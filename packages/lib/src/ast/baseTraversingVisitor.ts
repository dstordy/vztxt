import { AstNode } from "./astNode";
import { NodeTypes } from "./nodeType";
import { NodeVisitorConfig } from "./visitor";

/**
 * Make a visitor that can be used as a fallback for another visitor,
 * given that visitor's visit function. Does not handle visitors with returns.
 *
 * @param visit Visit function to use on traversal
 * @returns A visit function to traverse AST nodes.
 */
export function baseTraversingVisitor<D extends NonNullable<unknown>>(
  visit: (node: AstNode, state: D) => void,
) {
  const config: NodeVisitorConfig<void, D> = {
    visitors: {
      [NodeTypes.Program](node, state) {
        visitMany(node.body, state);
      },
      [NodeTypes.Detached](node, state) {
        visitMany(node.body, state);
      },
      [NodeTypes.Event](node, state) {
        visitMany(node.body, state);
      },
      [NodeTypes.InstructionDeclaration](node, state) {
        visitMany(node.body, state);
      },
      [NodeTypes.ExpressionDeclaration](node, state) {
        visit(node.expression, state);
      },
      [NodeTypes.Instruction](node, state) {
        visitMany(node.arguments, state);
      },
      [NodeTypes.Assignment](node, state) {
        visit(node.identifier, state);
        visit(node.value, state);
      },
      [NodeTypes.Comment]() {
        // Terminal
      },
      [NodeTypes.Wait](node, state) {
        visit(node.condition, state);
      },
      [NodeTypes.If](node, state) {
        visit(node.condition, state);
        visitMany(node.consequent, state);
        visitMany(node.alternative, state);
      },
      [NodeTypes.While](node, state) {
        visit(node.condition, state);
        visitMany(node.body, state);
      },
      [NodeTypes.For](node, state) {
        visit(node.start, state);
        visit(node.end, state);
        visit(node.step, state);
        visitMany(node.body, state);
      },
      [NodeTypes.Break]() {
        // Terminal
      },
      [NodeTypes.Repeat](node, state) {
        visit(node.count, state);
        visitMany(node.body, state);
      },
      [NodeTypes.Identifier](node, state) {
        visitMany(node.arguments, state);
      },
      [NodeTypes.Literal]() {
        // Terminal
      },
      [NodeTypes.BinaryOp](node, state) {
        visit(node.lhs, state);
        visit(node.rhs, state);
      },
      [NodeTypes.UnaryOp](node, state) {
        visit(node.operand, state);
      },
      [NodeTypes.Conditional](node, state) {
        visit(node.condition, state);
        visit(node.consequent, state);
        visit(node.alternative, state);
      },
    },

    fallback(node) {
      console.warn(`Unexpected visit to ${node.type}`);
    },
  };

  function visitMany(body: AstNode[] | undefined, state: D) {
    for (const node of body ?? []) visit(node, state);
  }

  return (node: AstNode, state: D) => {
    const v = config.visitors[node.type] as (node: AstNode, state: D) => void;
    (v ?? config.fallback)(node, state);
  };
}
