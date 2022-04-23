import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";
import nodeResolve from "@rollup/plugin-node-resolve";
import replace from "@rollup/plugin-replace";
import typescript from "@rollup/plugin-typescript";
import { terser } from "rollup-plugin-terser";

const env = process.env.NODE_ENV;

export default {
  input: "src/index.ts",
  plugins: [
    json({ compact: true }),
    commonjs(),
    nodeResolve({
      browser: true,
      extensions: [".js", ".ts"],
      dedupe: ["bn.js", "buffer"],
      preferBuiltins: false,
    }),
    typescript({
      tsconfig: "./tsconfig.base.json",
      moduleResolution: "node",
      outDir: "dist/browser",
      target: "es2019",
      outputToFilesystem: false,
    }),
    replace({
      preventAssignment: true,
      values: {
        "process.env.NODE_ENV": JSON.stringify(env),
        "process.env.BROWSER": JSON.stringify(true),
      },
    }),
    terser(),
  ],
  external: ["@project-serum/anchor", "@solana/spl-token", "bs58", "buffer", "date-fns"],
  output: {
    file: "dist/browser/index.js",
    format: "es",
    sourcemap: true,
  },
};
