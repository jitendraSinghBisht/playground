import fs from 'node:fs';
import path from "node:path";
import { WebSocket } from 'ws';
import { v4 as uuid } from "uuid";
import { isValidObjectId } from 'mongoose';
import { User } from '../models/user.model.js';
import { Volume } from '../models/volume.model.js';
import { IFile, IFolder, IUserDocument, IVolumeDocument } from '../types.js';

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

  ws.on("message", async (data) => {
    let volume: IVolumeDocument | null = await Volume.findById(id);
    if (!volume) {
      ws.send(JSON.stringify({ success: false, message: "No volume found" }));
      ws.close();
      return;
    }
    const msg: { task: string, [key: string]: string } = JSON.parse(data.toString());

    let res: { success: boolean; message: string; data?: any; };
    switch (msg.task) {
      case "getRootFolder":
        res = await getRootFolder(user, volume, basePath);
        break;
      case "saveFile":
        res = await saveFile(user, volume, basePath, msg.fileId, msg.fileData)
        break;
      case "getFile":
        res = await getFile(user, volume, basePath, msg.fileId)
        break;
      case "createFile":
        res = await createFile(user, volume, basePath, msg.folderId, msg.fileName)
        break;
      case "createFolder":
        res = await createFolder(user, volume, basePath, msg.folderId, msg.folderName)
        break;
      case "renameFolder":
        res = await renameFolder(user, volume, basePath, msg.folderId, msg.folderName)
        break;
      case "renameFile":
        res = await renameFile(user, volume, basePath, msg.fileId, msg.fileName)
        break;
      case "deleteFile":
        res = await deleteFile(user, volume, basePath, msg.fileId)
        break;
      case "deleteFolder":
        res = await deleteFolder(user, volume, basePath, msg.folderId)
        break;

      default:
        res = {
          success: false,
          message: "No valid option found"
        }
        break;
    }
    ws.send(JSON.stringify({
      task: msg.task,
      ...res
    }));
  });

  ws.on("error", () => {
    console.error;
    ws.close();
  });

  ws.on("close", () => console.log("client disconnected"))
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

async function getRootFolder(user: IUserDocument, volume: IVolumeDocument, basePath: string) {
  try {
    let result: IFolder | undefined = volume.volumeStructure ? JSON.parse(volume.volumeStructure) : undefined
    result = folderRead(`${basePath}/${user.username}/${volume.volumeName}`, result)

    await Volume.findByIdAndUpdate(volume._id, {
      volumeStructure: JSON.stringify(result)
    });

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

async function saveFile(user: IUserDocument, volume: IVolumeDocument, basePath: string, fileId: string, fileData: string) {
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

async function getFile(user: IUserDocument, volume: IVolumeDocument, basePath: string, fileId: string) {
  try {
    const obj: IFolder = JSON.parse(volume.volumeStructure)

    const filePath = traverseForFile(`${basePath}/${user.username}/${volume.volumeName}`, obj, fileId)
    if (!filePath) {
      return {
        success: false,
        message: "No such file exists"
      }
    }

    const data = fs.readFileSync(filePath, 'utf8');

    return {
      success: true,
      message: "File fetched successfully",
      data: {
        file: filePath.split("/").pop(),
        fileId,
        data
      }
    }
  } catch (error: any) {
    return {
      success: false,
      message: error.meassage
    }
  }
}

async function createFile(user: IUserDocument, volume: IVolumeDocument, basePath: string, folderId: string, fileName: string) {
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

    await Volume.findByIdAndUpdate(volume._id, {
      volumeStructure: JSON.stringify(obj)
    });


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

async function createFolder(user: IUserDocument, volume: IVolumeDocument, basePath: string, folderId: string, folderName: string) {
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

    await Volume.findByIdAndUpdate(volume._id, {
      volumeStructure: JSON.stringify(obj)
    });


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

async function deleteFile(user: IUserDocument, volume: IVolumeDocument, basePath: string, fileId: string) {
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

    await Volume.findByIdAndUpdate(volume._id, {
      volumeStructure: JSON.stringify(obj)
    });


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

async function deleteFolder(user: IUserDocument, volume: IVolumeDocument, basePath: string, folderId: string) {
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

    await Volume.findByIdAndUpdate(volume._id, {
      volumeStructure: JSON.stringify(obj)
    });


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

async function renameFile(user: IUserDocument, volume: IVolumeDocument, basePath: string, fileId: string, fileName: string) {
  try {
    const obj: IFolder = JSON.parse(volume.volumeStructure)

    const filePath = traverseForFile(`${basePath}/${user.username}/${volume.volumeName}`, obj, fileId)
    if (!filePath) {
      return {
        success: false,
        message: "No such file exists"
      }
    }

    fs.renameSync(filePath,filePath.substring(0, filePath.lastIndexOf('/') + 1) + fileName);
    folderRead(`${basePath}/${user.username}/${volume.volumeName}`, obj);

    await Volume.findByIdAndUpdate(volume._id, {
      volumeStructure: JSON.stringify(obj)
    });


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

async function renameFolder(user: IUserDocument, volume: IVolumeDocument, basePath: string, folderId: string, folderName: string) {
  try {
    const obj: IFolder = JSON.parse(volume.volumeStructure)

    const folderPath = traverseForFolder(`${basePath}/${user.username}/${volume.volumeName}`, obj, folderId)
    if (!folderPath) {
      return {
        success: false,
        message: "No such Folder exists"
      }
    }

    fs.renameSync(folderPath,folderPath.substring(0, folderPath.lastIndexOf('/') + 1) + folderName);
    folderRead(`${basePath}/${user.username}/${volume.volumeName}`, obj);

    await Volume.findByIdAndUpdate(volume._id, {
      volumeStructure: JSON.stringify(obj)
    });


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