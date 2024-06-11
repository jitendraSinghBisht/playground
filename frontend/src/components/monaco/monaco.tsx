import { fileData, updateFile } from "@/store/slice/files.slice";
import Editor from "@monaco-editor/react";
import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

function Monaco(props: { click: () => void }) {
  const exToLang: { [key: string]: string } = {
    py: "python",
    java: "java",
    js: "javascript",
    ts: "typescript",
    c: "c",
    cpp: "cpp",
    md: "markdown",
  };

  const file = useSelector(fileData);
  const dispatch = useDispatch();
  const [lang,setLang] = useState<string>("markdown");

  useEffect(()=>{
    setLang(exToLang[file.curFile?.split(".").pop() || "md"])
  },[file.curFile])

  return (
    <div className="h-full w-full">
      <div className=" text-white p-1 flex items-center justify-between">
        <span className="bg-gray-800 p-1 cursor-default">{`${file.curFile}`}</span>
        <X
          size={30}
          strokeWidth={1}
          onClick={props.click}
          className="cursor-pointer mx-2"
        />
      </div>
      <Editor
        theme="vs-dark"
        className="h-full w-full"
        language={lang}
        value={file.curFileData}
        onChange={(value)=>{dispatch(updateFile({curFileData: value}))}}
        options={{
          wordWrap: "on",
          folding: false,
          lineNumbersMinChars: 3,
          fontSize: 20,
          automaticLayout: true,
          cursorBlinking: "phase",
          tabSize: 2,
        }}
      />
    </div>
  );
}

export default Monaco;
