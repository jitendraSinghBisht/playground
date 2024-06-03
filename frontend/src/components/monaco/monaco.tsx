import Editor from "@monaco-editor/react";
import { RefreshCw, X } from "lucide-react";

function Monaco(props: { click: () => void }) {
  return (
    <div className="h-full w-full">
      <div className=" text-white p-1 flex items-center justify-between">
        <span className="bg-gray-800 p-1 cursor-default">currentFileName</span>
        <div className="flex items-center justify-between">
          <RefreshCw
            onClick={() => {
              /* TODO: refresh and create new conatiner */
            }}
            className="cursor-pointer mx-2"
          />
          <X
            size={30}
            strokeWidth={1}
            onClick={props.click}
            className="cursor-pointer mx-2"
          />
        </div>
      </div>
      <Editor
        theme="vs-dark"
        className="h-full w-full"
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
