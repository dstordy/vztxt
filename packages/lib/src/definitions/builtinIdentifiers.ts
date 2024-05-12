import { builtinFunctionDefinitions } from "./function";
import { staticInstructionDefinitions } from "./instruction";
import { mfdExpressions } from "./mfd";
import { propertyDefinitions } from "./property";
import { definitionListToObject } from "./shared";

export const builtinIdentifiers = {
  expressionIdentifiers: {
    ...builtinFunctionDefinitions,
    ...definitionListToObject(propertyDefinitions),
    ...definitionListToObject(mfdExpressions),
  },
  instructionIdentifiers: staticInstructionDefinitions,
} as const;
