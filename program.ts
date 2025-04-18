import dotenv from "dotenv";
import chalk from "chalk";
dotenv.config();
import server, { configureDatabase } from "./app";

const PORT = process.env.PORT || 3300;

(() => {
  configureDatabase();
  server.listen(PORT, () => {
    console.log(
      chalk.green(
        `------------- Server is running on port ${PORT} -------------------------`
      )
    );
  });
})();
