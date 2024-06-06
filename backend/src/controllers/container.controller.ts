import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { Request, Response } from "express";
import { IUserDocument, workDir } from "../types.js";
import Docker from "dockerode";

const docker = new Docker({ socketPath: '/var/run/docker.sock' });
const images = {
  node: "ubuntu",
  java: "ubuntu",
  python: "ubuntu",
  ccpp: "ubuntu"
}

const createContainer = asyncHandler(async (req: Request, res: Response) => {
  const { lang, user, name }: { lang: workDir, user: IUserDocument, name: string } = req.body;
  const imageName = images[lang]

  if (!lang || !user || !name) {
    throw new ApiError(400, "lang, user and name are required")
  }

  const volumeName = `${process.env.VOLUME_LOC}/${user.username}/${name}`

  const options = {
    Image: imageName,
    name: `${Date.now()}`,
    Volumes: { [`/home/ubuntu`]: {} },
    Cmd: ['sh'],
    WorkingDir: `/home/ubuntu`,
    AttachStdin: true,
    AttachStdout: true,
    AttachStderr: true,
    Tty: true,
    OpenStdin: true,
    HostConfig: {
      Binds: [`${volumeName}:/home/ubuntu`],
    }
  }
  const container = await docker.createContainer(options);

  await container.start();

  return res
    .status(200)
    .json(new ApiResponse(200, {
      containerId: container.id
    }, "Container created successfully"))
})

export { createContainer }