import { nodeFactory } from "../ast/nodeFactory";
import { cameraProperties } from "./camera";
import { inputs } from "./input";
import { listInstructions } from "./list";
import { mfdInstructions } from "./mfd";
import { autopilotHeadingSetters, indicatorTypes } from "./navigation";
import { craftPartSetterProperties } from "./property";
import { IdentifierDefinition, definitionListToObject } from "./shared";
import { timeModes } from "./timeMode";

type ValidElements =
  | "SetInput"
  | "LockNavSphere"
  | "SetTimeMode"
  | "DisplayMessage"
  | "SetCameraProperty"
  | "SetCraftProperty"
  | "SetTargetHeading"
  | "SetList"
  | "SetVariable"
  | "ChangeVariable"
  | "ActivateStage"
  | "SetTarget"
  | "SetActivationGroup"
  | "SwitchCraft"
  | "BroadcastMessage"
  | "LogMessage"
  | "LogFlight"
  | "UserInput";

type InstructionDefinition = IdentifierDefinition<ValidElements>;

const inputInstructionDefinitions = [
  ...inputs.map<InstructionDefinition>((i) => ({
    identifier: `Input.Set${i}`,
    xmlElement: "SetInput",
    xmlStaticAttributes: {
      input: `${i[0].toLowerCase()}${i.slice(1)}`,
      style: "set-input",
    },
    parameters: 1,
  })),
] as const;

const navigationInstructionDefinitions: InstructionDefinition[] = [
  ...indicatorTypes.map<InstructionDefinition>((indicatorType) => ({
    identifier: `Nav.Lock${indicatorType}`,
    xmlElement: "LockNavSphere",
    xmlStaticAttributes: {
      indicatorType,
      style: "lock-nav-sphere",
    },
  })),
  {
    identifier: "Nav.LockVector",
    xmlElement: "LockNavSphere",
    xmlStaticAttributes: {
      indicatorType: "Vector",
      style: "lock-nav-sphere-vector",
    },
    parameters: 1,
  },
  ...autopilotHeadingSetters.map<InstructionDefinition>((property) => ({
    identifier: property[0],
    xmlElement: "SetTargetHeading",
    xmlStaticAttributes: {
      property: property[1],
      style: "set-heading",
    },
    parameters: 1,
  })),
] as const;

const timeModeInstructionDefinitions = [
  ...timeModes.map<InstructionDefinition>((timeMode) => ({
    identifier: `SetTimeMode.${timeMode}`,
    xmlElement: "SetTimeMode",
    xmlStaticAttributes: {
      mode: timeMode,
      style: "set-time-mode",
    },
  })),
] as const;

const outputInstructionDefinitions: InstructionDefinition[] = [
  {
    identifier: "Display",
    xmlElement: "DisplayMessage",
    xmlStaticAttributes: {
      style: "display",
    },
    parameters: 1,
    staticArgumentsPost: [
      nodeFactory.literal({
        valueType: "number",
        value: "7",
      }),
    ],
  },
  {
    identifier: "Log.Message",
    xmlElement: "LogMessage",
    xmlStaticAttributes: {
      style: "log",
    },
    parameters: 1,
  },
  {
    identifier: "Log.Flight",
    xmlElement: "LogFlight",
    xmlStaticAttributes: {
      style: "flightlog",
    },
    parameters: 2,
  },
] as const;

const cameraInstructionDefinitions = [
  ...cameraProperties.map<InstructionDefinition>((property) => ({
    identifier: `Camera.${property}`,
    xmlElement: "SetCameraProperty",
    xmlStaticAttributes: {
      property: `${property[0].toLowerCase()}${property.slice(1)}`,
      style: "set-camera",
    },
    parameters: 1,
  })),
] as const;

const craftPartInstructionDefinitions = [
  ...craftPartSetterProperties.map<InstructionDefinition>((property) => ({
    identifier: property,
    xmlElement: "SetCraftProperty",
    xmlStaticAttributes: {
      property,
      style: "set-part",
    },
    parameters: 2,
  })),
] as const;

const listInstructionDefinitions = [
  ...listInstructions.map<InstructionDefinition>(([op, parameters]) => ({
    identifier: `List.${op}`,
    xmlElement: "SetList",
    xmlStaticAttributes: {
      op,
      style: `list-${op}`,
    },
    parameters,
  })),
] as const;

const broadcastInstructionDefinitions: InstructionDefinition[] = [
  {
    identifier: "Broadcast.This",
    xmlElement: "BroadcastMessage",
    xmlStaticAttributes: {
      global: "false",
      local: "true",
      style: "broadcast-msg",
    },
    parameters: 2,
  },
  {
    identifier: "Broadcast.Craft",
    xmlElement: "BroadcastMessage",
    xmlStaticAttributes: {
      global: "false",
      local: "false",
      style: "broadcast-msg-craft",
    },
    parameters: 2,
  },
  {
    identifier: "Broadcast.Nearby",
    xmlElement: "BroadcastMessage",
    xmlStaticAttributes: {
      global: "true",
      local: "true",
      style: "broadcast-msg-all-crafts",
    },
    parameters: 2,
  },
] as const;
const baseInstructionDefinitions: InstructionDefinition[] = [
  {
    identifier: "ActivateStage",
    xmlElement: "ActivateStage",
    xmlStaticAttributes: {
      style: "activate-stage",
    },
  },
  {
    identifier: "SetTarget",
    xmlElement: "SetTarget",
    xmlStaticAttributes: {
      style: "set-target",
    },
    parameters: 1,
  },
  {
    identifier: "AG.Set",
    xmlElement: "SetActivationGroup",
    xmlStaticAttributes: {
      style: "set-ag",
    },
    parameters: 2,
  },
  {
    identifier: "Craft.Switch",
    xmlElement: "SwitchCraft",
    xmlStaticAttributes: {
      style: "switch-craft",
    },
    parameters: 1,
  },
  {
    identifier: "Sound.Beep",
    xmlElement: "SetCraftProperty",
    xmlStaticAttributes: {
      property: "Sound.Beep",
      style: "play-beep",
    },
    parameters: 3,
  },
  {
    identifier: "UserInput",
    xmlElement: "UserInput",
    xmlStaticAttributes: {
      style: "user-input",
    },
    parameters: 2,
  },
] as const;

export const staticInstructionDefinitions = {
  ...definitionListToObject([
    ...baseInstructionDefinitions,
    ...inputInstructionDefinitions,
    ...navigationInstructionDefinitions,
    ...timeModeInstructionDefinitions,
    ...outputInstructionDefinitions,
    ...cameraInstructionDefinitions,
    ...craftPartInstructionDefinitions,
    ...listInstructionDefinitions,
    ...broadcastInstructionDefinitions,
    ...mfdInstructions,
  ]),
} as const;
