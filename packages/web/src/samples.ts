import { html } from "lit-html";

const samples: Record<string, string> = {};

async function loadSamples() {
  const sampleFiles = import.meta.glob("../../../samples/*.xml", { as: "raw" });

  for (const path in sampleFiles) {
    const [, filename] = path.match(/([^/]+.xml)/i) ?? [];
    if (filename) {
      const sampleFile = await sampleFiles[path]();
      samples[filename] = sampleFile;
    }
  }
}

await loadSamples();

export const sampleList = (loadSampleXml: (doc: string) => void) => {
  if (Object.keys(samples).length == 0) return "";

  return html`
    <form
      class="p-2 flex flex-col"
      @submit=${(e: Event) => {
        e.preventDefault();

        const sampleSelect = document.getElementById("sample-select");
        if (sampleSelect instanceof HTMLSelectElement) {
          loadSampleXml(samples[sampleSelect.value]);
        }
      }}
    >
      <div class="label">
        <label class="label-text" for="sample-select">Load Sample</label>
      </div>
      <div class="flex gap-2">
        <select id="sample-select" class="select select-sm flex-1">
          ${Object.keys(samples).map(
            (s) => html`<option value=${s}>${s}</option>`,
          )}
        </select>
        <button class="btn btn-sm" type="submit">Load</button>
      </div>
    </form>
  `;
};
