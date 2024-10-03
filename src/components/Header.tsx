import { appWindow } from "@tauri-apps/api/window";
import { PhysicalSize } from "@tauri-apps/api/window";
import { Progress, Tooltip } from "antd";
import { AiOutlinePushpin, AiFillPushpin } from "react-icons/ai";
import { useState } from "react";
import { BiHide } from "react-icons/bi";
import {
  IoExit,
  IoExitOutline,
  IoTabletLandscapeOutline,
} from "react-icons/io5";
import { emit } from "@tauri-apps/api/event";

function Header({
  taskName,
  waitCount,
  count,
  nextInfo,
  switchMiniMode,
  miniMode,
}: {
  taskName: string;
  waitCount: number;
  count?: number;
  nextInfo?: string;
  switchMiniMode: () => void;
  miniMode: boolean;
}) {
  count = count || 0;
  const remainCount = waitCount - count;
  const [alwaysOnTop, setAlwaysOnTop] = useState(false);
  const [stepOut, setStepOut] = useState(false);

  return miniMode ? (
    <MiniHeader remainCount={remainCount} waitCount={waitCount} />
  ) : (
    <div
      data-tauri-drag-region
      className="flex h-auto w-full items-center justify-center px-8 py-7 hover:cursor-move"
    >
      {remainCount != 0 && (
        <div className="absolute left-3 top-2 flex flex-row items-center justify-center space-x-4">
          <Progress
            type="circle"
            size={30}
            trailColor="#fda2a2"
            strokeColor={"white"}
            percent={(remainCount / waitCount) * 100}
            format={() => (
              <p className="select-none font-sans text-[1.4em] text-white">
                {remainCount}
              </p>
            )}
          />
          <p className="w-auto select-none truncate rounded-full bg-white bg-opacity-20 px-3 text-white">
            {nextInfo!.length > 8 ? nextInfo!.slice(0, 8) + "..." : nextInfo}
          </p>
        </div>
      )}

      <Tooltip placement="bottomLeft" title={taskName}>
        <p className="font cursor-default select-none truncate pt-5 text-2xl text-white drop-shadow-sm">
          {taskName.length > 20 ? taskName.slice(0, 20) + "..." : taskName}
        </p>
      </Tooltip>

      <div className="absolute right-3 top-3 flex flex-row items-center justify-center space-x-1">
        {stepOut ? (
          <IoExit
            className="size-5 cursor-pointer text-white transition-shadow duration-300 hover:drop-shadow-sm"
            onClick={() => {
              setStepOut(() => false);
              emit("resume");
            }}
          />
        ) : (
          <IoExitOutline
            className="size-5 cursor-pointer text-white transition-shadow duration-300 hover:drop-shadow-sm"
            onClick={() => {
              setStepOut(() => true);
              emit("pause");
            }}
          />
        )}

        {alwaysOnTop ? (
          <AiFillPushpin
            className="size-5 cursor-pointer text-white transition-shadow duration-300 hover:drop-shadow-sm"
            onClick={() => {
              setAlwaysOnTop(() => false);
              appWindow.setAlwaysOnTop(false);
            }}
          />
        ) : (
          <AiOutlinePushpin
            className="size-5 cursor-pointer text-white transition-shadow duration-300 hover:drop-shadow-sm"
            onClick={() => {
              setAlwaysOnTop(() => true);
              appWindow.setAlwaysOnTop(true);
            }}
          />
        )}

        <BiHide
          className="size-5 cursor-pointer text-white transition-shadow duration-300 hover:drop-shadow-sm"
          onClick={() => appWindow.hide()}
        />

        <IoTabletLandscapeOutline
          className="size-5 cursor-pointer pl-1 text-white transition-shadow duration-300 hover:drop-shadow-sm"
          onClick={() => {
            appWindow.setSize(new PhysicalSize(300, 55));
            switchMiniMode();
          }}
        />
      </div>
    </div>
  );
}

function MiniHeader({
  remainCount,
  waitCount,
}: {
  remainCount: number;
  waitCount: number;
}) {
  return (
    <div
      data-tauri-drag-region
      className="flex h-full w-14 cursor-move items-center justify-center"
    >
      {remainCount != 0 && (
        <div className="flex flex-row items-center justify-center space-x-4">
          <Progress
            type="circle"
            size={30}
            trailColor="#fda2a2"
            strokeColor={"white"}
            percent={(remainCount / waitCount) * 100}
            format={() => (
              <p className="cursor-default select-none font-sans text-[1.4em] text-white">
                {remainCount}
              </p>
            )}
          />
          {/* <p className="w-auto truncate rounded-full bg-white bg-opacity-20 px-3 text-white">
            {nextInfo!.length > 8 ? nextInfo!.slice(0, 8) + "..." : nextInfo}
          </p> */}
        </div>
      )}
    </div>
  );
}

export default Header;
