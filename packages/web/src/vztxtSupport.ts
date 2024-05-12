import { parseAndValidate } from "@vztxt/lib/parser/parse";
import { ProblemLevel } from "@vztxt/lib/problemLog/problem";
import { ProblemLog } from "@vztxt/lib/problemLog/problemLog";
import * as monaco from "monaco-editor/esm/vs/editor/editor.api";
import { ProblemsElement } from "./problems";
import * as vztxtSyntax from "./vztxtSyntax";

const langId = "vztxt";

monaco.languages.register({
  id: langId,
  extensions: ["vztxt"],
});

const vztxtListeners = new Map<string, monaco.IDisposable>();

function addModel(model: monaco.editor.ITextModel) {
  if (model.getLanguageId() != langId) return;

  const validate = () => {
    const logger = new ProblemLog();
    parseAndValidate(model.getValue(), logger);
    setMarkers(model, logger);

    const problemElements = document.querySelectorAll("vztxt-problems");
    for (const el of problemElements) {
      if (el instanceof ProblemsElement) {
        el.problemLog = logger;
      }
    }
  };

  let handle: ReturnType<typeof setTimeout> | undefined = undefined;
  const changeListener = model.onDidChangeContent(() => {
    if (handle != undefined) clearTimeout(handle);
    handle = setTimeout(validate, 500);
  });

  vztxtListeners.set(model.uri.toString(), {
    dispose() {
      changeListener.dispose();
      clearTimeout(handle);
    },
  });

  validate();
}

function removeModel(model: monaco.editor.ITextModel) {
  const key = model.uri.toString();
  monaco.editor.setModelMarkers(model, langId, []);
  vztxtListeners.get(key)?.dispose();
  vztxtListeners.delete(key);
}

function setMarkers(model: monaco.editor.ITextModel, logger: ProblemLog) {
  const markers: monaco.editor.IMarkerData[] = [];

  for (const problem of logger.getFilteredProblems(ProblemLevel.Debug)) {
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
  addModel(model);
});

monaco.editor.onWillDisposeModel((model) => {
  removeModel(model);
});

monaco.editor.onDidChangeModelLanguage((e) => {
  removeModel(e.model);
  addModel(e.model);
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
    if (lineTextUntilPosition.match(/^\s*[^\s]*$/)) {
      return {
        suggestions: vztxtSyntax.instructionCompletions(range),
      };
    } else {
      return {
        suggestions: vztxtSyntax.expressionCompletions(range),
      };
    }
  },
});
