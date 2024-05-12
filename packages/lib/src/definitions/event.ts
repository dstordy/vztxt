interface EventDefinition {
  event: string;
  style: string;
  hasFilter: boolean;
  localVars: string[];
}

const makeEventDefinition = (
  event: string,
  style: string,
  localVars: string[] = [],
  hasFilter = false,
): [string, EventDefinition] => [
  event,
  {
    event,
    style,
    localVars,
    hasFilter,
  },
];

export const eventDefinitions = {
  ...Object.fromEntries([
    makeEventDefinition("FlightStart", "flight-start"),
    makeEventDefinition("Docked", "craft-docked", ["craftA", "craftB"]),
    makeEventDefinition("ChangeSoi", "change-soi", ["planet"]),
    makeEventDefinition("ReceiveMessage", "receive-msg", ["data"], true),
    makeEventDefinition("PartExplode", "part-explode", ["part"]),
    makeEventDefinition("PartCollision", "part-collision", [
      "part",
      "other",
      "velocity",
      "impulse",
    ]),
  ]),
} as const;
