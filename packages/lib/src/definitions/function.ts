import { friendlyStringFormats } from "./string";
import { mathBinaryFunctionStyles, mathFunctionStyles } from "./math";
import { planetOpStyles } from "./planet";
import { vectorBinaryOps, vectorUnaryOps } from "./vector";
import { IdentifierDefinition, definitionListToObject } from "./shared";
import { listOps } from "./list";
import { nodeFactory } from "../ast/nodeFactory";

type ValidElements =
  | "MathFunction"
  | "BinaryOp"
  | "StringOp"
  | "Planet"
  | "CraftProperty"
  | "VectorOp"
  | "Vector"
  | "ListOp"
  | "EvaluateExpression";

type FunctionDefinition = IdentifierDefinition<ValidElements>;

function applyFunctionNamespace(
  definitions: readonly FunctionDefinition[],
  namespace: string,
): FunctionDefinition[] {
  return definitions.map((d) => {
    const { identifier, ...rest } = d;
    return { identifier: `${namespace}.${identifier}`, ...rest };
  });
}

const mathFunctionDefinitions: FunctionDefinition[] = [
  ...mathFunctionStyles.map<FunctionDefinition>(([identifier, style]) => ({
    identifier,
    xmlElement: "MathFunction",
    xmlStaticAttributes: { function: identifier, style },
    parameters: 1,
  })),
  ...mathBinaryFunctionStyles.map<FunctionDefinition>(
    ([identifier, style]) => ({
      identifier,
      xmlElement: "BinaryOp",
      xmlStaticAttributes: { op: identifier, style },
      parameters: 2,
    }),
  ),
] as const;

const vectorFunctionDefinitions: FunctionDefinition[] = [
  ...vectorUnaryOps.map<FunctionDefinition>((op) => ({
    identifier: `Vec.${op}`,
    xmlElement: "VectorOp",
    xmlStaticAttributes: { op, style: "vec-op-1" },
    parameters: 1,
  })),
  ...vectorBinaryOps.map<FunctionDefinition>((op) => ({
    identifier: `Vec.${op}`,
    xmlElement: "VectorOp",
    xmlStaticAttributes: { op, style: "vec-op-2" },
    parameters: 2,
  })),
  {
    identifier: "Vec",
    xmlElement: "Vector",
    xmlStaticAttributes: { style: "vec" },
    parameters: 3,
  },
  {
    identifier: "Vec.hex",
    xmlElement: "VectorOp",
    xmlStaticAttributes: { op: "hex", style: "vec-op-color" },
    parameters: 1,
  },
] as const;

const defineStringOP = (
  identifier: string,
  parameters: number,
  extraEmptyArgument = false,
): FunctionDefinition => ({
  identifier,
  xmlElement: "StringOp",
  xmlStaticAttributes: { op: identifier, style: identifier },
  parameters,
  ...(extraEmptyArgument
    ? {
        staticArgumentsPost: [
          nodeFactory.literal({
            valueType: "string",
            value: "",
          }),
        ],
      }
    : {}),
});

const stringFunctionDefinitions: FunctionDefinition[] = [
  defineStringOP("join", -1, true),
  defineStringOP("length", 1),
  defineStringOP("letter", 2),
  defineStringOP("substring", 3),
  defineStringOP("contains", 2),
  defineStringOP("format", -1, true),
  ...applyFunctionNamespace(
    friendlyStringFormats.map<FunctionDefinition>((fmt) => ({
      identifier: fmt,
      xmlElement: "StringOp",
      xmlStaticAttributes: { op: "friendly", subOp: fmt, style: "friendly" },
      parameters: 1,
    })),
    "friendly",
  ),
] as const;

const definePlanetOp = ([identifier, style]: [
  string,
  string,
]): FunctionDefinition => ({
  identifier,
  xmlElement: "Planet",
  xmlStaticAttributes: { op: identifier, style },
  parameters: 1,
});

const planetFunctionDefinitions = [
  ...planetOpStyles.map<FunctionDefinition>(definePlanetOp),
] as const;

const listFunctionDefinitions = [
  ...listOps.map<FunctionDefinition>(([op, parameters]) => ({
    identifier: op,
    xmlElement: "ListOp",
    xmlStaticAttributes: {
      op,
      style: `list-${op}`,
    },
    parameters,
  })),
];

export const builtinFunctionDefinitions = {
  ...definitionListToObject([
    ...applyFunctionNamespace(mathFunctionDefinitions, "Math"),
    ...vectorFunctionDefinitions,
    ...applyFunctionNamespace(stringFunctionDefinitions, "String"),
    ...applyFunctionNamespace(planetFunctionDefinitions, "Planet"),
    ...applyFunctionNamespace(listFunctionDefinitions, "List"),
    {
      identifier: "AG.Get",
      xmlElement: "ActivationGroup",
      xmlStaticAttributes: { style: "activation-group" },
      parameters: 1,
    },
    {
      identifier: "Sound.Frequency",
      xmlElement: "CraftProperty",
      xmlStaticAttributes: {
        property: "Sound.Frequency",
        style: "note-frequency",
      },
      parameters: 2,
    },
    {
      identifier: "funk",
      xmlElement: "EvaluateExpression",
      xmlStaticAttributes: {
        style: "evaluate-expression",
      },
      parameters: 1,
    },
  ]),
} as const;
