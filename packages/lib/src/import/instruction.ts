import { filterUndefined } from "@vztxt/utils/filter";
import * as astNode from "../ast/astNode";
import { nodeFactory } from "../ast/nodeFactory";
import { setTargetHeadingPropertyMap } from "../definitions/navigation";
import { nodeExpression } from "./expression";

const extractBodyInstructions = (el: Element) =>
  [...(el.querySelector(":scope > Instructions")?.children ?? [])]
    .map(nodeInstruction)
    .filter(filterUndefined);

const handleAlternative = (
  el: Element,
): Record<string, never> | { alternative: astNode.AstNode[] } => {
  if (el.nextElementSibling?.nodeName != "ElseIf") return {};

  const elseIfEl = el.nextElementSibling;
  if (elseIfEl.getAttribute("style") == "else") {
    return { alternative: extractBodyInstructions(elseIfEl) };
  } else {
    return {
      alternative: [
        nodeFactory.if({
          condition: nodeExpression(elseIfEl.firstElementChild),
          consequent: extractBodyInstructions(elseIfEl),
          ...handleAlternative(elseIfEl),
        }),
      ],
    };
  }
};

const instructionElementHandlers: Record<
  string,
  (el: Element) => astNode.AstNode | undefined
> = {
  If: (el) =>
    nodeFactory.if({
      condition: nodeExpression(el.firstElementChild),
      consequent: extractBodyInstructions(el),
      ...handleAlternative(el),
    }),
  ElseIf: () => {
    return undefined;
  },
  While: (el) =>
    nodeFactory.while({
      condition: nodeExpression(el.firstElementChild),
      body: extractBodyInstructions(el),
    }),
  For: (el) => {
    const [start, end, step] = el.children;
    return nodeFactory.for({
      var: el.getAttribute("var") ?? "i",
      start: nodeExpression(start),
      end: nodeExpression(end),
      step: nodeExpression(step),
      body: extractBodyInstructions(el),
    });
  },
  Repeat: (el) =>
    nodeFactory.repeat({
      count: nodeExpression(el.firstElementChild),
      body: extractBodyInstructions(el),
    }),
  SetInput: (el) => {
    const input = el.getAttribute("input") ?? "slider1";
    return nodeFactory.instruction({
      identifier: `Input.Set${input[0].toUpperCase()}${input.slice(1)}`,
      instructionType: "builtin",
      arguments: [...el.children].map(nodeExpression),
    });
  },
  LockNavSphere: (el) => {
    const indicatorType = el.getAttribute("indicatorType") ?? "None";
    return nodeFactory.instruction({
      identifier: `Nav.Lock${indicatorType}`,
      instructionType: "builtin",
      arguments: [...el.children].map(nodeExpression),
    });
  },
  SetTimeMode: (el) => {
    const mode = el.getAttribute("mode") ?? "Normal";
    return nodeFactory.instruction({
      identifier: `SetTimeMode.${mode}`,
      instructionType: "builtin",
      arguments: [],
    });
  },
  DisplayMessage: (el) =>
    nodeFactory.instruction({
      identifier: "Display",
      instructionType: "builtin",
      arguments: [nodeExpression(el.firstElementChild)],
    }),
  SetCameraProperty: (el) => {
    const property = el.getAttribute("property") ?? "zoom";
    return nodeFactory.instruction({
      identifier: `Camera.${property[0].toUpperCase()}${property.slice(1)}`,
      instructionType: "builtin",
      arguments: [...el.children].map(nodeExpression),
    });
  },
  SetCraftProperty: (el) => {
    const property = el.getAttribute("property") ?? "SetActivated";
    return nodeFactory.instruction({
      identifier: property,
      instructionType: "builtin",
      arguments: [...el.children].map(nodeExpression),
    });
  },
  SetTargetHeading: (el) => {
    const property =
      setTargetHeadingPropertyMap[el.getAttribute("property") ?? ""] ??
      "heading";
    return nodeFactory.instruction({
      identifier: property,
      instructionType: "builtin",
      arguments: [...el.children].map(nodeExpression),
    });
  },
  SetList: (el) => {
    const op = el.getAttribute("op") ?? "add";
    return nodeFactory.instruction({
      identifier: `List.${op}`,
      instructionType: "builtin",
      arguments: [...el.children].map(nodeExpression),
    });
  },
  SetVariable: (el) => {
    const [variable, value] = [...el.children].map(nodeExpression);
    return nodeFactory.assignment({
      identifier: variable,
      operator: "=",
      value: value,
    });
  },
  ChangeVariable: (el) => {
    const [variable, value] = [...el.children].map(nodeExpression);
    return nodeFactory.assignment({
      identifier: variable,
      operator: "+=",
      value: value,
    });
  },
  ActivateStage: () =>
    nodeFactory.instruction({
      identifier: "ActivateStage",
      instructionType: "builtin",
      arguments: [],
    }),
  WaitSeconds: (el) =>
    nodeFactory.wait({
      waitType: "seconds",
      condition: nodeExpression(el.firstElementChild),
    }),
  WaitUntil: (el) =>
    nodeFactory.wait({
      waitType: "condition",
      condition: nodeExpression(el.firstElementChild),
    }),
  SetTarget: (el) =>
    nodeFactory.instruction({
      identifier: "SetTarget",
      instructionType: "builtin",
      arguments: [...el.children].map(nodeExpression),
    }),
  SetActivationGroup: (el) =>
    nodeFactory.instruction({
      identifier: "AG.Set",
      instructionType: "builtin",
      arguments: [...el.children].map(nodeExpression),
    }),
  SwitchCraft: (el) =>
    nodeFactory.instruction({
      identifier: "Craft.Switch",
      instructionType: "builtin",
      arguments: [...el.children].map(nodeExpression),
    }),
  Break: () => nodeFactory.break({}),
  BroadcastMessage: (el) => {
    const style = el.getAttribute("style") ?? "";
    let instruction = "Broadcast.This";
    if (style == "broadcast-msg-craft") instruction = "Broadcast.Craft";
    else if (style == "broadcast-msg-all-crafts")
      instruction = "Broadcast.Nearby";
    return nodeFactory.instruction({
      identifier: instruction,
      instructionType: "builtin",
      arguments: [...el.children].map(nodeExpression),
    });
  },
  LogMessage: (el) =>
    nodeFactory.instruction({
      identifier: "Log.Message",
      instructionType: "builtin",
      arguments: [...el.children].map(nodeExpression),
    }),
  LogFlight: (el) =>
    nodeFactory.instruction({
      identifier: "Log.Flight",
      instructionType: "builtin",
      arguments: [...el.children].map(nodeExpression),
    }),
  CallCustomInstruction: (el) =>
    nodeFactory.instruction({
      identifier: el.getAttribute("call") ?? "",
      instructionType: "global",
      arguments: [...el.children].map(nodeExpression),
    }),
  Comment: (el) => {
    const text =
      el.querySelector(":scope > Constant")?.getAttribute("text") ?? "";
    return nodeFactory.comment({
      comment: text,
    });
  },
  UserInput: (el) =>
    nodeFactory.instruction({
      identifier: "UserInput",
      instructionType: "builtin",
      arguments: [...el.children].map(nodeExpression),
    }),
} as const;

export function nodeInstruction(el: Element): astNode.AstNode | undefined {
  return (
    instructionElementHandlers[el.nodeName] ??
    (() => nodeFactory.error({ message: el.nodeName }))
  )(el);
}
