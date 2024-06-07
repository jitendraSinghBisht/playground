import { IFolderOptions } from "@/types";
import { createContext, useContext } from "react";

const FolderContext = createContext<IFolderOptions | undefined>(undefined)

const useFolderContext = () => {
  const folderOptions = useContext(FolderContext);

  if (!folderOptions) {
    throw new Error("Folder Options are not passed in FolderContext");
  }

  return folderOptions;
}

export { FolderContext, useFolderContext }