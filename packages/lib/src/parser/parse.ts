import { CharStream, CommonTokenStream } from "antlr4ng";
import * as astNode from "../ast/astNode";
import { ProblemLog } from "../problemLog/problemLog";
import { validateIdentifiers } from "../process/validateIdentifiers";
import { AstBuilderVisitor } from "./astBuilderVisitor";
import { vztxtLexer } from "./generated/vztxtLexer";
import * as vztxtParser from "./generated/vztxtParser";
import { ProblemListener } from "./problemListener";

export type VisitorReturnType = astNode.AstNode | null;

export function parseAndValidate(src: string, problemLog?: ProblemLog) {
  const listener = problemLog ? new ProblemListener(problemLog) : undefined;

  const inputStream = CharStream.fromString(src);

  // Lexer
  const lexer = new vztxtLexer(inputStream);
  lexer.removeErrorListeners();
  if (listener) lexer.addErrorListener(listener);
  const tokenStream = new CommonTokenStream(lexer);

  // Parser
  const parser = new vztxtParser.vztxtParser(tokenStream);
  parser.removeErrorListeners();
  //parser.interpreter.predictionMode = PredictionMode.LL_EXACT_AMBIG_DETECTION;
  if (listener) parser.addErrorListener(listener);
  const tree = parser.start();

  // Construct AST
  const visitor = new AstBuilderVisitor();
  const ast = visitor.visit(tree);

  // Validation Step
  if (ast) {
    validateIdentifiers(ast, problemLog);
  }
  return ast;
}
