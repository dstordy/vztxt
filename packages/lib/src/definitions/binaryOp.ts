import {
  arithmeticOpStyles,
  booleanOpStyles,
  comparisonOpStyles,
} from "./math";
import { IdentifierDefinition, definitionListToObject } from "./shared";

type ValidElements = "BinaryOp" | "BoolOp" | "Comparison";
type BinaryOpDefinition = IdentifierDefinition<ValidElements>;

const binaryOpDefinition =
  (element: ValidElements) =>
  ([op, style]: [string, string]): BinaryOpDefinition => ({
    identifier: op,
    xmlElement: element,
    xmlStaticAttributes: { style },
    parameters: 2,
  });

const binaryOpDefinitions = {
  ...definitionListToObject([
    ...arithmeticOpStyles.map(binaryOpDefinition("BinaryOp")),
    ...comparisonOpStyles.map(binaryOpDefinition("Comparison")),
    ...booleanOpStyles.map(binaryOpDefinition("BoolOp")),
  ]),
} as const;

export function getBinaryOpDefinition(op: string) {
  return binaryOpDefinitions[op];
}
