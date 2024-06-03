import { RefreshCw, SquareArrowOutUpRight, X } from "lucide-react";
import { useState } from "react";

export default function Preview(props: {click: ()=>void}) {
  const [url, setUrl] = useState<string>("https://example.org/");

  function chngUrl(e: React.ChangeEvent<HTMLInputElement>) {
    setUrl(e.target.value);
  }

  return (
    <div className="h-full w-full bg-black">
      <div className="flex">
        <RefreshCw size={30} strokeWidth={1.5} onClick={()=>{/* TODO: refresh and get the url */}} className="cursor-pointer mx-1" />
        <input
          title="url"
          className="text-white pl-2 bg-gray-700 focus:ring-0 focus-visible:outline-none w-full"
          placeholder=""
          onChange={chngUrl}
          value={url}
        />
        <SquareArrowOutUpRight size={30} strokeWidth={1.5} onClick={()=> window.open(url,"_blank","noopener,noreferrer")} className="cursor-pointer mx-2" />
        <X size={30} strokeWidth={1.5} onClick={props.click} className="cursor-pointer mx-2" />
      </div>
      <iframe title="preview" src={url} className="h-full w-full"></iframe>
    </div>
  );
}