import { IoMdTimer } from "react-icons/io";

export interface Task {
  name: string;
  duration: string;
  startTime: string;
  endTime?: string;
}

export function TaskItem({ name, duration }: Task) {
  return (
    <div className="flex h-auto w-auto rounded-md bg-white bg-opacity-40 py-1 text-white">
      <p className="flex w-2/3 justify-center truncate px-5">
        {name.length > 8 ? name.slice(0, 8) + "..." : name}
      </p>
      <div className="flex w-auto flex-shrink-0 items-center space-x-1 pr-5">
        <IoMdTimer />
        <p>{duration}</p>
      </div>
    </div>
  );
}

function TasksList({ tasks }: { tasks: Task[] }) {
  return (
    <div className="mt-10 flex h-1/4 w-auto flex-col space-y-1 overflow-x-hidden overflow-y-scroll px-8">
      {tasks.map((task) => (
        <TaskItem key={`${task.name}-${task.startTime}`} {...task} />
      ))}
    </div>
  );
}

export default TasksList;
