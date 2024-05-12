import * as astNode from "../ast/astNode";
import { nodeProgram } from "./root";

export function importXml(program: Element): astNode.ProgramNode | undefined {
  if (program.nodeName != "Program") return undefined;

  return nodeProgram(program);
}
