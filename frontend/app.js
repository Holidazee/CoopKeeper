const STORAGE_KEYS = {
  token: "coookeeper.authToken",
  username: "coookeeper.username",
};

const API_BASE_URL = String(window.CoopKeeperConfig?.apiBaseUrl || "").replace(/\/$/, "");

const api = {
  signup: (payload) =>
    requestJson("/auth/signup", {
      method: "POST",
      body: JSON.stringify(payload),
      skipAuthHandling: true,
    }),
  login: (payload) =>
    requestJson("/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
      skipAuthHandling: true,
    }),
  getDashboard: () => requestJson("/dashboard"),
  getChickens: () => requestJson("/chickens?skip=0&limit=100"),
  createChicken: (payload) =>
    requestJson("/chickens", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  updateChicken: (chickenId, payload) =>
    requestJson(`/chickens/${chickenId}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),
  getEggs: () => requestJson("/eggs?skip=0&limit=100"),
  createEgg: (payload) =>
    requestJson("/eggs", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  updateEgg: (eggId, payload) =>
    requestJson(`/eggs/${eggId}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),
  getFeedRecords: () => requestJson("/feed?skip=0&limit=100"),
  createFeedRecord: (payload) =>
    requestJson("/feed", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  updateFeedRecord: (feedId, payload) =>
    requestJson(`/feed/${feedId}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),
  getExpenses: () => requestJson("/expenses?skip=0&limit=100"),
  createExpense: (payload) =>
    requestJson("/expenses", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  updateExpense: (expenseId, payload) =>
    requestJson(`/expenses/${expenseId}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),
};

const state = {
  token: loadStoredValue(STORAGE_KEYS.token),
  username: loadStoredValue(STORAGE_KEYS.username),
  dashboard: null,
  chickens: [],
  eggs: [],
  feedRecords: [],
  expenses: [],
  editing: {
    chickenId: null,
    eggId: null,
    feedId: null,
    expenseId: null,
  },
};

const elements = {
  authPanel: document.querySelector("#auth-panel"),
  authBadge: document.querySelector("#auth-badge"),
  authNotice: document.querySelector("#auth-notice"),
  appShell: document.querySelector("#app-shell"),
  logoutButton: document.querySelector("#logout-button"),
  loginForm: document.querySelector("#login-form"),
  loginFormMessage: document.querySelector("#login-form-message"),
  signupForm: document.querySelector("#signup-form"),
  signupFormMessage: document.querySelector("#signup-form-message"),
  dashboardStatus: document.querySelector("#dashboard-status"),
  dashboardError: document.querySelector("#dashboard-error"),
  dashboardTotalChickens: document.querySelector("#dashboard-total-chickens"),
  dashboardTotalEggs: document.querySelector("#dashboard-total-eggs"),
  dashboardAverageEggs: document.querySelector("#dashboard-average-eggs"),
  dashboardLatestEgg: document.querySelector("#dashboard-latest-egg"),
  eggChartSummary: document.querySelector("#egg-chart-summary"),
  eggChartMessage: document.querySelector("#egg-chart-message"),
  eggChart: document.querySelector("#egg-chart"),
  expenseChartSummary: document.querySelector("#expense-chart-summary"),
  expenseChartMessage: document.querySelector("#expense-chart-message"),
  expenseChart: document.querySelector("#expense-chart"),
  chickensStatus: document.querySelector("#chickens-status"),
  chickensError: document.querySelector("#chickens-error"),
  chickensEmpty: document.querySelector("#chickens-empty"),
  chickensList: document.querySelector("#chickens-list"),
  chickenForm: document.querySelector("#chicken-form"),
  chickenFormTitle: document.querySelector("#chicken-form-title"),
  chickenSubmitButton: document.querySelector("#chicken-submit-button"),
  chickenCancelButton: document.querySelector("#chicken-cancel-button"),
  chickenFormMessage: document.querySelector("#chicken-form-message"),
  eggsStatus: document.querySelector("#eggs-status"),
  eggsError: document.querySelector("#eggs-error"),
  eggsEmpty: document.querySelector("#eggs-empty"),
  eggsList: document.querySelector("#eggs-list"),
  eggForm: document.querySelector("#egg-form"),
  eggFormTitle: document.querySelector("#egg-form-title"),
  eggSubmitButton: document.querySelector("#egg-submit-button"),
  eggCancelButton: document.querySelector("#egg-cancel-button"),
  eggChickenSelect: document.querySelector("#egg-chicken-select"),
  eggFormMessage: document.querySelector("#egg-form-message"),
  feedStatus: document.querySelector("#feed-status"),
  feedError: document.querySelector("#feed-error"),
  feedEmpty: document.querySelector("#feed-empty"),
  feedList: document.querySelector("#feed-list"),
  feedForm: document.querySelector("#feed-form"),
  feedFormTitle: document.querySelector("#feed-form-title"),
  feedSubmitButton: document.querySelector("#feed-submit-button"),
  feedCancelButton: document.querySelector("#feed-cancel-button"),
  feedChickenSelect: document.querySelector("#feed-chicken-select"),
  feedFormMessage: document.querySelector("#feed-form-message"),
  expensesStatus: document.querySelector("#expenses-status"),
  expensesError: document.querySelector("#expenses-error"),
  expensesEmpty: document.querySelector("#expenses-empty"),
  expensesList: document.querySelector("#expenses-list"),
  expenseForm: document.querySelector("#expense-form"),
  expenseFormTitle: document.querySelector("#expense-form-title"),
  expenseSubmitButton: document.querySelector("#expense-submit-button"),
  expenseCancelButton: document.querySelector("#expense-cancel-button"),
  expenseFormMessage: document.querySelector("#expense-form-message"),
};

document.addEventListener("DOMContentLoaded", () => {
  setDefaultDates();
  bindEvents();
  renderAuthState();
  resetProtectedData();

  if (state.token) {
    loadApp();
  }
});

function bindEvents() {
  elements.loginForm.addEventListener("submit", handleLoginSubmit);
  elements.signupForm.addEventListener("submit", handleSignupSubmit);
  elements.logoutButton.addEventListener("click", handleLogout);
  elements.chickenForm.addEventListener("submit", handleChickenSubmit);
  elements.eggForm.addEventListener("submit", handleEggSubmit);
  elements.feedForm.addEventListener("submit", handleFeedSubmit);
  elements.expenseForm.addEventListener("submit", handleExpenseSubmit);
  elements.chickenCancelButton.addEventListener("click", resetChickenForm);
  elements.eggCancelButton.addEventListener("click", resetEggForm);
  elements.feedCancelButton.addEventListener("click", resetFeedForm);
  elements.expenseCancelButton.addEventListener("click", resetExpenseForm);
}

async function loadApp() {
  if (!state.token) {
    return;
  }

  await Promise.allSettled([
    loadChickens(),
    loadEggs(),
    loadFeedRecords(),
    loadExpenses(),
    loadDashboard(),
  ]);
}

async function requestJson(path, options = {}) {
  const { headers = {}, skipAuthHandling = false, ...fetchOptions } = options;

  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      Accept: "application/json",
      ...(state.token ? { Authorization: `Bearer ${state.token}` } : {}),
      ...(fetchOptions.body ? { "Content-Type": "application/json" } : {}),
      ...headers,
    },
    ...fetchOptions,
  });

  if (!response.ok) {
    let message = `Request failed (${response.status})`;
    try {
      const data = await response.json();
      if (data?.detail) {
        message = data.detail;
      }
    } catch (error) {
      // Ignore parsing errors and keep fallback message.
    }

    if (response.status === 401 && state.token && !skipAuthHandling) {
      clearSession();
      renderAuthState("Your session is no longer valid. Please log in again.");
      resetProtectedData();
    }

    throw new Error(message);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

function loadStoredValue(key) {
  return window.localStorage.getItem(key) || "";
}

function persistSession(authResult) {
  state.token = authResult.access_token;
  state.username = authResult.user.username;
  window.localStorage.setItem(STORAGE_KEYS.token, state.token);
  window.localStorage.setItem(STORAGE_KEYS.username, state.username);
}

function clearSession() {
  state.token = "";
  state.username = "";
  window.localStorage.removeItem(STORAGE_KEYS.token);
  window.localStorage.removeItem(STORAGE_KEYS.username);
}

function renderAuthState(noticeText = "") {
  const isAuthenticated = Boolean(state.token);

  elements.authPanel.classList.toggle("hidden", isAuthenticated);
  elements.appShell.classList.toggle("hidden", !isAuthenticated);
  elements.logoutButton.classList.toggle("hidden", !isAuthenticated);
  elements.authBadge.textContent = isAuthenticated
    ? `Signed in as ${state.username || "User"}`
    : "Not signed in";

  if (noticeText) {
    showMessage(elements.authNotice, noticeText, "neutral");
  } else if (!isAuthenticated) {
    showMessage(
      elements.authNotice,
      "Create an account or log in to access your coop data.",
      "neutral",
    );
  } else {
    hideMessage(elements.authNotice);
  }
}

function resetProtectedData() {
  state.dashboard = null;
  state.chickens = [];
  state.eggs = [];
  state.feedRecords = [];
  state.expenses = [];
  state.editing.chickenId = null;
  state.editing.eggId = null;
  state.editing.feedId = null;
  state.editing.expenseId = null;

  resetChickenForm();
  resetEggForm();
  resetFeedForm();
  resetExpenseForm();
  renderDashboard(null);
  renderEggProductionChart();
  renderExpenseChart();
  renderChickens();
  renderEggs();
  renderFeedRecords();
  renderExpenses();
  renderChickenOptions();

  hideMessage(elements.dashboardError);
  hideMessage(elements.chickensError);
  hideMessage(elements.eggsError);
  hideMessage(elements.feedError);
  hideMessage(elements.expensesError);
  setStatus(elements.dashboardStatus, state.token ? "Loading..." : "Sign in required");
  setStatus(elements.chickensStatus, state.token ? "Loading..." : "Sign in required");
  setStatus(elements.eggsStatus, state.token ? "Loading..." : "Sign in required");
  setStatus(elements.feedStatus, state.token ? "Loading..." : "Sign in required");
  setStatus(elements.expensesStatus, state.token ? "Loading..." : "Sign in required");
}

function setDefaultDates() {
  const today = new Date().toISOString().slice(0, 10);
  elements.eggForm.elements.date.value = today;
  elements.feedForm.elements.date.value = today;
  elements.expenseForm.elements.date.value = today;
}

function setStatus(element, text) {
  element.textContent = text;
}

function showMessage(element, text, tone = "neutral") {
  element.textContent = text;
  element.className = `message message-${tone}`;
}

function hideMessage(element) {
  element.textContent = "";
  element.className = "message hidden";
}

function formatAverage(value) {
  return Number(value).toFixed(2);
}

function describeLatestEgg(record) {
  if (!record) {
    return state.token ? "No egg records yet." : "Sign in to load data.";
  }

  const chickenLabel = getChickenLabel(record.chicken_id);
  return `${record.date} | ${record.count} eggs | ${chickenLabel}`;
}

function getChickenLabel(chickenId) {
  const chicken = state.chickens.find((item) => item.id === chickenId);
  return chicken ? `${chicken.name} (#${chicken.id})` : `Chicken #${chickenId}`;
}

function renderDashboard(data) {
  if (!data) {
    elements.dashboardTotalChickens.textContent = "-";
    elements.dashboardTotalEggs.textContent = "-";
    elements.dashboardAverageEggs.textContent = "-";
    elements.dashboardLatestEgg.textContent = state.token ? "No data loaded yet." : "Sign in to load data.";
    return;
  }

  elements.dashboardTotalChickens.textContent = String(data.total_chickens);
  elements.dashboardTotalEggs.textContent = String(data.total_eggs);
  elements.dashboardAverageEggs.textContent = formatAverage(data.average_eggs_per_chicken);
  elements.dashboardLatestEgg.textContent = describeLatestEgg(data.latest_egg_record);
}

function renderEggProductionChart(message = "") {
  renderMiniBarChart({
    container: elements.eggChart,
    messageElement: elements.eggChartMessage,
    summaryElement: elements.eggChartSummary,
    items: aggregateByDate(state.eggs, "count"),
    emptyMessage: state.token ? "No egg records yet." : "Sign in to load egg production.",
    summaryFormatter: (items) => {
      const totalEggs = items.reduce((sum, item) => sum + item.value, 0);
      return `${totalEggs} eggs tracked`;
    },
    labelFormatter: (value) => `${value} eggs`,
    message,
  });
}

function renderExpenseChart(message = "") {
  renderMiniBarChart({
    container: elements.expenseChart,
    messageElement: elements.expenseChartMessage,
    summaryElement: elements.expenseChartSummary,
    items: aggregateByDate(state.expenses, "amount"),
    emptyMessage: state.token ? "No expenses yet." : "Sign in to load expenses.",
    summaryFormatter: (items) => {
      const totalAmount = items.reduce((sum, item) => sum + item.value, 0);
      return formatCurrency(totalAmount);
    },
    labelFormatter: (value) => formatCurrency(value),
    valueFormatter: (value) => formatCurrency(value),
    message,
  });
}

function renderChickens() {
  elements.chickensList.innerHTML = "";

  if (state.chickens.length === 0) {
    elements.chickensEmpty.classList.remove("hidden");
    elements.chickensEmpty.textContent = state.token ? "No chickens yet." : "Sign in to load chickens.";
    return;
  }

  elements.chickensEmpty.classList.add("hidden");

  for (const chicken of state.chickens) {
    const item = document.createElement("li");
    item.className = "item-card";
    item.innerHTML = `
      <div class="item-card-main">
        <strong>${escapeHtml(chicken.name)}</strong>
        <span class="item-meta">Breed: ${escapeHtml(chicken.breed || "Unknown")}</span>
        <span class="item-meta">ID: ${chicken.id}</span>
      </div>
      <div class="item-actions">
        <button type="button" class="button button-secondary button-small">Edit</button>
      </div>
    `;
    item.querySelector("button").addEventListener("click", () => startChickenEdit(chicken.id));
    elements.chickensList.appendChild(item);
  }
}

function renderEggs() {
  elements.eggsList.innerHTML = "";

  if (state.eggs.length === 0) {
    elements.eggsEmpty.classList.remove("hidden");
    elements.eggsEmpty.textContent = state.token ? "No egg records yet." : "Sign in to load egg records.";
    return;
  }

  elements.eggsEmpty.classList.add("hidden");

  for (const egg of state.eggs) {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${egg.id}</td>
      <td>${escapeHtml(egg.date)}</td>
      <td>${egg.count}</td>
      <td>${escapeHtml(getChickenLabel(egg.chicken_id))}</td>
      <td></td>
    `;

    const actionsCell = row.lastElementChild;
    const button = document.createElement("button");
    button.type = "button";
    button.className = "button button-secondary button-small";
    button.textContent = "Edit";
    button.addEventListener("click", () => startEggEdit(egg.id));
    actionsCell.appendChild(button);

    elements.eggsList.appendChild(row);
  }
}

function renderFeedRecords() {
  elements.feedList.innerHTML = "";

  if (state.feedRecords.length === 0) {
    elements.feedEmpty.classList.remove("hidden");
    elements.feedEmpty.textContent = state.token ? "No feed records yet." : "Sign in to load feed records.";
    return;
  }

  elements.feedEmpty.classList.add("hidden");

  for (const feedRecord of state.feedRecords) {
    const chickenLabel = feedRecord.chicken_id ? getChickenLabel(feedRecord.chicken_id) : "General coop";
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${feedRecord.id}</td>
      <td>${escapeHtml(feedRecord.date)}</td>
      <td>${escapeHtml(feedRecord.feed_type)}</td>
      <td>${escapeHtml(formatNumber(feedRecord.amount))}</td>
      <td>${feedRecord.cost == null ? "-" : escapeHtml(formatCurrency(feedRecord.cost))}</td>
      <td>${escapeHtml(chickenLabel)}</td>
      <td></td>
    `;

    const actionsCell = row.lastElementChild;
    const button = document.createElement("button");
    button.type = "button";
    button.className = "button button-secondary button-small";
    button.textContent = "Edit";
    button.addEventListener("click", () => startFeedEdit(feedRecord.id));
    actionsCell.appendChild(button);

    elements.feedList.appendChild(row);
  }
}

function renderExpenses() {
  elements.expensesList.innerHTML = "";

  if (state.expenses.length === 0) {
    elements.expensesEmpty.classList.remove("hidden");
    elements.expensesEmpty.textContent = state.token ? "No expenses yet." : "Sign in to load expenses.";
    return;
  }

  elements.expensesEmpty.classList.add("hidden");

  for (const expense of state.expenses) {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${expense.id}</td>
      <td>${escapeHtml(expense.date)}</td>
      <td>${escapeHtml(expense.category)}</td>
      <td>${escapeHtml(expense.description || "-")}</td>
      <td>${escapeHtml(formatCurrency(expense.amount))}</td>
      <td></td>
    `;

    const actionsCell = row.lastElementChild;
    const button = document.createElement("button");
    button.type = "button";
    button.className = "button button-secondary button-small";
    button.textContent = "Edit";
    button.addEventListener("click", () => startExpenseEdit(expense.id));
    actionsCell.appendChild(button);

    elements.expensesList.appendChild(row);
  }
}

function aggregateByDate(records, valueKey) {
  const totals = new Map();

  for (const record of records) {
    const dateKey = String(record.date);
    const currentValue = totals.get(dateKey) || 0;
    totals.set(dateKey, currentValue + Number(record[valueKey] || 0));
  }

  return Array.from(totals.entries())
    .map(([date, value]) => ({ date, value }))
    .sort((left, right) => left.date.localeCompare(right.date))
    .slice(-7);
}

function renderMiniBarChart({
  container,
  messageElement,
  summaryElement,
  items,
  emptyMessage,
  summaryFormatter,
  labelFormatter,
  valueFormatter = (value) => String(value),
  message = "",
}) {
  container.innerHTML = "";

  if (message) {
    showMessage(messageElement, message, "error");
    summaryElement.textContent = "-";
    return;
  }

  hideMessage(messageElement);

  if (items.length === 0) {
    summaryElement.textContent = "-";
    showMessage(messageElement, emptyMessage, "neutral");
    return;
  }

  summaryElement.textContent = summaryFormatter(items);

  const maxValue = Math.max(...items.map((item) => item.value), 1);

  for (const item of items) {
    const bar = document.createElement("div");
    bar.className = "mini-chart-bar";
    bar.style.setProperty("--bar-height", `${(item.value / maxValue) * 100}%`);
    bar.innerHTML = `
      <span class="mini-chart-value">${escapeHtml(valueFormatter(item.value))}</span>
      <div class="mini-chart-column" title="${escapeHtml(item.date)}: ${escapeHtml(labelFormatter(item.value))}"></div>
      <span class="mini-chart-label">${escapeHtml(formatShortDate(item.date))}</span>
    `;
    container.appendChild(bar);
  }
}

function renderChickenOptions() {
  renderEggChickenOptions();
  renderFeedChickenOptions();
}

function renderEggChickenOptions() {
  const selectedValue = elements.eggChickenSelect.value;
  elements.eggChickenSelect.innerHTML = "";

  if (!state.token) {
    addSelectOption(elements.eggChickenSelect, "", "Log in first");
    setFormFieldsEnabled(elements.eggForm, false);
    hideMessage(elements.eggFormMessage);
    return;
  }

  if (state.chickens.length === 0) {
    addSelectOption(elements.eggChickenSelect, "", "Add a chicken first");
    setFormFieldsEnabled(elements.eggForm, false);
    showMessage(elements.eggFormMessage, "Add a chicken before recording eggs.", "neutral");
    return;
  }

  for (const chicken of state.chickens) {
    addSelectOption(elements.eggChickenSelect, String(chicken.id), `${chicken.name} (#${chicken.id})`);
  }

  elements.eggChickenSelect.value =
    findMatchingSelectValue(elements.eggChickenSelect, selectedValue) ||
    String(state.chickens[0].id);
  setFormFieldsEnabled(elements.eggForm, true);

  if (elements.eggFormMessage.classList.contains("message-neutral")) {
    hideMessage(elements.eggFormMessage);
  }
}

function renderFeedChickenOptions() {
  const selectedValue = elements.feedChickenSelect.value;
  elements.feedChickenSelect.innerHTML = "";

  addSelectOption(elements.feedChickenSelect, "", "General coop");

  for (const chicken of state.chickens) {
    addSelectOption(elements.feedChickenSelect, String(chicken.id), `${chicken.name} (#${chicken.id})`);
  }

  elements.feedChickenSelect.value = findMatchingSelectValue(elements.feedChickenSelect, selectedValue);
}

function addSelectOption(selectElement, value, label) {
  const option = document.createElement("option");
  option.value = value;
  option.textContent = label;
  selectElement.appendChild(option);
}

function findMatchingSelectValue(selectElement, preferredValue) {
  const preferredText = String(preferredValue || "");
  return Array.from(selectElement.options).some((option) => option.value === preferredText)
    ? preferredText
    : "";
}

function setFormFieldsEnabled(form, enabled) {
  for (const field of form.elements) {
    if (
      field instanceof HTMLInputElement ||
      field instanceof HTMLSelectElement ||
      field instanceof HTMLButtonElement
    ) {
      field.disabled = !enabled;
    }
  }
}

function resetChickenForm() {
  state.editing.chickenId = null;
  elements.chickenForm.reset();
  elements.chickenFormTitle.textContent = "Add Chicken";
  elements.chickenSubmitButton.textContent = "Save Chicken";
  elements.chickenCancelButton.classList.add("hidden");
  hideMessage(elements.chickenFormMessage);
}

function resetEggForm() {
  state.editing.eggId = null;
  elements.eggForm.reset();
  elements.eggFormTitle.textContent = "Add Egg Record";
  elements.eggSubmitButton.textContent = "Save Egg Record";
  elements.eggCancelButton.classList.add("hidden");
  elements.eggForm.elements.count.value = "";
  elements.eggForm.elements.date.value = new Date().toISOString().slice(0, 10);
  hideMessage(elements.eggFormMessage);
}

function resetFeedForm() {
  state.editing.feedId = null;
  elements.feedForm.reset();
  elements.feedFormTitle.textContent = "Add Feed Record";
  elements.feedSubmitButton.textContent = "Save Feed Record";
  elements.feedCancelButton.classList.add("hidden");
  elements.feedForm.elements.date.value = new Date().toISOString().slice(0, 10);
  elements.feedChickenSelect.value = "";
  hideMessage(elements.feedFormMessage);
}

function resetExpenseForm() {
  state.editing.expenseId = null;
  elements.expenseForm.reset();
  elements.expenseFormTitle.textContent = "Add Expense";
  elements.expenseSubmitButton.textContent = "Save Expense";
  elements.expenseCancelButton.classList.add("hidden");
  elements.expenseForm.elements.date.value = new Date().toISOString().slice(0, 10);
  hideMessage(elements.expenseFormMessage);
}

function startChickenEdit(chickenId) {
  const chicken = state.chickens.find((item) => item.id === chickenId);
  if (!chicken) {
    return;
  }

  state.editing.chickenId = chicken.id;
  elements.chickenForm.elements.name.value = chicken.name;
  elements.chickenForm.elements.breed.value = chicken.breed || "";
  elements.chickenFormTitle.textContent = "Edit Chicken";
  elements.chickenSubmitButton.textContent = "Update Chicken";
  elements.chickenCancelButton.classList.remove("hidden");
  hideMessage(elements.chickenFormMessage);
}

function startEggEdit(eggId) {
  const egg = state.eggs.find((item) => item.id === eggId);
  if (!egg) {
    return;
  }

  state.editing.eggId = egg.id;
  elements.eggForm.elements.date.value = egg.date;
  elements.eggForm.elements.count.value = String(egg.count);
  elements.eggChickenSelect.value = String(egg.chicken_id);
  elements.eggFormTitle.textContent = "Edit Egg Record";
  elements.eggSubmitButton.textContent = "Update Egg Record";
  elements.eggCancelButton.classList.remove("hidden");
  hideMessage(elements.eggFormMessage);
}

function startFeedEdit(feedId) {
  const feedRecord = state.feedRecords.find((item) => item.id === feedId);
  if (!feedRecord) {
    return;
  }

  state.editing.feedId = feedRecord.id;
  elements.feedForm.elements.date.value = feedRecord.date;
  elements.feedForm.elements.feed_type.value = feedRecord.feed_type;
  elements.feedForm.elements.amount.value = String(feedRecord.amount);
  elements.feedForm.elements.cost.value =
    feedRecord.cost == null ? "" : String(feedRecord.cost);
  elements.feedChickenSelect.value = feedRecord.chicken_id == null ? "" : String(feedRecord.chicken_id);
  elements.feedFormTitle.textContent = "Edit Feed Record";
  elements.feedSubmitButton.textContent = "Update Feed Record";
  elements.feedCancelButton.classList.remove("hidden");
  hideMessage(elements.feedFormMessage);
}

function startExpenseEdit(expenseId) {
  const expense = state.expenses.find((item) => item.id === expenseId);
  if (!expense) {
    return;
  }

  state.editing.expenseId = expense.id;
  elements.expenseForm.elements.date.value = expense.date;
  elements.expenseForm.elements.category.value = expense.category;
  elements.expenseForm.elements.description.value = expense.description || "";
  elements.expenseForm.elements.amount.value = String(expense.amount);
  elements.expenseFormTitle.textContent = "Edit Expense";
  elements.expenseSubmitButton.textContent = "Update Expense";
  elements.expenseCancelButton.classList.remove("hidden");
  hideMessage(elements.expenseFormMessage);
}

async function loadDashboard() {
  setStatus(elements.dashboardStatus, "Loading...");
  hideMessage(elements.dashboardError);

  try {
    state.dashboard = await api.getDashboard();
    renderDashboard(state.dashboard);
    setStatus(elements.dashboardStatus, "Ready");
  } catch (error) {
    state.dashboard = null;
    renderDashboard(null);
    setStatus(elements.dashboardStatus, "Unavailable");
    showMessage(elements.dashboardError, error.message, "error");
  }
}

async function loadChickens() {
  setStatus(elements.chickensStatus, "Loading...");
  hideMessage(elements.chickensError);

  try {
    state.chickens = await api.getChickens();
    renderChickens();
    renderChickenOptions();
    renderEggs();
    renderFeedRecords();

    if (state.editing.chickenId && !state.chickens.some((item) => item.id === state.editing.chickenId)) {
      resetChickenForm();
    }

    if (state.dashboard) {
      renderDashboard(state.dashboard);
    }

    setStatus(elements.chickensStatus, `${state.chickens.length} loaded`);
  } catch (error) {
    state.chickens = [];
    renderChickens();
    renderChickenOptions();
    renderEggs();
    renderFeedRecords();
    setStatus(elements.chickensStatus, "Unavailable");
    showMessage(elements.chickensError, error.message, "error");
  }
}

async function loadEggs() {
  setStatus(elements.eggsStatus, "Loading...");
  hideMessage(elements.eggsError);

  try {
    state.eggs = await api.getEggs();
    renderEggs();
    renderEggProductionChart();

    if (state.editing.eggId && !state.eggs.some((item) => item.id === state.editing.eggId)) {
      resetEggForm();
    }

    setStatus(elements.eggsStatus, `${state.eggs.length} loaded`);
  } catch (error) {
    state.eggs = [];
    renderEggs();
    renderEggProductionChart(error.message);
    setStatus(elements.eggsStatus, "Unavailable");
    showMessage(elements.eggsError, error.message, "error");
  }
}

async function loadFeedRecords() {
  setStatus(elements.feedStatus, "Loading...");
  hideMessage(elements.feedError);

  try {
    state.feedRecords = await api.getFeedRecords();
    renderFeedRecords();

    if (state.editing.feedId && !state.feedRecords.some((item) => item.id === state.editing.feedId)) {
      resetFeedForm();
    }

    setStatus(elements.feedStatus, `${state.feedRecords.length} loaded`);
  } catch (error) {
    state.feedRecords = [];
    renderFeedRecords();
    setStatus(elements.feedStatus, "Unavailable");
    showMessage(elements.feedError, error.message, "error");
  }
}

async function loadExpenses() {
  setStatus(elements.expensesStatus, "Loading...");
  hideMessage(elements.expensesError);

  try {
    state.expenses = await api.getExpenses();
    renderExpenses();
    renderExpenseChart();

    if (state.editing.expenseId && !state.expenses.some((item) => item.id === state.editing.expenseId)) {
      resetExpenseForm();
    }

    setStatus(elements.expensesStatus, `${state.expenses.length} loaded`);
  } catch (error) {
    state.expenses = [];
    renderExpenses();
    renderExpenseChart(error.message);
    setStatus(elements.expensesStatus, "Unavailable");
    showMessage(elements.expensesError, error.message, "error");
  }
}

async function handleLoginSubmit(event) {
  event.preventDefault();
  hideMessage(elements.loginFormMessage);
  hideMessage(elements.signupFormMessage);

  const submitButton = elements.loginForm.querySelector('button[type="submit"]');
  submitButton.disabled = true;
  submitButton.textContent = "Logging in...";

  const formData = new FormData(elements.loginForm);
  const payload = {
    username: String(formData.get("username") || "").trim(),
    password: String(formData.get("password") || ""),
  };

  try {
    const authResult = await api.login(payload);
    persistSession(authResult);
    elements.loginForm.reset();
    renderAuthState();
    resetProtectedData();
    await loadApp();
  } catch (error) {
    showMessage(elements.loginFormMessage, error.message, "error");
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = "Log In";
  }
}

async function handleSignupSubmit(event) {
  event.preventDefault();
  hideMessage(elements.loginFormMessage);
  hideMessage(elements.signupFormMessage);

  const submitButton = elements.signupForm.querySelector('button[type="submit"]');
  submitButton.disabled = true;
  submitButton.textContent = "Creating...";

  const formData = new FormData(elements.signupForm);
  const payload = {
    username: String(formData.get("username") || "").trim(),
    password: String(formData.get("password") || ""),
  };

  try {
    const authResult = await api.signup(payload);
    persistSession(authResult);
    elements.signupForm.reset();
    renderAuthState();
    resetProtectedData();
    await loadApp();
  } catch (error) {
    showMessage(elements.signupFormMessage, error.message, "error");
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = "Sign Up";
  }
}

function handleLogout() {
  clearSession();
  renderAuthState("You have been logged out.");
  resetProtectedData();
}

async function handleChickenSubmit(event) {
  event.preventDefault();
  hideMessage(elements.chickenFormMessage);

  const isEditing = state.editing.chickenId !== null;
  elements.chickenSubmitButton.disabled = true;
  elements.chickenSubmitButton.textContent = isEditing ? "Updating..." : "Saving...";

  const formData = new FormData(elements.chickenForm);
  const payload = {
    name: String(formData.get("name") || "").trim(),
    breed: String(formData.get("breed") || "").trim() || null,
  };

  try {
    if (isEditing) {
      await api.updateChicken(state.editing.chickenId, payload);
      resetChickenForm();
      showMessage(elements.chickenFormMessage, "Chicken updated.", "success");
    } else {
      await api.createChicken(payload);
      resetChickenForm();
      showMessage(elements.chickenFormMessage, "Chicken added.", "success");
    }

    await Promise.allSettled([loadChickens(), loadDashboard()]);
  } catch (error) {
    showMessage(elements.chickenFormMessage, error.message, "error");
  } finally {
    elements.chickenSubmitButton.disabled = false;
    elements.chickenSubmitButton.textContent =
      state.editing.chickenId !== null ? "Update Chicken" : "Save Chicken";
  }
}

async function handleEggSubmit(event) {
  event.preventDefault();
  hideMessage(elements.eggFormMessage);

  const isEditing = state.editing.eggId !== null;
  elements.eggSubmitButton.disabled = true;
  elements.eggSubmitButton.textContent = isEditing ? "Updating..." : "Saving...";

  const formData = new FormData(elements.eggForm);
  const payload = {
    date: String(formData.get("date") || ""),
    count: Number(formData.get("count") || 0),
    chicken_id: Number(formData.get("chicken_id")),
  };

  try {
    if (isEditing) {
      await api.updateEgg(state.editing.eggId, payload);
      resetEggForm();
      showMessage(elements.eggFormMessage, "Egg record updated.", "success");
    } else {
      await api.createEgg(payload);
      resetEggForm();
      showMessage(elements.eggFormMessage, "Egg record added.", "success");
    }

    await Promise.allSettled([loadEggs(), loadDashboard()]);
  } catch (error) {
    showMessage(elements.eggFormMessage, error.message, "error");
  } finally {
    elements.eggSubmitButton.disabled = false;
    elements.eggSubmitButton.textContent =
      state.editing.eggId !== null ? "Update Egg Record" : "Save Egg Record";
  }
}

async function handleFeedSubmit(event) {
  event.preventDefault();
  hideMessage(elements.feedFormMessage);

  const isEditing = state.editing.feedId !== null;
  elements.feedSubmitButton.disabled = true;
  elements.feedSubmitButton.textContent = isEditing ? "Updating..." : "Saving...";

  const formData = new FormData(elements.feedForm);
  const chickenValue = String(formData.get("chicken_id") || "");
  const payload = {
    date: String(formData.get("date") || ""),
    feed_type: String(formData.get("feed_type") || "").trim(),
    amount: Number(formData.get("amount") || 0),
    cost: parseOptionalNumber(formData.get("cost")),
    chicken_id: chickenValue ? Number(chickenValue) : null,
  };

  try {
    if (isEditing) {
      await api.updateFeedRecord(state.editing.feedId, payload);
      resetFeedForm();
      showMessage(elements.feedFormMessage, "Feed record updated.", "success");
    } else {
      await api.createFeedRecord(payload);
      resetFeedForm();
      showMessage(elements.feedFormMessage, "Feed record added.", "success");
    }

    await loadFeedRecords();
  } catch (error) {
    showMessage(elements.feedFormMessage, error.message, "error");
  } finally {
    elements.feedSubmitButton.disabled = false;
    elements.feedSubmitButton.textContent =
      state.editing.feedId !== null ? "Update Feed Record" : "Save Feed Record";
  }
}

async function handleExpenseSubmit(event) {
  event.preventDefault();
  hideMessage(elements.expenseFormMessage);

  const isEditing = state.editing.expenseId !== null;
  elements.expenseSubmitButton.disabled = true;
  elements.expenseSubmitButton.textContent = isEditing ? "Updating..." : "Saving...";

  const formData = new FormData(elements.expenseForm);
  const payload = {
    date: String(formData.get("date") || ""),
    category: String(formData.get("category") || "").trim(),
    description: String(formData.get("description") || "").trim() || null,
    amount: Number(formData.get("amount") || 0),
  };

  try {
    if (isEditing) {
      await api.updateExpense(state.editing.expenseId, payload);
      resetExpenseForm();
      showMessage(elements.expenseFormMessage, "Expense updated.", "success");
    } else {
      await api.createExpense(payload);
      resetExpenseForm();
      showMessage(elements.expenseFormMessage, "Expense added.", "success");
    }

    await Promise.allSettled([loadExpenses(), loadDashboard()]);
  } catch (error) {
    showMessage(elements.expenseFormMessage, error.message, "error");
  } finally {
    elements.expenseSubmitButton.disabled = false;
    elements.expenseSubmitButton.textContent =
      state.editing.expenseId !== null ? "Update Expense" : "Save Expense";
  }
}

function parseOptionalNumber(value) {
  const parsedValue = String(value || "").trim();
  return parsedValue ? Number(parsedValue) : null;
}

function formatNumber(value) {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 2,
  }).format(Number(value || 0));
}

function formatCurrency(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(Number(value || 0));
}

function formatShortDate(value) {
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
