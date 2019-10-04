const packageName = "jasmine-ajax-node";

export const config = {
    packageName,
    dist: {
        path: "dist/",
        mainJS: `${packageName}.js`,
        mainDTS: `${packageName}.d.ts`,
    },
    src: {
        path: "src/",
        files: "src/**/*.ts",
        mainFile: "index.ts",
    },
    temp: {
        path: "temp/",
        files: "temp/**/*.js",
        mainDTS: "index.d.ts",
    },
    test: {
        path: "src/",
        files: "src/**/*.spec.ts",
    },
    coverage: {
        path: "coverage/",
        reports: {
            json: "coverage/coverage-final.json",
            html: "coverage/html-report",
            lcovonly: "coverage/lcov.info",
        }
    }
};