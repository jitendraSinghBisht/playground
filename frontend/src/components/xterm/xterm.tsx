import { Terminal } from "@xterm/xterm";
import axios from "axios";
import { FitAddon } from '@xterm/addon-fit';
import '@xterm/xterm/css/xterm.css'
import { useRef, useEffect, useState } from "react";
import { RefreshCw, X } from "lucide-react";
import { useSelector } from "react-redux";
import { volumeData } from "@/store/slice/volume.slice";
import { IApiError, IApiResponse } from "@/types";

const term = new Terminal({ convertEol: true,cursorBlink: true  });

function Xterm(props: {click: ()=>void}) {

  const [containerId, setContainerId] = useState(getContainerId())
  const [ws, setWS] = useState(new WebSocket(`${import.meta.env.VITE_WS_URL}/terminal/container/${containerId}`))
  const volume = useSelector(volumeData)

  async function getContainerId() {
    try {
      const response = await axios.post(`/container/create`, {
        name: volume.volumeName,
        lang: volume.volumeLang
      });
      const jres: IApiResponse | IApiError = await response.data;
      if (!jres.success) {
        alert("Unable to deploy... \nTry again later....");
        return;
      }
      const cId = jres.data.containerId;
      ws.close();
      setWS(new WebSocket(`${import.meta.env.VITE_WS_URL}/terminal/container/${cId}`))
      return cId;
    } catch (error) {
      alert("Unable to deploy... \nTry again later....");
      console.log(error);
    }
  }

  const termRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    term.open(termRef.current!);

    ws.onmessage= (ev: MessageEvent<string>)=>{
      term.write(ev.data)
    }
    term.onKey((e) => {
      ws.send(e.key)
    })

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    fitAddon.fit();

    new ResizeObserver(
      () => {
        fitAddon.fit();
      }
    ).observe(termRef.current!);
  }, [termRef, containerId, ws]);

  return (<>
  <div className=" text-white p-2 border-b flex items-center justify-between">
    <span className="bg-gray-800 p-1 cursor-default" >TERMINAL</span>
    <div className="flex items-center justify-between">
      <RefreshCw onClick={()=>{setContainerId(getContainerId())}} className="cursor-pointer mx-2" />
      <X size={30} strokeWidth={1} onClick={props.click} className="cursor-pointer mx-2" />
    </div>
  </div>
  <div className="pl-3 pt-1 mb-2 overflow-scroll h-[90%] w-full min-h-[]" ref={termRef}></div>
  </>);
}

export default Xterm;