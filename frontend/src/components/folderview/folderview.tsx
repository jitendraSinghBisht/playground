import { useSelector } from "react-redux";
import Folders from "./folderstruct";
import { folderData } from "@/store/slice/folder.slice";

function FolderView() {

  const rootFolder = useSelector(folderData)

  return (
    <div className="h-full w-full bg-gray-950" >
      <div className="text-white pt-1 pl-3">
        Explorer
      </div>
      <div className="text-gray-500 mt-4 pl-3">
        WORKSPACE
        <Folders folder={{id: "_NoDeleteAndRename_", name: "root", childFiles: rootFolder.childFiles, childFolder: rootFolder.childFolder}} />
      </div>
    </div>
  );
}

export default FolderView;