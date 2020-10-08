import del from "del";
import { parallel, TaskFunction } from "gulp";
import { config } from "./common";


export const cleanDist: TaskFunction = () => del(config.dist.path);
cleanDist.displayName = "cleanDist";

export const cleanTemp: TaskFunction = () => del(config.temp.path);
cleanTemp.displayName = "cleanTemp";

export const cleanAll: TaskFunction = parallel(cleanDist, cleanTemp);
cleanAll.displayName = "cleanAll";
