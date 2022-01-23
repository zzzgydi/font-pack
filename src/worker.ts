import { workerData } from "worker_threads";
import { TasksData, runner } from "./utils/runner";

runner(workerData as TasksData);
