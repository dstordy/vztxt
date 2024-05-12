import { IdentifierType, InstructionType } from "./astNode";
import { builtinIdentifiers } from "../definitions/builtinIdentifiers";
import { IdentifierDefinition } from "../definitions/shared";
import { GlobalSymbols } from "../process/scanGlobals";

export interface SymbolTable {
  builtin: typeof builtinIdentifiers;
  globals: GlobalSymbols;
  locals: Record<string, string>;
  localsStack: Record<string, string>[];
}

/**
 * Push a local symbol context on the symbol table and call callback function.
 *
 * Handles pushing a new local scope on and off the given symbol table,
 * modifying it's state during the callback then restoring the previous
 * state from the stack.
 *
 * @param symbols Symbol table to modify
 * @param locals Local values to seed the local scope
 * @param callback Inner callback function
 * @returns Value retuned by the callback
 */
export function localScope<T = void>(
  symbols: SymbolTable,
  locals: string[] | undefined,
  callback: () => T,
) {
  symbols.localsStack.push(symbols.locals);
  symbols.locals = Object.create(symbols.locals) as Record<string, string>;
  for (const localVar of locals ?? []) symbols.locals[localVar] = localVar;

  const returnValue = callback();

  symbols.locals = symbols.localsStack.pop() ?? {};

  return returnValue;
}

/**
 * Empty symbol table (with builtin identifiers)
 */
export const emptySymbolTable = (): SymbolTable => ({
  builtin: builtinIdentifiers,
  globals: {
    expressions: {},
    instructions: {},
    variables: {},
  },
  locals: {},
  localsStack: [],
});

/**
 * Given a expression identifier and type, find definition in symbol table.
 *
 * @param symbols Symbol table to search
 * @param identifier Identifier name
 * @param identifierType Identifier type
 * @returns Found definition or undefined if not found
 */
export function resolveExpressionIdentifierDefinition(
  symbols: SymbolTable,
  identifier: string,
  identifierType: IdentifierType,
): IdentifierDefinition | undefined {
  switch (identifierType) {
    case "local":
      return {
        identifier: identifier,
        xmlElement: "Variable",
        xmlStaticAttributes: {
          list: "false",
          local: "true",
          variableName: identifier,
        },
      };
    case "global":
      return symbols.globals.variables[identifier];
    case "expression":
      return symbols.globals.expressions[identifier];
    case "builtin":
      return symbols.builtin.expressionIdentifiers[identifier];
    default:
      return undefined;
  }
}

/**
 * Given a instruction identifier and type, find definition in symbol table.
 *
 * @param symbols Symbol table to search
 * @param identifier Identifier name
 * @param identifierType Identifier type
 * @returns Found definition or undefined if not found
 */
export function resolveInstructionIdentifierDefinition(
  symbols: SymbolTable,
  identifier: string,
  instructionType: InstructionType,
): IdentifierDefinition | undefined {
  switch (instructionType) {
    case "global":
      return symbols.globals.instructions[identifier];
    case "builtin":
      return symbols.builtin.instructionIdentifiers[identifier];
    default:
      return undefined;
  }
}
