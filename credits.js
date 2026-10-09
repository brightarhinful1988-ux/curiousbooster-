(() => {
  const authView = document.querySelector("#auth-view");
  const signedInView = document.querySelector("#signed-in-view");
  const authForm = document.querySelector("#auth-form");
  const accountStatus = document.querySelector("#account-status");
  const packageList = document.querySelector("#package-list");
  const state = {
    user: null,
    credits: 0,
    unlockedLessonIds: new Set()
  };

  function setStatus(message, isError = false) {
    accountStatus.textContent = message;
    accountStatus.classList.toggle("is-error", isError);
  }

  async function requestJson(url, options = {}) {
    let response;
    try {
      response = await fetch(url, {
        credentials: "same-origin",
        ...options,
        headers: {
          ...(options.body ? { "Content-Type": "application/json" } : {}),
          ...options.headers
        }
      });
    } catch (error) {
      console.error("Could not reach the CURIOUSBOOSTER server.", error);
      throw new Error("The learning server could not be reached. Start CURIOUSBOOSTER with npm start and open http://localhost:3000.");
    }

    let result = {};
    if (response.status !== 204) {
      try {
        result = await response.json();
      } catch (error) {
        console.error("The server returned an unreadable response.", error);
        throw new Error("The server returned an unreadable response. Please try again.");
      }
    }
    if (!response.ok) {
      const requestError = new Error(result.error?.message || "The request could not be completed.");
      requestError.code = result.error?.code;
      throw requestError;
    }
    return result;
  }

  function render() {
    authView.hidden = Boolean(state.user);
    signedInView.hidden = !state.user;
    document.querySelector("#topbar-credit-balance-label").textContent = state.user
      ? `Credits: ${state.credits}`
      : "Credits: sign in";
    const balance = document.querySelector("#account-credit-balance");
    balance.textContent = state.user
      ? `${state.credits} ${state.credits === 1 ? "lesson credit" : "lesson credits"} available`
      : "Sign in to view credits";
    document.querySelector("#account-email-label").textContent = state.user?.email || "";
    window.dispatchEvent(new CustomEvent("curiousbooster:creditschange", {
      detail: {
        user: state.user,
        credits: state.credits,
        unlockedLessonIds: new Set(state.unlockedLessonIds)
      }
    }));
  }

  async function refresh() {
    try {
      const result = await requestJson("/api/me");
      state.user = result.user;
      state.credits = result.credits;
      state.unlockedLessonIds = new Set(result.unlockedLessonIds);
      render();
      setStatus("");
      return true;
    } catch (error) {
      if (error.code === "AUTH_REQUIRED") {
        state.user = null;
        state.credits = 0;
        state.unlockedLessonIds.clear();
        render();
        return false;
      }
      setStatus(error.message, true);
      return false;
    }
  }

  async function loadPackages() {
    try {
      const result = await requestJson("/api/packages");
      packageList.replaceChildren();
      for (const item of result.packages) {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "package-card";
        const name = document.createElement("strong");
        name.textContent = item.label;
        const quantity = document.createElement("span");
        quantity.textContent = `${item.credits} lesson credits`;
        const price = document.createElement("span");
        price.className = "package-price";
        price.textContent = `GH₵${item.priceGhs} · demo price`;
        button.append(name, quantity, price);
        button.addEventListener("click", async () => {
          button.disabled = true;
          setStatus("Connecting to Paystack test checkout…");
          try {
            const checkout = await requestJson("/api/payments/checkout", {
              method: "POST",
              body: JSON.stringify({ packageId: item.id })
            });
            const checkoutUrl = new URL(checkout.authorizationUrl);
            if (
              checkoutUrl.protocol !== "https:" ||
              checkoutUrl.hostname !== "checkout.paystack.com"
            ) {
              throw new Error("Paystack returned an unexpected checkout address.");
            }
            window.location.assign(checkoutUrl.toString());
          } catch (error) {
            setStatus(error.message, true);
            button.disabled = false;
          }
        });
        packageList.append(button);
      }
    } catch (error) {
      setStatus(error.message, true);
    }
  }

  authForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const action = event.submitter?.value === "register" ? "register" : "login";
    const email = document.querySelector("#account-email").value;
    const password = document.querySelector("#account-password").value;
    const submitButtons = [...authForm.querySelectorAll("button")];
    submitButtons.forEach((button) => { button.disabled = true; });
    setStatus(action === "register" ? "Creating your account…" : "Signing in…");
    try {
      const result = await requestJson(`/api/auth/${action}`, {
        method: "POST",
        body: JSON.stringify({ email, password })
      });
      state.user = result.user;
      state.credits = result.credits;
      state.unlockedLessonIds = new Set(result.unlockedLessonIds);
      document.querySelector("#account-password").value = "";
      render();
      setStatus(action === "register" ? "Account created. Choose a credit package to get started." : "You are signed in.");
    } catch (error) {
      setStatus(error.message, true);
    } finally {
      submitButtons.forEach((button) => { button.disabled = false; });
    }
  });

  document.querySelector("#sign-out-button").addEventListener("click", async () => {
    try {
      await requestJson("/api/auth/logout", { method: "POST" });
      state.user = null;
      state.credits = 0;
      state.unlockedLessonIds.clear();
      render();
      setStatus("You have signed out.");
    } catch (error) {
      setStatus(error.message, true);
    }
  });

  window.CuriousBoosterCredits = {
    state,
    async refresh() {
      return refresh();
    },
    async unlock(lessonId) {
      const result = await requestJson(`/api/lessons/${encodeURIComponent(lessonId)}/unlock`, {
        method: "POST",
        body: "{}"
      });
      state.credits = result.credits;
      state.unlockedLessonIds.add(lessonId);
      render();
      setStatus(result.alreadyUnlocked ? "This lesson is already unlocked." : "Lesson unlocked.");
      return result;
    }
  };

  const paymentResult = new URLSearchParams(window.location.search).get("payment");
  if (paymentResult === "success") {
    setStatus("Payment confirmed. Your lesson credits are ready to use.");
  }
  loadPackages();
  refresh();
})();
