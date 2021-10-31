import { RollupOptions } from "rollup";
import typescript from "rollup-plugin-typescript2";

const options: RollupOptions[] = [
  {
    input: 'src/index.ts',
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
            declarationDir: 'temp'
          },
          include: [
            'src/**/*.ts',
          ],
        },
      })
    ],
    output: {
      file: 'dist/index.js',
      format: "cjs",
      sourcemap: true,
      sourcemapExcludeSources: true,
    },
  },
];

export default options;
