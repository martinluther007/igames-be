import { NextFunction, Request, Response } from "express";
import AuthController from "./auth.controller";
import USER from "../models/user.model";
import GAME_SESSION from "../models/game.session.model";
import AppError from "../utils/error.utils";

export class UserController {
  async getUserDetails(req: Request, res: Response, next: NextFunction) {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader) return res.status(401).json({ error: "Token required" });
      const token = authHeader.split(" ")[1];
      const id = AuthController.verifyAuth(token);
      const user = await USER.findById(id);
      if (!user) throw new Error("The user with this id does not exist");
      const sessions = await GAME_SESSION.find({ "players.userId": id });
      const totalGames = sessions.length;
      const wins = user.wins;
      const losses = totalGames - wins;

      return res.status(200).json({
        status: "success",
        data: { wins, losses },
      });
    } catch (error) {
      const appError = new AppError(
        (error as Error)?.message || "An error occurred",
        400
      );
      return res.status(appError.statusCode).json({
        status: "Error",
        message: appError.message,
      });
    }
  }

  async getLeaderBoard(req: Request, res: Response, next: NextFunction) {
    const users = await USER.find().sort({ wins: -1 }).limit(10);

    res.status(200).json({
      status: "success",
      data: users,
    });
  }
}
