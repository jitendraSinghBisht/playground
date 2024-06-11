import { useSelector } from "react-redux";
import Folders from "./folderstruct";
import { folderData } from "@/store/slice/folder.slice";
import { fileData } from "@/store/slice/files.slice";
import useFolder from "./useFolder";
import { FolderContext } from "./context";

function FolderView({setSaveFile}:{setSaveFile: (val: ()=> void) => void}) {

  const rootFolder = useSelector(folderData)
  const curFile = useSelector(fileData)
  const folderOptions = useFolder()
  // setSaveFile(folderOptions.saveCurFile)

  return (
    <div className="h-full w-full bg-gray-950" >
      <div className="text-white pt-1 pl-3">
        Explorer
      </div>
      <div className="text-gray-500 mt-4 pl-3">
        WORKSPACE
        <FolderContext.Provider value={folderOptions}>
          <Folders folder={{ id: "_NoDeleteAndRename_", name: "root", childFiles: rootFolder.childFiles, childFolder: rootFolder.childFolder }} activeFile={curFile.curFileId} />
        </FolderContext.Provider>
      </div>
    </div>
  );
}

export default FolderView;