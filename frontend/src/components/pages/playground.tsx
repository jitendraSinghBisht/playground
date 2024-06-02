import {
  Binary,
  LogOut,
  Play,
  SaveAll,
  FilesIcon,
  TerminalSquare,
  Braces,
  Globe,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useDispatch, useSelector } from "react-redux";
import { userData } from "@/store/slice/user.slice";
import { useEffect, useState } from "react";
// import FolderView from "@/folderview/folderview";
import { IApiError, IApiResponse } from "@/types";
import axios from "axios";
import { folderData } from "@/store/slice/folder.slice";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "../ui/resizable";

export function Playground() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [fileActive, setFileActive] = useState(true);
  const [editorActive, setEditorActive] = useState(true);
  const [termActive, setTermActive] = useState(true);
  const [webActive, setWebActive] = useState(false);
  const folder = useSelector(folderData);
  const user = useSelector(userData);

  async function logout() {
    try {
      const response = await axios.post(`/user/log-out`, {
        userId: user.userId,
      });
      const jres: IApiResponse | IApiError = await response.data;
      if (!jres.success) {
        alert("Unable to logout... \nTry again later....");
        return;
      }
      dispatch({ type: "RESET" });
      navigate("/login");
    } catch (error) {
      console.log(error);
    }
  }

  // useEffect(() => {
  //   if (!user.loggedIn) {
  //     navigate("/login");
  //   }
  // }, [user]);

  return (
    <div className="h-screen w-full">
      <header className="sticky top-0 left-0 flex h-[7vh] items-center border-b border-gray-700 justify-between">
        <div className="flex items-center">
          <Binary />
          <span className="text-2xl font-bold"> PLAYGROUND </span>
        </div>
        <Button
          variant="destructive"
          className="bg-green-900 hover:bg-green-600 m-1"
        >
          <Play size="18" /> &nbsp; RUN
        </Button>
        <Button
          variant="outline"
          className="bg-transparent hover:bg-gray-700 border-gray-700 hover:text-white m-1"
        >
          <SaveAll size="18" /> &nbsp; SAVE
        </Button>
      </header>
      <div className="h-[93vh] flex">
        <div className="h-full gap-5 border-r-2 border-gray-700 w-[3vw] flex flex-col">
          <div
            className={`h-fit p-2 w-full flex items-center justify-center ${
              fileActive ? "border-l-4" : ""
            }`}
            onClick={() => setFileActive((pre) => !pre)}
          >
            <FilesIcon size="35" />
          </div>
          <div
            className={`h-fit p-2 w-full flex items-center justify-center ${
              editorActive ? "border-l-4" : ""
            }`}
            onClick={() => setEditorActive((pre) => !pre)}
          >
            <Braces size="35" />
          </div>
          <div
            className={`h-fit p-2 w-full flex items-center justify-center ${
              termActive ? "border-l-4" : ""
            }`}
            onClick={() => setTermActive((pre) => !pre)}
          >
            <TerminalSquare size="35" />
          </div>
          <div
            className={`h-fit p-2 w-full flex items-center justify-center ${
              webActive ? "border-l-4" : ""
            }`}
            onClick={() => setWebActive((pre) => !pre)}
          >
            <Globe size="35" />
          </div>
        </div>
        <div className="h-full w-[97vw]">
          <ResizablePanelGroup direction="horizontal">
            {fileActive && (
              <>
                <ResizablePanel defaultSize={18}></ResizablePanel>
                <ResizableHandle className="border-2 border-gray-700 " />
              </>
            )}
            <ResizablePanel>
              <ResizablePanelGroup direction="vertical">
                {editorActive && (
                  <ResizablePanel defaultSize={70}></ResizablePanel>
                )}
                {termActive && (
                  <>
                    <ResizableHandle className="border-2 border-gray-700 " />
                    <ResizablePanel></ResizablePanel>
                  </>
                )}
              </ResizablePanelGroup>
            </ResizablePanel>
            {webActive && (
              <>
                <ResizableHandle className="border-2 border-gray-700 " />
                <ResizablePanel></ResizablePanel>
              </>
            )}
          </ResizablePanelGroup>
        </div>
      </div>
    </div>
  );
}
