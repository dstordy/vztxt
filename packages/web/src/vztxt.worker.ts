import * as astNode from "@vztxt/lib/ast/astNode";
import { parseAndValidate } from "@vztxt/lib/parser/parse";
import { ProblemLog } from "@vztxt/lib/problemLog/problemLog";
import { expose } from "comlink";

export class VztxtWorker {
  validate(src: string) {
    const logger = new ProblemLog();
    parseAndValidate(src, logger);

    return logger.problems;
  }

  produceAst(src: string) {
    const logger = new ProblemLog();
    const ast = parseAndValidate(src);
    let filename = "out.xml";
    if (ast && astNode.matchNode<astNode.ProgramNode>(ast, "Program")) {
      filename = ast.name + ".xml";
    }
    return {
      problems: logger.problems,
      filename,
      ast,
    };
  }
}

expose(new VztxtWorker());
