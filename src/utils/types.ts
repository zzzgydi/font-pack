export interface Options {
  name?: string;
  outdir?: string;
  css?: boolean; // default is true
  splitName?: string;
  splitByTxt?: string; // utf-8
  splitByChars?: string;
  hinting?: boolean; // keep hinting or not, default false
  tranfrom?: boolean; // tranfrom compound glyph to simple, default true
}

export interface InnerOptions {
  type: string;
  name: string;
  outDir: string;
}
