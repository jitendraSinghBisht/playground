import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const healthCheck = asyncHandler(async (req: Request, res: Response) => {

  return res
    .status(200)
    .json(new ApiResponse(200, { "hello": "world" }, "all good"))
})

export { healthCheck }