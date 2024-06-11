import { Terminal } from "@xterm/xterm";
import axios from "axios";
import { FitAddon } from '@xterm/addon-fit';
import '@xterm/xterm/css/xterm.css'
import { useRef, useEffect, useState } from "react";
import { RefreshCw, X } from "lucide-react";
import { useSelector } from "react-redux";
import { volumeData } from "@/store/slice/volume.slice";
import { IApiError, IApiResponse } from "@/types";
import { fileData } from "@/store/slice/files.slice";
import { useNavigate } from "react-router-dom";

const term = new Terminal({ convertEol: true,cursorBlink: true  });

function Xterm(props: {click: ()=>void, setRunFile: (val: ()=>void) => void}) {

  const navigate = useNavigate();
  const curFile = useSelector(fileData)
  const volume = useSelector(volumeData)
  const [containerId, setContainerId] = useState<string>()
  const [ws, setWS] = useState<WebSocket>()

  // props.setRunFile(()=>{
  //   if (!curFile.curFileId) {
  //     alert("No current file exists....\nOpen file to run it.....");
  //     return;
  //   }
  //   const command = `cat ${curFile.curFile}`;
  //   ws.send(command);
  //   term.write(command);
  // })

  async function getContainerId() {
    try {
      const response = await axios.post(`/container/create`, {
        name: volume.volumeName,
        lang: volume.volumeLang
      });
      const jres: IApiResponse | IApiError = await response.data;
      if (!jres.success) {
        alert("Unable to deploy... \nTry again later....");
        navigate("/");
        return;
      }
      const cId = jres.data.containerId;
      if (ws){
        if (ws.readyState == ws.OPEN || ws.readyState == ws.CONNECTING)
          ws.close();
      }
      setWS(new WebSocket(`${import.meta.env.VITE_WS_URL}/terminal/container/${cId}`));
      setContainerId(cId);
    } catch (error) {
      alert("Unable to deploy... \nTry again later....");
      console.log(error);
    }
  }

  const termRef = useRef<HTMLDivElement>(null)

  useEffect(()=>{
    if (!ws || ws.readyState == ws.CLOSED || ws.readyState == ws.CLOSING)
    getContainerId();
  })

  useEffect(() => {
    term.open(termRef.current!);

    if (ws) {
      ws.onmessage= (ev: MessageEvent<string>)=>{
        term.write(ev.data)
      }
      term.onKey((e) => {
        ws.send(e.key)
      })
    }

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    fitAddon.fit();

    new ResizeObserver(
      () => {
        fitAddon.fit();
      }
    ).observe(termRef.current!);
  }, [termRef, containerId]);

  return (<>
  <div className=" text-white p-2 border-b flex items-center justify-between">
    <span className="bg-gray-800 p-1 cursor-default" >TERMINAL</span>
    <div className="flex items-center justify-between">
      <RefreshCw onClick={getContainerId} className="cursor-pointer mx-2" />
      <X size={30} strokeWidth={1} onClick={props.click} className="cursor-pointer mx-2" />
    </div>
  </div>
  <div className="pl-3 pt-1 mb-2 overflow-scroll h-[90%] w-full min-h-[]" ref={termRef}></div>
  </>);
}

export default Xterm;