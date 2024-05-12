import { importXml } from "@vztxt/lib/import/importXml";
import { codePrinter } from "@vztxt/lib/printer/codePrinter";

const parser = new DOMParser();

export function importXmlString(value: string) {
  const doc = parser.parseFromString(value, "text/xml");
  if (!(doc instanceof XMLDocument)) {
    return "";
  }
  const program = doc.querySelector("Program");
  if (!program) {
    return "";
  }

  const ast = importXml(program);
  if (ast) return codePrinter(ast);
  else return "";
}
