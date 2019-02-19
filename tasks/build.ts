import { series } from "gulp";
import { cleanAll } from "./clean";
import { compile } from "./rollup-typescript";
import { extractAPI } from "./api-extractor";


export const build = series(cleanAll, compile, extractAPI);
export default build;
