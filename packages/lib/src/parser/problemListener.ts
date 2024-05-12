import { ATNSimulator, BaseErrorListener, Recognizer, Token } from "antlr4ng";
import { ProblemLog } from "../problemLog/problemLog";

export class ProblemListener extends BaseErrorListener {
  log: ProblemLog;

  constructor(log: ProblemLog) {
    super();
    this.log = log;
  }

  public override syntaxError(
    recognizer: Recognizer<ATNSimulator> | null,
    offendingSymbol: Token | null,
    line: number,
    charPositionInLine: number,
    msg: string | null,
  ): void {
    this.log.error(
      msg ?? "",
      {
        line,
        col: charPositionInLine + 1,
      },
      {
        line,
        col: charPositionInLine + (offendingSymbol?.text ?? "").length + 1,
      },
    );
  }
}
