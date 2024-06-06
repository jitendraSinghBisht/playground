import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";

export const verifyUser = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies?.userSession;

    if (!token) {
      throw new ApiError(401, "Unauthorized Request");
    }

    const user = await User.find({session: token}).select(
      "-password -session"
    );

    if (!user) {
      throw new ApiError(401, "Invalid Session");
    }

    req.body.user = user[0];
    next();
  } catch (error: any) {
    throw new ApiError(401, error?.message || "Invalid Access Token");
  }
});