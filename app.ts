import express from "express";
import { Server } from "socket.io";
import http from "http";
import ISession from "./interfaces/session.interface";
import USER from "./models/user.model";
import GAME_SESSION from "./models/game.session.model";
import IPlayer from "./interfaces/player.interface";
import authRouter from "./routes/auth.route";
import mongoose from "mongoose";
import chalk from "chalk";
import cors from "cors";
import AuthController from "./controllers/auth.controller";
import { UserController } from "./controllers/user.controller";

const app = express();
app.use(express.json());
app.use(cors());

export const configureDatabase = () => {
  const DB = process.env.MONGODB_URL?.replace(
    "<db_password>",
    process.env.MONGODB_PASSWORD!
  )!;

  mongoose
    .connect(DB)
    .then(({ connection }) => console.log(chalk.bgBlue(connection.host)))
    .catch((err) =>
      console.log(
        chalk.red("-------------- DB CONNECTION FAILED ------------------", err)
      )
    );
};

const timeLeftForNewSession = 30000;

const server = http.createServer(app);
let currentSession: ISession | null = null;
app.get("/", (req, res) => {
  res.send("its all good");
});

const io = new Server(server, {
  cors: {
    origin: "https://fabulous-eclair-951375.netlify.app",
    // origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

io.use((socket, next) => {
  const origin = socket.handshake.headers.origin;

  if (
    origin === "http://localhost:3000" ||
    origin === "https://fabulous-eclair-951375.netlify.app"
  ) {
    return next();
  }
  return next(new Error("Unauthorized origin"));
});

let players: IPlayer[] = [];

const startGameSession = () => {
  players = [];
  let countdownInterval: NodeJS.Timeout | null = null;
  let sessionStartcountdownInterval: NodeJS.Timeout | null = null;

  currentSession = {
    startTime: Date.now(),
    duration: 20000,
    isActive: true,
  };

  io.emit("session_start", { duration: currentSession.duration });

  let timeLeft = currentSession.duration / 1000;
  countdownInterval = setInterval(() => {
    timeLeft--;
    io.emit("countdown_tick", { timeLeft });
    if (timeLeft <= 0 && countdownInterval !== null)
      clearInterval(countdownInterval);
  }, 1000);

  setInterval(() => {
    io.emit("numOfPlayers", { count: players.length });
  }, 100);

  setTimeout(async () => {
    if (currentSession) {
      currentSession.isActive = false;
    }

    const winningNumber = Math.floor(Math.random() * 9) + 1;
    // const winningNumber = 1;

    if (players.length) {
      const winners = players.filter(
        (player) => Number(player.number) === winningNumber
      );

      for (const winner of winners) {
        await USER.findByIdAndUpdate(winner.userId, { $inc: { wins: 1 } });
      }

      await GAME_SESSION.create({
        startTime: currentSession?.startTime,
        players,
        correctNumber: winningNumber,
        winners: winners.map((winner) => winner.userId),
      });
      io.emit("session_end", { winners, answer: winningNumber });
    }

    let timeToStart = timeLeftForNewSession / 1000;

    sessionStartcountdownInterval = setInterval(() => {
      timeToStart--;

      io.emit("time_till_new_session", { timeToStart });
      if (timeToStart <= 0 && sessionStartcountdownInterval !== null)
        clearInterval(sessionStartcountdownInterval);
    }, 1000);

    setTimeout(startGameSession, timeLeftForNewSession);
  }, currentSession.duration);
};

startGameSession();

io.on("connection", (socket) => {
  console.log(`a user connected ${socket.id}`);

  socket.on("join_game", ({ token, name }) => {
    try {
      const id = AuthController.verifyAuth(token);
      // console.log(id);
      if (currentSession?.isActive) {
        players.push({ userId: id, username: name });

        // io.emit("playerCount", { count: players.length });
        // io.to(socket.id).emit("numOfPlayers", { count: players.length });
      } else {
        socket.emit("session_closed");
      }
    } catch (error) {
      // console.log(error);
      socket.emit("error", "something went wrong joining game");
    }
  });

  socket.on("user_answer", ({ token, number }) => {
    try {
      const id = AuthController.verifyAuth(token);

      for (const player of players) {
        if (player.userId === id) {
          player.number = number;
        }
      }
    } catch (error) {
      console.log(error);
    }
  });

  socket.on("disconnect", () => {
    console.log("❌ Client disconnected:", socket.id);
  });
});

const userController = new UserController();

app.use("/auth", authRouter);
app.use("/leaderboard", userController.getLeaderBoard.bind(userController));

export default server;
