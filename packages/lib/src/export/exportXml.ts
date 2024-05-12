import * as astNode from "../ast/astNode";
import { NodeTypes } from "../ast/nodeType";
import { NodeVisitorConfig, visitNode } from "../ast/visitor";
import { getBinaryOpDefinition } from "../definitions/binaryOp";
import { eventDefinitions } from "../definitions/event";
import { IdentifierDefinition } from "../definitions/shared";
import { scanGlobals } from "../process/scanGlobals";
import * as symbolTable from "../ast/symbolTable";

export class XmlExportError extends Error {
  constructor(message: string) {
    super(message);
  }
}

interface XmlGenState {
  doc: XMLDocument;
  symbols: symbolTable.SymbolTable;
  id: number;
}

type XmlNodeType = Element | DocumentFragment;

/**
 * XML Element creation shortcut.
 *
 * @param state Generation state
 * @param tag Output element tag
 * @param attributes Element attributes
 * @param children Element children nodes
 * @returns Created XML element
 */
function createElement(
  state: XmlGenState,
  tag: string,
  attributes?: Record<string, string | number>,
  children?: XmlNodeType[],
) {
  const el = state.doc.createElement(tag);
  if (attributes)
    for (const [k, v] of Object.entries(attributes)) {
      el.setAttribute(k, v.toString());
    }
  if (children) children.forEach((c) => el.appendChild(c));
  return el;
}

/**
 * Create XML Element for given identifier definition.
 *
 * @param state Generation state
 * @param definition Identifier definition
 * @param attributes extra element attributes
 * @param children element children
 * @returns
 */
function createDefinedElement<T extends string, A>(
  state: XmlGenState,
  definition: IdentifierDefinition<T, A>,
  attributes?: Record<string, string | number>,
  children?: XmlNodeType[],
) {
  return createElement(
    state,
    definition.xmlElement,
    {
      ...attributes,
      ...definition.xmlStaticAttributes,
    },
    children,
  );
}

/**
 * Handle creation of an Instructions element
 */
function bodyInstructions({
  nodes,
  state,
  head,
  locals,
  pos,
}: {
  nodes: astNode.AstNode[];
  state: XmlGenState;
  head?: XmlNodeType;
  locals?: string[];
  pos?: string;
}): XmlNodeType {
  if (nodes.length > 0 || head) {
    return symbolTable.localScope(state.symbols, locals ?? [], () => {
      const instructions = createElement(state, "Instructions");
      if (head) instructions.appendChild(head);

      nodes
        .map((n) => visit(n, state))
        .forEach((n) => instructions.appendChild(n));

      if (pos) instructions.firstElementChild?.setAttribute("pos", pos);
      return instructions;
    });
  }
  return state.doc.createDocumentFragment();
}

const xmlOutputVisitor: NodeVisitorConfig<XmlNodeType, XmlGenState> = {
  visitors: {
    [NodeTypes.Program](node, state) {
      state.symbols.globals = scanGlobals(node);

      const program = createElement(state, "Program", {
        name: node.name,
      });

      const variables = createElement(state, "Variables");
      program.appendChild(variables);
      node.globals
        .map((v) => visit(v, state))
        .forEach((e) => variables.appendChild(e));

      const expressions = createElement(state, "Expressions");

      node.body
        .map((n) => visit(n, state))
        .forEach((e) => {
          if (e.nodeName == "CustomExpression") expressions.appendChild(e);
          else program.appendChild(e);
        });

      program.appendChild(expressions);

      return program;
    },
    [NodeTypes.VariableDeclaration](node, state) {
      const variable = createElement(state, "Variable", {
        name: node.identifier,
      });

      if (node.variableType == "value") {
        variable.setAttribute("number", "0");
      } else {
        variable.appendChild(createElement(state, "Items"));
      }

      return variable;
    },
    [NodeTypes.Event](node, state) {
      const definition = eventDefinitions[node.event];
      if (!definition)
        throw new XmlExportError(`Unexpected Event '${node.event}'`);

      const event = createElement(state, "Event", {
        event: node.event,
        id: state.id++,
        style: definition.style,
      });

      if (definition.hasFilter) {
        event.appendChild(
          createElement(state, "Constant", {
            canReplace: "false",
            text: node.eventFilter ?? "",
          }),
        );
      }

      return bodyInstructions({
        nodes: node.body,
        state,
        head: event,
        locals: definition.localVars,
        pos: node.pos,
      });
    },
    [NodeTypes.InstructionDeclaration](node, state) {
      const formats = {
        callFormat: `${node.identifier}${node.parameters.map((_, i) => ` (${i})`).join("")}`,
        format: `${node.identifier}${node.parameters.map((p) => ` |${p}|`).join("")}`,
      };
      if (
        node.callFormat &&
        [...node.callFormat.matchAll(/_/g)].length === node.parameters.length
      ) {
        let n = 0;
        formats.callFormat = `${node.identifier} ${node.callFormat.replaceAll(/_/g, () => `(${n++})`)}`;
        n = 0;
        formats.format = `${node.identifier} ${node.callFormat.replaceAll(/_/g, () => `|${node.parameters[n++]}|`)}`;
      }
      return bodyInstructions({
        nodes: node.body,
        state,
        head: createElement(state, "CustomInstruction", {
          ...formats,
          name: node.identifier,
          id: state.id++,
          style: "custom-instruction",
        }),
        locals: node.parameters,
        pos: node.pos,
      });
    },
    [NodeTypes.Detached](node, state) {
      return bodyInstructions({ nodes: node.body, state, pos: node.pos });
    },
    [NodeTypes.ExpressionDeclaration](node, state) {
      const formats = {
        callFormat: `${node.identifier}${node.parameters.map((_, i) => ` (${i})`).join("")}`,
        format: `${node.identifier}${node.parameters.map((p) => ` |${p}|`).join("")} return (0)`,
      };
      if (
        node.callFormat &&
        [...node.callFormat.matchAll(/_/g)].length === node.parameters.length
      ) {
        let n = 0;
        formats.callFormat = `${node.identifier} ${node.callFormat.replaceAll(/_/g, () => `(${n++})`)}`;
        n = 0;
        formats.format = `${node.identifier} ${node.callFormat.replaceAll(/_/g, () => `|${node.parameters[n++]}|`)} return (0)`;
      }
      return symbolTable.localScope(state.symbols, node.parameters, () => {
        return createElement(
          state,
          "CustomExpression",
          {
            name: node.identifier,
            ...formats,
            style: "custom-expression",
            ...(node.pos ? { pos: node.pos } : {}),
          },
          [visit(node.expression, state)],
        );
      });
    },
    [NodeTypes.Instruction](node, state) {
      const definition = symbolTable.resolveInstructionIdentifierDefinition(
        state.symbols,
        node.identifier,
        node.instructionType,
      );
      if (definition) {
        return createDefinedElement(state, definition, { id: state.id++ }, [
          ...(node.arguments ?? []).map((n) => visit(n, state)),
          ...(definition.staticArgumentsPost ?? []).map((n) => visit(n, state)),
        ]);
      }
      return state.doc.createDocumentFragment();
    },
    [NodeTypes.Wait](node, state) {
      return createElement(
        state,
        node.waitType == "seconds" ? "WaitSeconds" : "WaitUntil",
        {
          id: state.id++,
          style: node.waitType == "seconds" ? "wait-seconds" : "wait-until",
        },
        [visit(node.condition, state)],
      );
    },
    [NodeTypes.If](node, state) {
      const result = state.doc.createDocumentFragment();

      result.appendChild(
        createElement(
          state,
          "If",
          {
            id: state.id++,
            style: "if",
          },
          [
            visit(node.condition, state),
            bodyInstructions({ nodes: node.consequent, state }),
          ],
        ),
      );

      function handleAlternative(alternative?: astNode.AstNode[]) {
        if (
          alternative?.length == 1 &&
          astNode.matchNode<astNode.IfNode>(alternative[0], "If")
        ) {
          // Only has an IF node -> elseif
          const elseIfNode = alternative[0];
          result.appendChild(
            createElement(
              state,
              "ElseIf",
              {
                id: state.id++,
                style: "else-if",
              },
              [
                visit(elseIfNode.condition, state),
                bodyInstructions({ nodes: elseIfNode.consequent, state }),
              ],
            ),
          );
          handleAlternative(elseIfNode.alternative);
        } else if ((alternative?.length ?? 0) > 0) {
          // has a body -> else
          result.appendChild(
            createElement(
              state,
              "ElseIf",
              {
                id: state.id++,
                style: "else",
              },
              [
                createElement(state, "Constant", { bool: "true" }),
                bodyInstructions({ nodes: alternative ?? [], state }),
              ],
            ),
          );
        }
      }

      handleAlternative(node.alternative);

      return result;
    },
    [NodeTypes.While](node, state) {
      return createElement(
        state,
        "While",
        {
          id: state.id++,
          style: "while",
        },
        [
          visit(node.condition, state),
          bodyInstructions({ nodes: node.body, state }),
        ],
      );
    },
    [NodeTypes.For](node, state) {
      return symbolTable.localScope(state.symbols, [node.var], () =>
        createElement(
          state,
          "For",
          {
            var: node.var,
            id: state.id++,
            style: "for",
          },
          [
            visit(node.start, state),
            visit(node.end, state),
            visit(node.step, state),
            bodyInstructions({ nodes: node.body, state }),
          ],
        ),
      );
    },
    [NodeTypes.Break](_, state) {
      return createElement(state, "Break", { style: "break" });
    },
    [NodeTypes.Repeat](node, state) {
      return createElement(
        state,
        "Repeat",
        {
          id: state.id++,
          style: "repeat",
        },
        [
          visit(node.count, state),
          bodyInstructions({ nodes: node.body, state }),
        ],
      );
    },
    [NodeTypes.Identifier](node, state) {
      const definition = symbolTable.resolveExpressionIdentifierDefinition(
        state.symbols,
        node.identifier,
        node.identifierType,
      );
      if (definition) {
        return createDefinedElement(state, definition, {}, [
          ...(node.arguments ?? []).map((n) => visit(n, state)),
          ...(definition.staticArgumentsPost ?? []).map((n) => visit(n, state)),
        ]);
      } else {
        return state.doc.createDocumentFragment();
      }
    },
    [NodeTypes.Literal](node, state) {
      switch (node.valueType) {
        case "bool":
          return createElement(state, "Constant", {
            style: node.value,
            bool: node.value,
          });
        case "number":
          return createElement(state, "Constant", {
            number: node.value,
          });
        case "string":
          return createElement(state, "Constant", {
            text: node.value,
          });
        case "vector":
          return createElement(state, "Constant", {
            vector: node.value,
          });
      }
    },
    [NodeTypes.BinaryOp](node, state) {
      const definition = getBinaryOpDefinition(node.op);
      if (!definition) throw new XmlExportError(`Unexpected op '${node.op}'`);

      return createDefinedElement(
        state,
        definition,
        {
          op: node.op,
        },
        [visit(node.lhs, state), visit(node.rhs, state)],
      );
    },
    [NodeTypes.UnaryOp](node, state) {
      if (node.op == "not") {
        return createElement(
          state,
          "Not",
          {
            style: "op-not",
          },
          [visit(node.operand, state)],
        );
      }

      throw new XmlExportError(`Unexpected op '${node.op}'`);
    },
    [NodeTypes.Conditional](node, state) {
      return createElement(
        state,
        "Conditional",
        {
          style: "conditional",
        },
        [
          visit(node.condition, state),
          visit(node.consequent, state),
          visit(node.alternative, state),
        ],
      );
    },
    [NodeTypes.Assignment](node, state) {
      if (node.operator == "+=") {
        return createElement(
          state,
          "ChangeVariable",
          {
            id: state.id++,
            style: "change-variable",
          },
          [visit(node.identifier, state), visit(node.value, state)],
        );
      } else {
        // TODO if variable is list => "list-init"
        return createElement(
          state,
          "SetVariable",
          {
            id: state.id++,
            style: "set-variable",
          },
          [visit(node.identifier, state), visit(node.value, state)],
        );
      }
    },
    [NodeTypes.Comment](node, state) {
      return createElement(
        state,
        "Comment",
        {
          id: state.id++,
          style: "comment",
        },
        [
          createElement(state, "Constant", {
            style: "comment-text",
            canReplace: "false",
            text: node.comment,
          }),
        ],
      );
    },
  },
  fallback(node) {
    throw new XmlExportError(`Unexpected AST node ${node.type}`);
  },
};

function visit(node: astNode.AstNode, state: XmlGenState): XmlNodeType {
  return visitNode(xmlOutputVisitor, node, state);
}

export function exportXml(ast: astNode.AstNode): XMLDocument {
  const doc = document.implementation.createDocument(null, null);
  doc.appendChild(
    doc.createProcessingInstruction("xml", `version="1.0" encoding="utf-8"`),
  );

  doc.appendChild(
    visit(ast, {
      symbols: symbolTable.emptySymbolTable(),
      doc,
      id: 0,
    }),
  );

  return doc;
}
