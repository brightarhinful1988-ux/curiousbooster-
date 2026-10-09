(() => {
  const heading = document.querySelector("#payment-heading");
  const message = document.querySelector("#payment-message");
  const referenceParams = new URLSearchParams(window.location.search);
  const reference = referenceParams.get("reference") || referenceParams.get("trxref");
  const homeLink = document.querySelector(".payment-result-card .read-lesson-button");

  if (!reference || reference.length > 100) {
    heading.textContent = "Payment reference missing";
    message.textContent = "We could not find a transaction reference. Return to your account and contact support if you were charged.";
    return;
  }

  fetch("/api/payments/verify", {
    method: "POST",
    credentials: "same-origin",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ reference })
  })
    .then(async (response) => {
      let result;
      try {
        result = await response.json();
      } catch (error) {
        console.error("The payment verification response could not be read.", error);
        throw new Error("The payment result could not be read. Please check your account again.");
      }
      if (!response.ok) {
        throw new Error(result.error?.message || "The payment could not be confirmed.");
      }
      return result;
    })
    .then((result) => {
      heading.textContent = "Payment confirmed";
      message.textContent = `${result.credits} lesson credits are now available in your account.`;
      homeLink.href = "index.html?payment=success";
    })
    .catch((error) => {
      console.error("Payment confirmation failed.", error);
      heading.textContent = "Payment not confirmed yet";
      message.textContent = `${error.message} No credits were added. Your account balance will update only after Paystack confirms the payment.`;
    });
})();
