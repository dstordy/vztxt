import "monaco-editor/esm/vs/editor/edcore.main";
import * as monaco from "monaco-editor/esm/vs/editor/editor.api";
import editorWorker from "monaco-editor/esm/vs/editor/editor.worker?worker";
import "./vztxtSupport";

self.MonacoEnvironment = {
  getWorker: function (_workerId, label) {
    switch (label) {
      default:
        return new editorWorker();
    }
  },
};

export class MonacoCodeEditorElement extends HTMLElement {
  #monacoEditor?: monaco.editor.IStandaloneCodeEditor;

  #timeoutHandle: ReturnType<typeof setTimeout> | undefined = undefined;

  constructor() {
    super();
  }

  connectedCallback() {
    const editor = document.createElement("div");
    editor.style.height = "100%";
    this.style.flex = "1";
    this.style.minWidth = "0";
    this.style.minHeight = "0";
    this.style.display = "flex";
    this.style.flexDirection = "column";
    this.appendChild(editor);
    this.translate = false;

    this.#monacoEditor = monaco.editor.create(editor, {
      automaticLayout: true,
      language: this.getAttribute("language") ?? "",
      value: this.loadValue(),
      readOnly: this.hasAttribute("readonly"),
      scrollBeyondLastLine: false,
      minimap: { enabled: false },
      theme: "vs-dark",
    });

    this.#monacoEditor.getModel()?.onDidChangeContent(() => {
      if (this.#timeoutHandle != null) clearTimeout(this.#timeoutHandle);
      this.#timeoutHandle = setTimeout(() => {
        this.#timeoutHandle = undefined;
        const storageKey = this.getAttribute("storage-key");
        if (storageKey) {
          localStorage.setItem(
            `editor-${storageKey}`,
            this.#monacoEditor?.getValue() ?? "",
          );
        }
      }, 500);
    });
  }

  loadValue(): string {
    const storageKey = this.getAttribute("storage-key");
    if (storageKey) {
      return localStorage.getItem(`editor-${storageKey}`) ?? "";
    }
    return "";
  }

  setValue(value: string) {
    this.#monacoEditor?.setValue(value);
    this.#monacoEditor?.revealPosition({ lineNumber: 0, column: 0 });
  }

  getValue() {
    return this.#monacoEditor?.getValue() ?? "";
  }

  reveal(line: number, col: number) {
    this.#monacoEditor?.revealPosition({ lineNumber: line, column: col });
  }

  select(range: monaco.IRange) {
    this.#monacoEditor?.setSelection(range);
    this.#monacoEditor?.revealRangeInCenterIfOutsideViewport(range);
    this.#monacoEditor?.focus();
  }
}

customElements.define("code-editor", MonacoCodeEditorElement);
