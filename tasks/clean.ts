import del from "del";
import { parallel } from "gulp";
import { config } from "./common";


export const cleanDist = () => del(config.dist.path);
cleanDist.displayName = "cleanDist";

export const cleanTemp = () => del(config.temp.path);
cleanTemp.displayName = "cleanTemp";

export const cleanAll = parallel(cleanDist, cleanTemp);
cleanAll.displayName = "cleanAll";
