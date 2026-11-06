const assert = require("node:assert/strict");
const { execFileSync } = require("node:child_process");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");

const APP_DIRECTORY = path.join(__dirname, "..");

test("public demo build includes all lessons without account features", (context) => {
  const temporaryDirectory = fs.mkdtempSync(path.join(os.tmpdir(), "curiousbooster-demo-"));
  context.after(() => fs.rmSync(temporaryDirectory, { recursive: true, force: true }));

  execFileSync(process.execPath, [path.join(APP_DIRECTORY, "scripts", "build-public-demo.js")], {
    cwd: APP_DIRECTORY,
    env: { ...process.env, CURIOUSBOOSTER_DEMO_OUTPUT: temporaryDirectory },
    stdio: "pipe"
  });

  const html = fs.readFileSync(path.join(temporaryDirectory, "index.html"), "utf8");
  const catalogue = JSON.parse(
    fs.readFileSync(path.join(temporaryDirectory, "curriculum.json"), "utf8")
  );
  const lessons = catalogue.branches.flatMap((branch) => branch.lessons);
  const photoAttributions = {};
  vm.runInNewContext(
    fs.readFileSync(path.join(temporaryDirectory, "assets", "lesson-photo-attributions.js"), "utf8"),
    { window: photoAttributions }
  );

  assert.match(html, /data-public-demo="true"/);
  assert.match(html, /public-demo-notice/);
  assert.match(html, /After installation, the report form will open for you to complete/);
  assert.doesNotMatch(html, /Report your installation/);
  assert.doesNotMatch(html, /install-report/);
  assert.equal(catalogue.branches.length, 8);
  assert.equal(lessons.length, 89);
  assert.ok(lessons.every((lesson) =>
    typeof lesson.intro === "string" &&
    lesson.intro.length > 40 &&
    typeof lesson.fact === "string" &&
    lesson.fact.length > 10 &&
    typeof lesson.explanation === "string" &&
    lesson.explanation.length > 10
  ));
  assert.ok(lessons.some((lesson) => lesson.learningNotes));
  assert.ok(lessons.every((lesson) =>
    lesson.id === "chemistry-periodic-table" ||
    (typeof photoAttributions.lessonPhotoAttributions[lesson.id]?.path === "string" &&
      fs.existsSync(path.join(
        temporaryDirectory,
        photoAttributions.lessonPhotoAttributions[lesson.id].path
      )))
  ), "each lesson should have an image available in the public build");
  assert.ok(fs.existsSync(path.join(temporaryDirectory, "lesson.html")));
  assert.ok(fs.existsSync(path.join(temporaryDirectory, "quiz.html")));
  assert.ok(fs.existsSync(path.join(temporaryDirectory, "service-worker.js")));
  assert.ok(fs.existsSync(path.join(temporaryDirectory, "assets", "ambitious-science-icon.svg")));
  const manifest = JSON.parse(
    fs.readFileSync(path.join(temporaryDirectory, "manifest.webmanifest"), "utf8")
  );
  assert.equal(manifest.id, "./");
  assert.equal(manifest.start_url, "./");
  assert.equal(manifest.scope, "./");
  assert.ok(manifest.icons.every((icon) => !icon.src.startsWith("/")));
  assert.ok(manifest.icons.some((icon) => icon.sizes === "192x192"));
  assert.ok(manifest.icons.some((icon) => icon.sizes === "512x512"));
  for (const size of [180, 192, 512]) {
    assert.ok(fs.existsSync(path.join(temporaryDirectory, "assets", `ambitious-science-icon-${size}.png`)));
  }
  const serviceWorker = fs.readFileSync(path.join(temporaryDirectory, "service-worker.js"), "utf8");
  assert.match(serviceWorker, /SERVER_ONLY_FILES = \[\]/);
  assert.match(serviceWorker, /DEMO_ONLY_FILES = \["curriculum\.json"\]/);

  const quizSource = fs.readFileSync(path.join(temporaryDirectory, "quiz-page.js"), "utf8");
  const lessonSource = fs.readFileSync(path.join(temporaryDirectory, "lesson-page.js"), "utf8");
  const appSource = fs.readFileSync(path.join(temporaryDirectory, "app-client.js"), "utf8");
  const lessonHtml = fs.readFileSync(path.join(temporaryDirectory, "lesson.html"), "utf8");
  const questionBank = quizSource.match(/const challengeQuestions = (\[[\s\S]*?\n\]);/);
  assert.ok(questionBank, "the 30-level question bank should be present");
  const questions = vm.runInNewContext(`(${questionBank[1]})`);
  assert.equal(questions.length, 30);
  assert.ok(questions.every((question) =>
    typeof question.subject === "string" &&
    typeof question.question === "string" &&
    question.options.length === 4 &&
    Number.isInteger(question.answer) &&
    question.answer >= 0 &&
    question.answer < question.options.length &&
    typeof question.explanation === "string"
  ));
  assert.match(quizSource, /level <= 10 \? "Foundation" : level <= 20 \? "Application" : "Challenge"/);
  assert.match(appSource, /lesson\.html\?lesson=\$\{encodeURIComponent\(lesson\.id\)\}/);
  assert.match(lessonSource, /new URLSearchParams\(window\.location\.search\)\.get\("lesson"\)/);
  assert.match(lessonSource, /LESSON READING DOCUMENT/);
  assert.match(lessonSource, /KEY FACT/);
  assert.match(lessonSource, /nextPage\.href = "#quiz-card"/);
  assert.match(quizSource, /new URLSearchParams\(window\.location\.search\)\.get\("lesson"\)/);
  assert.match(lessonHtml, /id="quiz-card"/);
  assert.match(lessonHtml, /<script src="quiz-page\.js" defer><\/script>/);
  assert.match(serviceWorker, /curiousbooster-shell-v5/);
});
