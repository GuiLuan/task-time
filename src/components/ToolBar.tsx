import { appWindow } from "@tauri-apps/api/window";
import { PhysicalSize } from "@tauri-apps/api/window";
import { message } from "antd";
import { useState } from "react";
import { AiFillPushpin, AiOutlinePushpin } from "react-icons/ai";
import { BiHide } from "react-icons/bi";
import {
  IoReader,
  IoTabletPortraitOutline,
  IoCopyOutline,
} from "react-icons/io5";
import { AiOutlineClear } from "react-icons/ai";

function UtilsBar({
  exportFunc,
  clearFunc,
  miniMode,
  switchFullMode,
}: {
  exportFunc: () => void;
  clearFunc: () => void;
  miniMode: boolean;
  switchFullMode: () => void;
}) {
  return miniMode ? (
    <MiniToolBar switchFullMode={switchFullMode} exportFunc={exportFunc} />
  ) : (
    <div className="mb-5 mt-6 flex h-auto items-baseline justify-center text-white">
      <IoReader
        className="size-12 cursor-pointer text-white transition-all duration-100 hover:-translate-y-1 hover:drop-shadow-md"
        onClick={() => {
          exportFunc();
          message.success("导出到剪贴板");
        }}
      />

      <AiOutlineClear
        className="size-12 cursor-pointer text-white transition-all duration-100 hover:-translate-y-1 hover:drop-shadow-md"
        onClick={() => {
          clearFunc();
          message.success("清空内容");
        }}
      />
    </div>
  );
}

function MiniToolBar({
  switchFullMode,
  exportFunc,
}: {
  switchFullMode: () => void;
  exportFunc: () => void;
}) {
  const [alwaysOnTop, setAlwaysOnTop] = useState(false);

  return (
    <div className="absolute right-1 flex h-full w-auto flex-row justify-center space-x-1 pt-2">
      <div className="flex flex-col justify-start space-y-1">
        <BiHide
          className="size-4 cursor-pointer text-white transition-shadow duration-300 hover:drop-shadow-sm"
          onClick={() => appWindow.hide()}
        />

        <IoTabletPortraitOutline
          className="size-4 cursor-pointer text-white transition-shadow duration-300 hover:drop-shadow-sm"
          onClick={() => {
            appWindow.setSize(new PhysicalSize(320, 480));
            switchFullMode();
          }}
        />
      </div>
      <div className="flex flex-col justify-start space-y-1">
        {alwaysOnTop ? (
          <AiFillPushpin
            className="size-4 cursor-pointer text-white transition-shadow duration-300 hover:drop-shadow-sm"
            onClick={() => {
              setAlwaysOnTop(() => false);
              appWindow.setAlwaysOnTop(false);
            }}
          />
        ) : (
          <AiOutlinePushpin
            className="size-4 cursor-pointer text-white transition-shadow duration-300 hover:drop-shadow-sm"
            onClick={() => {
              setAlwaysOnTop(() => true);
              appWindow.setAlwaysOnTop(true);
            }}
          />
        )}

        <IoCopyOutline
          className="size-4 cursor-pointer text-white transition-shadow duration-300 hover:drop-shadow-sm"
          onClick={() => exportFunc()}
        />
      </div>
    </div>
  );
}

export default UtilsBar;
