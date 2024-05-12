import * as astNode from "./astNode";
import { NodeTypeMap } from "./nodeType";

type NodeVisitorFunction<NODE extends astNode.AstNode, RETURN, DATA> = (
  node: NODE,
  data: DATA,
) => RETURN;

export interface NodeVisitorConfig<R = void, D = undefined> {
  visitors: {
    [P in keyof NodeTypeMap]?: NodeVisitorFunction<NodeTypeMap[P], R, D>;
  };
  fallback: NodeVisitorFunction<astNode.AstNode, R, D>;
}

export function visitNode<D, R>(
  visitor: NodeVisitorConfig<R, D>,
  node: astNode.AstNode,
  ...data: D extends undefined ? [] : [D]
): R {
  const nodeConfig = visitor.visitors[node.type] as
    | NodeVisitorFunction<astNode.AstNode, R, D>
    | undefined;
  return (nodeConfig ?? visitor.fallback)(node, data[0] as D);
}
