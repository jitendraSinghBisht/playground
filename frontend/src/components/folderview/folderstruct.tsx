import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { useState } from "react";
import { IFolder, IFile } from "@/types";
import { Button } from "@/components/ui/button";

function Folders({ folder }: { folder: IFolder }) {
  const [expand, setExpand] = useState(true);

  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger>
          <div
            className="pl-2 cursor-pointer flex items-center hover:bg-slate-700"
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
            onClick={() => {}}
          >
            New File
          </Button>
          <Button
            className="p-1 m-0 hover:bg-slate-400"
            variant="ghost"
            onClick={() => {}}
          >
            New Folder
          </Button>
          {folder.id !== "_NoDeleteAndRename_" && <><Button
            className="p-1 m-0 hover:bg-slate-400"
            variant="ghost"
            onClick={() => {}}
          >
            Rename
          </Button>
          <Button
            className="p-1 m-0 hover:bg-slate-400"
            variant="ghost"
            onClick={() => {}}
          >
            Delete
          </Button></>}
        </ContextMenuContent>
      </ContextMenu>

      <div style={{ display: expand ? "block" : "none", paddingLeft: "10px" }}>
        {folder.childFolder.map((child: IFolder) => (
          <Folders folder={child} key={child.id} />
        ))}
        {folder.childFiles.map((child: IFile) => (
          <ContextMenu>
            <ContextMenuTrigger>
              <div
                className="ml-3 cursor-pointer max-w-fit flex items-center"
                onClick={() => {
                  // changeFile(child.id);
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
            onClick={() => {}}
          >
            Rename
          </Button>
          <Button
            className="p-1 m-0 hover:bg-slate-400"
            variant="ghost"
            onClick={() => {}}
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