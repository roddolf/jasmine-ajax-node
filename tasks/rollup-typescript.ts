import path from "path";
import {rollup} from "rollup";
import typescript from "rollup-plugin-typescript2";
import {config} from "./common";


export const compile = async () => {
    const bundle = await rollup({
        input: path.resolve(config.src.path, config.src.mainFile),
        external: [
            // Node.js
            "http", "https", "url", "timers", "net", "events",
            // Typescript Helpers
            "tslib"
        ],
        plugins: [
            typescript({
                useTsconfigDeclarationDir: true,

                tsconfig: "tsconfig.json",
                tsconfigOverride: {
                    compilerOptions: {
                        module: "esnext",
                        declaration: true,
                        declarationDir: config.temp.path
                    },
                    include: [
                        config.src.files,
                    ],
                },
            })
        ]
    });

    await bundle.write({
        file: path.resolve(config.dist.path, config.dist.mainJS),
        format: "cjs",
        name: config.packageName,

        sourcemap: true,
        sourcemapExcludeSources: true,
    });
};
compile.displayName = "compile";
