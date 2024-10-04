import { Event, listen } from "@tauri-apps/api/event";
import { useEffect, useRef, useState } from "react";

import Header from "./components/Header";
import TimeShower, { Times } from "./components/TimeShower";
import TasksList, { Task } from "./components/HistoryTask";
import UtilsBar from "./components/ToolBar";

import { useTimer } from "./hooks";
import copy from "copy-to-clipboard";
import Wave from "react-wavify";

let WAIT_COUNT: number = 10; // 等待计时器，与后端的定义保持一致

function getTimeStringSecondsAgo(seconds: number) {
  const now = new Date();
  now.setSeconds(now.getSeconds() - seconds);
  return now.toLocaleTimeString();
}

function timeDifference(start: string, end: string): string {
  const [startHours, startMinutes, startSeconds] = start.split(":").map(Number);
  const [endHours, endMinutes, endSeconds] = end.split(":").map(Number);

  const startDate = new Date(0, 0, 0, startHours, startMinutes, startSeconds);
  const endDate = new Date(0, 0, 0, endHours, endMinutes, endSeconds);

  let diff = (endDate.getTime() - startDate.getTime()) / 1000;

  const hours = Math.floor(diff / 3600);
  diff %= 3600;
  const minutes = Math.floor(diff / 60);
  const seconds = Math.floor(diff % 60);

  return [
    hours.toString().padStart(2, "0"),
    minutes.toString().padStart(2, "0"),
    seconds.toString().padStart(2, "0"),
  ].join(":");
}

function App() {
  const [miniMode, setMiniMode] = useState(true); // 默认开启最小化模式

  /* 指定 [] 依赖，防止每次重渲染都增绑监听函数 */
  useEffect(() => {
    const unlisten1 = listen("new_task", handleNewTaskEvent);
    const unlisten2 = listen("switch_window", handleSwitchWindowEvent);

    return () => {
      unlisten1.then((f) => f());
      unlisten2.then((f) => f());
    };
  }, []);

  /* 计时相关 */
  const [changeTimer, setChangerTimer] = useState(false);
  const times = useTimer(changeTimer, WAIT_COUNT * 1000);

  /* 当前任务及历史任务 */
  const curInfo = useRef<{ task: Task; times: Times } | null>(null);
  const [curTask, setCurTask] = useState<Task | null>(null);
  const [historyTasks, setHistoryTasks] = useState<Task[]>([]);

  const [switchCount, setSwitchCount] = useState(0);
  const [switchWindowName, setSwitchWindowName] = useState("");

  useEffect(() => {
    curInfo.current = {
      task: curTask!,
      times: times,
    };
  }, [curTask, times]);

  const handleSwitchWindowEvent = (
    event: Event<{ title: string; count: number }>,
  ) => {
    console.log(
      `${WAIT_COUNT - event.payload.count} 秒后将切换到任务: ${event.payload.title}`,
    );
    setSwitchCount(event.payload.count);
    setSwitchWindowName(event.payload.title);
  };

  const handleNewTaskEvent = (event: Event<{ title: string }>) => {
    const title = event.payload.title;

    function createNewTask(): Task {
      return {
        name: event.payload.title,
        duration: "00:00:00",
        startTime:
          title === "暂停中"
            ? new Date().toLocaleTimeString()
            : getTimeStringSecondsAgo(WAIT_COUNT),
      };
    }

    console.log("新的任务准备开始计时: ", event.payload.title);

    if (curInfo.current!.task === null) {
      /* 当前没有任务，则新建任务 */
      console.log("新建任务");
      setCurTask(createNewTask());
    } else {
      /* 否则，先保存当前已经存在的任务，再切换当前任务 */
      console.log("切换任务");
      setHistoryTasks((list) => {
        const startTime = curInfo.current!.task.startTime;
        const endTime =
          title === "暂停中"
            ? new Date().toLocaleTimeString()
            : getTimeStringSecondsAgo(WAIT_COUNT);
        return [
          ...list,
          {
            ...curInfo.current!.task,
            duration: timeDifference(startTime, endTime),
            endTime: endTime,
          },
        ];
      });
      setCurTask(createNewTask());
    }

    /* 更新顶部计数条 */
    setSwitchCount(WAIT_COUNT);

    /* 重载计时器 */
    setChangerTimer((s) => !s);
  };

  /* 数据导出 */
  function exportFunc() {
    console.log("正在导出");
    if (curInfo.current === null) {
      return;
    } else {
      const copyInfo = Array.from(historyTasks);
      // 包括当前执行的任务也保存一下
      if (curTask !== null) {
        const _curTaskStartTime = curTask.startTime;
        const _curTaskLastTime = getTimeStringSecondsAgo(WAIT_COUNT);
        copyInfo.push({
          ...curTask,
          endTime: _curTaskLastTime,
          duration: timeDifference(_curTaskStartTime, _curTaskLastTime),
        });
      }
      copy(JSON.stringify(copyInfo, null, 2));
      console.log("复制到剪粘板");
    }
  }

  return (
    <div
      className={
        miniMode
          ? "flex h-[100vh] w-[100vw] flex-row items-center rounded-bl-lg rounded-tr-lg bg-gradient-to-r from-[#FE5C44] to-[#FC4D62]"
          : "flex h-[100vh] w-[100vw] flex-col rounded-lg bg-gradient-to-t from-[#FE5C44] to-[#FC4D62]"
      }
    >
      <Header
        taskName={curTask === null ? "无任务" : curTask.name}
        waitCount={WAIT_COUNT}
        count={switchCount}
        nextInfo={switchWindowName}
        switchMiniMode={() => setMiniMode(true)}
        miniMode={miniMode}
      />
      <TimeShower {...times} miniMode={miniMode} />
      {miniMode ? null : <TasksList tasks={[...historyTasks].reverse()} />}
      <UtilsBar
        exportFunc={exportFunc}
        clearFunc={() => {
          setHistoryTasks([]);
          setCurTask(null);
          setChangerTimer((s) => !s);
        }}
        miniMode={miniMode}
        switchFullMode={() => setMiniMode(false)}
      />

      {
        // 海浪背景
        miniMode ? (
          <Wave
            className="pointer-events-none fixed -bottom-[120px] left-0 z-0 overflow-hidden"
            fill="#f1f1f153"
            paused={false}
            style={{ display: "flex" }}
            options={{
              height: 20,
              amplitude: 5,
              speed: 0.3,
              points: 5,
            }}
          />
        ) : (
          <Wave
            className="pointer-events-none fixed -bottom-12 left-0 z-0 overflow-hidden"
            fill="#f1f1f153"
            paused={false}
            style={{ display: "flex" }}
            options={{
              height: 20,
              amplitude: 10,
              speed: 0.3,
              points: 4,
            }}
          />
        )
      }
    </div>
  );
}

export default App;
