import { SrcLocation } from "../ast/astNode";

export const ProblemLevel = {
  Debug: 1,
  Info: 2,
  Hint: 3,
  Warning: 4,
  Error: 5,
} as const;

export type ProblemLevelType = (typeof ProblemLevel)[keyof typeof ProblemLevel];

export interface Problem {
  level: ProblemLevelType;
  message: string;
  start?: SrcLocation;
  end?: SrcLocation;
}
