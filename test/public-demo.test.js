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

  assert.match(html, /data-public-demo="true"/);
  assert.match(html, /public-demo-notice/);
  assert.equal(catalogue.branches.length, 8);
  assert.equal(lessons.length, 89);
  assert.ok(lessons.every((lesson) => typeof lesson.intro === "string"));
  assert.ok(lessons.some((lesson) => lesson.learningNotes));
  assert.ok(fs.existsSync(path.join(temporaryDirectory, "lesson.html")));
  assert.ok(fs.existsSync(path.join(temporaryDirectory, "quiz.html")));
  assert.ok(fs.existsSync(path.join(temporaryDirectory, "assets", "curiousbooster-icon.svg")));

  const quizSource = fs.readFileSync(path.join(temporaryDirectory, "quiz-page.js"), "utf8");
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
});
