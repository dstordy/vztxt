import {
  Problem,
  ProblemLevel,
  ProblemLevelType,
} from "@vztxt/lib/problemLog/problem";
import { ProblemLog } from "@vztxt/lib/problemLog/problemLog";
import { html, render } from "lit-html";
import { MonacoCodeEditorElement } from "./monaco";

export class ProblemsElement extends HTMLElement {
  constructor() {
    super();
  }

  #displayProblemLevel: ProblemLevelType = ProblemLevel.Debug;
  #problemLog: ProblemLog | undefined;

  connectedCallback() {
    this.renderElement();
  }

  #problemPreamble(problem: Problem) {
    switch (problem.level) {
      case ProblemLevel.Error:
        return html`<span class="text-error font-bold">[error]</span>`;
      default:
        return "";
    }
  }

  #renderProblem = (problem: Problem) => {
    const loc = problem.start
      ? html`<span
          class="float-right btn btn-xs btn-ghost"
          @click=${() => {
            if (problem.start && problem.end) {
              const el = document.getElementById("editor-view");
              if (el instanceof MonacoCodeEditorElement) {
                el.select({
                  startLineNumber: problem.start.line,
                  startColumn: problem.start.col,
                  endLineNumber: problem.end.line,
                  endColumn: problem.end.col,
                });
              }
            }
          }}
          >[Ln ${problem.start.line}, Col ${problem.start.col}]</span
        > `
      : "";
    return html`<li class="px-2 py-1">
      <div>${this.#problemPreamble(problem)} ${loc}</div>
      ${problem.message}
    </li>`;
  };

  renderElement() {
    const problems =
      this.#problemLog
        ?.getFilteredProblems(this.#displayProblemLevel)
        .map(this.#renderProblem) ?? [];

    render(
      html`
        <section class="bg-base-100 flex-1 flex flex-col">
          <header class="py-1 px-2 text-sm select-none">
            <h2 class="font-bold">Problems</h2>
          </header>
          <ul
            class="bg-base-200 flex-1 flex flex-col divide-y-2 divide-base-100 text-sm overflow-y-scroll scrollbar-thin"
          >
            ${problems}
          </ul>
        </section>
      `,
      this,
    );
  }

  public set problemLog(problemLog: ProblemLog | undefined) {
    this.#problemLog = problemLog;
    if (this.isConnected) this.renderElement();
  }
}

customElements.define("vztxt-problems", ProblemsElement);
