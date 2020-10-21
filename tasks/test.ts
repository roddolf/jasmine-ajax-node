/// <reference types="../typings" />
import del from "del";
import { dest, series, src, TaskFunction } from "gulp";
import codecov from "gulp-codecov";
import istanbul from "gulp-istanbul";
import jasmine from "gulp-jasmine";
import sourcemaps from "gulp-sourcemaps";
import typescript from "gulp-typescript";
import { SpecReporter, StacktraceOption } from "jasmine-spec-reporter";
import path from "path";
import remapIstanbul from 'remap-istanbul/lib/gulpRemapIstanbul';
import { config } from "./common";

declare module 'gulp-sourcemaps' {
  function mapSources(mapper: (sourcePath: string) => string): NodeJS.ReadWriteStream;
}

export const compileTemp: TaskFunction = () => {
  const tsProject = typescript.createProject("tsconfig.json");

  return src([config.test.files, config.src.files])
    .pipe(sourcemaps.init())
    .pipe(tsProject())
    .pipe((sourcemaps).mapSources((sourcePath: string) =>
      path.resolve(config.src.path, sourcePath))
    )
    .pipe(sourcemaps.write(".", { includeContent: false }))
    .pipe(dest(config.temp.path))
  ;
}
compileTemp.displayName = "compileTemp";


export const testRun: TaskFunction = () =>
  src(config.temp.files)
    .pipe(jasmine({
      reporter: new SpecReporter({
        summary: {
          displayStacktrace: StacktraceOption.PRETTY,
        },
      }),
    }))
    ;
testRun.displayName = "testRun";

export const test = series(compileTemp, testRun);
test.displayName = "test";


export const coverageClean: TaskFunction = () => del(config.coverage.path);
coverageClean.displayName = "coverageClean";

export const coverageHook: TaskFunction = () =>
  src([config.temp.files, "!**/*.spec.js"])
    .pipe(istanbul())
    .pipe(istanbul.hookRequire())
    ;
coverageHook.displayName = "coverageHook";

export const coverageRun: TaskFunction = () =>
  src(config.temp.files)
    .pipe(jasmine({
      reporter: new SpecReporter({
        summary: {
          displayStacktrace: StacktraceOption.PRETTY,
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

export const remapCoverage: TaskFunction = () =>
  src(config.coverage.reports.json)
    .pipe(remapIstanbul({
      reports: { ...config.coverage.reports, "text": undefined },
    }))
    ;
remapCoverage.displayName = "remapCoverage";

export const coverage = series(compileTemp, coverageClean, coverageHook, coverageRun, remapCoverage);
coverage.displayName = "coverage";


export const sendCoverage: TaskFunction = () =>
  src(config.coverage.reports.lcovonly)
    .pipe(codecov())
    ;
