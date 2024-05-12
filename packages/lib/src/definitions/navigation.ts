export const indicatorTypes = [
  "None",
  "Prograde",
  "Retrograde",
  "Target",
  "BurnNode",
  "Current",
] as const;

export const autopilotHeadingSetters: [string, string][] = [
  ["Nav.SetAutopilotHeading", "heading"],
  ["Nav.SetAutopilotPitch", "pitch"],
  ["Misc.SetPidPitch", "pid-pitch"],
  ["Misc.SetPidRoll", "pid-roll"],
] as const;

export const setTargetHeadingPropertyMap = {
  ...Object.fromEntries(autopilotHeadingSetters.map(([v, k]) => [k, v])),
} as const;
