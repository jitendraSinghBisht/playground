import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Volume } from "../models/volume.model.js";
import fs from "fs";
import { IUserDocument, workDir } from "../types.js";

const createVolume = asyncHandler(async (req: Request, res: Response) => {
  const { lang, user, name }: { lang: workDir, user: IUserDocument, name: string } = req.body;

  if (!lang || !user || !name) {
    throw new ApiError(400, "lang, user and name are required")
  }

  const volumedbs = await Volume.find({ volumeName: name, owner: user._id })
  let volumedb;
  if (!volumedbs.length) {
    volumedb = await Volume.create({
      owner: user._id,
      volumeName: name,
      volumeLang: lang,
    })
  }
  const volumeName = `${process.env.VOLUME_LOC}/${user.username}/${name}`

  if (!fs.existsSync(volumeName)) {
    fs.mkdirSync(volumeName, { recursive: true });
  }

  return res
    .status(200)
    .json(new ApiResponse(200, {
      _id: volumedb?._id,
      volumeName: volumedb?.volumeName,
      volumeLang: volumedb?.volumeLang
    }, "Volume created successfully"))
})

const getOldVolumes = asyncHandler(async (req: Request, res: Response) => {
  const { user }: { user: IUserDocument } = req.body;

  const oldVolumes = await Volume.find({owner: user._id}).select("-volumeStructure -owner -createdAt -updatedAt")

  if (!oldVolumes.length) {
    throw new ApiError(400,"No volumes found")
  }

  return res
    .status(200)
    .json(new ApiResponse(200, {
      oldVolumes
    }, "Volumes fetched successfully"))
})

export { createVolume, getOldVolumes }