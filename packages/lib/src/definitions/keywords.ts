export const keywords = [
  "var",
  "list",
  "this",
  "local",

  "on",
  "def",
  "expression",
  "wait",
  "until",

  "if",
  "then",
  "else",
  "while",
  "for",
  "to",
  "step",
  "break",
  "repeat",

  "and",
  "or",
  "not",

  "true",
  "false",
] as const;

export const isKeyword = (value: string) =>
  (keywords as readonly string[]).includes(value);
