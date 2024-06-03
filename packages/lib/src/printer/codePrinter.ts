import { escapeString } from "@vztxt/utils/string";
import * as astNode from "../ast/astNode";
import { NodeTypes } from "../ast/nodeType";
import { NodeVisitorConfig, visitNode } from "../ast/visitor";
import { isKeyword } from "../definitions/keywords";
import {
  binaryOpIsRightAssociative,
  opPrecedenceLookup,
  opSrcDisplay,
} from "../definitions/math";
import { SymbolTable, emptySymbolTable, localScope } from "../ast/symbolTable";
import { scanGlobals } from "../process/scanGlobals";
import { validateIdentifiers } from "../process/validateIdentifiers";

/**
 * Valid identifier pattern.
 */
const identifierTest = /^[A-Za-z_][\w.]*$/;

/**
 * Valid number pattern.
 */
const numberTest = /^-?[0-9_]+(\.[0-9_]+([eE][\-+]?\d+)?)?$/;

/**
 * Indent at a given depth.
 */
const indent = (depth: number) => "  ".repeat(depth);

/**
 * Print a new line separated sequence of nodes.
 */
const printStatements = (
  nodes: astNode.AstNode[],
  symbols: SymbolTable,
  depth: number,
): string =>
  nodes
    .map((node) => "\n" + indent(depth) + visit(node, symbols, depth))
    .join("");

/**
 * Print a block of instructions inside curly braces.
 */
const printStatementBlock = (
  nodes: astNode.AstNode[],
  symbols: SymbolTable,
  depth: number,
) => `{${printStatements(nodes, symbols, depth + 1)}\n${indent(depth)}}`;

/**
 * Print a comma separated sequence.
 */
const printArgumentInner = (nodes: astNode.AstNode[], symbols: SymbolTable) =>
  nodes.map((node) => visit(node, symbols)).join(", ");

/**
 * Print a comma separated sequence in brackets if length > 0.
 */
const printArgumentList = (nodes: astNode.AstNode[], symbols: SymbolTable) =>
  nodes.length > 0 ? `(${printArgumentInner(nodes, symbols)})` : "";

/**
 * Print a list of parameters given as strings.
 *
 * Will return an empty string when array is empty.
 */
const printParameters = (parameters: string[] | undefined) => {
  if (parameters && parameters.length > 0) {
    return `(${parameters.map(sanitizeIdentifier).join(", ")})`;
  }
  return "";
};

/**
 * Check if a given IfNode alternate is an else if statement.
 *
 * @param node IfNode to check
 * @returns Does the alternative have a single node that's also an IfNode?
 */
const hasElseIf = (node: astNode.IfNode) =>
  node.alternative?.length == 1 && node.alternative[0].type == NodeTypes.If;

/**
 * Output a string with quotes and escape characters.
 *
 * Use double quotes unless string contains a double quote without single quotes.
 *
 * @param value Value to quote
 * @returns Quoted value
 */
const printString = (value: string) => {
  if (value.match('"') && !value.match("'")) {
    return `'${escapeString(value, "'")}'`;
  } else {
    return `"${escapeString(value)}"`;
  }
};

/**
 * Check if the identifier requires escaping.
 *
 * Will escape as a string if not a valid identifier or collides with a keyword.
 *
 * @param identifier
 * @returns Sanitized Identifier
 */
const sanitizeIdentifier = (identifier: string) =>
  identifier.match(identifierTest) && !isKeyword(identifier)
    ? identifier
    : printString(identifier);

/**
 * Check if the identifier member part requires escaping.
 *
 * Will escape as a string if not a valid identifier.
 *
 * @param identifier
 * @returns Sanitized Identifier
 */
const sanitizeIdentifierMember = (identifier: string) =>
  identifier.match(identifierTest) ? identifier : printString(identifier);

/**
 * Check if a given identifier in an expression may require a specifier.
 */
const expressionIdentifierMayRequireSpecifier = (
  node: astNode.IdentifierNode,
  symbols: SymbolTable,
) =>
  node.identifier in symbols.builtin.expressionIdentifiers ||
  (node.identifierType != "local" && node.identifier in symbols.locals) ||
  isKeyword(node.identifier) ||
  !node.identifier.match(identifierTest);

/**
 * Check if a given identifier in an expression may require a specifier.
 */
const instructionIdentifierMayRequireSpecifier = (
  node: astNode.InstructionNode,
  symbols: SymbolTable,
) =>
  node.identifier in symbols.builtin.instructionIdentifiers ||
  isKeyword(node.identifier) ||
  !node.identifier.match(identifierTest);

interface VisitorState {
  depth: number;
  precedence: number;
  symbols: SymbolTable;
}

const codeOutputVisitor: NodeVisitorConfig<string, VisitorState> = {
  visitors: {
    [NodeTypes.Program]: (node, { symbols }) =>
      `#program "${node.name}"\n` +
      `${printStatements(node.globals, symbols, 0)}\n` +
      `${printStatements(node.body, symbols, 0)}`,

    [NodeTypes.VariableDeclaration]: (node) =>
      `${node.variableType == "value" ? "var" : "list"} ${sanitizeIdentifier(node.identifier)}`,

    [NodeTypes.Event]: (node, { depth, symbols }) =>
      localScope(symbols, node.locals, () => {
        const locString = node.pos ? `#pos ${printString(node.pos)}\n` : "";
        if (node.eventFilter) {
          return `${locString}on ${printString(node.eventFilter)}${printParameters(node.parameters)} ${printStatementBlock(node.body, symbols, depth)}\n`;
        } else {
          return `${locString}on ${node.event}${printParameters(node.parameters)} ${printStatementBlock(node.body, symbols, depth)}\n`;
        }
      }),

    [NodeTypes.InstructionDeclaration]: (node, { depth, symbols }) =>
      localScope(
        symbols,
        node.locals,
        () =>
          (node.pos ? `#pos ${printString(node.pos)}\n` : "") +
          (node.callFormat ? `#fmt ${printString(node.callFormat)}\n` : "") +
          `def ${sanitizeIdentifier(node.identifier)}${printParameters(node.parameters)} ${printStatementBlock(node.body, symbols, depth)}\n`,
      ),

    [NodeTypes.ExpressionDeclaration]: (node, { symbols }) =>
      localScope(
        symbols,
        node.locals,
        () =>
          (node.pos ? `#pos ${printString(node.pos)}\n` : "") +
          (node.callFormat ? `#fmt ${printString(node.callFormat)}\n` : "") +
          `def expression ${sanitizeIdentifier(node.identifier)}${printParameters(node.parameters)}: ${visit(node.expression, symbols)}\n`,
      ),

    [NodeTypes.Detached]: (node, { depth, symbols }) =>
      (node.pos ? `#pos ${printString(node.pos)}\n` : "") +
      `${printStatementBlock(node.body, symbols, depth)}\n`,

    [NodeTypes.Instruction](node, { symbols }) {
      const callPart =
        node.arguments.length > 0
          ? node.arguments.length > 1
            ? printArgumentList(node.arguments, symbols)
            : " " + printArgumentInner(node.arguments, symbols)
          : "";
      if (instructionIdentifierMayRequireSpecifier(node, symbols)) {
        if (node.instructionType == "global")
          return `this.${sanitizeIdentifier(node.identifier)}${callPart}`;
        // Fall through
      }
      return `${node.identifier}${callPart}`;
    },

    [NodeTypes.If]: (node, { depth, symbols }) =>
      `if ${visit(node.condition, symbols)} ${printStatementBlock(node.consequent, symbols, depth)}` +
      (node.alternative?.length
        ? ` else ${hasElseIf(node) ? visit(node.alternative[0], symbols, depth) : printStatementBlock(node.alternative, symbols, depth)}`
        : ""),

    [NodeTypes.While]: (node, { depth, symbols }) =>
      `while ${visit(node.condition, symbols)} ${printStatementBlock(node.body, symbols, depth)}`,

    [NodeTypes.For]: (node, { depth, symbols }) =>
      localScope(
        symbols,
        node.locals,
        () =>
          `for ${sanitizeIdentifier(node.var)} = ${visit(node.start, symbols, 0)} to ${visit(node.end, symbols, 0)}` +
          (astNode.matchNode<astNode.LiteralNode>(
            node.step,
            NodeTypes.Literal,
          ) && node.step.value == "1"
            ? ""
            : ` step ${visit(node.step, symbols, 0)}`) +
          ` ${printStatementBlock(node.body, symbols, depth)}`,
      ),

    [NodeTypes.Break]: () => "break",

    [NodeTypes.Repeat]: (node, { depth, symbols }) =>
      `repeat ${visit(node.count, symbols)} ${printStatementBlock(node.body, symbols, depth)}`,

    [NodeTypes.Identifier](node, { symbols }) {
      const callPart = printArgumentList(node.arguments ?? [], symbols);
      if (expressionIdentifierMayRequireSpecifier(node, symbols)) {
        if (node.identifierType == "expression")
          return `this.${sanitizeIdentifierMember(node.identifier)}${callPart}`;
        if (node.identifierType == "global")
          return `var.${sanitizeIdentifierMember(node.identifier)}${callPart}`;
        if (node.identifierType == "local")
          return `local.${sanitizeIdentifierMember(node.identifier)}${callPart}`;
        // Fall through
      }
      return `${node.identifier}${callPart}`;
    },

    [NodeTypes.Literal](node) {
      if (node.valueType == "string" || node.valueType == "vector") {
        return node.value != "" && node.value.match(numberTest)
          ? node.value
          : printString(node.value);
      }
      return node.value;
    },

    [NodeTypes.BinaryOp](node, { precedence, symbols }) {
      const opPrecedence = opPrecedenceLookup[node.op] ?? 19;
      const opDisplay = opSrcDisplay[node.op] ?? node.op;
      const inner = binaryOpIsRightAssociative(node.op)
        ? `${visit(node.lhs, symbols, 0, opPrecedence - 1)} ${opDisplay} ${visit(node.rhs, symbols, 0, opPrecedence)}`
        : `${visit(node.lhs, symbols, 0, opPrecedence)} ${opDisplay} ${visit(node.rhs, symbols, 0, opPrecedence - 1)}`;
      if (opPrecedence == 0 || precedence < opPrecedence) return `(${inner})`;
      else return inner;
    },

    [NodeTypes.UnaryOp](node, { precedence, symbols }) {
      const opPrecedence = opPrecedenceLookup.not ?? 8;
      const inner = `${node.op} ${visit(node.operand, symbols, 0, opPrecedence)}`;
      if (precedence < 8) return `(${inner})`;
      else return inner;
    },

    [NodeTypes.Conditional](node, { precedence, symbols }) {
      // Right associative
      const opPrecedence = opPrecedenceLookup.if ?? 11;
      const inner = `if ${visit(node.condition, symbols, 0, opPrecedence)} then ${visit(node.consequent, symbols, 0, opPrecedence - 1)} else ${visit(node.alternative, symbols, 0, opPrecedence)}`;
      if (precedence < opPrecedence) return `(${inner})`;
      else return inner;
    },

    [NodeTypes.Comment]: (node) =>
      `// ${node.comment.replaceAll(/\n/g, "\\n")}`,

    [NodeTypes.Assignment]: (node, { symbols }) => {
      if (astNode.matchNode(node.identifier, "Identifier")) {
        return `${visit(node.identifier, symbols)} ${node.operator} ${visit(node.value, symbols)}`;
      } else {
        return `(${visit(node.identifier, symbols)}) ${node.operator} ${visit(node.value, symbols)}`;
      }
    },
    [NodeTypes.Wait]: (node, { symbols }) => {
      if (node.waitType == "seconds") {
        if (
          astNode.matchNode<astNode.LiteralNode>(node.condition, "Literal") &&
          node.condition.value == "0"
        ) {
          return "wait";
        }
        return `wait ${visit(node.condition, symbols)}`;
      } else {
        return `wait until ${visit(node.condition, symbols)}`;
      }
    },
  },
  fallback: (node) => `<? ${node.type}>`,
};

function visit(
  node: astNode.AstNode,
  symbols: SymbolTable,
  depth = 0,
  precedence = 20,
): string {
  return visitNode(codeOutputVisitor, node, { symbols, depth, precedence });
}

export function codePrinter(ast: astNode.AstNode): string {
  validateIdentifiers(ast);
  const symbols = emptySymbolTable();

  if (astNode.matchNode<astNode.ProgramNode>(ast, "Program")) {
    symbols.globals = scanGlobals(ast);
  }

  return visit(ast, symbols);
}
