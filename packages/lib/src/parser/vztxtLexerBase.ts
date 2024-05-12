import { CharStream, Lexer, LexerOptions, Token } from "antlr4ng";
import { vztxtLexer } from "./generated/vztxtLexer";

export abstract class VztxtLexerBase extends Lexer {
  #opened = 0;

  constructor(input: CharStream, options?: Partial<LexerOptions>) {
    super(input, options);
  }

  nextToken(): Token {
    const nextToken = super.nextToken();

    switch (nextToken.type) {
      case vztxtLexer.LPAR:
        this.#opened += 1;
        break;
      case vztxtLexer.RPAR:
        this.#opened = Math.max(this.#opened - 1, 0);
        break;
    }

    if (this.#opened > 0) {
      if (nextToken.type == vztxtLexer.NL)
        nextToken.channel = Token.HIDDEN_CHANNEL;
    }

    return nextToken;
  }
}
