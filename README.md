# Font Pack

A tool helps to generate ttf, woff, woff2 and css file at the same time. Supports splitting font files on demand.

一个可以根据常用字体格式文件，直接生成 ttf、woff 和 woff2 字体文件、以及包含该字体`font-face`定义的 css 文件。同时可以根据需要的字符集裁剪字体文件，实现类似`font-spider`的功能。

## Usage

### Only generate web font

```shell
npx font-pack test.ttf -o dist
```

Output Files:

```txt
dist/test.css
dist/test.tff
dist/test.woff
dist/test.woff2
```

### Split font file

This will generate two font files, one only contain the charset required, and the other contains the rest charset of the font itself.

```shell
npx font-pack test.ttf --split-name test2 --split-chars abcdefg1234567
```

Output Files:

```txt
dist/test.css
dist/test.tff
dist/test.woff
dist/test.woff2
dist/test2.css
dist/test2.tff
dist/test2.woff
dist/test2.woff2
```

## Acknowledgement

- [kekee000/fonteditor-core](https://github.com/kekee000/fonteditor-core): fonteditor core functions.

## License

MIT License. See [here](./LICENSE) for details.
