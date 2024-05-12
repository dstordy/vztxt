import { inputs } from "./input";
import { IdentifierDefinition } from "./shared";

export const altitudeProperties = [
  "Altitude.AGL",
  "Altitude.ASL",
  "Altitude.ASF",
] as const;

export const orbitProperties = [
  "Orbit.Apoapsis",
  "Orbit.Periapsis",
  "Orbit.TimeToApoapsis",
  "Orbit.TimeToPeriapsis",
  "Orbit.Eccentricity",
  "Orbit.Inclination",
  "Orbit.Period",
] as const;

export const atmosphereProperties = [
  "Atmosphere.AirDensity",
  "Atmosphere.AirPressure",
  "Atmosphere.SpeedOfSound",
  "Atmosphere.Temperature",
] as const;

export const performanceProperties = [
  "Performance.CurrentEngineThrust",
  "Performance.Mass",
  "Performance.DryMass",
  "Performance.FuelMass",
  "Performance.MaxActiveEngineThrust",
  "Performance.TWR",
  "Performance.CurrentIsp",
  "Performance.StageDeltaV",
  "Performance.BurnTime",
];

export const fuelProperties = [
  "Fuel.Battery",
  "Fuel.FuelInStage",
  "Fuel.Mono",
  "Fuel.AllStages",
] as const;

export const navProperties = [
  "Nav.Position",
  "Target.Position",
  "Nav.CraftHeading",
  "Nav.Pitch",
  "Nav.AutopilotHeading",
  "Nav.AutopilotPitch",
  "Nav.BankAngle",
  "Nav.AngleOfAttack",
  "Nav.SideSlip",
  "Nav.North",
  "Nav.East",
  "Nav.CraftDirection",
  "Nav.CraftRight",
  "Nav.CraftUp",
] as const;

export const velocityProperties = [
  "Vel.SurfaceVelocity",
  "Vel.OrbitVelocity",
  "Target.Velocity",
  "Vel.Gravity",
  "Vel.Drag",
  "Vel.Acceleration",
  "Vel.AngularVelocity",
  "Vel.LateralSurfaceVelocity",
  "Vel.VerticalSurfaceVelocity",
  "Vel.MachNumber",
] as const;

export const inputProperties = [...inputs.map((i) => `Input.${i}`)] as const;

export const miscProperties = [
  "Misc.Stage",
  "Misc.NumStages",
  "Misc.Grounded",
  "Misc.SolarRadiation",
  "Misc.CameraPosition",
  "Misc.CameraPointing",
  "Misc.CameraUp",
  "Misc.PidPitch",
  "Misc.PidRoll",
] as const;

export const timeProperties = [
  "Time.FrameDeltaTime",
  "Time.TimeSinceLaunch",
  "Time.TotalTime",
  "Time.WarpAmount",
  "Time.RealTime",
] as const;

export const nameProperties = [
  "Name.Craft",
  "Orbit.Planet",
  "Target.Name",
  "Target.Planet",
] as const;

export const terrainProperties = ["Terrain.Color", "Terrain.Height"] as const;

export const partProperties = [
  "Part.IDToName",
  "Part.Mass",
  "Part.DryMass",
  "Part.WetMass",
  "Part.Activated",
  "Part.PartType",
  "Part.Position",
  "Part.Temperature",
  "Part.Drag",
  "Part.ThisID",
  "Part.MinID",
  "Part.MaxID",
  "Part.UnderWater",
] as const;

export const craftProperties = [
  "Craft.Altitude",
  "Craft.Destroyed",
  "Craft.Grounded",
  "Craft.Mass",
  "Craft.IDToName",
  "Craft.PartCount",
  "Craft.Planet",
  "Craft.Position",
  "Craft.Velocity",
  "Craft.IsPlayer",
  "Craft.BoundMin",
  "Craft.BoundMax",
  "Craft.Apoapsis",
  "Craft.Periapsis",
  "Craft.Period",
  "Craft.ApoapsisTime",
  "Craft.PeriapsisTime",
  "Craft.Inclination",
  "Craft.Eccentricity",
  "Craft.MeanAnomaly",
  "Craft.MeanMotion",
  "Craft.PeriapsisArgument",
  "Craft.RightAscension",
  "Craft.TrueAnomaly",
  "Craft.SemiMajorAxis",
  "Craft.SemiMinorAxis",
] as const;

export const craftPartSetterProperties = [
  "Part.SetActivated",
  "Part.SetFocused",
  "Part.SetName",
  "Part.SetExplode",
  "Part.FuelTransfer",
] as const;

const createPropDef =
  (style: string, parameters = 0) =>
  (identifier: string): IdentifierDefinition => ({
    identifier,
    xmlElement: "CraftProperty",
    xmlStaticAttributes: { property: identifier, style },
    ...(parameters > 0 ? { parameters } : {}),
  });

export const propertyDefinitions = [
  ...altitudeProperties.map(createPropDef("prop-altitude")),
  ...orbitProperties.map(createPropDef("prop-orbit")),
  ...atmosphereProperties.map(createPropDef("prop-atmosphere")),
  ...performanceProperties.map(createPropDef("prop-performance")),
  ...fuelProperties.map(createPropDef("prop-fuel")),
  ...navProperties.map(createPropDef("prop-nav")),
  ...velocityProperties.map(createPropDef("prop-velocity")),
  ...inputProperties.map(createPropDef("prop-input")),
  ...miscProperties.map(createPropDef("prop-misc")),
  ...timeProperties.map(createPropDef("prop-time")),
  ...nameProperties.map(createPropDef("prop-name")),

  ...terrainProperties.map(createPropDef("terrain-query", 1)),
  ...partProperties.map(createPropDef("part", 1)),
  ...craftProperties.map(createPropDef("craft", 1)),
  createPropDef("part-id", 1)("Part.NameToID"),
  createPropDef("craft-id", 1)("Craft.NameToID"),

  ...["Part.LocalToPci", "Part.PciToLocal"].map(
    createPropDef("part-transform", 2),
  ),
  createPropDef("raycast-query", 2)("Raycast"),
] as const;
