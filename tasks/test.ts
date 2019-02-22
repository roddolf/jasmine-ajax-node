import del from "del";
import { dest, series, src } from "gulp";
import istanbul from "gulp-istanbul";
import jasmine from "gulp-jasmine";
import sourcemaps from "gulp-sourcemaps";
import typescript from "gulp-typescript";
import { SpecReporter } from "jasmine-spec-reporter";
import path from "path";
import { config } from "./common";
// @ts-ignore
import codecov from "gulp-codecov";


export const compileTemp = () => {
    const tsProject = typescript.createProject("tsconfig.json");

    return src([config.test.files, config.src.files])
        .pipe(sourcemaps.init())
        .pipe(tsProject())
        .pipe((sourcemaps as any).mapSources((sourcePath: string) =>
            path.resolve(config.src.path, sourcePath))
        )
        .pipe(sourcemaps.write(".", { includeContent: false }))
        .pipe(dest(config.temp.path))
        ;
}
compileTemp.displayName = "compileTemp";


export const testRun = () =>
    src(config.temp.files)
        .pipe(jasmine({
            reporter: new SpecReporter({
                summary: {
                    displayStacktrace: true,
                },
            }),
        }))
    ;
testRun.displayName = "testRun";

export const test = series(compileTemp, testRun);
test.displayName = "test";


export const coverageClean = () => del(config.coverage.path);
coverageClean.displayName = "coverageClean";

export const coverageHook = () =>
    src([config.temp.files, "!**/*.spec.js"])
        .pipe(istanbul())
        .pipe(istanbul.hookRequire())
    ;
coverageHook.displayName = "coverageHook";

export const coverageRun = () =>
    // src(config.temp.files)
    src(["temp/register.spec.js"])
        .pipe(jasmine({
            reporter: new SpecReporter({
                summary: {
                    displayStacktrace: true,
                },
            }),
        }))
        .pipe(istanbul.writeReports({
            dir: config.coverage.path,
            reporters: ["json"],
        }))
    // TODO: Enforce a coverage of at least 90%
    // .pipe(istanbul.enforceThresholds({ thresholds: { global: 90 } }))
    ;
coverageRun.displayName = "coverageRun";

export const remapCoverage = () =>
    src(config.coverage.reports.json)
        .pipe(require("remap-istanbul/lib/gulpRemapIstanbul")({
            reports: { ...config.coverage.reports, "text": undefined },
        }))
    ;
remapCoverage.displayName = "remapCoverage";

export const coverage = series(compileTemp, coverageClean, coverageHook, coverageRun, remapCoverage);
coverage.displayName = "coverage";


export const sendCoverage = () =>
    src(config.coverage.reports.lcovonly)
        .pipe(codecov())
    ;
