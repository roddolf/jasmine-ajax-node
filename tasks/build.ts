import { series } from "gulp";
import { cleanAll } from "./clean";
import { compile } from "./rollup-typescript";
import { extractAPI } from "./api-extractor";

const build = series(cleanAll, compile, extractAPI);
export { build as default, build };
