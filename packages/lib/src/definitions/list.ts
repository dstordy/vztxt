export const listInstructions: [string, number][] = [
  ["add", 2],
  ["insert", 3],
  ["remove", 2],
  ["set", 3],
  ["clear", 1],
  ["sort", 1],
  ["reverse", 1],
] as const;

export const listOps: [string, number][] = [
  ["create", 1],
  ["get", 2],
  ["length", 1],
  ["index", 2],
] as const;
