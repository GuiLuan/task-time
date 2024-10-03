import { useUpdateEffect } from "ahooks";
import { Times } from "./components/TimeShower";
import { useState } from "react";

export function useTimer(change: boolean, baseMillis: number): Times {
  const [times, setTimes] = useState<Times>({
    seconds: 0,
    minutes: 0,
    hours: 0,
    miliseconds: baseMillis,
  });

  function initTimes() {
    setTimes({
      seconds: 0,
      minutes: 0,
      hours: 0,
      miliseconds: baseMillis,
    });
  }

  /* 当且仅当依赖更新时运行，避免了初始化默认运行的问题 */
  useUpdateEffect(() => {
    console.log("更新定时器");
    initTimes();

    const intervalId = setInterval(() => {
      setTimes((prevState) => {
        const cur_miliseconds = prevState.miliseconds! + 1000;
        return {
          miliseconds: cur_miliseconds,
          seconds: Math.floor((cur_miliseconds / 1000) % 60),
          minutes: Math.floor((cur_miliseconds / (1000 * 60)) % 60),
          hours: Math.floor((cur_miliseconds / (1000 * 60 * 60)) % 24),
        };
      });
    }, 1000);

    return () => {
      console.log("移除定时器");
      clearInterval(intervalId);
      initTimes();
    };
  }, [change]);

  return times;
}
