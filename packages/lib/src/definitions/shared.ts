import * as astNode from "../ast/astNode";

export interface IdentifierDefinition<E = string, A = Record<string, string>> {
  identifier: string;
  xmlElement: E;
  xmlStaticAttributes: A;
  staticArgumentsPost?: astNode.AstNode[];
  parameters?: number;
}

export function definitionListToObject(
  definitions: readonly IdentifierDefinition[],
) {
  return Object.fromEntries(definitions.map((d) => [d.identifier, d]));
}
