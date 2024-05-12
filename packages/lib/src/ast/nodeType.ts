import * as astNode from "./astNode";

export const NodeTypes = {
  Error: "Error",
  Unknown: "Unknown",

  Program: "Program",

  // Top level
  VariableDeclaration: "VariableDeclaration",
  InstructionDeclaration: "InstructionDeclaration",
  ExpressionDeclaration: "ExpressionDeclaration",
  Event: "Event",
  Detached: "Detached",

  // Instructions
  Instruction: "Instruction",
  Assignment: "Assignment",
  Comment: "Comment",
  Wait: "Wait",

  // Control flow
  If: "If",
  While: "While",
  For: "For",
  Break: "Break",
  Repeat: "Repeat",

  // Expression
  Identifier: "Identifier",
  Literal: "Literal",
  BinaryOp: "BinaryOp",
  UnaryOp: "UnaryOp",
  Conditional: "Conditional",
} as const;

export type NodeType = keyof typeof NodeTypes;

export interface NodeTypeMap {
  [NodeTypes.Error]: astNode.ErrorNode;
  [NodeTypes.Unknown]: astNode.AstNode<typeof NodeTypes.Unknown>;

  [NodeTypes.Program]: astNode.ProgramNode;

  [NodeTypes.VariableDeclaration]: astNode.VariableDeclarationNode;
  [NodeTypes.InstructionDeclaration]: astNode.InstructionDeclarationNode;
  [NodeTypes.ExpressionDeclaration]: astNode.ExpressionDeclarationNode;
  [NodeTypes.Event]: astNode.EventNode;
  [NodeTypes.Detached]: astNode.DetachedNode;

  [NodeTypes.Instruction]: astNode.InstructionNode;
  [NodeTypes.Assignment]: astNode.AssignmentNode;
  [NodeTypes.Comment]: astNode.CommentNode;
  [NodeTypes.Wait]: astNode.WaitNode;

  [NodeTypes.If]: astNode.IfNode;
  [NodeTypes.While]: astNode.WhileNode;
  [NodeTypes.For]: astNode.ForNode;
  [NodeTypes.Break]: astNode.BreakNode;
  [NodeTypes.Repeat]: astNode.RepeatNode;

  [NodeTypes.Identifier]: astNode.IdentifierNode;
  [NodeTypes.Literal]: astNode.LiteralNode;
  [NodeTypes.BinaryOp]: astNode.BinaryOpNode;
  [NodeTypes.UnaryOp]: astNode.UnaryOpNode;
  [NodeTypes.Conditional]: astNode.ConditionalNode;
}
