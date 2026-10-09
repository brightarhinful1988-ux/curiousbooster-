(() => {
  const isPublicDemo = document.documentElement.dataset.publicDemo === "true";
  const ACTIVE_SELECTION_KEY = "curious.active-selection";
  const READER_LESSON_KEY = "curious.reader-lesson";
  const COMPLETED_LESSONS_KEY = "curious.completed-lessons";
  const branchPicker = document.querySelector("#branch-picker");
  const learningLayout = document.querySelector(".learning-layout");
  const lessonList = document.querySelector("#lesson-list");
  const lessonContent = document.querySelector("#lesson-content");
  const lessonCount = document.querySelector("#lesson-count");
  const progressText = document.querySelector("#progress-text");
  const progressTrack = document.querySelector("#progress-track");
  const progressFill = document.querySelector("#progress-fill");
  const lessonError = document.querySelector("#account-status");
  let branches = [];
  let activeBranchId = null;
  let activeLessonId = null;
  let completedLessons = loadCompletedLessons();
  let lessonRenderVersion = 0;

  if (isPublicDemo) {
    document.querySelector("#account-panel").hidden = true;
    document.querySelector("#public-demo-notice").hidden = false;
    document.querySelector(".topbar-actions").hidden = true;
  }

  function loadCompletedLessons() {
    try {
      const saved = JSON.parse(localStorage.getItem(COMPLETED_LESSONS_KEY) || "[]");
      return new Set(Array.isArray(saved) ? saved.filter((id) => typeof id === "string") : []);
    } catch (error) {
      console.error("Could not load saved lesson progress.", error);
      return new Set();
    }
  }

  async function requestJson(url, options = {}) {
    const response = await fetch(url, {
      credentials: "same-origin",
      ...options,
      headers: {
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        ...options.headers
      }
    });
    let result;
    try {
      result = await response.json();
    } catch (error) {
      console.error("The learning server returned an unreadable response.", error);
      throw new Error("The learning server returned an unreadable response.");
    }
    if (!response.ok) {
      const requestError = new Error(result.error?.message || "The request could not be completed.");
      requestError.code = result.error?.code;
      throw requestError;
    }
    return result;
  }

  function reportError(message) {
    lessonError.textContent = message;
    lessonError.classList.add("is-error");
  }

  function clearError() {
    lessonError.textContent = "";
    lessonError.classList.remove("is-error");
  }

  function getActiveBranch() {
    return branches.find((branch) => branch.id === activeBranchId);
  }

  function getActiveLesson(branch = getActiveBranch()) {
    return branch?.lessons.find((lesson) => lesson.id === activeLessonId);
  }

  function saveSelection() {
    try {
      sessionStorage.setItem(
        ACTIVE_SELECTION_KEY,
        JSON.stringify({ branchId: activeBranchId, lessonId: activeLessonId })
      );
      return true;
    } catch (error) {
      console.error("Could not save the selected lesson.", error);
      reportError("Your browser could not save the lesson selection. Check its storage settings and try again.");
      return false;
    }
  }

  function renderBranches() {
    branchPicker.replaceChildren();
    for (const branch of branches) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "branch-card";
      button.setAttribute("aria-pressed", String(branch.id === activeBranchId));
      const icon = document.createElement("span");
      icon.className = "branch-icon";
      icon.setAttribute("aria-hidden", "true");
      icon.textContent = branch.icon;
      const text = document.createElement("span");
      const name = document.createElement("span");
      name.className = "branch-name";
      name.textContent = branch.name;
      const description = document.createElement("span");
      description.className = "branch-description";
      description.textContent = branch.summary;
      text.append(name, description);
      button.append(icon, text);
      button.addEventListener("click", () => {
        activeBranchId = branch.id;
        activeLessonId = branch.lessons[0]?.id || null;
        clearError();
        saveSelection();
        render();
      });
      branchPicker.append(button);
    }
  }

  function renderLessonList(branch) {
    const creditState = window.CuriousBoosterCredits?.state;
    const unlockedLessonIds = creditState?.unlockedLessonIds || new Set();
    const lessons = [...branch.lessons].sort((first, second) => {
      if (!first.year || !second.year) {
        return 0;
      }
      return Number(first.year.replace("Year ", "")) - Number(second.year.replace("Year ", ""));
    });
    const years = new Set(lessons.map((lesson) => lesson.year).filter(Boolean));
    lessonCount.textContent = years.size
      ? `${lessons.length} lessons · ${years.size} years`
      : `${lessons.length} ${lessons.length === 1 ? "lesson" : "lessons"}`;
    lessonList.replaceChildren();

    let lastYear = null;
    let sequenceInYear = 0;
    lessons.forEach((lesson, index) => {
      if (lesson.year && lesson.year !== lastYear) {
        const heading = document.createElement("h3");
        heading.className = "year-heading";
        heading.textContent = lesson.year;
        lessonList.append(heading);
        lastYear = lesson.year;
        sequenceInYear = 0;
      }
      sequenceInYear += 1;
      const unlocked = isPublicDemo || unlockedLessonIds.has(lesson.id);
      const button = document.createElement("button");
      button.type = "button";
      button.className = `lesson-link${unlocked ? "" : " is-locked"}`;
      button.setAttribute("aria-current", String(lesson.id === activeLessonId));
      const complete = completedLessons.has(lesson.id);
      const number = document.createElement("span");
      number.className = "lesson-number";
      number.setAttribute("aria-label", complete ? "Completed" : `Lesson ${lesson.year ? sequenceInYear : index + 1}`);
      number.textContent = complete ? "✓" : String(lesson.year ? sequenceInYear : index + 1).padStart(2, "0");
      const label = document.createElement("span");
      const title = document.createElement("span");
      title.className = "lesson-link-title";
      title.textContent = lesson.title;
      const meta = document.createElement("span");
      meta.className = "lesson-link-meta";
      meta.textContent = `${lesson.hasCode ? "CODING EXTRA · " : ""}${lesson.duration}${lesson.year ? ` · ${lesson.year}` : ""}`;
      label.append(title, meta);
      const lock = document.createElement("span");
      lock.className = "lesson-lock-indicator";
      lock.setAttribute("aria-label", isPublicDemo ? "Available in public demo" : unlocked ? "Unlocked" : "Costs 1 credit");
      lock.textContent = isPublicDemo ? "Read" : unlocked ? "✓" : "1 cr";
      button.append(number, label, lock);
      button.addEventListener("click", () => {
        activeLessonId = lesson.id;
        clearError();
        saveSelection();
        render();
      });
      lessonList.append(button);
    });

    const completedCount = lessons.filter((lesson) => completedLessons.has(lesson.id)).length;
    progressText.textContent = `${completedCount} of ${lessons.length} done`;
    progressTrack.setAttribute("aria-valuemax", String(lessons.length));
    progressTrack.setAttribute("aria-valuenow", String(completedCount));
    progressFill.style.width = `${lessons.length ? (completedCount / lessons.length) * 100 : 0}%`;
  }

  function renderLesson(branch, lesson) {
    const renderVersion = ++lessonRenderVersion;
    const creditState = window.CuriousBoosterCredits?.state;
    const unlocked = isPublicDemo || creditState?.unlockedLessonIds.has(lesson.id) || false;
    const subject = document.createElement("div");
    subject.className = "lesson-meta";
    const subjectTag = document.createElement("span");
    subjectTag.className = "subject-tag";
    subjectTag.textContent = branch.name.toUpperCase();
    subject.append(subjectTag);
    if (lesson.year) {
      const yearTag = document.createElement("span");
      yearTag.className = "year-tag";
      yearTag.textContent = lesson.year;
      subject.append(yearTag);
    }
    const duration = document.createElement("span");
    duration.className = "time-tag";
    duration.textContent = `◷ ${lesson.duration} read`;
    subject.append(duration);

    lessonContent.replaceChildren(subject);
    const title = document.createElement("h2");
    title.textContent = lesson.title;
    lessonContent.append(title);

    const intro = document.createElement("p");
    intro.className = "lesson-intro";
    intro.textContent = isPublicDemo
      ? lesson.intro
      : unlocked
      ? "Loading your lesson preview…"
      : "This lesson is locked. Use 1 credit to unlock the complete reading and its quiz.";
    lessonContent.append(intro);

    const button = document.createElement("a");
    button.className = "read-lesson-button";
    button.href = "lesson.html";
    button.textContent = isPublicDemo
      ? "Read this lesson →"
      : unlocked
      ? "Read full lesson →"
      : creditState?.user
        ? creditState.credits > 0 ? "Unlock with 1 credit and read →" : "Buy credits to unlock →"
        : "Sign in to unlock this lesson →";
    button.addEventListener("click", async (event) => {
      event.preventDefault();
      if (isPublicDemo) {
        sessionStorage.setItem(READER_LESSON_KEY, JSON.stringify({ lessonId: lesson.id }));
        window.location.assign("lesson.html");
        return;
      }
      button.setAttribute("aria-disabled", "true");
      button.classList.add("is-loading");
      clearError();
      try {
        await window.CuriousBoosterCredits.unlock(lesson.id);
        sessionStorage.setItem(READER_LESSON_KEY, JSON.stringify({ lessonId: lesson.id }));
        if (!saveSelection()) {
          throw new Error("Could not save the lesson selection. Please check browser storage settings.");
        }
        window.location.assign("lesson.html");
      } catch (error) {
        console.error("Could not unlock or open the lesson.", error);
        reportError(error.message || "The lesson could not be unlocked. Please try again.");
        button.removeAttribute("aria-disabled");
        button.classList.remove("is-loading");
        if (error.code === "INSUFFICIENT_CREDITS") {
          document.querySelector("#account-panel").scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }
    });
    lessonContent.append(button);

    if (!unlocked || isPublicDemo) {
      return;
    }
    requestJson(`/api/lessons/${encodeURIComponent(lesson.id)}/content`)
      .then((data) => {
        if (renderVersion === lessonRenderVersion) {
          intro.textContent = data.lesson.intro;
        }
      })
      .catch((error) => {
        if (renderVersion === lessonRenderVersion) {
          console.error("Could not load unlocked lesson preview.", error);
          intro.textContent = error.message;
        }
      });
  }

  function render() {
    const branch = getActiveBranch();
    renderBranches();
    learningLayout.hidden = !branch;
    if (!branch) {
      return;
    }
    const lesson = getActiveLesson(branch);
    if (!lesson) {
      learningLayout.hidden = true;
      return;
    }
    renderLessonList(branch);
    renderLesson(branch, lesson);
  }

  function restoreSelection() {
    try {
      const saved = JSON.parse(sessionStorage.getItem(ACTIVE_SELECTION_KEY) || "null");
      const branch = branches.find((item) => item.id === saved?.branchId);
      const lesson = branch?.lessons.find((item) => item.id === saved?.lessonId);
      if (branch && lesson) {
        activeBranchId = branch.id;
        activeLessonId = lesson.id;
      }
    } catch (error) {
      console.error("Could not restore the selected lesson.", error);
    }
  }

  window.addEventListener("curiousbooster:creditschange", () => render());
  const catalogueRequest = isPublicDemo
    ? fetch("curriculum.json").then((response) => {
      if (!response.ok) {
        throw new Error("The public lesson catalogue could not be loaded.");
      }
      return response.json();
    })
    : requestJson("/api/catalog");
  catalogueRequest
    .then((result) => {
      branches = result.branches;
      if (isPublicDemo) {
        window.CuriousBoosterPublicLessons = branches.flatMap((branch) => branch.lessons);
      }
      restoreSelection();
      render();
      clearError();
    })
    .catch((error) => {
      console.error("Could not load the science lesson catalogue.", error);
      reportError(`${error.message} Run CURIOUSBOOSTER with npm start and open http://localhost:3000.`);
    });
})();
