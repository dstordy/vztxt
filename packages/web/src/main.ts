import { ProgramNode, matchNode } from "@vztxt/lib/ast/astNode";
import { parseAndValidate } from "@vztxt/lib/parser/parse";
import { saveAs } from "file-saver";
import { html, render } from "lit-html";
import { Ref, createRef, ref } from "lit-html/directives/ref.js";
import xmlFormat from "xml-formatter";
import { importXmlString } from "./import";
import { MonacoCodeEditorElement } from "./monaco";
import "./problems";
import { sampleList } from "./samples";
import "./style.css";
import { exportXml } from "@vztxt/lib/export/exportXml";
import { ProblemLog } from "@vztxt/lib/problemLog/problemLog";
import { ProblemLevel } from "@vztxt/lib/problemLog/problem";

export const setContent = (targetId: string, content: string) => {
  const target = document.getElementById(targetId);
  if (target instanceof MonacoCodeEditorElement) {
    target.setValue(content);
  }
};

const xmlSerializer = new XMLSerializer();

const codeEditorRef: Ref<MonacoCodeEditorElement> = createRef();
const fileInputRef: Ref<HTMLInputElement> = createRef();

const dumpAst = (e: Event) => {
  e.preventDefault();

  if (codeEditorRef.value) {
    const ast = parseAndValidate(codeEditorRef.value.getValue());
    console.log(ast);
  }
};

const triggerImportXml = (e: Event) => {
  e.preventDefault();
  fileInputRef.value?.click();
};

const importFileChanged = async () => {
  const inputElem = fileInputRef.value;
  const file = inputElem?.files?.item(0);
  if (inputElem) inputElem.value = "";
  if (file) {
    const doc = await file.text();
    const src = importXmlString(doc);
    if (codeEditorRef.value) {
      codeEditorRef.value.setValue(src);
    }
  }
};

const handleExport = (e: Event) => {
  e.preventDefault();

  if (codeEditorRef.value) {
    const logger = new ProblemLog();
    const ast = parseAndValidate(codeEditorRef.value.getValue(), logger);
    const errors = logger.getFilteredProblems(ProblemLevel.Error);
    if (errors.length > 0) {
      alert("Fix errors before exporting");
      return;
    }
    if (ast) {
      let filename = "out.xml";
      if (matchNode<ProgramNode>(ast, "Program")) {
        filename = ast.name + ".xml";
      }
      const raw = xmlSerializer.serializeToString(exportXml(ast));
      const xml = xmlFormat(raw, {
        indentation: "  ",
        lineSeparator: "\n",
        whiteSpaceAtEndOfSelfclosingTag: true,
      });
      const blob = new Blob([xml], { type: "text/xml;charset=utf-8" });
      saveAs(blob, filename);
    }
  }
};

const localFilePath =
  "%appdata%/../LocalLow/Jundroo/SimpleRockets 2/UserData/FlightPrograms/";

render(
  html`<div class="flex flex-row h-full">
    <div class="w-96 flex flex-col divide-y divide-base-100 bg-base-300">
      <header class="p-2 flex flex-row items-center justify-between">
        <h1 class="text-3xl font-bold">VzTxt</h1>
        <a
          class="btn btn-xs btn-ghost"
          target="_blank"
          href="https://github.com/dstordy/vztxt"
        >
          View on Github
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-3 w-3"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="feather feather-external-link"
          >
            <path
              d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"
            ></path>
            <polyline points="15 3 21 3 21 9"></polyline>
            <line x1="10" y1="14" x2="21" y2="3"></line>
          </svg>
        </a>
      </header>
      ${import.meta.env.DEV
        ? html` <div class="flex justify-end content-end">
            <button @click=${dumpAst} class="btn btn-xs">Dump AST</button>
          </div>`
        : ""}
      ${sampleList((doc) => {
        const src = importXmlString(doc);
        if (codeEditorRef.value) {
          codeEditorRef.value.setValue(src);
        }
      })}
      <div class="p-2 flex flex-col gap-1">
        <button @click=${triggerImportXml} class="btn btn-neutral">
          Import Program from XML
        </button>
        <div class="text-xs flex flex-row whitespace-nowrap">
          <span class="select-none">File location '</span>
          <span
            class="link text-ellipsis overflow-hidden"
            title=${`Click to copy path "${localFilePath}"`}
            @click=${() => {
              void navigator.clipboard.writeText(localFilePath);
            }}
          >
            ${localFilePath}
          </span>
          <span class="select-none">'</span>
        </div>
        <input
          ${ref(fileInputRef)}
          @change=${importFileChanged}
          type="file"
          accept=".xml"
          class="hidden"
        />
      </div>
      <div class="min-h-0 p-2 flex-1 flex flex-col gap-1">
        <vztxt-problems class="min-h-0 flex-1 flex"></vztxt-problems>
      </div>
      <div class="p-2 flex flex-col gap-1">
        <p
          class="rounded-box bg-warning-content text-warning p-1 text-sm text-center"
        >
          <strong class="badge badge-warning select-none">Warning</strong>
          Errors may occur in the output, avoid overwriting existing program
          files to prevent data loss.
        </p>
        <button @click=${handleExport} class="btn btn-primary">
          Export Flight Program XML
        </button>
      </div>
    </div>
    <section class="flex flex-col flex-1 min-w-0">
      <code-editor
        id="editor-view"
        ${ref(codeEditorRef)}
        language="vztxt"
        storage-key="src-main"
      ></code-editor>
    </section>
  </div>`,
  document.body,
);
