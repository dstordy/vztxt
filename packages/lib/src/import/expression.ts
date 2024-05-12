import { assertUnlessDefined } from "@vztxt/utils/assert";
import * as astNode from "../ast/astNode";
import { nodeFactory } from "../ast/nodeFactory";

const binaryOpFns = ["rand", "min", "max", "atan2"] as const;

export function nodeExpression(el: Element | null): astNode.AstNode {
  if (!el) return nodeFactory.error({});

  try {
    return (
      expressionElementHandlers[el.nodeName] ??
      (() => {
        console.warn(`Unknown node ${el.nodeName}`);
        return nodeFactory.unknown({});
      })
    )(el);
  } catch (error) {
    console.error(error);
    return nodeFactory.error({});
  }
}

const args = (nodes: astNode.AstNode[]) =>
  nodes.length > 0 ? { arguments: nodes } : {};
const argsFromChildren = (el: Element) =>
  args([...el.children].map(nodeExpression));

const allButLastArgFromChildren = (el: Element) =>
  args([...el.children].slice(0, -1).map(nodeExpression));
const propertyRewrites: Record<string, string> = {
  "Mfd.LocaltoDisplay": "Mfd.LocalToDisplay",
};

const rewritePropertyIdentifier = (identifier: string) => {
  const lookup = propertyRewrites[identifier];
  return lookup ?? identifier;
};

const expressionElementHandlers: Record<
  string,
  (el: Element) => astNode.AstNode
> = {
  MathFunction: (el) =>
    nodeFactory.identifier({
      identifier: `Math.${el.getAttribute("function") ?? ""}`,
      identifierType: "builtin",
      arguments: [nodeExpression(el.firstElementChild)],
    }),
  Constant: (el) => {
    if (el.hasAttribute("number"))
      return nodeFactory.literal({
        valueType: "number",
        value: el.getAttribute("number") ?? "",
      });
    else if (el.hasAttribute("bool"))
      return nodeFactory.literal({
        valueType: "bool",
        value: el.getAttribute("bool") ?? "",
      });
    else if (el.hasAttribute("vector"))
      return nodeFactory.literal({
        valueType: "vector",
        value: el.getAttribute("vector") ?? "",
      });
    else
      return nodeFactory.literal({
        valueType: "string",
        value: el.getAttribute("text") ?? "",
      });
  },
  Vector: (el) =>
    nodeFactory.identifier({
      identifier: "Vec",
      identifierType: "builtin",
      ...argsFromChildren(el),
    }),
  Variable: (el) =>
    nodeFactory.identifier({
      identifier: el.getAttribute("variableName") ?? "",
      identifierType:
        (el.getAttribute("local") ?? "false") == "true" ? "local" : "global",
    }),
  BinaryOp: (el) => {
    const [lhs, rhs] = el.children;
    if (
      (binaryOpFns as readonly string[]).includes(el.getAttribute("op") ?? "")
    ) {
      return nodeFactory.identifier({
        identifier: `Math.${el.getAttribute("op") ?? ""}`,
        identifierType: "builtin",
        arguments: [lhs, rhs].map(nodeExpression),
      });
    } else {
      return nodeFactory.binaryOp({
        op: el.getAttribute("op") ?? "+",
        lhs: nodeExpression(lhs),
        rhs: nodeExpression(rhs),
      });
    }
  },
  BoolOp: (el) => {
    const [lhs, rhs] = el.children;
    return nodeFactory.binaryOp({
      op: el.getAttribute("op") ?? "+",
      lhs: nodeExpression(lhs),
      rhs: nodeExpression(rhs),
    });
  },
  Comparison: (el) => {
    const [lhs, rhs] = el.children;
    return nodeFactory.binaryOp({
      op: el.getAttribute("op") ?? "+",
      lhs: nodeExpression(lhs),
      rhs: nodeExpression(rhs),
    });
  },
  StringOp: (el) =>
    nodeFactory.identifier({
      identifier: `String.${el.getAttribute("op")}${el.hasAttribute("subOp") ? `.${el.getAttribute("subOp")}` : ""}`,
      identifierType: "builtin",
      ...(el.getAttribute("op") == "format" || el.getAttribute("op") == "join"
        ? allButLastArgFromChildren(el)
        : argsFromChildren(el)),
    }),
  VectorOp: (el) =>
    nodeFactory.identifier({
      identifier: `Vec.${el.getAttribute("op") ?? ""}`,
      identifierType: "builtin",
      ...argsFromChildren(el),
    }),
  ListOp: (el) =>
    nodeFactory.identifier({
      identifier: `List.${el.getAttribute("op") ?? ""}`,
      identifierType: "builtin",
      ...argsFromChildren(el),
    }),
  Planet: (el) =>
    nodeFactory.identifier({
      identifier: `Planet.${el.getAttribute("op") ?? ""}`,
      identifierType: "builtin",
      ...argsFromChildren(el),
    }),
  ActivationGroup: (el) =>
    nodeFactory.identifier({
      identifier: "AG.Get",
      identifierType: "builtin",
      ...argsFromChildren(el),
    }),
  EvaluateExpression: (el) =>
    nodeFactory.identifier({
      identifier: "funk",
      identifierType: "builtin",
      arguments: [nodeExpression(el.firstElementChild)],
    }),
  Not: (el) =>
    nodeFactory.unaryOp({
      op: "not",
      operand: nodeExpression(el.firstElementChild),
    }),
  Conditional: (el) => {
    const [condition, isTrue, isFalse] = el.children;
    return nodeFactory.conditional({
      condition: nodeExpression(condition),
      consequent: nodeExpression(isTrue),
      alternative: nodeExpression(isFalse),
    });
  },
  CraftProperty: (el) =>
    nodeFactory.identifier({
      identifier: rewritePropertyIdentifier(
        assertUnlessDefined(el.getAttribute("property")),
      ),
      identifierType: "builtin",
      ...argsFromChildren(el),
    }),
  CallCustomExpression: (el) =>
    nodeFactory.identifier({
      identifier: assertUnlessDefined(el.getAttribute("call")),
      identifierType: "expression",
      ...argsFromChildren(el),
    }),
} as const;
