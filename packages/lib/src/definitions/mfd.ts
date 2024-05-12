import { IdentifierDefinition } from "./shared";

const widgetTypes = [
  "Ellipse",
  "Label",
  "Line",
  "RadialGauge",
  "Rectangle",
  "Texture",
  "Navball",
  "Map",
] as const;

const widgetProperties = [
  "AnchoredPosition",
  "AnchorMin",
  "AnchorMax",
  "Color",
  "Opacity",
  "Parent",
  "Pivot",
  "Position",
  "Rotation",
  "Scale",
  "Size",
  "Visible",
] as const;

const widgetAnchorPositions = [
  "Left",
  "Center",
  "Right",
  "TopLeft",
  "TopCenter",
  "TopRight",
  "BottomLeft",
  "BottomCenter",
  "BottomRight",
] as const;

const labelProperties = ["Text", "FontSize", "AutoSize"] as const;

const spriteProperties = ["FillMethod", "Icon", "FillAmount"] as const;

const gaugeProperties = [
  "BackgroundColor",
  "FillColor",
  "Text",
  "TextColor",
  "Value",
] as const;

const lineInstructions = ["SetThickness", "SetLength"] as const;

const navballInstructions = ["TopColor", "BottomColor"] as const;

const mapInstructions = [
  "NorthUp",
  "Zoom",
  "ManualMode",
  "PlanetName",
  "Coordinates",
  "Heading",
] as const;

const mfdEvents = ["Drag", "PointerDown", "PointerUp", "PointerClick"] as const;

const makeInstructionDefinition = (
  identifier: string,
  style: string,
  parameters = 1,
): IdentifierDefinition => ({
  identifier,
  xmlElement: "SetCraftProperty",
  xmlStaticAttributes: {
    property: identifier,
    style,
  },
  parameters,
});

export const mfdInstructions = [
  ...widgetTypes.map((i) =>
    makeInstructionDefinition(`Mfd.Create.${i}`, "create-mfd-widget"),
  ),
  ...widgetProperties.map((i) =>
    makeInstructionDefinition(`Mfd.Set${i}`, "set-mfd-widget", 2),
  ),
  ...widgetAnchorPositions.map((i) =>
    makeInstructionDefinition(`Mfd.Widget.SetAnchor.${i}`, "set-mfd-anchor"),
  ),
  ...widgetAnchorPositions.map((i) =>
    makeInstructionDefinition(
      `Mfd.Label.SetAlignment.${i}`,
      "set-mfd-alignment",
    ),
  ),
  makeInstructionDefinition(
    "Mfd.Texture.Initialize",
    "set-mfd-texture-initialize",
    3,
  ),
  makeInstructionDefinition(
    "Mfd.Texture.SetPixel",
    "set-mfd-texture-setpixel",
    4,
  ),
  ...labelProperties.map((i) =>
    makeInstructionDefinition(`Mfd.Label.Set${i}`, "set-mfd-label", 2),
  ),
  ...spriteProperties.map((i) =>
    makeInstructionDefinition(`Mfd.Sprite.Set${i}`, "set-mfd-sprite", 2),
  ),
  ...gaugeProperties.map((i) =>
    makeInstructionDefinition(`Mfd.Gauge.Set${i}`, "set-mfd-gauge", 2),
  ),
  ...lineInstructions.map((i) =>
    makeInstructionDefinition(`Mfd.Line.${i}`, "set-mfd-line", 2),
  ),
  makeInstructionDefinition("Mfd.Line.SetLinePoints", "set-mfd-line-points", 3),
  ...navballInstructions.map((i) =>
    makeInstructionDefinition(`Mfd.Navball.${i}`, "set-mfd-navball", 2),
  ),
  ...mapInstructions.map((i) =>
    makeInstructionDefinition(`Mfd.Map.${i}`, "set-mfd-map", 2),
  ),
  makeInstructionDefinition("Mfd.Order.SendToFront", "set-mfd-order-front", 2),
  makeInstructionDefinition("Mfd.Order.SendToBack", "set-mfd-order-back", 2),
  ...mfdEvents.map((i) =>
    makeInstructionDefinition(`Mfd.Event.Set${i}`, "set-mfd-event", 3),
  ),
  makeInstructionDefinition("Mfd.Destroy", "destroy-mfd-widget", 1),
  makeInstructionDefinition("Mfd.Destroy.All", "destroy-all-mfd-widgets", 0),
] as const;

const makeExpressionDefinition = (
  identifier: string,
  style: string,
  parameters = 1,
  propertyOverride?: string,
): IdentifierDefinition => ({
  identifier,
  xmlElement: "CraftProperty",
  xmlStaticAttributes: {
    property: propertyOverride ?? identifier,
    style,
  },
  parameters,
});

export const mfdExpressions: IdentifierDefinition[] = [
  ...widgetProperties.map((i) =>
    makeExpressionDefinition(`Mfd.${i}`, "prop-mfd-widget"),
  ),
  makeExpressionDefinition("Mfd.Exists", "prop-mfd-widget"),
  ...labelProperties.map((i) =>
    makeExpressionDefinition(`Mfd.Label.${i}`, "prop-mfd-label"),
  ),
  makeExpressionDefinition("Mfd.Label.Alignment", "prop-mfd-label"),
  ...spriteProperties.map((i) =>
    makeExpressionDefinition(`Mfd.Sprite.${i}`, "prop-mfd-sprite"),
  ),
  ...gaugeProperties.map((i) =>
    makeExpressionDefinition(`Mfd.Gauge.${i}`, "prop-mfd-gauge"),
  ),
  makeExpressionDefinition(
    "Mfd.Texture.GetPixel",
    "prop-mfd-texture-getpixel",
    3,
  ),
  makeExpressionDefinition(
    "Mfd.LocalToDisplay",
    "prop-mfd-pos",
    2,
    "Mfd.LocaltoDisplay",
  ),
  makeExpressionDefinition("Mfd.DisplayToLocal", "prop-mfd-pos", 2),
  ...mfdEvents.map((i) =>
    makeExpressionDefinition(`Mfd.Event.${i}`, "prop-mfd-event"),
  ),
] as const;
