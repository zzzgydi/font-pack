export interface Options {
  /**
   * specify the font name
   */
  name?: string;

  /**
   * the font output dir
   */
  outdir?: string;

  /**
   * whether generate css file(default: true)
   */
  css?: boolean;

  /**
   * keep ttf hinting or not(default: false)
   */
  hinting?: boolean;

  /**
   * transform compound glyph to simple(default: true)
   */
  transform?: boolean;

  /**
   * the split font name(default: {name}-split)
   */
  splitName?: string;

  /**
   * the txt file path encoding as utf-8
   * when set this field, it will enable font split
   */
  splitByTxt?: string;

  /**
   * the split chars string
   * when set this field, it will enable font split
   */
  splitByChars?: string;
}

export interface InnerOptions {
  type: string;
  name: string;
  outDir: string;
}
