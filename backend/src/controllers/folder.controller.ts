import fs from 'node:fs';
import path from "node:path";
import { WebSocket } from 'ws';
import chokidar from 'chokidar';
import { v4 as uuid } from "uuid";
import { isValidObjectId } from 'mongoose';
import { User } from '../models/user.model.js';
import { Volume } from '../models/volume.model.js';
import { IFile, IFolder, IUserDocument, IVolumeDocument, IWSResponse } from '../types.js';

export async function folderConnect(ws: WebSocket, id: string) {
  console.log("Client Connected!! on F")

  const basePath = process.env.VOLUME_LOC
  if (!basePath) {
    return new Error("Volume Location is missing in env variables");
  }
  if (!isValidObjectId(id)) {
    ws.send(JSON.stringify({ success: false, message: "Invalid volume id" }));
    ws.close();
    return;
  }
  let volume: IVolumeDocument | null = await Volume.findById(id);
  if (!volume) {
    ws.send(JSON.stringify({ success: false, message: "No volume found" }));
    ws.close();
    return;
  }
  const user: IUserDocument | null = await User.findById(volume.owner);
  if (!user) {
    ws.send(JSON.stringify({ success: false, message: "No user found" }));
    ws.close();
    return;
  }

  const watch = chokidar.watch(`${basePath}/${user.username}/${volume.volumeName}`)
  watch.on("ready", () => { console.log("Volume is being watched....") })
  watch.on('all', async (event) => {
    if (["add", "addDir", "unlink", "unlinkDir"].includes(event)) {
      const res: IWSResponse = getRootFolder(user, volume, basePath);
      if (res.success) volume.volumeStructure = JSON.stringify(res.data);
      wsSend("updateRootFolder", res);
    }
  })

  function wsSend(task: string, res: IWSResponse) {
    ws.send(JSON.stringify({
      task,
      ...res
    }));
  }

  ws.on("message", async (data) => {
    const msg: { task: string, [key: string]: string } = JSON.parse(data.toString());

    let res: IWSResponse;
    switch (msg.task) {
      case "getRootFolder":
        res = getRootFolder(user, volume, basePath);
        res.success ?
          volume.volumeStructure = JSON.stringify(res.data) :
          wsSend(msg.task, res);
        break;
      case "saveFile":
        res = saveFile(user, volume, basePath, msg.fileId, msg.fileData)
        wsSend(msg.task, res);
        break;
      case "getFile":
        res = getFile(user, volume, basePath, msg.fileId)
        wsSend(msg.task, res);
        break;
      case "createFile":
        res = createFile(user, volume, basePath, msg.folderId, msg.fileName)
        res.success ?
          volume.volumeStructure = JSON.stringify(res.data) :
          wsSend(msg.task, res);
        break;
      case "createFolder":
        res = createFolder(user, volume, basePath, msg.folderId, msg.folderName)
        res.success ?
          volume.volumeStructure = JSON.stringify(res.data) :
          wsSend(msg.task, res);
        break;
      case "renameFolder":
        res = renameFolder(user, volume, basePath, msg.folderId, msg.folderName)
        res.success ?
          volume.volumeStructure = JSON.stringify(res.data) :
          wsSend(msg.task, res);
        break;
      case "renameFile":
        res = renameFile(user, volume, basePath, msg.fileId, msg.fileName)
        res.success ?
          volume.volumeStructure = JSON.stringify(res.data) :
          wsSend(msg.task, res);
        break;
      case "deleteFile":
        res = deleteFile(user, volume, basePath, msg.fileId)
        res.success ?
          volume.volumeStructure = JSON.stringify(res.data) :
          wsSend(msg.task, res);
        break;
      case "deleteFolder":
        res = deleteFolder(user, volume, basePath, msg.folderId)
        res.success ?
          volume.volumeStructure = JSON.stringify(res.data) :
          wsSend(msg.task, res);
        break;

      default:
        res = {
          success: false,
          message: "No valid option found"
        }
        wsSend(msg.task, res);
        break;
    }
  });

  ws.on("error", () => {
    console.error;
    ws.close();
  });

  ws.on("close", async () => {
    try {
      await Volume.findByIdAndUpdate(volume._id, {
        volumeStructure: volume.volumeStructure
      });
      console.log("client disconnected");
    } catch (error) {
      console.log(error);
    }
  })
}

//functions........
function folderRead(dirPath: string, obj?: IFolder) {
  const elements = fs.readdirSync(dirPath);

  if (!obj) {
    obj = {
      id: uuid(),
      name: path.basename(dirPath),
      childFiles: [],
      childFolder: []
    };
  }

  obj.childFolder = obj.childFolder.filter(folder => elements.includes(folder.name));
  obj.childFiles = obj.childFiles.filter(file => elements.includes(file.name));

  elements.forEach((el) => {
    const elPath = path.join(dirPath, el);
    if (fs.lstatSync(elPath).isDirectory()) {
      const existingFolder = obj.childFolder.find(folder => folder.name === el);
      const elObj: IFolder = existingFolder || {
        id: uuid(),
        name: el,
        childFiles: [],
        childFolder: []
      };
      folderRead(elPath, elObj);
      if (!existingFolder) {
        obj.childFolder.push(elObj);
      }
    } else {
      const existingFile = obj?.childFiles.find(file => file.name === el);
      const elObj: IFile = existingFile || {
        id: uuid(),
        name: el
      };
      if (!existingFile) {
        obj.childFiles.push(elObj);
      }
    }
  });

  return obj;
}

function traverseForFile(rootPath: string, fol: IFolder, fileId: string): string | undefined {
  const fileFetch = fol.childFiles.filter(({ id }) => { console.log(id, fileId); return id == fileId })

  if (!fileFetch.length) {
    for (const childFolder of fol.childFolder) {
      const newPath = path.join(rootPath, childFolder.name);
      const foundPath = traverseForFile(newPath, childFolder, fileId);
      if (foundPath) return foundPath;
    }
    return undefined;
  } else {
    return path.join(rootPath, fileFetch[0].name);
  }
}

function traverseForFolder(rootPath: string, fol: IFolder, folderId: string): string | undefined {
  if (fol.id == folderId) return rootPath;
  for (const childFolder of fol.childFolder) {
    const newPath = path.join(rootPath, childFolder.name);
    const foundPath = traverseForFolder(newPath, childFolder, folderId);
    if (foundPath) return foundPath;
  }
  return undefined;
}

function getRootFolder(user: IUserDocument, volume: IVolumeDocument, basePath: string) {
  try {
    let result: IFolder | undefined = volume.volumeStructure ? JSON.parse(volume.volumeStructure) : undefined
    result = folderRead(`${basePath}/${user.username}/${volume.volumeName}`, result)

    return {
      success: true,
      message: "Root folder fetched successfully",
      data: result
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.meassage
    }
  }
}

function saveFile(user: IUserDocument, volume: IVolumeDocument, basePath: string, fileId: string, fileData: string) {
  try {
    const obj: IFolder = JSON.parse(volume.volumeStructure)

    const filePath = traverseForFile(`${basePath}/${user.username}/${volume.volumeName}`, obj, fileId)
    if (!filePath) {
      return {
        success: false,
        message: "No such file exists"
      }
    }

    fs.writeFileSync(filePath, fileData);

    return {
      success: true,
      message: "File saved successfully",
    }
  } catch (error: any) {
    return {
      success: false,
      message: error.meassage
    }
  }
}

function getFile(user: IUserDocument, volume: IVolumeDocument, basePath: string, fileId: string) {
  try {
    const obj: IFolder = JSON.parse(volume.volumeStructure)

    const filePath = traverseForFile(`${basePath}/${user.username}/${volume.volumeName}`, obj, fileId)
    if (!filePath) {
      return {
        success: false,
        message: "No such file exists"
      }
    }

    const fileData = fs.readFileSync(filePath, 'utf8');

    return {
      success: true,
      message: "File fetched successfully",
      data: {
        file: filePath.split("/").pop(),
        fileId,
        fileData
      }
    }
  } catch (error: any) {
    return {
      success: false,
      message: error.meassage
    }
  }
}

function createFile(user: IUserDocument, volume: IVolumeDocument, basePath: string, folderId: string, fileName: string) {
  try {
    const obj: IFolder = JSON.parse(volume.volumeStructure)

    const folderPath = traverseForFolder(`${basePath}/${user.username}/${volume.volumeName}`, obj, folderId)
    if (!folderPath) {
      return {
        success: false,
        message: "No such folder exists"
      }
    }

    fs.writeFileSync(path.join(folderPath, fileName), "");
    folderRead(`${basePath}/${user.username}/${volume.volumeName}`, obj);

    return {
      success: true,
      message: "File created successfully",
      data: obj
    }
  } catch (error: any) {
    return {
      success: false,
      message: error.meassage
    }
  }
}

function createFolder(user: IUserDocument, volume: IVolumeDocument, basePath: string, folderId: string, folderName: string) {
  try {
    const obj: IFolder = JSON.parse(volume.volumeStructure)

    const folderPath = traverseForFolder(`${basePath}/${user.username}/${volume.volumeName}`, obj, folderId)
    if (!folderPath) {
      return {
        success: false,
        message: "No such folder exists"
      }
    }

    fs.mkdirSync(path.join(folderPath, folderName));
    folderRead(`${basePath}/${user.username}/${volume.volumeName}`, obj);

    return {
      success: true,
      message: "Folder created successfully",
      data: obj
    }
  } catch (error: any) {
    return {
      success: false,
      message: error.meassage
    }
  }
}

function deleteFile(user: IUserDocument, volume: IVolumeDocument, basePath: string, fileId: string) {
  try {
    const obj: IFolder = JSON.parse(volume.volumeStructure)

    const filePath = traverseForFile(`${basePath}/${user.username}/${volume.volumeName}`, obj, fileId)
    if (!filePath) {
      return {
        success: false,
        message: "No such file exists"
      }
    }

    fs.unlinkSync(filePath);
    folderRead(`${basePath}/${user.username}/${volume.volumeName}`, obj);

    return {
      success: true,
      message: "File deleted successfully",
      data: obj
    }
  } catch (error: any) {
    return {
      success: false,
      message: error.meassage
    }
  }
}

function deleteFolder(user: IUserDocument, volume: IVolumeDocument, basePath: string, folderId: string) {
  try {
    const obj: IFolder = JSON.parse(volume.volumeStructure)

    const folderPath = traverseForFolder(`${basePath}/${user.username}/${volume.volumeName}`, obj, folderId)
    if (!folderPath) {
      return {
        success: false,
        message: "No such Folder exists"
      }
    }

    fs.rmSync(folderPath, { recursive: true, force: true });
    folderRead(`${basePath}/${user.username}/${volume.volumeName}`, obj);

    return {
      success: true,
      message: "Folder deleted successfully",
      data: obj
    }
  } catch (error: any) {
    return {
      success: false,
      message: error.meassage
    }
  }
}

function renameFile(user: IUserDocument, volume: IVolumeDocument, basePath: string, fileId: string, fileName: string) {
  try {
    const obj: IFolder = JSON.parse(volume.volumeStructure)

    const filePath = traverseForFile(`${basePath}/${user.username}/${volume.volumeName}`, obj, fileId)
    if (!filePath) {
      return {
        success: false,
        message: "No such file exists"
      }
    }

    fs.renameSync(filePath, filePath.substring(0, filePath.lastIndexOf('/') + 1) + fileName);
    folderRead(`${basePath}/${user.username}/${volume.volumeName}`, obj);

    return {
      success: true,
      message: "File renamed successfully",
      data: obj
    }
  } catch (error: any) {
    return {
      success: false,
      message: error.meassage
    }
  }
}

function renameFolder(user: IUserDocument, volume: IVolumeDocument, basePath: string, folderId: string, folderName: string) {
  try {
    const obj: IFolder = JSON.parse(volume.volumeStructure)

    const folderPath = traverseForFolder(`${basePath}/${user.username}/${volume.volumeName}`, obj, folderId)
    if (!folderPath) {
      return {
        success: false,
        message: "No such Folder exists"
      }
    }

    fs.renameSync(folderPath, folderPath.substring(0, folderPath.lastIndexOf('/') + 1) + folderName);
    folderRead(`${basePath}/${user.username}/${volume.volumeName}`, obj);

    return {
      success: true,
      message: "Folder renamed successfully",
      data: obj
    }
  } catch (error: any) {
    return {
      success: false,
      message: error.meassage
    }
  }
}