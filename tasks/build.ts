import { series } from "gulp";
import { extractAPI } from "./api-extractor";
import { cleanAll } from "./clean";
import { compile } from "./rollup-typescript";

const build = series(cleanAll, compile, extractAPI);
export { build as default, build };

