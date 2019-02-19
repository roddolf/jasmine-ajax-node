const packageName = "jasmine-ajax-node"

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
        mainDTS: "index.d.ts",
    }
};