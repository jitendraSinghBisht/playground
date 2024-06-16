import { fileData, updateFile } from "@/store/slice/files.slice";
import { folderData, updateFolder } from "@/store/slice/folder.slice";
import { volumeData } from "@/store/slice/volume.slice";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

function useFolder() {
  const file = useSelector(fileData);
  const rootFolder = useSelector(folderData);
  const volume = useSelector(volumeData);
  const dispatch = useDispatch();
  const wsUrl = `${import.meta.env.VITE_WS_URL}/ws/folder/${volume._id}`;
  const [ws, setWS] = useState<WebSocket>()

  useEffect(()=>{
    if (!ws)
      setWS(new WebSocket(wsUrl))
  }, [ws])

  useEffect(()=>{
    if (ws) {
    ws.onopen = () => {
      const data = {
        task: "getRootFolder"
      }
      ws.send(JSON.stringify(data));
    }
  
    ws.onmessage = (ev: MessageEvent) => {
      const data: { task: string; success: boolean; message: string; data?: any; } = JSON.parse(ev.data);
  
      if (!data.success) {
        alert(data.message);
        return;
      }
  
      switch (data.task) {
        case "updateRootFolder":
          dispatch(updateFolder(data.data));
          break;
        // case "saveFile":
        //   alert(data.message);
        //   break;
        case "getFile":
          dispatch(updateFile({
            curFile: data.data.file,
            curFileId: data.data.fileId,
            curFileData: data.data.fileData || " "
          }));
          break;
  
        default:
          console.log("Unknow operation");
          break;
      }
    }
  }
  },[ws])

  function saveCurFile() {
    const data = {
      task: "saveFile",
      fileId: file.curFileId,
      fileData: file.curFileData
    }
    if (ws && ws.readyState == ws.OPEN) ws.send(JSON.stringify(data));
  }

  function changeFile(fileId: string) {
    if (file.curFileId != "") {
      saveCurFile();
    }
    const data = {
      task: "getFile",
      fileId
    }
    if (ws && ws.readyState == ws.OPEN) ws.send(JSON.stringify(data));
  }

  function createFile(folderId: string) {
    const fileName = prompt("Enter the file name....")
    if (!fileName) {
      alert("File name is required....")
      return
    }
    if (folderId === "_NoDeleteAndRename_") folderId = rootFolder.id;
    const data = {
      task: "createFile",
      folderId,
      fileName
    }
    if (ws && ws.readyState == ws.OPEN) ws.send(JSON.stringify(data));
  }

  function createFolder(folderId: string) {
    const folderName = prompt("Enter the file name....")
    if (!folderName) {
      alert("Folder name is required....")
      return
    }
    if (folderId === "_NoDeleteAndRename_") folderId = rootFolder.id;
    const data = {
      task: "createFolder",
      folderId,
      folderName
    }
    if (ws && ws.readyState == ws.OPEN) ws.send(JSON.stringify(data));
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
    if (ws && ws.readyState == ws.OPEN) ws.send(JSON.stringify(data));
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
    if (ws && ws.readyState == ws.OPEN) ws.send(JSON.stringify(data));
  }

  function deleteFile(fileId: string) {
    const data = {
      task: "deleteFile",
      fileId
    }
    if (ws && ws.readyState == ws.OPEN) ws.send(JSON.stringify(data));
  }

  function deleteFolder(folderId: string) {
    const data = {
      task: "deleteFolder",
      folderId
    }
    if (ws && ws.readyState == ws.OPEN) ws.send(JSON.stringify(data));
  }

  return { changeFile, saveCurFile, createFile, createFolder, deleteFile, deleteFolder, renameFile, renameFolder }
}

export default useFolder;