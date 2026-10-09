const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const APP_DIRECTORY = path.join(__dirname, "..");
const OUTPUT_DIRECTORY = process.env.CURIOUSBOOSTER_DEMO_OUTPUT
  ? path.resolve(process.env.CURIOUSBOOSTER_DEMO_OUTPUT)
  : path.join(APP_DIRECTORY, "docs");
const HTML_PAGES = ["index.html", "lesson.html", "quiz.html"];
const STATIC_FILES = [
  "styles.css",
  "app-client.js",
  "credits.js",
  "lesson-page.js",
  "quiz-page.js",
  "pwa.js",
  "service-worker.js"
];

function loadCurriculum() {
  const source = fs.readFileSync(path.join(APP_DIRECTORY, "app.js"), "utf8");
  const endOfCurriculum = source.indexOf("\nconst STORAGE_KEY =");
  if (endOfCurriculum < 0) {
    throw new Error("Could not locate the end of the lesson curriculum.");
  }

  const module = { exports: null };
  const curriculumScript = `${source.slice(0, endOfCurriculum)}\nmodule.exports = branches;`;
  vm.runInNewContext(curriculumScript, { module }, { timeout: 1000 });
  if (!Array.isArray(module.exports)) {
    throw new Error("The lesson curriculum could not be loaded.");
  }
  return module.exports;
}

function prepareOutputDirectory(outputDirectory) {
  fs.mkdirSync(outputDirectory, { recursive: true });
  for (const name of fs.readdirSync(outputDirectory)) {
    fs.rmSync(path.join(outputDirectory, name), { recursive: true, force: true });
  }
}

function buildPublicDemo(outputDirectory) {
  prepareOutputDirectory(outputDirectory);
  for (const filename of HTML_PAGES) {
    const source = fs.readFileSync(path.join(APP_DIRECTORY, filename), "utf8");
    const demoHtml = source
      .replace('<html lang="en">', '<html lang="en" data-public-demo="true">')
      .replace('href="/manifest.webmanifest"', 'href="manifest.webmanifest"');
    if (demoHtml === source) {
      throw new Error(`Could not enable public-demo mode in ${filename}.`);
    }
    fs.writeFileSync(path.join(outputDirectory, filename), demoHtml);
  }

  for (const filename of STATIC_FILES) {
    fs.copyFileSync(
      path.join(APP_DIRECTORY, filename),
      path.join(outputDirectory, filename)
    );
  }

  fs.copyFileSync(
    path.join(APP_DIRECTORY, "manifest.webmanifest"),
    path.join(outputDirectory, "manifest.webmanifest")
  );
  const manifestPath = path.join(outputDirectory, "manifest.webmanifest");
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  manifest.start_url = "./";
  manifest.scope = "./";
  manifest.id = "./";
  manifest.icons = manifest.icons.map((icon) => ({
    ...icon,
    src: icon.src.replace(/^\//, "./")
  }));
  fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);

  const serviceWorkerPath = path.join(outputDirectory, "service-worker.js");
  const serviceWorker = fs.readFileSync(serviceWorkerPath, "utf8")
    .replace(
      'const SERVER_ONLY_FILES = ["payment-return.html", "payment-return.js"];',
      "const SERVER_ONLY_FILES = [];"
    )
    .replace("const DEMO_ONLY_FILES = [];", 'const DEMO_ONLY_FILES = ["curriculum.json"];');
  if (
    serviceWorker === fs.readFileSync(path.join(APP_DIRECTORY, "service-worker.js"), "utf8") ||
    serviceWorker.includes('const SERVER_ONLY_FILES = ["payment-return.html", "payment-return.js"];') ||
    serviceWorker.includes("const DEMO_ONLY_FILES = [];")
  ) {
    throw new Error("Could not configure the public app's offline shell.");
  }
  fs.writeFileSync(serviceWorkerPath, serviceWorker);
  fs.cpSync(
    path.join(APP_DIRECTORY, "assets"),
    path.join(outputDirectory, "assets"),
    { recursive: true }
  );
  fs.writeFileSync(
    path.join(outputDirectory, "curriculum.json"),
    `${JSON.stringify({ branches: loadCurriculum() })}\n`
  );
  fs.writeFileSync(path.join(outputDirectory, ".nojekyll"), "");
}

try {
  buildPublicDemo(OUTPUT_DIRECTORY);
  console.log(`Built the public lessons demo in ${OUTPUT_DIRECTORY}.`);
} catch (error) {
  console.error("Could not build the public lessons demo.", error);
  process.exitCode = 1;
}
