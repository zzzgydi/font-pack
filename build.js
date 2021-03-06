const wasmPlugin = {
  name: "wasm",
  setup(build) {
    const fs = require("fs");
    const path = require("path");

    // Resolve ".wasm" files to a path with a namespace
    build.onResolve({ filter: /\.wasm$/ }, (args) => {
      // If this is the import inside the stub module, import the
      // binary itself. Put the path in the "wasm-binary" namespace
      // to tell our binary load callback to load the binary file.
      if (args.namespace === "wasm-stub") {
        return {
          path: args.path,
          namespace: "wasm-binary",
        };
      }

      // Otherwise, generate the JavaScript stub module for this
      // ".wasm" file. Put it in the "wasm-stub" namespace to tell
      // our stub load callback to fill it with JavaScript.
      //
      // Resolve relative paths to absolute paths here since this
      // resolve callback is given "resolveDir", the directory to
      // resolve imports against.
      if (args.resolveDir === "") {
        return; // Ignore unresolvable paths
      }
      return {
        path: path.isAbsolute(args.path)
          ? args.path
          : path.join(args.resolveDir, args.path),
        namespace: "wasm-stub",
      };
    });

    // Virtual modules in the "wasm-stub" namespace are filled with
    // the JavaScript code for compiling the WebAssembly binary. The
    // binary itself is imported from a second virtual module.
    build.onLoad({ filter: /.*/, namespace: "wasm-stub" }, async (args) => ({
      contents: `import wasm from ${JSON.stringify(args.path)}
        export default (imports) =>
          WebAssembly.instantiate(wasm, imports).then(
            result => result.instance.exports)`,
    }));

    // Virtual modules in the "wasm-binary" namespace contain the
    // actual bytes of the WebAssembly file. This uses esbuild's
    // built-in "binary" loader instead of manually embedding the
    // binary data inside JavaScript code ourselves.
    build.onLoad({ filter: /.*/, namespace: "wasm-binary" }, async (args) => ({
      contents: await fs.promises.readFile(args.path),
      loader: "binary",
    }));
  },
};

const fs = require("fs-extra");
const esbuild = require("esbuild");
const watching = process.argv[2] === "-w" || process.argv[2] === "--watch";

esbuild
  .build({
    entryPoints: ["bin/cli.ts"],
    bundle: true,
    watch: watching,
    platform: "node",
    outfile: "dist/cli.js",
    plugins: [wasmPlugin],
  })
  .catch(() => process.exit(1));

esbuild
  .build({
    entryPoints: ["src/index.ts"],
    bundle: true,
    watch: watching,
    platform: "node",
    outfile: "dist/index.js",
    plugins: [wasmPlugin],
  })
  .catch(() => process.exit(1));

esbuild
  .build({
    entryPoints: ["src/worker.ts"],
    bundle: true,
    watch: watching,
    platform: "node",
    outfile: "dist/worker.js",
    plugins: [wasmPlugin],
  })
  .catch(() => process.exit(1));

fs.copyFileSync(
  "./node_modules/fonteditor-core/woff2/woff2.wasm",
  "dist/woff2.wasm"
);
