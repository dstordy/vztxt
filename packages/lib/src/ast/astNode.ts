import { NodeType, NodeTypes } from "./nodeType";

export interface SrcLocation {
  line: number;
  col: number;
}

export interface SrcRange {
  start: SrcLocation;
  end: SrcLocation;
}

export interface AstNode<T = NodeType> {
  type: T;
  loc?: SrcRange;
}

export function matchNode<T extends AstNode>(
  node: AstNode,
  type: T["type"],
): node is T {
  return node.type === type;
}

export interface ErrorNode extends AstNode {
  type: typeof NodeTypes.Error;
  message?: string;
}

export interface RootNode extends AstNode {
  pos?: string;
}

export interface ParentNode extends AstNode {
  body: AstNode[];
}

export interface ProgramNode extends AstNode {
  type: typeof NodeTypes.Program;
  name: string;
  globals: VariableDeclarationNode[];
  body: RootNode[];
}

export const variableDeclarationTypes = ["value", "list"] as const;

export type VariableDeclarationType = (typeof variableDeclarationTypes)[number];

export interface VariableDeclarationNode extends AstNode {
  type: typeof NodeTypes.VariableDeclaration;
  identifier: string;
  identifierLoc?: SrcRange;
  variableType: VariableDeclarationType;
}

export interface InstructionDeclarationNode extends RootNode, ParentNode {
  type: typeof NodeTypes.InstructionDeclaration;
  identifier: string;
  identifierLoc?: SrcRange;
  callFormat?: string;
  parameters: string[];
  locals?: string[];
}

export interface ExpressionDeclarationNode extends RootNode {
  type: typeof NodeTypes.ExpressionDeclaration;
  identifier: string;
  identifierLoc?: SrcRange;
  callFormat?: string;
  parameters: string[];
  expression: AstNode;
  locals?: string[];
}

export interface EventNode extends RootNode, ParentNode {
  type: typeof NodeTypes.Event;
  event: string;
  eventFilter?: string;
  parameters: string[];
  parametersLoc?: SrcRange;
  locals?: string[];
}

export interface DetachedNode extends RootNode, ParentNode {
  type: typeof NodeTypes.Detached;
}

export const instructionTypes = [
  "unknown",
  "invalid",
  "builtin",
  "global",
] as const;

export type InstructionType = (typeof instructionTypes)[number];

export interface InstructionNode extends AstNode {
  type: typeof NodeTypes.Instruction;
  identifier: string;
  identifierLoc?: SrcRange;
  arguments: AstNode[];
  instructionType: InstructionType;
}

export interface AssignmentNode extends AstNode {
  type: typeof NodeTypes.Assignment;
  identifier: AstNode;
  operator: string;
  value: AstNode;
}

export interface CommentNode extends AstNode {
  type: typeof NodeTypes.Comment;
  comment: string;
}

export interface WaitNode extends AstNode {
  type: typeof NodeTypes.Wait;
  waitType: "seconds" | "condition";
  condition: AstNode;
}

export interface IfNode extends AstNode {
  type: typeof NodeTypes.If;
  condition: AstNode;
  consequent: AstNode[];
  alternative?: AstNode[];
}
export interface WhileNode extends ParentNode, AstNode {
  type: typeof NodeTypes.While;
  condition: AstNode;
}

export interface ForNode extends ParentNode {
  type: typeof NodeTypes.For;
  var: string;
  start: AstNode;
  end: AstNode;
  step: AstNode;
  locals?: string[];
}

export interface BreakNode extends AstNode {
  type: typeof NodeTypes.Break;
}

export interface RepeatNode extends ParentNode {
  type: typeof NodeTypes.Repeat;
  count: AstNode;
}

export const identifierTypes = [
  "unknown",
  "invalid",
  "builtin",
  "expression",
  "global",
  "local",
] as const;

export type IdentifierType = (typeof identifierTypes)[number];

export interface IdentifierNode extends AstNode {
  type: typeof NodeTypes.Identifier;
  identifier: string;
  identifierType: IdentifierType;
  identifierLoc?: SrcRange;
  arguments?: AstNode[];
}

export const literalTypes = ["number", "string", "bool", "vector"] as const;

export type LiteralType = (typeof literalTypes)[number];

export interface LiteralNode extends AstNode {
  type: typeof NodeTypes.Literal;
  valueType: LiteralType;
  value: string;
}

export interface BinaryOpNode extends AstNode {
  type: typeof NodeTypes.BinaryOp;
  op: string;
  lhs: AstNode;
  rhs: AstNode;
}

export interface UnaryOpNode extends AstNode {
  type: typeof NodeTypes.UnaryOp;
  op: string;
  operand: AstNode;
}

export interface ConditionalNode extends AstNode {
  type: typeof NodeTypes.Conditional;
  condition: AstNode;
  consequent: AstNode;
  alternative: AstNode;
}
