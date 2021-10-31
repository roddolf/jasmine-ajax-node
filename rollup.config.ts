import { RollupOptions } from "rollup";
import dts from 'rollup-plugin-dts';
import typescript from "rollup-plugin-typescript2";

// Node.js externals
const commonExternal = [ "http", "https", "url", "timers", "net", "events", "stream" ];

const options: RollupOptions[] = [
  {
    input: 'src/index.ts',
    external: [
      ...commonExternal,
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
  {
    input: './temp/index.d.ts',
    external: commonExternal,
    plugins: [
      dts(),
    ],
    output: {
      file: 'dist/index.d.ts',
      format: 'es',
    },
  },
];

export default options;
