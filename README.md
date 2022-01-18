# Font Pack

A simple font tool helps to convert ttf to woff and woff2.

## Usage

Use as cli tool:

```shell
font-pack a.ttf b.ttf -o outdir
```

Use as npm dependency:

```js
import fontPack from "font-pack";

await fontPack("a.ttf");
```

## Acknowledgement

- [fontello/ttf2woff](https://github.com/fontello/ttf2woff): ttf2woff converts TTF fonts to WOFF format.
- [fontello/wawoff2](https://github.com/fontello/wawoff2): Google's woff2 build for node.js, using WebAssembly.
