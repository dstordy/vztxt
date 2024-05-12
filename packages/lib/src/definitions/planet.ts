const planetBasicOps = [
  "mass",
  "radius",
  "hasTerrain",
  "atmosphereDensity",
  "atmosphereHeight",
  "soiradius",
  "solarPosition",
  "childPlanets",
  "crafts",
  "crafts",
  "craftids",
  "parent",
  "structures",
  "day",
  "year",
  "velocity",
  "apoapsis",
  "periapsis",
  "period",
  "apoapsistime",
  "periapsistime",
  "inclination",
  "eccentricity",
  "meananomaly",
  "meanmotion",
  "periapsisargument",
  "rightascension",
  "trueanomaly",
  "semimajoraxis",
  "semiminoraxis",
] as const;

const planetPositionOps = [
  "toLatLongAgl",
  "toLatLongAsl",
  "toPosition",
  "toPositionOverSea",
] as const;

export const planetOps = [...planetBasicOps, ...planetPositionOps] as const;

export const planetOpStyles: [(typeof planetOps)[number], string][] = [
  ...planetBasicOps.map<[(typeof planetBasicOps)[number], string]>((op) => [
    op,
    "planet",
  ]),
  ["toLatLongAgl", "planet-to-lat-long-agl"],
  ["toLatLongAsl", "planet-to-lat-long-asl"],
  ["toPosition", "planet-to-position"],
  ["toPositionOverSea", "planet-to-position-asl"],
] as const;
