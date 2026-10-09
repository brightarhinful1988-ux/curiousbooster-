const READER_LESSON_KEY = "curious.reader-lesson";
const COMPLETED_LESSONS_KEY = "curious.completed-lessons";
const quizCard = document.querySelector("#quiz-card");
const isPublicDemo = document.documentElement.dataset.publicDemo === "true";

function addTextElement(parent, tagName, className, text) {
  const element = document.createElement(tagName);
  if (className) {
    element.className = className;
  }
  element.textContent = text;
  parent.append(element);
  return element;
}

function loadLesson() {
  try {
    const saved = sessionStorage.getItem(READER_LESSON_KEY);
    if (!saved) {
      return null;
    }
    const selection = JSON.parse(saved);
    const lessonId = selection?.lessonId || selection?.lesson?.id;
    if (typeof lessonId !== "string") {
      throw new Error("The selected lesson identifier is missing.");
    }
    return { lessonId };
  } catch (error) {
    console.error("Could not load quiz data.", error);
    return null;
  }
}

function markLessonComplete(lessonId) {
  try {
    const stored = JSON.parse(localStorage.getItem(COMPLETED_LESSONS_KEY) || "[]");
    const completed = new Set(Array.isArray(stored) ? stored : []);
    completed.add(lessonId);
    localStorage.setItem(COMPLETED_LESSONS_KEY, JSON.stringify([...completed]));
  } catch (error) {
    console.error("Could not save lesson progress.", error);
    throw error;
  }
}

function renderMissingQuiz() {
  quizCard.replaceChildren();
  addTextElement(quizCard, "p", "eyebrow", "NO LESSON SELECTED");
  addTextElement(quizCard, "h1", "reader-title", "Choose a lesson first");
  addTextElement(
    quizCard,
    "p",
    "reader-intro",
    "Open a lesson and finish reading it before starting its quiz."
  );
  const link = document.createElement("a");
  link.className = "read-lesson-button";
  link.href = "index.html";
  link.textContent = "Browse lessons";
  quizCard.append(link);
}

function renderQuiz(selection) {
  const { branchName, lesson } = selection;
  quizCard.replaceChildren();
  addTextElement(quizCard, "p", "eyebrow", "LESSON SELF-CHECK");

  const meta = document.createElement("div");
  meta.className = "lesson-meta";
  addTextElement(meta, "span", "subject-tag", branchName.toUpperCase());
  if (lesson.year) {
    addTextElement(meta, "span", "year-tag", lesson.year);
  }
  quizCard.append(meta);

  addTextElement(quizCard, "h1", "reader-title", lesson.title);
  addTextElement(quizCard, "h2", "quiz-page-question", lesson.question);

  const options = document.createElement("div");
  options.className = "quiz-options";
  const feedback = document.createElement("p");
  feedback.className = "quiz-feedback";
  feedback.setAttribute("aria-live", "polite");

  lesson.options.forEach((option, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "quiz-option";
    const letter = document.createElement("span");
    letter.className = "option-letter";
    letter.textContent = String.fromCharCode(65 + index);
    const label = document.createElement("span");
    label.textContent = option;
    button.append(letter, label);
    button.addEventListener("click", () => {
      if (index === lesson.answer) {
        button.classList.add("is-correct");
        feedback.textContent = `That's right! ${lesson.explanation}`;
        feedback.className = "quiz-feedback success";
        try {
          markLessonComplete(lesson.id);
        } catch {
          feedback.textContent += " Progress could not be saved in this browser.";
        }
        for (const answerButton of options.querySelectorAll("button")) {
          answerButton.disabled = true;
        }
      } else {
        button.classList.add("is-incorrect");
        button.disabled = true;
        feedback.textContent = "Not quite. Think back to the lesson and try another answer.";
        feedback.className = "quiz-feedback try-again";
      }
    });
    options.append(button);
  });

  quizCard.append(options, feedback);
  const returnLink = document.createElement("a");
  returnLink.className = "reader-return";
  returnLink.href = "index.html";
  returnLink.textContent = "← Return to subjects and lessons";
  quizCard.append(returnLink);
}

const lessonSelection = loadLesson();
if (lessonSelection) {
  const lessonRequest = isPublicDemo
    ? fetch("curriculum.json")
      .then((response) => {
        if (!response.ok) {
          throw new Error("The public lesson catalogue could not be loaded.");
        }
        return response.json();
      })
      .then((catalogue) => {
        for (const branch of catalogue.branches) {
          const lesson = branch.lessons.find((item) => item.id === lessonSelection.lessonId);
          if (lesson) {
            return { branchName: branch.name, lesson };
          }
        }
        throw new Error("The selected lesson could not be found.");
      })
    : fetch(`/api/lessons/${encodeURIComponent(lessonSelection.lessonId)}/content`, {
      credentials: "same-origin"
    })
    .then(async (response) => {
      let result;
      try {
        result = await response.json();
      } catch (error) {
        console.error("The quiz-access response could not be read.", error);
        throw new Error("The server returned an unreadable access response.");
      }
      if (!response.ok) {
        const accessError = new Error(result.error?.message || "Quiz access could not be checked.");
        accessError.code = result.error?.code;
        throw accessError;
      }
      return result;
    });
  lessonRequest
    .then((selection) => {
      if (
        typeof selection?.branchName !== "string" ||
        typeof selection?.lesson?.id !== "string" ||
        typeof selection?.lesson?.title !== "string" ||
        typeof selection?.lesson?.question !== "string" ||
        !Array.isArray(selection?.lesson?.options) ||
        !Number.isInteger(selection?.lesson?.answer) ||
        typeof selection?.lesson?.explanation !== "string"
      ) {
        throw new Error("The server returned incomplete quiz data.");
      }
      renderQuiz(selection);
    })
    .catch((error) => {
      console.error("Could not confirm quiz access.", error);
      quizCard.replaceChildren();
      const locked = error.code === "LESSON_LOCKED";
      addTextElement(quizCard, "p", "eyebrow", locked ? "LESSON LOCKED" : "QUIZ ACCESS");
      addTextElement(
        quizCard,
        "h1",
        "reader-title",
        locked ? "Unlock this lesson first" : "Could not verify lesson access"
      );
      addTextElement(
        quizCard,
        "p",
        "reader-intro",
        locked
          ? "Use 1 credit to unlock the lesson before taking its quiz. Quizzes for unlocked lessons are free."
          : `${error.message} Run CURIOUSBOOSTER using npm start and open http://localhost:3000.`
      );
      const link = document.createElement("a");
      link.className = "read-lesson-button";
      link.href = "index.html";
      link.textContent = locked ? "Return to your learning path" : "Return to CURIOUSBOOSTER";
      quizCard.append(link);
    });
} else {
  renderMissingQuiz();
}
