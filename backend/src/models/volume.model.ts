import mongoose from "mongoose";
import { IVolumeDocument } from "../types.js";

const volumeSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      require: true
    },
    volumeName: {
      type: String,
      require: true
    },
    volumeLang: {
      type: String,
      require: true
    },
    volumeStructure: {
      type: String,
    },
  },
  { timestamps: true }
)

export const Volume = mongoose.model<IVolumeDocument>("Volume",volumeSchema)