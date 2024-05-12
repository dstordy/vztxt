import { filterUndefined } from "@vztxt/utils/filter";
import * as astNode from "../ast/astNode";
import { nodeFactory } from "../ast/nodeFactory";
import { nodeExpression } from "./expression";
import { nodeInstruction } from "./instruction";
import { eventDefinitions } from "../definitions/event";

const extractParameters = (format: string): string[] =>
  [...format.matchAll(/\|([^\|]*)\|/g)].map((m) => m[1]);

const filterCallFormat = (
  identifier: string | null,
  callFormat: string | null,
): string | undefined => {
  if (identifier == undefined || callFormat == undefined) return undefined;
  const trimmed = callFormat.slice(identifier.length).trim();
  if (trimmed.match(/^(?:\(\d+\) ?)*$/)) {
    return undefined;
  }
  return trimmed.replaceAll(/\(\d+\)/g, "_");
};

export function nodeProgram(el: Element): astNode.ProgramNode {
  return nodeFactory.program({
    name: el.getAttribute("name") ?? "",
    globals: nodeVariables(el.querySelector(":scope > Variables")),
    body: [
      ...nodeInstructions([...el.querySelectorAll(":scope > Instructions")]),
      ...nodeExpressions(el.querySelector(":scope > Expressions")),
    ],
  });
}

export function nodeVariables(
  el: Element | null,
): astNode.VariableDeclarationNode[] {
  if (!el) return [];
  return [...el.querySelectorAll(":scope > Variable")].map((vEl) =>
    nodeFactory.variableDeclaration({
      identifier: vEl.getAttribute("name") ?? "",
      variableType: vEl.hasAttribute("number") ? "value" : "list",
    }),
  );
}

export function nodeInstructions(els: Element[]): astNode.RootNode[] {
  const blocks: astNode.RootNode[] = [];
  for (const el of els) {
    const blockBody = [...el.children].slice(1);
    const blockHeader = el.firstElementChild;
    if (!blockHeader) continue;
    if (blockHeader.nodeName == "CustomInstruction") {
      blocks.push(
        nodeFactory.instructionDeclaration({
          pos: blockHeader.getAttribute("pos") ?? undefined,
          identifier: blockHeader.getAttribute("name") ?? "",
          callFormat: filterCallFormat(
            blockHeader.getAttribute("name"),
            blockHeader.getAttribute("callFormat"),
          ),
          parameters: extractParameters(
            blockHeader.getAttribute("format") ?? "",
          ),
          body: blockBody.map(nodeInstruction).filter(filterUndefined),
        }),
      );
    } else if (blockHeader.nodeName == "Event") {
      const filter =
        blockHeader.getAttribute("event") == "ReceiveMessage"
          ? blockHeader.firstElementChild?.getAttribute("text")
          : undefined;
      const eventName = blockHeader.getAttribute("event") ?? "";
      const parameters = eventDefinitions[eventName].localVars ?? [];
      blocks.push(
        nodeFactory.event({
          event: eventName,
          ...(filter ? { eventFilter: filter } : {}),
          pos: blockHeader.getAttribute("pos") ?? undefined,
          parameters,
          body: blockBody.map(nodeInstruction).filter(filterUndefined),
        }),
      );
    } else {
      blocks.push(
        nodeFactory.detached({
          pos: blockHeader.getAttribute("pos") ?? undefined,
          body: [...el.children].map(nodeInstruction).filter(filterUndefined),
        }),
      );
    }
  }
  return blocks;
}

export function nodeExpressions(
  el: Element | null,
): astNode.ExpressionDeclarationNode[] {
  if (!el) return [];
  return [...el.querySelectorAll(":scope > CustomExpression")].map((exEl) =>
    nodeFactory.expressionDeclaration({
      pos: exEl.getAttribute("pos") ?? undefined,
      identifier: exEl.getAttribute("name") ?? "",
      callFormat: filterCallFormat(
        exEl.getAttribute("name"),
        exEl.getAttribute("callFormat"),
      ),
      parameters: extractParameters(exEl.getAttribute("format") ?? ""),
      expression: nodeExpression(exEl.firstElementChild),
    }),
  );
}
