const { entrypoints } = require("uxp");
const ppro = require("premierepro");
const fs = require("fs");

const IMPORTS_DIRECTORY = "plugin-data:/Imports";
const RESULTS_DIRECTORY = "plugin-data:/Results";
const ACTIVE_PROJECT_PATH = "plugin-data:/active-project.json";
const BRIDGE_VERSION = "1.2.1";
const RELEASES_URL = "https://api.github.com/repos/Coraubanne/CreatorBridge/releases/latest";
const RELEASE_PAGE = "https://github.com/Coraubanne/CreatorBridge/releases/tag/";
const SEMVER = /^v?(0|[1-9]\d{0,7})\.(0|[1-9]\d{0,7})\.(0|[1-9]\d{0,7})$/;
const checkButton = document.getElementById("check-update");
const releaseLink = document.getElementById("release-link");
const updateStatus = document.getElementById("update-status");
let timer = null;
let busy = false;
let checkingUpdate = false;
let activeProjectPath = "";

function setText(element, value) {
  if (element.textContent !== value) element.textContent = value;
}

function setProject(state, connection, name, path) {
  if (path !== undefined && path !== activeProjectPath) {
    activeProjectPath = path;
    document.getElementById("import-card").style.display = "none";
  }
  document.getElementById("project-card").dataset.state = state;
  setText(document.getElementById("connection"), connection);
  setText(document.getElementById("project"), name);
}

function setImportStatus(state, message) {
  const card = document.getElementById("import-card");
  card.dataset.state = state;
  setText(document.getElementById("import-status"), message);
  card.style.display = "block";
}

function compareVersions(left, right) {
  const a = left.match(SEMVER).slice(1).map(Number);
  const b = right.match(SEMVER).slice(1).map(Number);
  return a[0] - b[0] || a[1] - b[1] || a[2] - b[2];
}

async function checkForUpdate() {
  if (checkingUpdate) return;
  checkingUpdate = true;
  checkButton.setAttribute("disabled", "");
  releaseLink.style.display = "none";
  releaseLink.removeAttribute("href");
  updateStatus.dataset.state = "checking";
  setText(updateStatus, "Recherche en cours…");

  let timeout;
  try {
    const controller = new AbortController();
    timeout = setTimeout(() => controller.abort(), 10000);
    const response = await fetch(RELEASES_URL, {
      headers: { Accept: "application/vnd.github+json" },
      signal: controller.signal
    });
    if (!response.ok) throw new Error("GitHub inaccessible");
    const release = await response.json();
    const tag = release?.tag_name;
    if (release?.draft !== false || release.prerelease !== false
        || typeof tag !== "string" || !tag.startsWith("v") || !SEMVER.test(tag)) {
      throw new Error("Version invalide");
    }
    if (compareVersions(tag, BRIDGE_VERSION) <= 0) {
      updateStatus.dataset.state = "ready";
      setText(updateStatus, "Creator Bridge est à jour.");
      return;
    }
    const archive = Array.isArray(release.assets) && release.assets.some((asset) =>
      asset?.name === `CreatorBridge-${tag}.zip` && asset.state === "uploaded"
      && /^sha256:[0-9a-f]{64}$/.test(asset.digest)
    );
    if (!archive) throw new Error("Archive manquante ou empreinte indisponible");

    updateStatus.dataset.state = "available";
    setText(updateStatus, `Version ${tag.slice(1)} disponible.`);
    releaseLink.setAttribute("href", `${RELEASE_PAGE}${tag}`);
    releaseLink.style.display = "inline-block";
  } catch (error) {
    updateStatus.dataset.state = "error";
    setText(updateStatus, "Vérification impossible. Réessayez dans un instant.");
  } finally {
    clearTimeout(timeout);
    checkButton.removeAttribute("disabled");
    checkingUpdate = false;
  }
}

async function ensureDirectories() {
  for (const directory of [IMPORTS_DIRECTORY, RESULTS_DIRECTORY]) {
    try { await fs.mkdir(directory, { recursive: true }); }
    catch (error) {
      if (!String(error.message || error).toLowerCase().includes("exist")) throw error;
    }
  }
}

async function writeJson(target, payload) {
  await fs.writeFile(target, JSON.stringify(payload), { encoding: "utf-8" });
}

function childPath(directory, name) { return `${directory.replace(/\/$/, "")}/${name}`; }
function fileStem(value) { return String(value).split("/").pop().replace(/\.json$/i, ""); }
function normalizedPath(value) { return String(value || "").replace(/\\/g, "/").replace(/\/+$/, ""); }
function samePath(first, second) { return normalizedPath(first) === normalizedPath(second); }
function producerName(job) {
  const value = String(job.producerName || job.producer || "ClipFlow").trim();
  return value.slice(0, 48) || "Application";
}

async function finishJob(jobPath, job, state, message) {
  const identifier = String(job.jobId || fileStem(jobPath));
  await writeJson(childPath(RESULTS_DIRECTORY, `${identifier}.json`), {
    schemaVersion: 1,
    producer: String(job.producer || "clipflow"),
    state,
    message,
    updatedAt: Date.now()
  });
  await fs.unlink(jobPath);
}

async function importNextJob(project) {
  const names = (await fs.readdir(IMPORTS_DIRECTORY)).filter((name) => name.endsWith(".json")).sort();
  for (const name of names) {
    const jobPath = childPath(IMPORTS_DIRECTORY, name);
    let job;
    try { job = JSON.parse(await fs.readFile(jobPath, { encoding: "utf-8" })); }
    catch (error) {
      await finishJob(jobPath, {}, "error", `Demande invalide : ${error.message}`);
      continue;
    }
    if (!samePath(job.projectPath, project.path)) continue;
    const producer = producerName(job);
    try {
      const rootItem = await project.getRootItem();
      const imported = await project.importFiles([job.mediaPath], true, rootItem, false);
      if (!imported) throw new Error("Premiere Pro a refusé le fichier.");
      await finishJob(jobPath, job, "complete", `${producer} · fichier ajouté au projet`);
      setImportStatus("complete", `${producer} · fichier ajouté au projet`);
    } catch (error) {
      await finishJob(jobPath, job, "error", String(error.message || error));
      setImportStatus("error", `${producer} · ${error.message || error}`);
    }
    break;
  }
}

async function tick() {
  if (busy) return;
  busy = true;
  try {
    await ensureDirectories();
    const project = await ppro.Project.getActiveProject();
    if (!project || !project.path || !String(project.path).toLowerCase().endsWith(".prproj")) {
      setProject("waiting", "En attente", "Ouvrez un projet enregistré.", "");
      return;
    }
    await writeJson(ACTIVE_PROJECT_PATH, {
      schemaVersion: 1,
      bridgeName: "Creator Bridge",
      bridgeVersion: BRIDGE_VERSION,
      producers: ["clipflow", "capture8k"],
      projectPath: project.path,
      projectName: project.name,
      projectGuid: String(project.guid || ""),
      updatedAt: Date.now()
    });
    setProject("ready", "Connecté", project.name || fileStem(project.path), normalizedPath(project.path));
    await importNextJob(project);
  } catch (error) {
    setProject("error", "Indisponible", String(error.message || error));
  } finally { busy = false; }
}

function startBridge() {
  if (timer !== null) return;
  tick();
  timer = setInterval(tick, 1000);
}
function stopBridge() { if (timer !== null) clearInterval(timer); timer = null; }

setText(document.getElementById("bridge-version"), `v${BRIDGE_VERSION}`);
checkButton.addEventListener("click", checkForUpdate);

entrypoints.setup({
  plugin: { create: startBridge, destroy: stopBridge },
  panels: {
    clipflowBridge: { create: startBridge, show() { startBridge(); tick(); }, destroy: stopBridge }
  }
});
