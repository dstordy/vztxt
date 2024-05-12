import { SrcLocation } from "../ast/astNode";
import { Problem, ProblemLevel, ProblemLevelType } from "./problem";

export class ProblemLog {
  problems: Problem[] = [];

  postProblem(
    level: ProblemLevelType,
    message: string,
    start?: SrcLocation,
    end?: SrcLocation,
  ) {
    this.problems.push({
      level,
      message,
      start,
      end,
    });
  }

  debug = (msg: string, start?: SrcLocation, end?: SrcLocation) => {
    this.postProblem(ProblemLevel.Debug, msg, start, end);
  };

  info = (msg: string, start?: SrcLocation, end?: SrcLocation) => {
    this.postProblem(ProblemLevel.Info, msg, start, end);
  };

  hint = (msg: string, start?: SrcLocation, end?: SrcLocation) => {
    this.postProblem(ProblemLevel.Hint, msg, start, end);
  };

  warning = (msg: string, start?: SrcLocation, end?: SrcLocation) => {
    this.postProblem(ProblemLevel.Warning, msg, start, end);
  };

  error = (msg: string, start?: SrcLocation, end?: SrcLocation) => {
    this.postProblem(ProblemLevel.Error, msg, start, end);
  };

  getFilteredProblems(minLevel: ProblemLevelType) {
    return this.problems.filter((p) => p.level >= minLevel);
  }
}
