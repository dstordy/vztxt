import { builtinIdentifiers } from "@vztxt/lib/definitions/builtinIdentifiers";
import * as monaco from "monaco-editor/esm/vs/editor/editor.api";

export const vztxtConfig: monaco.languages.LanguageConfiguration = {
  comments: {
    lineComment: "//",
  },
  brackets: [
    ["{", "}"],
    ["[", "]"],
    ["(", ")"],
  ],
  autoClosingPairs: [
    { open: "[", close: "]" },
    { open: "{", close: "}" },
    { open: "(", close: ")" },
    { open: "'", close: "'", notIn: ["string", "comment"] },
    { open: '"', close: '"', notIn: ["string"] },
  ],
  surroundingPairs: [
    { open: "{", close: "}" },
    { open: "[", close: "]" },
    { open: "(", close: ")" },
    { open: '"', close: '"' },
    { open: "'", close: "'" },
  ],
};

const parameterString = (parameters: number | undefined) => {
  if (parameters == undefined || parameters == 0) return "property";
  if (parameters < 0) return "variable parameters";
  if (parameters == 1) return "1 parameter";
  return `${parameters} parameters`;
};

export const instructionCompletions = (
  range: monaco.IRange,
): monaco.languages.CompletionItem[] => [
  ...Object.values(
    builtinIdentifiers.instructionIdentifiers,
  ).map<monaco.languages.CompletionItem>((def) => ({
    label: def.identifier,
    detail: parameterString(def.parameters),
    kind: monaco.languages.CompletionItemKind.Function,
    insertText:
      (def.parameters ?? 0) > 1
        ? `${def.identifier}($0)`
        : `${def.identifier} $0`,
    insertTextRules:
      monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
    range,
  })),
];

export const expressionCompletions = (
  range: monaco.IRange,
): monaco.languages.CompletionItem[] => [
  ...Object.values(
    builtinIdentifiers.expressionIdentifiers,
  ).map<monaco.languages.CompletionItem>((def) => ({
    label: def.identifier,
    detail: parameterString(def.parameters),
    kind:
      (def.parameters ?? 0) != 0
        ? monaco.languages.CompletionItemKind.Method
        : monaco.languages.CompletionItemKind.Property,
    insertText:
      (def.parameters ?? 0) != 0 ? `${def.identifier}($0)` : def.identifier,
    insertTextRules:
      monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
    range,
  })),
];

export const vztxtSyntax: monaco.languages.IMonarchLanguage = {
  // Set defaultToken to invalid to see what you do not tokenize yet
  defaultToken: "invalid",

  keywords: [
    "on",
    "def",
    "expression",
    "wait",
    "until",
    "if",
    "then",
    "else",
    "while",
    "for",
    "repeat",
    "to",
    "step",
    "true",
    "false",
    "and",
    "or",
    "not",
    "this",
    "break",
    "funk",
  ],

  typeKeywords: ["var", "list"],

  operators: [
    "=",
    ">",
    "<",
    ":",
    "==",
    "<=",
    ">=",
    "+",
    "-",
    "*",
    "/",
    "%",
    "+=",
  ],

  symbols: /[=><!~?:&|+\-*\/\^%]+/,

  escapes: /\\(?:[nrt\\"'])/,

  // The main tokenizer for our languages
  tokenizer: {
    root: [
      // identifiers and keywords
      [
        /[a-zA-Z_]\w*$/,
        {
          cases: {
            "@typeKeywords": { token: "type" },
            "@keywords": { token: "keyword.$0" },
            "@default": { token: "identifier" },
          },
        },
      ],
      [
        /[a-zA-Z_]\w*/,
        {
          cases: {
            "@typeKeywords": { token: "type", next: "@varDeclaration" },
            "@keywords": { token: "keyword.$0", next: "@qualified" },
            "@default": { token: "identifier", next: "@qualified" },
          },
        },
      ],

      // whitespace
      { include: "@whitespace" },

      [/<\?[^>]*>/, "invalid"],

      // delimiters and operators
      [/[{}()\[\]]/, "@brackets"],
      [/[<>](?!@symbols)/, "@brackets"],
      [/@symbols/, { cases: { "@operators": "operator", "@default": "" } }],

      [/#\s*[a-zA-Z_\$][\w\$]*/, "keyword.directive"],

      // numbers
      [/[0-9]*\.[0-9]+([eE][\-+]?\d+)?/, "number.float"],
      [/[0-9]+/, "number"],

      // delimiter: after number because of .\d floats
      [/[,.]/, "delimiter"],

      // strings
      [/"([^"\\]|\\.)*$/, "string.invalid"], // non-terminated string
      [/'([^'\\]|\\.)*$/, "string.invalid"], // non-terminated string
      [/"/, { token: "string.quote", bracket: "@open", next: "@string" }],
      [/'/, { token: "string.quote", bracket: "@open", next: "@stringSingle" }],
    ],

    varDeclaration: [
      [/[ \t]+/, "white"],
      [/[a-zA-Z_][\w]*/, "variable", "@pop"],
      ["", "", "@pop"],
    ],

    qualified: [
      [/[a-zA-Z_][\w]*/, "identifier"],
      [/\./, "delimiter"],
      ["", "", "@pop"],
    ],

    string: [
      [/[^\\"]+/, "string"],
      [/@escapes/, "string.escape"],
      [/\\./, "string.escape.invalid"],
      [/"/, { token: "string.quote", bracket: "@close", next: "@pop" }],
    ],

    stringSingle: [
      [/[^\\']+/, "string"],
      [/@escapes/, "string.escape"],
      [/\\./, "string.escape.invalid"],
      [/'/, { token: "string.quote", bracket: "@close", next: "@pop" }],
    ],

    whitespace: [
      [/[ \t\r\n]+/, "white"],
      [/\/\/.*$/, "comment"],
    ],
  },
};
