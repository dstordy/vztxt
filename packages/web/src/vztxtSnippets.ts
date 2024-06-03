import * as monaco from "monaco-editor/esm/vs/editor/editor.api";

const eventSnippets: [label: string, text: string][] = [
  ["FlightStart", "on FlightStart {\n\t$0\n}"],
  ["Docked", "on Docked (craftA, craftB) {\n\t$0\n}"],
  ["ChangeSoi", "on ChangeSoi (planet) {\n\t$0\n}"],
  ["PartExplode", "on PartExplode (part) {\n\t$0\n}"],
  [
    "PartCollision",
    "on PartCollision (part, other, velocity, impulse) {\n\t$0\n}",
  ],
];

export const rootTemplateSnippets = (
  range: monaco.IRange,
): monaco.languages.CompletionItem[] => {
  return [
    ...eventSnippets.map<monaco.languages.CompletionItem>((eventDef) => ({
      label: `on ${eventDef[0]}`,
      kind: monaco.languages.CompletionItemKind.Event,
      insertText: eventDef[1],
      insertTextRules:
        monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      range,
    })),
    {
      label: "on",
      detail: "Event handler",
      kind: monaco.languages.CompletionItemKind.Keyword,
      insertText: "on",
      range,
    },
    {
      label: "def",
      detail: "Define an instruction",
      kind: monaco.languages.CompletionItemKind.Keyword,
      insertText: "def",
      range,
    },
    {
      label: "define instruction",
      sortText: "def",
      detail: "Define an instruction",
      kind: monaco.languages.CompletionItemKind.Snippet,
      insertText: "def ${1:name}(${2:params}){\n\t$0\n}",
      insertTextRules:
        monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      range,
    },
    {
      label: "def expression",
      detail: "Define an expression",
      kind: monaco.languages.CompletionItemKind.Keyword,
      insertText: "def expression",
      range,
    },
    {
      label: "define expression",
      sortText: "def expression",
      detail: "Define an expression",
      kind: monaco.languages.CompletionItemKind.Snippet,
      insertText: "def expression ${1:name}(${2:params}): $0",
      insertTextRules:
        monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      range,
    },
    {
      label: "var",
      detail: "Define a global variable",
      kind: monaco.languages.CompletionItemKind.Keyword,
      insertText: "var",
      range,
    },
    {
      label: "var",
      kind: monaco.languages.CompletionItemKind.Snippet,
      insertText: "var ${0:name}",
      insertTextRules:
        monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      range,
    },
    {
      label: "list",
      detail: "Define a global list",
      kind: monaco.languages.CompletionItemKind.Keyword,
      insertText: "list",
      range,
    },
    {
      label: "list",
      kind: monaco.languages.CompletionItemKind.Snippet,
      insertText: "list ${0:name}",
      insertTextRules:
        monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      range,
    },
  ];
};
