import * as astNode from "../ast/astNode";
import { baseTraversingVisitor } from "../ast/baseTraversingVisitor";
import { NodeTypes } from "../ast/nodeType";
import { NodeVisitorConfig, visitNode } from "../ast/visitor";
import { eventDefinitions } from "../definitions/event";
import { IdentifierDefinition } from "../definitions/shared";
import { ProblemLog } from "../problemLog/problemLog";
import { scanGlobals } from "./scanGlobals";
import { SymbolTable, emptySymbolTable, localScope } from "../ast/symbolTable";

interface ValidationState {
  symbols: SymbolTable;
  problemLog?: ProblemLog;
}

const resolveExpressionIdentifierType = (
  state: ValidationState,
  node: astNode.IdentifierNode,
): astNode.IdentifierType => {
  const identifier = node.identifier;
  const args = node.arguments?.length ?? 0;

  if (state.symbols.builtin.expressionIdentifiers[identifier]) {
    return "builtin";
  }

  if (state.symbols.locals[identifier]) {
    return "local";
  }

  if (args == 0 && state.symbols.globals.variables[identifier]) {
    return "global";
  }

  if (state.symbols.globals.expressions[identifier]) {
    return "expression";
  }

  return "invalid";
};

function validateDefinitionUse(
  state: ValidationState,
  node: astNode.IdentifierNode | astNode.InstructionNode,
  definition: IdentifierDefinition | undefined,
) {
  const args = node.arguments?.length ?? 0;
  const identifier = node.identifier;
  if (definition) {
    const parameters = definition.parameters ?? 0;
    if (parameters >= 0 && parameters != args) {
      state.problemLog?.error(
        `'${identifier}' has ${args} out of ${parameters} expected arguments`,
        node.loc?.start,
        node.loc?.end,
      );
    }
  } else {
    state.problemLog?.error(
      `Unknown identifier '${identifier}'`,
      node.identifierLoc?.start ?? node.loc?.start,
      node.identifierLoc?.end ?? node.loc?.end,
    );
  }
}

const validateExpressionIdentifier = (
  state: ValidationState,
  node: astNode.IdentifierNode,
) => {
  const identifier = node.identifier;
  const args = node.arguments?.length ?? 0;
  let definition: IdentifierDefinition | undefined = undefined;

  switch (node.identifierType) {
    case "builtin":
      definition = state.symbols.builtin.expressionIdentifiers[identifier];
      break;
    case "expression":
      definition = state.symbols.globals.expressions[identifier];
      break;
    case "global":
      definition = state.symbols.globals.variables[identifier];
      break;
    case "local":
      const varDef = state.symbols.locals[identifier];
      if (varDef && args != 0) {
        state.problemLog?.error(
          `Variable '${identifier}' is not callable`,
          node.loc?.start,
          node.loc?.end,
        );
      }
      return;
  }

  validateDefinitionUse(state, node, definition);
};

const resolveInstructionIdentifierType = (
  state: ValidationState,
  identifier: string,
): astNode.InstructionType => {
  if (state.symbols.builtin.instructionIdentifiers[identifier]) {
    return "builtin";
  }

  if (state.symbols.globals.instructions[identifier]) {
    return "global";
  }

  return "invalid";
};

const validateInstructionIdentifier = (
  state: ValidationState,
  node: astNode.InstructionNode,
) => {
  const identifier = node.identifier;
  let definition: IdentifierDefinition | undefined = undefined;

  switch (node.instructionType) {
    case "builtin":
      definition = state.symbols.builtin.instructionIdentifiers[identifier];
      break;
    case "global":
      definition = state.symbols.globals.instructions[identifier];
      break;
  }

  validateDefinitionUse(state, node, definition);
};

const validateIdentifierVisitor: NodeVisitorConfig<void, ValidationState> = {
  visitors: {
    [NodeTypes.Program](node, state) {
      state.symbols.globals = scanGlobals(node);

      visitMany(node.body, state);
    },
    [NodeTypes.Event](node, state) {
      const definition = eventDefinitions[node.event];
      for (const parameter of node.parameters) {
        if (!definition.localVars.includes(parameter)) {
          state.problemLog?.error(
            `${parameter} is not a valid parameter for event ${node.event}. Valid options are [${definition.localVars.join(", ")}]`,
            node.parametersLoc?.start ?? node.loc?.start,
            node.parametersLoc?.end ?? node.loc?.end,
          );
        }
      }
      localScope(state.symbols, node.parameters, () => {
        visitMany(node.body, state);
        node.locals = Object.keys(state.symbols.locals);
      });
    },
    [NodeTypes.InstructionDeclaration](node, state) {
      localScope(state.symbols, node.parameters, () => {
        visitMany(node.body, state);
        node.locals = Object.keys(state.symbols.locals);
      });
    },
    [NodeTypes.ExpressionDeclaration](node, state) {
      localScope(state.symbols, node.parameters, () => {
        visit(node.expression, state);
        node.locals = Object.keys(state.symbols.locals);
      });
    },
    [NodeTypes.Instruction](node, state) {
      if (node.instructionType == "unknown") {
        node.instructionType = resolveInstructionIdentifierType(
          state,
          node.identifier,
        );
      }
      validateInstructionIdentifier(state, node);
      visitMany(node.arguments, state);
    },
    [NodeTypes.For](node, state) {
      visit(node.start, state);
      visit(node.end, state);
      visit(node.step, state);
      localScope(state.symbols, [node.var], () => {
        visitMany(node.body, state);
        node.locals = Object.keys(state.symbols.locals);
      });
    },
    [NodeTypes.Identifier](node, state) {
      if (node.identifierType == "unknown") {
        node.identifierType = resolveExpressionIdentifierType(state, node);
      }
      validateExpressionIdentifier(state, node);
      visitMany(node.arguments, state);
    },
  },

  fallback: baseTraversingVisitor(visit),
};

function visit(node: astNode.AstNode, state: ValidationState) {
  visitNode(validateIdentifierVisitor, node, state);
}

const visitMany = (
  body: astNode.AstNode[] | undefined,
  state: ValidationState,
) => {
  for (const node of body ?? []) visit(node, state);
};

export function validateIdentifiers(
  ast: astNode.AstNode,
  problemLog?: ProblemLog,
) {
  visit(ast, {
    symbols: emptySymbolTable(),
    problemLog,
  });
}
