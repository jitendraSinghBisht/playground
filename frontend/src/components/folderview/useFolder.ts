import { fileData } from "@/store/slice/files.slice";
import { folderData } from "@/store/slice/folder.slice";
import { userData } from "@/store/slice/user.slice";
import { volumeData } from "@/store/slice/volume.slice";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

function useFolder() {
  const file = useSelector(fileData);
  const rootFolder = useSelector(folderData);
  const user = useSelector(userData);
  const volume = useSelector(volumeData);
  const dispatch = useDispatch();
  const wsUrl = `${import.meta.env.VITE_WS_URL}/folder/${volume._id}`;
  const [ws, setWS] = useState<WebSocket>(new WebSocket(wsUrl))

  useEffect(()=>{
    if (ws.readyState == ws.CLOSED) {
      setWS(new WebSocket(wsUrl))
    }
  },[ws])

  ws.onopen = ()=>{
    const data = {
      type: "getRootFolder"
    }
    ws.send(JSON.stringify(data));
  }

  function saveCurFile() {
    const data = {
      task: "saveFile",
      fileId: file.curFileId,
      fileData: file.curFileData
    }
    ws.send(JSON.stringify(data));
  }

  function changeFile(fileId: string) {
    if (file.curFileId) {
      saveCurFile();
    }
    const data = {
      task: "getFile",
      fileId
    }
    ws.send(JSON.stringify(data));
  }

  function createFile(folderId: string) {
    const fileName = prompt("Enter the file name....")
    if (!fileName) {
      alert("File name is required....")
      return
    }
    const data = {
      task: "createFile",
      folderId,
      fileName
    }
    ws.send(JSON.stringify(data));
  }

  function createFolder(folderId: string) {
    const folderName = prompt("Enter the file name....")
    if (!folderName) {
      alert("Folder name is required....")
      return
    }
    const data = {
      task: "createFolder",
      folderId,
      folderName
    }
    ws.send(JSON.stringify(data));
  }

  function renameFolder(folderId: string) {
    const folderName = prompt("Enter the file name....")
    if (!folderName) {
      alert("Folder name is required....")
      return
    }
    const data = {
      task: "renameFolder",
      folderId,
      folderName
    }
    ws.send(JSON.stringify(data));
  }

  function renameFile(fileId: string) {
    const fileName = prompt("Enter the file name....")
    if (!fileName) {
      alert("Folder name is required....")
      return
    }
    const data = {
      task: "renameFile",
      fileId,
      fileName
    }
    ws.send(JSON.stringify(data));
  }

  function deleteFile(fileId: string) {
    const data = {
      task: "deleteFile",
      fileId
    }
    ws.send(JSON.stringify(data));
  }

  function deleteFolder(folderId: string) {
    const data = {
      task: "deleteFolder",
      folderId
    }
    ws.send(JSON.stringify(data));
  }

  return { changeFile, saveCurFile, createFile, createFolder, deleteFile, deleteFolder, renameFile, renameFolder }
}

export default useFolder;