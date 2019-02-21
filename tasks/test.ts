import { dest, src } from "gulp";
import filter from "gulp-filter";
import jasmine from "gulp-jasmine";
import sourcemaps from "gulp-sourcemaps";
import typescript from "gulp-typescript";
import { SpecReporter } from "jasmine-spec-reporter";
import path from "path";
import { config } from "./common";


export const test = () => {
    const tsProject = typescript.createProject("tsconfig.json");

    return src([config.test.files, config.src.files])
        .pipe(sourcemaps.init())
        .pipe(tsProject())
        .pipe((sourcemaps as any).mapSources((sourcePath: string) =>
            path.resolve(config.src.path, sourcePath))
        )
        .pipe(sourcemaps.write(".", { includeContent: false }))
        .pipe(dest(config.temp.path))
        .pipe(filter(config.temp.files))
        .pipe(jasmine({
            reporter: new SpecReporter({
                summary: {
                    displayStacktrace: true,
                },
            }),
        }))
        ;
}
test.displayName = "test";
