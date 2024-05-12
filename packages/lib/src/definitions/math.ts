export const mathUnaryFunctions = [
  "abs",
  "floor",
  "ceiling",
  "round",
  "sqrt",
  "sin",
  "cos",
  "tan",
  "asin",
  "acos",
  "atan",
  "ln",
  "log",
  "deg2rad",
  "rad2deg",
] as const;

export const mathFunctionStyles: [string, string][] = [
  ...mathUnaryFunctions.map<[string, string]>((fn) => [fn, "op-math"]),
] as const;

export const mathBinaryFunctions = ["rand", "min", "max", "atan2"] as const;

export const mathBinaryFunctionStyles = [
  ["rand", "op-rand"],
  ["min", "op-min"],
  ["max", "op-max"],
  ["atan2", "op-atan-2"],
] as const;

export const arithmeticOps = ["+", "-", "*", "/", "%", "^"] as const;
export const comparisonOps = ["=", "g", "ge", "l", "le"] as const;
export const booleanOps = ["and", "or"] as const;

export const arithmeticOpStyles: [(typeof arithmeticOps)[number], string][] = [
  ["+", "op-add"],
  ["-", "op-sub"],
  ["*", "op-mul"],
  ["/", "op-div"],
  ["%", "op-mod"],
  ["^", "op-exp"],
] as const;

export const comparisonOpStyles: [(typeof comparisonOps)[number], string][] = [
  ["=", "op-eq"],
  ["g", "op-gt"],
  ["ge", "op-gte"],
  ["l", "op-lt"],
  ["le", "op-lte"],
] as const;

export const booleanOpStyles: [(typeof booleanOps)[number], string][] = [
  ["and", "op-and"],
  ["or", "op-or"],
] as const;

export const opSrcDisplay: Record<string, string> = {
  "=": "==",
  g: ">",
  ge: ">=",
  l: "<",
  le: "<=",
} as const;

const opPrecedenceTable: [number, string[]][] = [
  // Groupings
  // Access, call
  [3, ["^"]],
  // Unary neg
  [5, ["*", "/", "%"]],
  [6, ["+", "-"]],
  [7, ["=", "g", "ge", "l", "le"]],
  [8, ["not"]],
  [9, ["and"]],
  [10, ["or"]],
  [11, ["if"]],
] as const;

export const opPrecedenceLookup = {
  ...Object.fromEntries(
    opPrecedenceTable.flatMap(([precedence, ops]) =>
      ops.map<[string, number]>((op) => [op, precedence]),
    ),
  ),
} as const;

export const binaryOpIsRightAssociative = (op: string) => op == "^";
