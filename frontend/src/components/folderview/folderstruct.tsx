import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { useState } from "react";
import { IFolder, IFile } from "@/types";
import { Button } from "@/components/ui/button";
import { useFolderContext } from "./context";

function Folders({ folder, activeFile }: { folder: IFolder, activeFile: string|undefined }) {
  const [expand, setExpand] = useState(true);
  const fo = useFolderContext();

  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger>
          <div
            className="pl-2 cursor-pointer flex text-white items-center hover:bg-slate-700"
            onClick={() => setExpand(!expand)}
            key={folder.id}
          >
            {expand ? `📂 ${folder.name}` : `📁 ${folder.name}`}
          </div>
        </ContextMenuTrigger>
        <ContextMenuContent className="bg-slate-950 text-white p-1 m-0 gap-2 flex flex-col">
          <Button
            className="p-1 m-0 hover:bg-slate-400"
            variant="ghost"
            onClick={() => {fo.createFile(folder.id)}}
          >
            New File
          </Button>
          <Button
            className="p-1 m-0 hover:bg-slate-400"
            variant="ghost"
            onClick={() => {fo.createFolder(folder.id)}}
          >
            New Folder
          </Button>
          {folder.id !== "_NoDeleteAndRename_" && <><Button
            className="p-1 m-0 hover:bg-slate-400"
            variant="ghost"
            onClick={() => {fo.renameFolder(folder.id)}}
          >
            Rename
          </Button>
          <Button
            className="p-1 m-0 hover:bg-slate-400"
            variant="ghost"
            onClick={() => {fo.deleteFolder(folder.id)}}
          >
            Delete
          </Button></>}
        </ContextMenuContent>
      </ContextMenu>

      <div style={{ display: expand ? "block" : "none", paddingLeft: "10px" }}>
        {folder.childFolder.map((child: IFolder) => (
          <Folders folder={child} key={child.id} activeFile={activeFile} />
        ))}
        {folder.childFiles.map((child: IFile) => (
          <ContextMenu>
            <ContextMenuTrigger>
              <div
                className={`ml-3 cursor-pointer text-white flex items-center ${child.id == activeFile ? "bg-slate-700" : ""} hover:bg-slate-700`}
                onClick={() => {
                  fo.changeFile(child.id)
                }}
                key={child.id}
              >
                {`📄 ${child.name}`}
              </div>
            </ContextMenuTrigger>
            <ContextMenuContent className="bg-slate-950 text-white p-1 m-0 gap-2 flex flex-col">
          <Button
            className="p-1 m-0 hover:bg-slate-400"
            variant="ghost"
            onClick={() => {fo.renameFile(child.id)}}
          >
            Rename
          </Button>
          <Button
            className="p-1 m-0 hover:bg-slate-400"
            variant="ghost"
            onClick={() => {fo.deleteFile(child.id)}}
          >
            Delete
          </Button>
            </ContextMenuContent>
          </ContextMenu>
        ))}
      </div>
    </>
  );
}

export default Folders;