export interface Times {
  hours: number;
  minutes: number;
  seconds: number;
  miliseconds?: number;
}

function smartConvertToTwoDigitNumber(num: number) {
  if (num < 10) {
    return `0${num}`;
  } else {
    return `${num}`;
  }
}

function TimeShower({
  hours,
  minutes,
  seconds,
  miniMode,
}: Times & { miniMode: boolean }) {
  return miniMode ? (
    <MiniTimeShower hours={hours} minutes={minutes} seconds={seconds} />
  ) : (
    <div className="flex h-auto w-full flex-col items-center space-y-3 text-white">
      <p className="cursor-default select-none text-3xl">{hours} 时</p>
      <p className="cursor-default select-none text-5xl">{minutes} 分</p>
      <p className="cursor-default select-none text-3xl">{seconds} 秒</p>
    </div>
  );
}

function MiniTimeShower({ hours, minutes, seconds }: Times) {
  return (
    <div className="flex flex-row items-center space-x-2 pl-2">
      <p className="cursor-default select-none text-xl text-white drop-shadow-md">
        {smartConvertToTwoDigitNumber(hours)} 时
      </p>
      <p className="cursor-default select-none text-2xl text-white drop-shadow-md">
        {smartConvertToTwoDigitNumber(minutes)} 分
      </p>
      <p className="cursor-default select-none text-xl text-white drop-shadow-md">
        {smartConvertToTwoDigitNumber(seconds)} 秒
      </p>
    </div>
  );
}

export default TimeShower;
