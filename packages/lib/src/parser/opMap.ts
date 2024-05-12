import { vztxtLexer } from "./generated/vztxtLexer";

export const opMap: Record<number, string> = {
  [vztxtLexer.EQUAL]: "=",
  [vztxtLexer.PLUSEQ]: "+=",

  [vztxtLexer.PLUS]: "+",
  [vztxtLexer.MINUS]: "-",
  [vztxtLexer.MULTIPLY]: "*",
  [vztxtLexer.DIVIDE]: "/",
  [vztxtLexer.MOD]: "%",
  [vztxtLexer.POWER]: "^",

  [vztxtLexer.EQEQUAL]: "=",
  [vztxtLexer.GT]: "g",
  [vztxtLexer.GTEQ]: "ge",
  [vztxtLexer.LT]: "l",
  [vztxtLexer.LTEQ]: "le",

  [vztxtLexer.AND]: "and",
  [vztxtLexer.OR]: "or",

  [vztxtLexer.NOT]: "not",
} as const;
