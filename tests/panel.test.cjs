const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const source = readFileSync(path.join(root, "index.js"), "utf8");
const manifest = JSON.parse(readFileSync(path.join(root, "manifest.json"), "utf8"));
const endpoint = "https://api.github.com/repos/Coraubanne/CreatorBridge/releases/latest";

function loadPanel(fetch) {
  const elements = new Map();
  let click;
  const document = {
    getElementById(id) {
      if (!elements.has(id)) elements.set(id, {
        textContent: "",
        style: {},
        dataset: {},
        attributes: {},
        setAttribute(name, value) { this.attributes[name] = value; },
        removeAttribute(name) { delete this.attributes[name]; },
        addEventListener(event, callback) { if (event === "click") click = callback; }
      });
      return elements.get(id);
    }
  };
  const context = vm.createContext({
    document, fetch, AbortController, setTimeout, clearTimeout,
    require(module) {
      if (module === "uxp") return { entrypoints: { setup() {} } };
      return {};
    }
  });
  vm.runInContext(source, context);
  return { get: document.getElementById, click, context };
}

test("checks only Creator Bridge on click and reports the installed version", async () => {
  const requests = [];
  const panel = loadPanel(async (url) => {
    requests.push(url);
    return { ok: true, json: async () => ({ draft: false, prerelease: false, tag_name: "v1.1.0" }) };
  });

  assert.deepEqual(requests, []);
  assert.equal(panel.get("bridge-version").textContent, "v" + manifest.version);
  await panel.click();
  assert.deepEqual(requests, [endpoint]);
  assert.equal(panel.get("update-status").dataset.state, "ready");
  assert.equal(panel.get("release-link").style.display, "none");
});

test("shows only a verified stable release and clears an old offer when the check fails", async () => {
  let release = {
    draft: false, prerelease: false, tag_name: "v1.10.0",
    assets: [{ name: "CreatorBridge-v1.10.0.zip", state: "uploaded", digest: "sha256:" + "a".repeat(64) }]
  };
  const panel = loadPanel(async () => ({ ok: true, json: async () => release }));
  await panel.click();
  assert.equal(panel.get("update-status").dataset.state, "available");
  assert.equal(panel.get("release-link").attributes.href, "https://github.com/Coraubanne/CreatorBridge/releases/tag/v1.10.0");

  release = { ...release, assets: [] };
  await panel.click();
  assert.equal(panel.get("update-status").dataset.state, "error");
  assert.equal(panel.get("release-link").attributes.href, undefined);
  assert.equal(panel.get("check-update").attributes.disabled, undefined);

  release = { ...release, tag_name: "v1.10.0-rc.1", prerelease: true };
  await panel.click();
  assert.equal(panel.get("update-status").dataset.state, "error");
});

test("keeps the last import visible for its project and clears it for another project", () => {
  const panel = loadPanel(() => { throw new Error("Unexpected network request"); });
  vm.runInContext("setProject('ready', 'Connecté', 'Projet A', '/A.prproj'); setImportStatus('complete', 'Import terminé');", panel.context);
  vm.runInContext("setProject('ready', 'Connecté', 'Projet A', '/A.prproj');", panel.context);
  assert.equal(panel.get("import-card").style.display, "block");
  assert.equal(panel.get("import-status").textContent, "Import terminé");
  vm.runInContext("setProject('ready', 'Connecté', 'Projet B', '/B.prproj');", panel.context);
  assert.equal(panel.get("import-card").style.display, "none");
});
