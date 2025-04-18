import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import USER from "../models/user.model";
import AppError from "../utils/error.utils";

class AuthController {
  jwt_secret: string;
  jwt_expiration: string;
  private static instance: AuthController;
  constructor() {
    this.jwt_secret = process.env.JWT_SECRET as string;
    this.jwt_expiration = process.env.JWT_TOKEN_EXPIRES as string;
  }

  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { username } = req.body;

      if (!username) throw new Error("Username is required");
      let user = await USER.findOne({ userName: username });
      if (!user) user = await USER.create({ userName: username });
      const token = jwt.sign({ id: user._id, username }, this.jwt_secret);
      res.status(201).json({
        status: "success",
        token,
        data: {
          user,
        },
      });
    } catch (error) {
      const appError = new AppError(
        (error as Error)?.message || "An error occurred",
        400
      );

      res.status(appError.statusCode).json({
        status: "Error",
        message: appError.message,
      });
    }
  }

  static getAuthInstance(): AuthController {
    if (!AuthController.instance) {
      AuthController.instance = new AuthController();
    }
    return AuthController.instance;
  }

  static verifyAuth(token: string) {
    const { id } = jwt.verify(
      token,
      AuthController.getAuthInstance().jwt_secret
    ) as JwtPayload;

    return id;
  }
}

export default AuthController;
