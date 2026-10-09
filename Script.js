const display = document.getElementById("display");
const historyPreview = document.getElementById("historyPreview");

const calculatorPage = document.getElementById("calculatorPage");
const historyPage = document.getElementById("historyPage");

const historyList = document.getElementById("historyList");

let expression = "";
let justCalculated = false;

let calculations =
  JSON.parse(localStorage.getItem("calcProHistory")) || [];


function updateDisplay() {
  display.textContent = expression || "0";
}


function addValue(value) {

  if (justCalculated) {
    expression = "";
    justCalculated = false;
  }

  if ("+-*/".includes(value)) {

    if (expression === "" && value !== "-") return;

    const last = expression.slice(-1);

    if ("+-*/".includes(last)) {
      expression = expression.slice(0, -1);
    }
  }

  if (value === ".") {

    const parts = expression.split(/[\+\-\*\/]/);
    const currentNumber = parts[parts.length - 1];

    if (currentNumber.includes(".")) return;
  }

  expression += value;
  updateDisplay();
}


function clearCalculator() {
  expression = "";
  historyPreview.textContent = "";
  justCalculated = false;
  updateDisplay();
}


function deleteLast() {
  if (justCalculated) {
    clearCalculator();
    return;
  }

  expression = expression.slice(0, -1);
  updateDisplay();
}


function calculate() {

  if (!expression) return;

  try {

    const result = Function(
      '"use strict"; return (' + expression + ')'
    )();

    if (!Number.isFinite(result)) {
      showError();
      return;
    }

    const finalResult =
      Number.isInteger(result)
        ? result
        : Number(result.toFixed(10));

    addToHistory(expression, finalResult);

    historyPreview.textContent = expression + " =";

    expression = String(finalResult);

    justCalculated = true;

    updateDisplay();

  } catch {
    showError();
  }
}


function percentage() {

  if (!expression) return;

  try {

    const result = Function(
      '"use strict"; return (' + expression + ')'
    )();

    expression = String(result / 100);

    updateDisplay();

  } catch {
    showError();
  }
}


function showError() {

  display.textContent = "Error";

  setTimeout(() => {
    clearCalculator();
  }, 1000);
}


/* HISTORY */

function addToHistory(expression, result) {

  calculations.unshift({
    expression: expression,
    result: result
  });

  if (calculations.length > 50) {
    calculations.pop();
  }

  localStorage.setItem(
    "calcProHistory",
    JSON.stringify(calculations)
  );
}


function showHistory() {

  historyList.innerHTML = "";

  if (calculations.length === 0) {

    historyList.innerHTML =
      '<p style="color:#888;text-align:center;">No calculations yet.</p>';

  } else {

    calculations.forEach(item => {

      const row = document.createElement("div");

      row.className = "history-item";

      row.innerHTML =
        '<span class="history-expression">' +
        item.expression +
        '</span>' +
        '<span class="history-result">' +
        item.result +
        '</span>';

      historyList.appendChild(row);
    });
  }

  calculatorPage.classList.add("hidden");
  historyPage.classList.remove("hidden");
}


function hideHistory() {

  historyPage.classList.add("hidden");
  calculatorPage.classList.remove("hidden");
}


function clearHistory() {

  calculations = [];

  localStorage.removeItem("calcProHistory");

  showHistory();
}


/* BUTTONS */

document.querySelectorAll("[data-value]").forEach(button => {

  button.addEventListener("click", () => {
    addValue(button.dataset.value);
  });

});


document.querySelectorAll("[data-action]").forEach(button => {

  button.addEventListener("click", () => {

    const action = button.dataset.action;

    if (action === "clear") clearCalculator();

    if (action === "delete") deleteLast();

    if (action === "percent") percentage();

    if (action === "calculate") calculate();

  });

});


/* HISTORY BUTTON */

document.getElementById("historyBtn")
  .addEventListener("click", showHistory);


document.getElementById("backBtn")
  .addEventListener("click", hideHistory);


document.getElementById("clearHistoryBtn")
  .addEventListener("click", clearHistory);


/* DARK / LIGHT MODE */

document.getElementById("themeBtn")
  .addEventListener("click", () => {

    document.body.classList.toggle("light");

    const button = document.getElementById("themeBtn");

    button.textContent =
      document.body.classList.contains("light")
        ? "🌙"
        : "☀️";
  });


/* KEYBOARD */

document.addEventListener("keydown", event => {

  const key = event.key;

  if (
    (key >= "0" && key <= "9") ||
    key === "." ||
    key === "+" ||
    key === "-" ||
    key === "*" ||
    key === "/"
  ) {
    addValue(key);
  }

  if (key === "Enter" || key === "=") calculate();

  if (key === "Backspace") deleteLast();

  if (key === "Escape") clearCalculator();

  if (key === "%") percentage();

});
