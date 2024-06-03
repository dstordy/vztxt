import { Problem, ProblemLevel } from "@vztxt/lib/problemLog/problem";
import { filterProblems } from "@vztxt/lib/problemLog/problemLog";
import { wrap } from "comlink";
import * as monaco from "monaco-editor/esm/vs/editor/editor.api";
import { ProblemsElement } from "./problems";
import type { VztxtWorker as IVztxtWorker } from "./vztxt.worker";
import VztxtWorker from "./vztxt.worker?worker";
import * as vztxtSyntax from "./vztxtSyntax";
import { rootTemplateSnippets } from "./vztxtSnippets";

const langId = "vztxt";

monaco.languages.register({
  id: langId,
  extensions: ["vztxt"],
});

export const vztxtWorker = wrap<IVztxtWorker>(new VztxtWorker());

const vztxtListeners = new Map<string, monaco.IDisposable>();

async function addModel(model: monaco.editor.ITextModel) {
  if (model.getLanguageId() != langId) return;

  const validate = async () => {
    const problems = await vztxtWorker.validate(model.getValue());
    setMarkers(model, problems);

    const problemElements = document.querySelectorAll("vztxt-problems");
    for (const el of problemElements) {
      if (el instanceof ProblemsElement) {
        el.problems = problems;
      }
    }
  };

  let handle: ReturnType<typeof setTimeout> | undefined = undefined;
  const changeListener = model.onDidChangeContent(() => {
    if (handle != undefined) clearTimeout(handle);
    handle = setTimeout(validate, 100);
  });

  vztxtListeners.set(model.uri.toString(), {
    dispose() {
      changeListener.dispose();
      clearTimeout(handle);
    },
  });

  await validate();
}

function removeModel(model: monaco.editor.ITextModel) {
  const key = model.uri.toString();
  monaco.editor.setModelMarkers(model, langId, []);
  vztxtListeners.get(key)?.dispose();
  vztxtListeners.delete(key);
}

function setMarkers(model: monaco.editor.ITextModel, problems: Problem[]) {
  const markers: monaco.editor.IMarkerData[] = [];

  for (const problem of filterProblems(problems, ProblemLevel.Debug)) {
    if (problem.start) {
      markers.push({
        message: problem.message,
        severity: monaco.MarkerSeverity.Error,
        startLineNumber: problem.start.line,
        startColumn: problem.start.col,
        endLineNumber: problem.end?.line ?? problem.start.line,
        endColumn: problem.end?.col ?? problem.start.col + 1,
      });
    }
  }

  monaco.editor.setModelMarkers(model, langId, markers);
}

monaco.editor.onDidCreateModel((model) => {
  void addModel(model);
});

monaco.editor.onWillDisposeModel((model) => {
  removeModel(model);
});

monaco.editor.onDidChangeModelLanguage((e) => {
  removeModel(e.model);
  void addModel(e.model);
});

monaco.languages.setMonarchTokensProvider(langId, vztxtSyntax.vztxtSyntax);
monaco.languages.setLanguageConfiguration(langId, vztxtSyntax.vztxtConfig);
monaco.languages.registerCompletionItemProvider(langId, {
  provideCompletionItems(model, position) {
    const lineTextUntilPosition = model.getValueInRange({
      startLineNumber: position.lineNumber,
      startColumn: 1,
      endLineNumber: position.lineNumber,
      endColumn: position.column,
    });
    const word = model.getWordUntilPosition(position);
    const range = {
      startLineNumber: position.lineNumber,
      endLineNumber: position.lineNumber,
      startColumn: word.startColumn,
      endColumn: word.endColumn,
    };

    if (lineTextUntilPosition.match(/^[^\s]*$/)) {
      return {
        suggestions: [...rootTemplateSnippets(range)],
      };
    } else if (lineTextUntilPosition.match(/^\s*[^\s]*$/)) {
      return {
        suggestions: [...vztxtSyntax.instructionCompletions(range)],
      };
    } else {
      return {
        suggestions: vztxtSyntax.expressionCompletions(range),
      };
    }
  },
});
