import mongooes from "mongoose";
import { IUserDocument } from "../types.js";

const userSchema = new mongooes.Schema(
  {
    username: {
      type: String,
      require: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    email: {
      type: String,
      require: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      require: true
    },
    session: {
      type: String
    },
  },
  { timestamps: true }
)

export const User = mongooes.model<IUserDocument>("User", userSchema);