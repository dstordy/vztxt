import { IdentifierDefinition } from "../definitions/shared";
import * as astNode from "../ast/astNode";
import { NodeTypes } from "../ast/nodeType";

export interface GlobalSymbols {
  instructions: Record<string, IdentifierDefinition>;
  expressions: Record<string, IdentifierDefinition>;
  variables: Record<string, IdentifierDefinition>;
}

export function scanGlobals(program: astNode.ProgramNode): GlobalSymbols {
  const result: GlobalSymbols = {
    instructions: {},
    expressions: {},
    variables: {},
  };

  for (const varDec of program.globals) {
    result.variables[varDec.identifier] = {
      identifier: varDec.identifier,
      xmlElement: "Variable",
      xmlStaticAttributes: {
        list: varDec.variableType == "list" ? "true" : "false",
        local: "false",
        variableName: varDec.identifier,
      },
    };
  }

  for (const block of program.body) {
    if (
      astNode.matchNode<astNode.InstructionDeclarationNode>(
        block,
        NodeTypes.InstructionDeclaration,
      )
    ) {
      result.instructions[block.identifier] = {
        identifier: block.identifier,
        xmlElement: "CallCustomInstruction",
        xmlStaticAttributes: {
          call: block.identifier,
          style: "call-custom-instruction",
        },
        parameters: block.parameters.length,
      };
    } else if (
      astNode.matchNode<astNode.ExpressionDeclarationNode>(
        block,
        NodeTypes.ExpressionDeclaration,
      )
    ) {
      result.expressions[block.identifier] = {
        identifier: block.identifier,
        xmlElement: "CallCustomExpression",
        xmlStaticAttributes: {
          call: block.identifier,
          style: "call-custom-expression",
        },
        parameters: block.parameters.length,
      };
    }
  }

  return result;
}
