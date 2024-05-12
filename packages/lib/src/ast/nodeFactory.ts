import * as astNode from "./astNode";
import { NodeTypes } from "./nodeType";

function baseFactory<T extends astNode.AstNode>(nodeType: T["type"]) {
  return (
    data: Omit<T, "type">,
  ): { type: typeof nodeType } & Omit<T, "type"> => ({
    type: nodeType,
    ...data,
  });
}

export const nodeFactory = {
  error: baseFactory<astNode.ErrorNode>(NodeTypes.Error),
  unknown: baseFactory<astNode.AstNode>(NodeTypes.Unknown),

  program: baseFactory<astNode.ProgramNode>(NodeTypes.Program),

  variableDeclaration: baseFactory<astNode.VariableDeclarationNode>(
    NodeTypes.VariableDeclaration,
  ),
  instructionDeclaration: baseFactory<astNode.InstructionDeclarationNode>(
    NodeTypes.InstructionDeclaration,
  ),
  expressionDeclaration: baseFactory<astNode.ExpressionDeclarationNode>(
    NodeTypes.ExpressionDeclaration,
  ),
  event: baseFactory<astNode.EventNode>(NodeTypes.Event),
  detached: baseFactory<astNode.DetachedNode>(NodeTypes.Detached),

  instruction: baseFactory<astNode.InstructionNode>(NodeTypes.Instruction),
  assignment: baseFactory<astNode.AssignmentNode>(NodeTypes.Assignment),
  comment: baseFactory<astNode.CommentNode>(NodeTypes.Comment),
  wait: baseFactory<astNode.WaitNode>(NodeTypes.Wait),

  if: baseFactory<astNode.IfNode>(NodeTypes.If),
  while: baseFactory<astNode.WhileNode>(NodeTypes.While),
  for: baseFactory<astNode.ForNode>(NodeTypes.For),
  break: baseFactory<astNode.BreakNode>(NodeTypes.Break),
  repeat: baseFactory<astNode.RepeatNode>(NodeTypes.Repeat),

  identifier: baseFactory<astNode.IdentifierNode>(NodeTypes.Identifier),
  literal: baseFactory<astNode.LiteralNode>(NodeTypes.Literal),
  binaryOp: baseFactory<astNode.BinaryOpNode>(NodeTypes.BinaryOp),
  unaryOp: baseFactory<astNode.UnaryOpNode>(NodeTypes.UnaryOp),
  conditional: baseFactory<astNode.ConditionalNode>(NodeTypes.Conditional),
} as const;
