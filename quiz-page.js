const READER_LESSON_KEY = "curious.reader-lesson";
const COMPLETED_LESSONS_KEY = "curious.completed-lessons";
const CHALLENGE_PROGRESS_KEY = "curious.science-challenge";
const quizCard = document.querySelector("#quiz-card");
const isPublicDemo = document.documentElement.dataset.publicDemo === "true";
const challengeQuestions = [
  {
    subject: "Biology · Cells",
    question: "A tissue is best described as…",
    options: ["Similar cells working together", "Several unrelated organs", "A single cell organelle", "A whole population of species"],
    answer: 0,
    explanation: "A tissue is a group of similar cells working together to perform a function."
  },
  {
    subject: "Biology · Plant transport",
    question: "Which plant tissue carries water from the roots toward the leaves?",
    options: ["Phloem", "Xylem", "Epidermis", "Cambium"],
    answer: 1,
    explanation: "Xylem transports water and mineral ions from roots through the plant."
  },
  {
    subject: "Chemistry · Photosynthesis",
    question: "Which substances are the main raw materials for photosynthesis?",
    options: ["Oxygen and glucose", "Nitrogen and water", "Carbon dioxide and water", "Protein and oxygen"],
    answer: 2,
    explanation: "Plants use carbon dioxide and water, with light energy, to make glucose and release oxygen."
  },
  {
    subject: "Chemistry · Atomic structure",
    question: "What does the atomic number of an element tell you?",
    options: ["Its number of protons", "Its number of electron shells", "Its total number of neutrons", "Its mass in grams"],
    answer: 0,
    explanation: "The atomic number equals the number of protons in the nucleus."
  },
  {
    subject: "Physics · Forces",
    question: "What is the SI unit of force?",
    options: ["Joule", "Watt", "Newton", "Pascal"],
    answer: 2,
    explanation: "Force is measured in newtons (N)."
  },
  {
    subject: "Earth Science · Rocks",
    question: "Which process turns loose sediment into sedimentary rock?",
    options: ["Melting and cooling", "Compaction and cementation", "Evaporation and condensation", "Nuclear fusion"],
    answer: 1,
    explanation: "Burial compacts sediment, and minerals cement the grains together."
  },
  {
    subject: "Space Science · The Solar System",
    question: "What keeps planets in orbit around the Sun?",
    options: ["The Sun's gravitational attraction", "Wind from the Sun pushing backward", "The Moon's magnetic field", "Friction with space"],
    answer: 0,
    explanation: "Gravity continually changes a planet's direction, keeping it in orbit."
  },
  {
    subject: "Environmental Science · Ecosystems",
    question: "In a food chain, green plants are called producers because they…",
    options: ["Eat every other organism", "Make organic food using an energy source", "Recycle all minerals into sunlight", "Always live longer than consumers"],
    answer: 1,
    explanation: "Producers, such as plants, make organic molecules, usually using energy from sunlight."
  },
  {
    subject: "Computer Science · Data",
    question: "In a computer program, what is a variable commonly used for?",
    options: ["Storing a value that a program can use", "Cooling the processor", "Connecting to every website", "Proving an answer is correct"],
    answer: 0,
    explanation: "A variable is a named place to store a value that a program can use or update."
  },
  {
    subject: "Psychology · Research",
    question: "Which method is most suitable for testing whether one factor causes a change in another?",
    options: ["An experiment that controls other factors", "A single unverified opinion", "A list of unrelated observations", "A fictional case"],
    answer: 0,
    explanation: "A controlled experiment can test causal effects more directly than opinion or simple observation."
  },
  {
    subject: "Biology · Cell structure",
    question: "A student observes a cell with a nucleus and chloroplasts. Which conclusion is best supported?",
    options: ["It is a prokaryotic cell", "It is likely a photosynthetic eukaryotic cell", "It must be a red blood cell", "It has no cell membrane"],
    answer: 1,
    explanation: "A nucleus identifies a eukaryotic cell, and chloroplasts are found in many photosynthetic cells."
  },
  {
    subject: "Chemistry · Conservation of mass",
    question: "A reaction happens in a sealed flask. Why should the total mass remain constant?",
    options: ["Atoms are rearranged, not created or destroyed", "All products have zero mass", "The flask absorbs every atom", "Energy is converted into new atoms"],
    answer: 0,
    explanation: "In an ordinary chemical reaction, atoms are conserved and rearranged into new substances."
  },
  {
    subject: "Physics · Motion",
    question: "A 2 kg trolley accelerates at 3 m/s². What is the net force on it?",
    options: ["1.5 N", "5 N", "6 N", "9 N"],
    answer: 2,
    explanation: "Newton's second law gives F = ma = 2 kg × 3 m/s² = 6 N."
  },
  {
    subject: "Earth Science · The water cycle",
    question: "Water vapour cools and forms tiny liquid droplets in a cloud. Which process is this?",
    options: ["Condensation", "Infiltration", "Combustion", "Erosion"],
    answer: 0,
    explanation: "Condensation changes water vapour into liquid droplets as it cools."
  },
  {
    subject: "Space Science · Seasons",
    question: "Why does Earth have seasons?",
    options: ["Earth's axis is tilted as it orbits the Sun", "Earth is much closer to the Sun every summer", "The Sun changes its direction each month", "The Moon blocks sunlight for half the year"],
    answer: 0,
    explanation: "Earth's axial tilt changes day length and the angle of sunlight received during the year."
  },
  {
    subject: "Environmental Science · Climate",
    question: "Why can increasing atmospheric carbon dioxide warm Earth's climate?",
    options: ["It absorbs and re-emits some outgoing infrared radiation", "It blocks all incoming sunlight", "It stops Earth's rotation", "It removes water vapour from the atmosphere"],
    answer: 0,
    explanation: "Carbon dioxide is a greenhouse gas that absorbs and re-emits infrared radiation."
  },
  {
    subject: "Computer Science · Algorithms",
    question: "A loop repeats an instruction while a condition is true. What should a programmer check to avoid an infinite loop?",
    options: ["That the condition can eventually become false", "That the loop has a colourful name", "That the computer is connected to Wi-Fi", "That every variable is a whole number"],
    answer: 0,
    explanation: "A loop needs a stopping condition that can eventually be reached."
  },
  {
    subject: "Psychology · Evidence",
    question: "A survey finds that students who sleep longer often report better concentration. What can the survey alone establish?",
    options: ["The association proves longer sleep caused better concentration", "The two measures are associated, but causation is not established", "Concentration always causes sleep", "The survey proves sleep has no effect"],
    answer: 1,
    explanation: "Correlation shows an association; other variables or reverse causation may explain it."
  },
  {
    subject: "Biology · Inheritance",
    question: "Two heterozygous parents (Aa × Aa) have a child. If A is completely dominant, what is the probability the child has genotype aa?",
    options: ["0%", "25%", "50%", "75%"],
    answer: 1,
    explanation: "The possible genotypes are AA, Aa, Aa, and aa, so one out of four is aa."
  },
  {
    subject: "Chemistry · Acids and bases",
    question: "A solution changes from pH 3 to pH 5. How has its hydrogen-ion concentration changed?",
    options: ["It is 100 times lower", "It is 2 times lower", "It is 100 times higher", "It has not changed"],
    answer: 0,
    explanation: "Each pH unit represents a tenfold change, so two units higher means 100 times lower hydrogen-ion concentration."
  },
  {
    subject: "Physics · Circuits",
    question: "A 12 V supply is connected across a 4 Ω resistor. What current flows?",
    options: ["0.33 A", "3 A", "8 A", "48 A"],
    answer: 1,
    explanation: "Ohm's law gives I = V/R = 12 V / 4 Ω = 3 A."
  },
  {
    subject: "Earth Science · Plate tectonics",
    question: "At a constructive (divergent) plate boundary, what commonly happens?",
    options: ["Plates move apart and magma can form new crust", "One plate always disappears beneath another", "Two plates stop moving permanently", "Continental crust turns directly into clouds"],
    answer: 0,
    explanation: "At divergent boundaries, plates move apart and rising magma can cool to form new crust."
  },
  {
    subject: "Space Science · Light",
    question: "A star is 4 light-years away. What does that distance describe?",
    options: ["The time the star has existed", "The distance light travels in four years", "The star's temperature", "The time Earth takes to orbit the Sun four times"],
    answer: 1,
    explanation: "A light-year is a unit of distance: how far light travels in one year."
  },
  {
    subject: "Environmental Science · Population",
    question: "A population grows rapidly, then levels off near the resources its habitat can support. What best explains the plateau?",
    options: ["Limiting resources and other density-dependent factors", "The population has stopped reproducing forever", "The habitat has unlimited food", "Every individual has become genetically identical"],
    answer: 0,
    explanation: "Competition, food, space, disease, and other limits can slow growth near carrying capacity."
  },
  {
    subject: "Computer Science · Binary",
    question: "What is the decimal value of the binary number 10110₂?",
    options: ["18", "20", "22", "24"],
    answer: 2,
    explanation: "10110₂ = 1×16 + 0×8 + 1×4 + 1×2 + 0×1 = 22."
  },
  {
    subject: "Psychology · Experiments",
    question: "A study tests whether background music affects memory. Why randomly assign participants to music and quiet groups?",
    options: ["To help balance pre-existing differences between groups", "To guarantee every participant gets the same score", "To remove the need to measure memory", "To make the hypothesis correct"],
    answer: 0,
    explanation: "Random assignment helps reduce systematic group differences that could confound the comparison."
  },
  {
    subject: "Biology · Photosynthesis",
    question: "In a controlled plant experiment, light intensity rises but the photosynthesis rate stops increasing. What is the best explanation?",
    options: ["A different factor, such as carbon dioxide or temperature, may now be limiting", "The plant has stopped needing enzymes", "Light is no longer an energy source", "The plant has converted all oxygen into glucose"],
    answer: 0,
    explanation: "Once light is no longer limiting, another factor can restrict the photosynthesis rate."
  },
  {
    subject: "Chemistry · Equilibrium",
    question: "At dynamic equilibrium in a closed system, what is true?",
    options: ["Forward and reverse reactions continue at equal rates", "Both reactions have stopped", "Reactant and product concentrations must be equal", "Only products continue to form"],
    answer: 0,
    explanation: "The opposing reactions continue at equal rates, so concentrations stay constant, though they need not be equal."
  },
  {
    subject: "Physics · Energy",
    question: "A 2 kg object is lifted 5 m. Using g = 10 N/kg, how much gravitational potential energy does it gain?",
    options: ["10 J", "25 J", "100 J", "250 J"],
    answer: 2,
    explanation: "The gain is mgh = 2 × 10 × 5 = 100 J."
  },
  {
    subject: "Space Science · Gravity",
    question: "An astronaut is orbiting Earth and appears weightless. Why?",
    options: ["Earth's gravity is absent in orbit", "The astronaut and spacecraft are both in continuous free fall", "The astronaut has lost all mass", "The spacecraft is beyond Earth's atmosphere"],
    answer: 1,
    explanation: "Gravity still acts; astronaut and spacecraft fall together around Earth, creating apparent weightlessness."
  }
];
const difficultyForLevel = (level) => (
  level <= 10 ? "Foundation" : level <= 20 ? "Application" : "Challenge"
);

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

function loadChallengeProgress() {
  try {
    const saved = JSON.parse(localStorage.getItem(CHALLENGE_PROGRESS_KEY) || "null");
    if (
      saved &&
      Number.isInteger(saved.completed) &&
      saved.completed >= 0 &&
      saved.completed <= challengeQuestions.length
    ) {
      return { completed: saved.completed };
    }
  } catch (error) {
    console.error("Could not load science challenge progress.", error);
  }
  return { completed: 0 };
}

function saveChallengeProgress(completed) {
  try {
    localStorage.setItem(CHALLENGE_PROGRESS_KEY, JSON.stringify({ completed }));
    return true;
  } catch (error) {
    console.error("Could not save science challenge progress.", error);
    return false;
  }
}

function renderQuiz(selection) {
  const { branchName, lesson } = selection;
  let progress = loadChallengeProgress();
  quizCard.replaceChildren();
  addTextElement(quizCard, "p", "eyebrow", "30-LEVEL SCIENCE CHALLENGE");
  const meta = document.createElement("div");
  meta.className = "lesson-meta";
  addTextElement(meta, "span", "subject-tag", "ALL SCIENCE BRANCHES");
  addTextElement(meta, "span", "year-tag", `Starting from ${branchName}`);
  quizCard.append(meta);
  addTextElement(quizCard, "h1", "reader-title", "Level up your science");
  addTextElement(
    quizCard,
    "p",
    "reader-intro",
    `Answer correctly to advance. The questions get harder as you progress. Your challenge starts after: ${lesson.title}.`
  );

  const progressLabel = document.createElement("div");
  progressLabel.className = "challenge-progress-label";
  const levelText = addTextElement(progressLabel, "span", "", "");
  const tierText = addTextElement(progressLabel, "span", "challenge-tier", "");
  const progressTrack = document.createElement("div");
  progressTrack.className = "challenge-progress-track";
  progressTrack.setAttribute("role", "progressbar");
  progressTrack.setAttribute("aria-label", "Science challenge levels completed");
  progressTrack.setAttribute("aria-valuemin", "0");
  progressTrack.setAttribute("aria-valuemax", String(challengeQuestions.length));
  const progressFill = document.createElement("span");
  progressFill.className = "challenge-progress-fill";
  progressTrack.append(progressFill);
  quizCard.append(progressLabel, progressTrack);

  const questionArea = document.createElement("section");
  questionArea.className = "challenge-question";
  const options = document.createElement("div");
  options.className = "quiz-options";
  const feedback = document.createElement("p");
  feedback.className = "quiz-feedback";
  feedback.setAttribute("aria-live", "polite");
  const actions = document.createElement("div");
  actions.className = "challenge-actions";
  const advanceButton = document.createElement("button");
  advanceButton.type = "button";
  advanceButton.className = "read-lesson-button";
  advanceButton.hidden = true;
  const returnLink = document.createElement("a");
  returnLink.className = "reader-return";
  returnLink.href = "index.html";
  returnLink.textContent = "← Return to subjects and lessons";
  actions.append(advanceButton);
  quizCard.append(questionArea, options, feedback, actions, returnLink);

  function renderLevel() {
    options.replaceChildren();
    feedback.textContent = "";
    feedback.className = "quiz-feedback";
    advanceButton.hidden = true;

    const completed = progress.completed;
    progressTrack.setAttribute("aria-valuenow", String(completed));
    progressFill.style.width = `${(completed / challengeQuestions.length) * 100}%`;
    if (completed === challengeQuestions.length) {
      levelText.textContent = `Challenge complete · ${completed}/${challengeQuestions.length}`;
      tierText.textContent = "Mastered";
      questionArea.replaceChildren();
      addTextElement(questionArea, "h2", "quiz-page-question", "You completed all 30 levels!");
      feedback.textContent = "Excellent work. You made it through questions across all science branches, from core ideas to deeper reasoning.";
      feedback.className = "quiz-feedback success";
      try {
        markLessonComplete(lesson.id);
      } catch (error) {
        console.error("Could not save completed lesson progress.", error);
        feedback.textContent += " Your lesson completion could not be saved in this browser.";
      }
      advanceButton.textContent = "Restart the 30-level challenge";
      advanceButton.hidden = false;
      advanceButton.onclick = () => {
        progress = { completed: 0 };
        if (!saveChallengeProgress(0)) {
          feedback.textContent = "Progress could not be reset in this browser. Check browser storage settings and try again.";
          return;
        }
        renderLevel();
      };
      return;
    }

    const level = completed + 1;
    const question = challengeQuestions[completed];
    levelText.textContent = `Level ${level} of ${challengeQuestions.length}`;
    tierText.textContent = difficultyForLevel(level);
    questionArea.replaceChildren();
    addTextElement(questionArea, "p", "eyebrow", question.subject);
    addTextElement(questionArea, "h2", "quiz-page-question", question.question);

    question.options.forEach((option, index) => {
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
        if (index === question.answer) {
          button.classList.add("is-correct");
          for (const answerButton of options.querySelectorAll("button")) {
            answerButton.disabled = true;
          }
          progress = { completed: level };
          const saved = saveChallengeProgress(progress.completed);
          feedback.textContent = `Correct! ${question.explanation}${saved ? "" : " Progress could not be saved in this browser."}`;
          feedback.className = "quiz-feedback success";
          advanceButton.textContent = level === challengeQuestions.length
            ? "See challenge results"
            : `Continue to level ${level + 1} →`;
          advanceButton.hidden = false;
          advanceButton.onclick = renderLevel;
        } else {
          button.classList.add("is-incorrect");
          button.disabled = true;
          feedback.textContent = "Not quite. Review the question and try another answer.";
          feedback.className = "quiz-feedback try-again";
          if ([...options.querySelectorAll("button")].every((answerButton) => answerButton.disabled)) {
            advanceButton.textContent = "Try this level again";
            advanceButton.hidden = false;
            advanceButton.onclick = renderLevel;
          }
        }
      });
      options.append(button);
    });
  }

  renderLevel();
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
