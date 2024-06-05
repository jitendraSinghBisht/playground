import { Request, Response } from "express"
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { IReqBody } from "../types.js";

const signUp = asyncHandler(async (req: Request, res: Response) => {

  const { username, email, password }: IReqBody = req.body

  if (!(username || email || password)) {
    throw new ApiError(400, "All details are required")
  }

  const existedUser = await User.findOne({ email });

  if (existedUser) {
    throw new ApiError(400, "User with username or email already exist");
  }

  const user = await User.create({
    username,
    email,
    password
  })

  if (!user) {
    throw new ApiError(500, "Registration Failed")
  }
  user.password = ""

  return res.status(200).json(new ApiResponse(200, user, "User signup successful"))
})

const signIn = asyncHandler(async (req: Request, res: Response) => {
  const { email, password }: IReqBody = req.body

  const user = await User.findOne({ email })

  if (user?.password !== password) {
    throw new ApiError(401, "Unauthorized access")
  }

  user.session = `${Date.now()}`
  await user.save()

  return res
    .cookie(
      'userSession',
      user.session,
      {
        httpOnly: true,
        secure: true,
        maxAge: 60*60*60,
        sameSite: "none"
      })
    .status(200)
    .json(new ApiResponse(200, {
      userId: user._id,
      username: user.username,
      email: user.email
    }, "Successfully logged in"))
})

const logOut = asyncHandler(async (req: Request, res: Response) => {
  const { user } = req.body

  await User.findByIdAndUpdate({_id: user._id},{$set: {session: ""}})

  if (!user) {
    throw new ApiError(500, "Unable to logout")
  }

  return res
    .clearCookie('userSession')
    .status(200)
    .json(new ApiResponse(200,{},"Logged out successfully"))
})

const authenticate = asyncHandler(async (req: Request, res: Response) => {
  const { user } = req.body

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Successfully logged in"))
})

export { signUp, signIn, logOut, authenticate }