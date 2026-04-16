const STORAGE_KEYS = {
  token: "coookeeper.authToken",
  username: "coookeeper.username",
};

const DEFAULT_DATE_RANGE = "30";
const DEFAULT_SORTS = {
  eggs: "date_desc",
  feed: "date_desc",
  expenses: "date_desc",
  cleaning: "date_desc",
};

const API_BASE_URL = String(window.CoopKeeperConfig?.apiBaseUrl || "").replace(/\/$/, "");
const API_DOCS_URL = String(window.CoopKeeperConfig?.docsUrl || "").trim();

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
  deleteChicken: (chickenId) =>
    requestJson(`/chickens/${chickenId}`, {
      method: "DELETE",
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
  deleteEgg: (eggId) =>
    requestJson(`/eggs/${eggId}`, {
      method: "DELETE",
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
  deleteFeedRecord: (feedId) =>
    requestJson(`/feed/${feedId}`, {
      method: "DELETE",
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
  deleteExpense: (expenseId) =>
    requestJson(`/expenses/${expenseId}`, {
      method: "DELETE",
    }),
  getCleaningLogs: () => requestJson("/cleaning-logs?skip=0&limit=100"),
  createCleaningLog: (payload) =>
    requestJson("/cleaning-logs", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  updateCleaningLog: (cleaningLogId, payload) =>
    requestJson(`/cleaning-logs/${cleaningLogId}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),
  deleteCleaningLog: (cleaningLogId) =>
    requestJson(`/cleaning-logs/${cleaningLogId}`, {
      method: "DELETE",
    }),
  getAlerts: () => requestJson("/alerts"),
  markAlertAsRead: (alertId) =>
    requestJson(`/alerts/${alertId}/read`, {
      method: "POST",
    }),
  deleteAlert: (alertId) =>
    requestJson(`/alerts/${alertId}`, {
      method: "DELETE",
    }),
};

const state = {
  token: loadStoredValue(STORAGE_KEYS.token),
  username: loadStoredValue(STORAGE_KEYS.username),
  chickens: [],
  eggs: [],
  feedRecords: [],
  expenses: [],
  cleaningLogs: [],
  alerts: [],
  loading: {
    chickens: false,
    eggs: false,
    feed: false,
    expenses: false,
    cleaning: false,
    alerts: false,
  },
  forms: {
    chicken: false,
    egg: false,
    feed: false,
    expense: false,
    cleaning: false,
  },
  editing: {
    chickenId: null,
    eggId: null,
    feedId: null,
    expenseId: null,
    cleaningId: null,
  },
  filters: {
    dateRange: DEFAULT_DATE_RANGE,
  },
  sorts: {
    ...DEFAULT_SORTS,
  },
};

const elements = {
  authPanel: document.querySelector("#auth-panel"),
  authBadge: document.querySelector("#auth-badge"),
  authNotice: document.querySelector("#auth-notice"),
  apiDocsLink: document.querySelector("#api-docs-link"),
  appShell: document.querySelector("#app-shell"),
  logoutButton: document.querySelector("#logout-button"),
  loginForm: document.querySelector("#login-form"),
  loginFormMessage: document.querySelector("#login-form-message"),
  signupForm: document.querySelector("#signup-form"),
  signupFormMessage: document.querySelector("#signup-form-message"),
  dateFilterButtons: Array.from(document.querySelectorAll(".filter-button")),
  dashboardStatus: document.querySelector("#dashboard-status"),
  dashboardError: document.querySelector("#dashboard-error"),
  dashboardTotalChickens: document.querySelector("#dashboard-total-chickens"),
  dashboardTotalEggs: document.querySelector("#dashboard-total-eggs"),
  dashboardAverageEggs: document.querySelector("#dashboard-average-eggs"),
  dashboardCostPerDozen: document.querySelector("#dashboard-cost-per-dozen"),
  dashboardLastCleaned: document.querySelector("#dashboard-last-cleaned"),
  dashboardLatestEgg: document.querySelector("#dashboard-latest-egg"),
  eggChartSummary: document.querySelector("#egg-chart-summary"),
  eggChartMessage: document.querySelector("#egg-chart-message"),
  eggChart: document.querySelector("#egg-chart"),
  expenseChartSummary: document.querySelector("#expense-chart-summary"),
  expenseChartMessage: document.querySelector("#expense-chart-message"),
  expenseChart: document.querySelector("#expense-chart"),
  alertsStatus: document.querySelector("#alerts-status"),
  alertsError: document.querySelector("#alerts-error"),
  alertsNotice: document.querySelector("#alerts-notice"),
  alertsEmpty: document.querySelector("#alerts-empty"),
  alertsList: document.querySelector("#alerts-list"),
  chickensStatus: document.querySelector("#chickens-status"),
  chickensError: document.querySelector("#chickens-error"),
  chickensNotice: document.querySelector("#chickens-notice"),
  chickensEmpty: document.querySelector("#chickens-empty"),
  chickensList: document.querySelector("#chickens-list"),
  chickenToggleButton: document.querySelector("#chicken-toggle-button"),
  chickenFormPanel: document.querySelector("#chicken-form-panel"),
  chickenForm: document.querySelector("#chicken-form"),
  chickenFormTitle: document.querySelector("#chicken-form-title"),
  chickenSubmitButton: document.querySelector("#chicken-submit-button"),
  chickenCancelButton: document.querySelector("#chicken-cancel-button"),
  eggsStatus: document.querySelector("#eggs-status"),
  eggsError: document.querySelector("#eggs-error"),
  eggsNotice: document.querySelector("#eggs-notice"),
  eggsEmpty: document.querySelector("#eggs-empty"),
  eggsList: document.querySelector("#eggs-list"),
  eggsSortSelect: document.querySelector("#eggs-sort-select"),
  eggToggleButton: document.querySelector("#egg-toggle-button"),
  eggFormPanel: document.querySelector("#egg-form-panel"),
  eggForm: document.querySelector("#egg-form"),
  eggFormTitle: document.querySelector("#egg-form-title"),
  eggSubmitButton: document.querySelector("#egg-submit-button"),
  eggCancelButton: document.querySelector("#egg-cancel-button"),
  eggChickenSelect: document.querySelector("#egg-chicken-select"),
  feedStatus: document.querySelector("#feed-status"),
  feedError: document.querySelector("#feed-error"),
  feedNotice: document.querySelector("#feed-notice"),
  feedEmpty: document.querySelector("#feed-empty"),
  feedList: document.querySelector("#feed-list"),
  feedSortSelect: document.querySelector("#feed-sort-select"),
  feedToggleButton: document.querySelector("#feed-toggle-button"),
  feedFormPanel: document.querySelector("#feed-form-panel"),
  feedForm: document.querySelector("#feed-form"),
  feedFormTitle: document.querySelector("#feed-form-title"),
  feedSubmitButton: document.querySelector("#feed-submit-button"),
  feedCancelButton: document.querySelector("#feed-cancel-button"),
  feedChickenSelect: document.querySelector("#feed-chicken-select"),
  expensesStatus: document.querySelector("#expenses-status"),
  expensesError: document.querySelector("#expenses-error"),
  expensesNotice: document.querySelector("#expenses-notice"),
  expensesEmpty: document.querySelector("#expenses-empty"),
  expensesList: document.querySelector("#expenses-list"),
  expensesSortSelect: document.querySelector("#expenses-sort-select"),
  expenseToggleButton: document.querySelector("#expense-toggle-button"),
  expenseFormPanel: document.querySelector("#expense-form-panel"),
  expenseForm: document.querySelector("#expense-form"),
  expenseFormTitle: document.querySelector("#expense-form-title"),
  expenseSubmitButton: document.querySelector("#expense-submit-button"),
  expenseCancelButton: document.querySelector("#expense-cancel-button"),
  cleaningStatus: document.querySelector("#cleaning-status"),
  cleaningError: document.querySelector("#cleaning-error"),
  cleaningNotice: document.querySelector("#cleaning-notice"),
  cleaningEmpty: document.querySelector("#cleaning-empty"),
  cleaningList: document.querySelector("#cleaning-list"),
  cleaningSortSelect: document.querySelector("#cleaning-sort-select"),
  cleaningToggleButton: document.querySelector("#cleaning-toggle-button"),
  cleaningFormPanel: document.querySelector("#cleaning-form-panel"),
  cleaningForm: document.querySelector("#cleaning-form"),
  cleaningFormTitle: document.querySelector("#cleaning-form-title"),
  cleaningSubmitButton: document.querySelector("#cleaning-submit-button"),
  cleaningCancelButton: document.querySelector("#cleaning-cancel-button"),
};

const formConfig = {
  chicken: {
    panel: elements.chickenFormPanel,
    toggleButton: elements.chickenToggleButton,
    addLabel: "+ Add Chicken",
  },
  egg: {
    panel: elements.eggFormPanel,
    toggleButton: elements.eggToggleButton,
    addLabel: "+ Add Egg Record",
  },
  feed: {
    panel: elements.feedFormPanel,
    toggleButton: elements.feedToggleButton,
    addLabel: "+ Add Feed Record",
  },
  expense: {
    panel: elements.expenseFormPanel,
    toggleButton: elements.expenseToggleButton,
    addLabel: "+ Add Expense",
  },
  cleaning: {
    panel: elements.cleaningFormPanel,
    toggleButton: elements.cleaningToggleButton,
    addLabel: "+ Add Cleaning Log",
  },
};

document.addEventListener("DOMContentLoaded", () => {
  configurePublicLinks();
  setDefaultDates();
  bindEvents();
  updateDateFilterButtons();
  renderAuthState();
  resetProtectedData();

  if (state.token) {
    loadApp();
  }
});

function configurePublicLinks() {
  if (!elements.apiDocsLink) {
    return;
  }

  if (API_DOCS_URL) {
    elements.apiDocsLink.href = API_DOCS_URL;
    elements.apiDocsLink.classList.remove("hidden");
    return;
  }

  elements.apiDocsLink.classList.add("hidden");
}

function bindEvents() {
  elements.loginForm.addEventListener("submit", handleLoginSubmit);
  elements.signupForm.addEventListener("submit", handleSignupSubmit);
  elements.logoutButton.addEventListener("click", handleLogout);
  elements.chickenToggleButton.addEventListener("click", () => handleFormToggle("chicken"));
  elements.eggToggleButton.addEventListener("click", () => handleFormToggle("egg"));
  elements.feedToggleButton.addEventListener("click", () => handleFormToggle("feed"));
  elements.expenseToggleButton.addEventListener("click", () => handleFormToggle("expense"));
  elements.cleaningToggleButton.addEventListener("click", () => handleFormToggle("cleaning"));
  elements.chickenForm.addEventListener("submit", handleChickenSubmit);
  elements.eggForm.addEventListener("submit", handleEggSubmit);
  elements.feedForm.addEventListener("submit", handleFeedSubmit);
  elements.expenseForm.addEventListener("submit", handleExpenseSubmit);
  elements.cleaningForm.addEventListener("submit", handleCleaningSubmit);
  elements.chickenCancelButton.addEventListener("click", resetChickenForm);
  elements.eggCancelButton.addEventListener("click", resetEggForm);
  elements.feedCancelButton.addEventListener("click", resetFeedForm);
  elements.expenseCancelButton.addEventListener("click", resetExpenseForm);
  elements.cleaningCancelButton.addEventListener("click", resetCleaningForm);
  elements.eggsSortSelect.addEventListener("change", handleEggSortChange);
  elements.feedSortSelect.addEventListener("change", handleFeedSortChange);
  elements.expensesSortSelect.addEventListener("change", handleExpenseSortChange);
  elements.cleaningSortSelect.addEventListener("change", handleCleaningSortChange);

  for (const button of elements.dateFilterButtons) {
    button.addEventListener("click", handleDateFilterClick);
  }
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
    loadCleaningLogs(),
    loadAlerts(),
  ]);
  refreshDashboard();
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
      // Keep fallback message.
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
  state.chickens = [];
  state.eggs = [];
  state.feedRecords = [];
  state.expenses = [];
  state.cleaningLogs = [];
  state.alerts = [];
  state.loading.chickens = false;
  state.loading.eggs = false;
  state.loading.feed = false;
  state.loading.expenses = false;
  state.loading.cleaning = false;
  state.loading.alerts = false;
  state.sorts = { ...DEFAULT_SORTS };
  state.filters.dateRange = DEFAULT_DATE_RANGE;

  elements.eggsSortSelect.value = state.sorts.eggs;
  elements.feedSortSelect.value = state.sorts.feed;
  elements.expensesSortSelect.value = state.sorts.expenses;
  elements.cleaningSortSelect.value = state.sorts.cleaning;
  updateDateFilterButtons();
  resetChickenForm();
  resetEggForm();
  resetFeedForm();
  resetExpenseForm();
  resetCleaningForm();
  hideMessage(elements.dashboardError);
  hideMessage(elements.chickensError);
  hideMessage(elements.eggsError);
  hideMessage(elements.feedError);
  hideMessage(elements.expensesError);
  hideMessage(elements.cleaningError);
  hideMessage(elements.alertsError);
  hideMessage(elements.chickensNotice);
  hideMessage(elements.eggsNotice);
  hideMessage(elements.feedNotice);
  hideMessage(elements.expensesNotice);
  hideMessage(elements.cleaningNotice);
  hideMessage(elements.alertsNotice);
  renderDashboard();
  renderEggChart();
  renderExpenseChart();
  renderAlerts();
  renderChickens();
  renderEggs();
  renderFeedRecords();
  renderExpenses();
  renderCleaningLogs();
  renderChickenOptions();
  setStatus(elements.dashboardStatus, state.token ? "Loading..." : "Sign in required");
  setStatus(elements.alertsStatus, state.token ? "Loading..." : "Sign in required");
  setStatus(elements.chickensStatus, state.token ? "Loading..." : "Sign in required");
  setStatus(elements.eggsStatus, state.token ? "Loading..." : "Sign in required");
  setStatus(elements.feedStatus, state.token ? "Loading..." : "Sign in required");
  setStatus(elements.expensesStatus, state.token ? "Loading..." : "Sign in required");
  setStatus(elements.cleaningStatus, state.token ? "Loading..." : "Sign in required");
}

function setDefaultDates() {
  const today = new Date().toISOString().slice(0, 10);
  elements.eggForm.elements.date.value = today;
  elements.feedForm.elements.date.value = today;
  elements.expenseForm.elements.date.value = today;
  elements.cleaningForm.elements.date.value = today;
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

function updateDateFilterButtons() {
  for (const button of elements.dateFilterButtons) {
    const isActive = button.dataset.range === state.filters.dateRange;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  }
}

function handleDateFilterClick(event) {
  const selectedRange = event.currentTarget.dataset.range || DEFAULT_DATE_RANGE;
  if (selectedRange === state.filters.dateRange) {
    return;
  }

  state.filters.dateRange = selectedRange;
  updateDateFilterButtons();
  refreshDashboard();
  renderEggs();
  renderFeedRecords();
  renderExpenses();
  renderCleaningLogs();
}

function handleEggSortChange(event) {
  state.sorts.eggs = event.target.value;
  renderEggs();
}

function handleFeedSortChange(event) {
  state.sorts.feed = event.target.value;
  renderFeedRecords();
}

function handleExpenseSortChange(event) {
  state.sorts.expenses = event.target.value;
  renderExpenses();
}

function handleCleaningSortChange(event) {
  state.sorts.cleaning = event.target.value;
  renderCleaningLogs();
}

function handleFormToggle(resource) {
  if (state.forms[resource]) {
    resetResourceForm(resource);
    return;
  }

  setFormOpen(resource, true);
  hideResourceNotice(resource);
}

function setFormOpen(resource, isOpen) {
  state.forms[resource] = isOpen;
  formConfig[resource].panel.classList.toggle("hidden", !isOpen);
  formConfig[resource].toggleButton.textContent = isOpen
    ? "Hide Form"
    : formConfig[resource].addLabel;
}

function resetResourceForm(resource) {
  if (resource === "chicken") {
    resetChickenForm();
  } else if (resource === "egg") {
    resetEggForm();
  } else if (resource === "feed") {
    resetFeedForm();
  } else if (resource === "expense") {
    resetExpenseForm();
  } else if (resource === "cleaning") {
    resetCleaningForm();
  }
}

function showResourceNotice(resource, text, tone) {
  const noticeElement = getResourceNoticeElement(resource);
  showMessage(noticeElement, text, tone);
}

function hideResourceNotice(resource) {
  hideMessage(getResourceNoticeElement(resource));
}

function getResourceNoticeElement(resource) {
  if (resource === "chicken") {
    return elements.chickensNotice;
  }
  if (resource === "egg") {
    return elements.eggsNotice;
  }
  if (resource === "feed") {
    return elements.feedNotice;
  }
  if (resource === "cleaning") {
    return elements.cleaningNotice;
  }
  return elements.expensesNotice;
}

function getRangeStart(range = state.filters.dateRange) {
  if (range === "all") {
    return null;
  }

  const days = Number(range);
  if (!Number.isFinite(days) || days <= 0) {
    return null;
  }

  const start = new Date();
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - (days - 1));
  return start;
}

function parseDateString(value) {
  if (!value) {
    return null;
  }

  const stringValue = String(value);
  const parsedDate = stringValue.includes("T")
    ? new Date(stringValue)
    : new Date(`${stringValue}T00:00:00`);
  return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
}

function recordMatchesDateRange(record) {
  const rangeStart = getRangeStart();
  if (!rangeStart) {
    return true;
  }

  const recordDate = parseDateString(record.date);
  return recordDate ? recordDate >= rangeStart : false;
}

function getFilteredEggs() {
  return state.eggs.filter(recordMatchesDateRange);
}

function getFilteredFeedRecords() {
  return state.feedRecords.filter(recordMatchesDateRange);
}

function getFilteredExpenses() {
  return state.expenses.filter(recordMatchesDateRange);
}

function getFilteredCleaningLogs() {
  return state.cleaningLogs.filter(recordMatchesDateRange);
}

function getVisibleChickens() {
  return [...state.chickens].sort((left, right) => right.id - left.id);
}

function sortByDate(left, right, direction) {
  const dateComparison = String(left.date).localeCompare(String(right.date));
  if (dateComparison !== 0) {
    return direction === "asc" ? dateComparison : -dateComparison;
  }

  return direction === "asc" ? left.id - right.id : right.id - left.id;
}

function getVisibleEggs() {
  const eggs = [...getFilteredEggs()];
  if (state.sorts.eggs === "count_desc") {
    eggs.sort((left, right) => right.count - left.count || sortByDate(left, right, "desc"));
    return eggs;
  }
  if (state.sorts.eggs === "count_asc") {
    eggs.sort((left, right) => left.count - right.count || sortByDate(left, right, "asc"));
    return eggs;
  }
  eggs.sort((left, right) => sortByDate(left, right, state.sorts.eggs === "date_asc" ? "asc" : "desc"));
  return eggs;
}

function getVisibleFeedRecords() {
  const feedRecords = [...getFilteredFeedRecords()];
  if (state.sorts.feed === "amount_desc") {
    feedRecords.sort((left, right) => right.amount - left.amount || sortByDate(left, right, "desc"));
    return feedRecords;
  }
  if (state.sorts.feed === "amount_asc") {
    feedRecords.sort((left, right) => left.amount - right.amount || sortByDate(left, right, "asc"));
    return feedRecords;
  }
  feedRecords.sort((left, right) =>
    sortByDate(left, right, state.sorts.feed === "date_asc" ? "asc" : "desc"),
  );
  return feedRecords;
}

function getVisibleExpenses() {
  const expenses = [...getFilteredExpenses()];
  if (state.sorts.expenses === "amount_desc") {
    expenses.sort((left, right) => right.amount - left.amount || sortByDate(left, right, "desc"));
    return expenses;
  }
  if (state.sorts.expenses === "amount_asc") {
    expenses.sort((left, right) => left.amount - right.amount || sortByDate(left, right, "asc"));
    return expenses;
  }
  expenses.sort((left, right) =>
    sortByDate(left, right, state.sorts.expenses === "date_asc" ? "asc" : "desc"),
  );
  return expenses;
}

function getVisibleCleaningLogs() {
  const cleaningLogs = [...getFilteredCleaningLogs()];
  cleaningLogs.sort((left, right) =>
    sortByDate(left, right, state.sorts.cleaning === "date_asc" ? "asc" : "desc"),
  );
  return cleaningLogs;
}

function getVisibleAlerts() {
  return [...state.alerts].sort((left, right) =>
    String(right.created_at).localeCompare(String(left.created_at)) || right.id - left.id,
  );
}

function getChickenName(chickenId) {
  const chicken = state.chickens.find((item) => item.id === chickenId);
  return chicken?.name || "Unknown chicken";
}

function getChickenSelectLabel(chicken) {
  return chicken.breed ? `${chicken.name} - ${chicken.breed}` : chicken.name;
}

function describeDateRange(range = state.filters.dateRange) {
  if (range === "7") {
    return "Last 7 days";
  }
  if (range === "30") {
    return "Last 30 days";
  }
  return "All time";
}

function getEmptyStateText(resource) {
  const rangeLabel = describeDateRange().toLowerCase();
  if (resource === "chicken") {
    return state.token ? "Add your first chicken to get started." : "Sign in to load chickens.";
  }

  const allRecordsExist =
    resource === "egg"
      ? state.eggs.length > 0
      : resource === "feed"
        ? state.feedRecords.length > 0
        : resource === "expense"
          ? state.expenses.length > 0
          : state.cleaningLogs.length > 0;

  if (!state.token) {
    if (resource === "egg") {
      return "Sign in to load egg records.";
    }
    if (resource === "feed") {
      return "Sign in to load feed records.";
    }
    if (resource === "expense") {
      return "Sign in to load expenses.";
    }
    return "Sign in to load cleaning logs.";
  }

  if (allRecordsExist && state.filters.dateRange !== "all") {
    if (resource === "egg") {
      return `No egg records for ${rangeLabel}.`;
    }
    if (resource === "feed") {
      return `No feed records for ${rangeLabel}.`;
    }
    if (resource === "expense") {
      return `No expenses for ${rangeLabel}.`;
    }
    return `No cleaning logs for ${rangeLabel}.`;
  }

  if (resource === "egg") {
    return "No egg records yet.";
  }
  if (resource === "feed") {
    return "No feed records yet.";
  }
  if (resource === "expense") {
    return "No expenses yet.";
  }
  return "No cleaning logs yet.";
}

function buildDashboardSummary() {
  const filteredEggs = getFilteredEggs();
  const filteredExpenses = getFilteredExpenses();
  const filteredCleaningLogs = getFilteredCleaningLogs();
  const totalEggs = filteredEggs.reduce((sum, record) => sum + Number(record.count || 0), 0);
  const totalExpenses = filteredExpenses.reduce((sum, record) => sum + Number(record.amount || 0), 0);
  const latestEggRecord = [...filteredEggs].sort((left, right) => sortByDate(left, right, "desc"))[0] || null;
  const lastCleaningLog =
    [...filteredCleaningLogs].sort((left, right) => sortByDate(left, right, "desc"))[0] || null;

  return {
    totalChickens: state.chickens.length,
    totalEggs,
    averageEggsPerChicken: state.chickens.length ? totalEggs / state.chickens.length : 0,
    costPerDozenEggs: totalEggs ? (totalExpenses / totalEggs) * 12 : 0,
    lastCleaningLog,
    latestEggRecord,
  };
}

function refreshDashboard() {
  renderDashboard();
  renderEggChart();
  renderExpenseChart();
}

function renderDashboard() {
  const isLoading =
    state.loading.chickens ||
    state.loading.eggs ||
    state.loading.expenses ||
    state.loading.cleaning;
  const summary = buildDashboardSummary();

  setStatus(elements.dashboardStatus, isLoading ? "Loading..." : describeDateRange());
  hideMessage(elements.dashboardError);

  if (!state.token) {
    elements.dashboardTotalChickens.textContent = "-";
    elements.dashboardTotalEggs.textContent = "-";
    elements.dashboardAverageEggs.textContent = "-";
    elements.dashboardCostPerDozen.textContent = "-";
    elements.dashboardLastCleaned.textContent = "Sign in to load data.";
    elements.dashboardLatestEgg.textContent = "Sign in to load data.";
    return;
  }

  elements.dashboardTotalChickens.textContent = String(summary.totalChickens);
  elements.dashboardTotalEggs.textContent = String(summary.totalEggs);
  elements.dashboardAverageEggs.textContent = formatAverage(summary.averageEggsPerChicken);
  elements.dashboardCostPerDozen.textContent = formatCurrency(summary.costPerDozenEggs);
  elements.dashboardLastCleaned.textContent = describeLastCleaned(summary.lastCleaningLog);
  elements.dashboardLatestEgg.textContent = describeLatestEgg(summary.latestEggRecord);
}

function describeLastCleaned(record) {
  if (!record) {
    return state.token ? "No cleaning logs in this range." : "Sign in to load data.";
  }

  return formatLongDate(record.date);
}

function describeLatestEgg(record) {
  if (!record) {
    return state.token ? "No egg records in this range." : "Sign in to load data.";
  }

  return `${formatLongDate(record.date)} | ${record.count} eggs | ${getChickenName(record.chicken_id)}`;
}

function renderAlerts() {
  elements.alertsList.innerHTML = "";

  if (!state.token) {
    elements.alertsEmpty.classList.add("hidden");
    return;
  }

  if (state.loading.alerts) {
    renderAlertLoading();
    elements.alertsEmpty.classList.add("hidden");
    return;
  }

  const alerts = getVisibleAlerts();
  if (alerts.length === 0) {
    elements.alertsEmpty.classList.remove("hidden");
    return;
  }

  elements.alertsEmpty.classList.add("hidden");
  for (const alert of alerts) {
    const item = document.createElement("li");
    item.className = `alert-item alert-${alert.severity}`;
    item.innerHTML = `
      <div class="alert-copy">
        <strong>${escapeHtml(alert.message)}</strong>
        <span class="alert-meta">${escapeHtml(formatDateTime(alert.created_at))} | ${escapeHtml(capitalize(alert.severity))}</span>
      </div>
      <div class="table-actions">
        <button type="button" class="button button-secondary button-small" data-action="read">Mark read</button>
        <button type="button" class="button button-secondary button-small button-danger" data-action="delete">
          Delete
        </button>
      </div>
    `;
    item.querySelector('[data-action="read"]').addEventListener("click", () => handleAlertMarkRead(alert.id));
    item.querySelector('[data-action="delete"]').addEventListener("click", () => handleAlertDelete(alert.id));
    elements.alertsList.appendChild(item);
  }
}

function renderEggChart() {
  if (state.loading.eggs) {
    renderChartLoading(elements.eggChart, elements.eggChartSummary, elements.eggChartMessage);
    return;
  }

  const points = aggregateByDate(getFilteredEggs(), "count");
  if (points.length === 0) {
    renderEmptyChart(
      elements.eggChart,
      elements.eggChartSummary,
      elements.eggChartMessage,
      getEmptyStateText("egg"),
    );
    return;
  }

  hideMessage(elements.eggChartMessage);
  elements.eggChartSummary.textContent = `${points.reduce((sum, point) => sum + point.value, 0)} eggs`;
  renderLineChart(elements.eggChart, points, {
    ariaLabel: "Egg production line chart",
    yLabel: "Eggs",
    valueFormatter: (value) => `${value} eggs`,
  });
}

function renderExpenseChart() {
  if (state.loading.expenses) {
    renderChartLoading(elements.expenseChart, elements.expenseChartSummary, elements.expenseChartMessage);
    return;
  }

  const points = aggregateByDate(getFilteredExpenses(), "amount");
  if (points.length === 0) {
    renderEmptyChart(
      elements.expenseChart,
      elements.expenseChartSummary,
      elements.expenseChartMessage,
      getEmptyStateText("expense"),
    );
    return;
  }

  hideMessage(elements.expenseChartMessage);
  elements.expenseChartSummary.textContent = formatCurrency(
    points.reduce((sum, point) => sum + point.value, 0),
  );
  renderBarChart(elements.expenseChart, points, {
    ariaLabel: "Expenses bar chart",
    yLabel: "Cost",
    valueFormatter: (value) => formatCurrency(value),
  });
}

function renderChartLoading(container, summaryElement, messageElement) {
  summaryElement.textContent = "-";
  hideMessage(messageElement);
  container.innerHTML = '<div class="chart-loading">Loading chart...</div>';
}

function renderEmptyChart(container, summaryElement, messageElement, messageText) {
  summaryElement.textContent = "-";
  showMessage(messageElement, messageText, "neutral");
  container.innerHTML = '<div class="chart-empty">No data to chart yet.</div>';
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
    .sort((left, right) => left.date.localeCompare(right.date));
}

function renderLineChart(container, points, options) {
  container.innerHTML = buildLineChartSvg(points, options);
}

function renderBarChart(container, points, options) {
  container.innerHTML = buildBarChartSvg(points, options);
}

function buildLineChartSvg(points, { ariaLabel, yLabel, valueFormatter }) {
  const width = 640;
  const height = 260;
  const margin = { top: 18, right: 24, bottom: 52, left: 56 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;
  const maxValue = getNiceMax(points.map((point) => point.value));
  const ticks = getYAxisTicks(maxValue);
  const labelIndices = getLabelIndices(points.length, 5);
  const xPosition = (index) =>
    points.length === 1
      ? margin.left + innerWidth / 2
      : margin.left + (innerWidth / (points.length - 1)) * index;
  const yPosition = (value) => margin.top + innerHeight - (value / maxValue) * innerHeight;
  const path = points
    .map((point, index) => `${index === 0 ? "M" : "L"} ${xPosition(index)} ${yPosition(point.value)}`)
    .join(" ");

  const gridLines = ticks
    .map((tick) => {
      const y = yPosition(tick);
      return `
        <line x1="${margin.left}" y1="${y}" x2="${width - margin.right}" y2="${y}" class="chart-grid-line" />
        <text x="${margin.left - 10}" y="${y + 4}" class="chart-tick-label">${escapeHtml(
          String(tick),
        )}</text>
      `;
    })
    .join("");

  const xLabels = points
    .map((point, index) => {
      if (!labelIndices.has(index)) {
        return "";
      }
      return `
        <text x="${xPosition(index)}" y="${height - 18}" text-anchor="middle" class="chart-tick-label">
          ${escapeHtml(formatShortDate(point.date))}
        </text>
      `;
    })
    .join("");

  const circles = points
    .map((point, index) => {
      const cx = xPosition(index);
      const cy = yPosition(point.value);
      return `
        <circle cx="${cx}" cy="${cy}" r="4.5" class="chart-point">
          <title>${escapeHtml(`${formatLongDate(point.date)}: ${valueFormatter(point.value)}`)}</title>
        </circle>
      `;
    })
    .join("");

  return `
    <svg class="chart-svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="${escapeHtml(ariaLabel)}">
      ${gridLines}
      <line x1="${margin.left}" y1="${margin.top}" x2="${margin.left}" y2="${margin.top + innerHeight}" class="chart-axis-line" />
      <line x1="${margin.left}" y1="${margin.top + innerHeight}" x2="${width - margin.right}" y2="${margin.top + innerHeight}" class="chart-axis-line" />
      <path d="${path}" class="chart-line-path" />
      ${circles}
      ${xLabels}
      <text x="${width / 2}" y="${height - 4}" text-anchor="middle" class="chart-axis-label">Date</text>
      <text
        x="18"
        y="${height / 2}"
        text-anchor="middle"
        transform="rotate(-90 18 ${height / 2})"
        class="chart-axis-label"
      >
        ${escapeHtml(yLabel)}
      </text>
    </svg>
  `;
}

function buildBarChartSvg(points, { ariaLabel, yLabel, valueFormatter }) {
  const width = 640;
  const height = 260;
  const margin = { top: 18, right: 24, bottom: 52, left: 72 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;
  const maxValue = getNiceMax(points.map((point) => point.value));
  const ticks = getYAxisTicks(maxValue);
  const barWidth = innerWidth / Math.max(points.length, 1) * 0.66;
  const gap = innerWidth / Math.max(points.length, 1);
  const labelIndices = getLabelIndices(points.length, 5);
  const xPosition = (index) => margin.left + gap * index + (gap - barWidth) / 2;
  const yPosition = (value) => margin.top + innerHeight - (value / maxValue) * innerHeight;

  const gridLines = ticks
    .map((tick) => {
      const y = yPosition(tick);
      return `
        <line x1="${margin.left}" y1="${y}" x2="${width - margin.right}" y2="${y}" class="chart-grid-line" />
        <text x="${margin.left - 10}" y="${y + 4}" class="chart-tick-label">${escapeHtml(
          valueFormatter(tick),
        )}</text>
      `;
    })
    .join("");

  const bars = points
    .map((point, index) => {
      const x = xPosition(index);
      const y = yPosition(point.value);
      const barHeight = margin.top + innerHeight - y;
      return `
        <rect x="${x}" y="${y}" width="${barWidth}" height="${barHeight}" rx="8" class="chart-bar">
          <title>${escapeHtml(`${formatLongDate(point.date)}: ${valueFormatter(point.value)}`)}</title>
        </rect>
      `;
    })
    .join("");

  const xLabels = points
    .map((point, index) => {
      if (!labelIndices.has(index)) {
        return "";
      }
      return `
        <text x="${xPosition(index) + barWidth / 2}" y="${height - 18}" text-anchor="middle" class="chart-tick-label">
          ${escapeHtml(formatShortDate(point.date))}
        </text>
      `;
    })
    .join("");

  return `
    <svg class="chart-svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="${escapeHtml(ariaLabel)}">
      ${gridLines}
      <line x1="${margin.left}" y1="${margin.top}" x2="${margin.left}" y2="${margin.top + innerHeight}" class="chart-axis-line" />
      <line x1="${margin.left}" y1="${margin.top + innerHeight}" x2="${width - margin.right}" y2="${margin.top + innerHeight}" class="chart-axis-line" />
      ${bars}
      ${xLabels}
      <text x="${width / 2}" y="${height - 4}" text-anchor="middle" class="chart-axis-label">Date</text>
      <text
        x="22"
        y="${height / 2}"
        text-anchor="middle"
        transform="rotate(-90 22 ${height / 2})"
        class="chart-axis-label"
      >
        ${escapeHtml(yLabel)}
      </text>
    </svg>
  `;
}

function renderChickens() {
  elements.chickensList.innerHTML = "";

  if (state.loading.chickens && state.chickens.length === 0) {
    renderChickenLoading();
    elements.chickensEmpty.classList.add("hidden");
    return;
  }

  const chickens = getVisibleChickens();
  if (chickens.length === 0) {
    elements.chickensEmpty.classList.remove("hidden");
    elements.chickensEmpty.textContent = getEmptyStateText("chicken");
    return;
  }

  elements.chickensEmpty.classList.add("hidden");

  for (const chicken of chickens) {
    const item = document.createElement("li");
    item.className = "item-card";
    item.innerHTML = `
      <div class="item-card-main">
        <strong>${escapeHtml(chicken.name)}</strong>
        <span class="item-meta">${escapeHtml(chicken.breed || "Breed not set")}</span>
      </div>
      <div class="item-actions">
        <button type="button" class="button button-secondary button-small" data-action="edit">Edit</button>
        <button type="button" class="button button-secondary button-small button-danger" data-action="delete">
          Delete
        </button>
      </div>
    `;
    item.querySelector('[data-action="edit"]').addEventListener("click", () => startChickenEdit(chicken.id));
    item.querySelector('[data-action="delete"]').addEventListener("click", () => handleChickenDelete(chicken.id));
    elements.chickensList.appendChild(item);
  }
}

function renderEggs() {
  elements.eggsList.innerHTML = "";

  if (state.loading.eggs && state.eggs.length === 0) {
    renderTableLoading(elements.eggsList, 4);
    elements.eggsEmpty.classList.add("hidden");
    return;
  }

  const eggs = getVisibleEggs();
  if (eggs.length === 0) {
    elements.eggsEmpty.classList.remove("hidden");
    elements.eggsEmpty.textContent = getEmptyStateText("egg");
    return;
  }

  elements.eggsEmpty.classList.add("hidden");

  for (const egg of eggs) {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${escapeHtml(formatLongDate(egg.date))}</td>
      <td>${egg.count}</td>
      <td>${escapeHtml(getChickenName(egg.chicken_id))}</td>
      <td class="table-actions"></td>
    `;

    const actionsCell = row.querySelector(".table-actions");
    actionsCell.appendChild(createActionButton("Edit", () => startEggEdit(egg.id)));
    actionsCell.appendChild(createActionButton("Delete", () => handleEggDelete(egg.id), true));
    elements.eggsList.appendChild(row);
  }
}

function renderFeedRecords() {
  elements.feedList.innerHTML = "";

  if (state.loading.feed && state.feedRecords.length === 0) {
    renderTableLoading(elements.feedList, 6);
    elements.feedEmpty.classList.add("hidden");
    return;
  }

  const feedRecords = getVisibleFeedRecords();
  if (feedRecords.length === 0) {
    elements.feedEmpty.classList.remove("hidden");
    elements.feedEmpty.textContent = getEmptyStateText("feed");
    return;
  }

  elements.feedEmpty.classList.add("hidden");

  for (const feedRecord of feedRecords) {
    const chickenLabel = feedRecord.chicken_id ? getChickenName(feedRecord.chicken_id) : "General coop";
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${escapeHtml(formatLongDate(feedRecord.date))}</td>
      <td>${escapeHtml(feedRecord.feed_type)}</td>
      <td>${escapeHtml(formatNumber(feedRecord.amount))}</td>
      <td>${feedRecord.cost == null ? "-" : escapeHtml(formatCurrency(feedRecord.cost))}</td>
      <td>${escapeHtml(chickenLabel)}</td>
      <td class="table-actions"></td>
    `;

    const actionsCell = row.querySelector(".table-actions");
    actionsCell.appendChild(createActionButton("Edit", () => startFeedEdit(feedRecord.id)));
    actionsCell.appendChild(createActionButton("Delete", () => handleFeedDelete(feedRecord.id), true));
    elements.feedList.appendChild(row);
  }
}

function renderExpenses() {
  elements.expensesList.innerHTML = "";

  if (state.loading.expenses && state.expenses.length === 0) {
    renderTableLoading(elements.expensesList, 5);
    elements.expensesEmpty.classList.add("hidden");
    return;
  }

  const expenses = getVisibleExpenses();
  if (expenses.length === 0) {
    elements.expensesEmpty.classList.remove("hidden");
    elements.expensesEmpty.textContent = getEmptyStateText("expense");
    return;
  }

  elements.expensesEmpty.classList.add("hidden");

  for (const expense of expenses) {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${escapeHtml(formatLongDate(expense.date))}</td>
      <td>${escapeHtml(expense.category)}</td>
      <td>${escapeHtml(expense.description || "-")}</td>
      <td>${escapeHtml(formatCurrency(expense.amount))}</td>
      <td class="table-actions"></td>
    `;

    const actionsCell = row.querySelector(".table-actions");
    actionsCell.appendChild(createActionButton("Edit", () => startExpenseEdit(expense.id)));
    actionsCell.appendChild(createActionButton("Delete", () => handleExpenseDelete(expense.id), true));
    elements.expensesList.appendChild(row);
  }
}

function renderCleaningLogs() {
  elements.cleaningList.innerHTML = "";

  if (state.loading.cleaning && state.cleaningLogs.length === 0) {
    renderTableLoading(elements.cleaningList, 5);
    elements.cleaningEmpty.classList.add("hidden");
    return;
  }

  const cleaningLogs = getVisibleCleaningLogs();
  if (cleaningLogs.length === 0) {
    elements.cleaningEmpty.classList.remove("hidden");
    elements.cleaningEmpty.textContent = getEmptyStateText("cleaning");
    return;
  }

  elements.cleaningEmpty.classList.add("hidden");

  for (const cleaningLog of cleaningLogs) {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${escapeHtml(formatLongDate(cleaningLog.date))}</td>
      <td>${escapeHtml(cleaningLog.task_type)}</td>
      <td>${escapeHtml(cleaningLog.notes || "-")}</td>
      <td>${cleaningLog.cost == null ? "-" : escapeHtml(formatCurrency(cleaningLog.cost))}</td>
      <td class="table-actions"></td>
    `;

    const actionsCell = row.querySelector(".table-actions");
    actionsCell.appendChild(createActionButton("Edit", () => startCleaningEdit(cleaningLog.id)));
    actionsCell.appendChild(
      createActionButton("Delete", () => handleCleaningDelete(cleaningLog.id), true),
    );
    elements.cleaningList.appendChild(row);
  }
}

function renderChickenLoading() {
  const placeholderCount = 3;
  for (let index = 0; index < placeholderCount; index += 1) {
    const item = document.createElement("li");
    item.className = "item-card loading-card";
    item.innerHTML = `
      <div class="item-card-main">
        <span class="skeleton-line skeleton-line-title"></span>
        <span class="skeleton-line"></span>
      </div>
      <div class="item-actions">
        <span class="skeleton-pill"></span>
      </div>
    `;
    elements.chickensList.appendChild(item);
  }
}

function renderTableLoading(tbody, columnCount) {
  const rowCount = 3;
  for (let rowIndex = 0; rowIndex < rowCount; rowIndex += 1) {
    const row = document.createElement("tr");
    row.className = "loading-row";
    row.innerHTML = Array.from({ length: columnCount })
      .map(() => '<td><span class="skeleton-line"></span></td>')
      .join("");
    tbody.appendChild(row);
  }
}

function renderAlertLoading() {
  const placeholderCount = 2;
  for (let index = 0; index < placeholderCount; index += 1) {
    const item = document.createElement("li");
    item.className = "alert-item loading-card";
    item.innerHTML = `
      <div class="alert-copy">
        <span class="skeleton-line skeleton-line-title"></span>
        <span class="skeleton-line"></span>
      </div>
      <div class="table-actions">
        <span class="skeleton-pill"></span>
      </div>
    `;
    elements.alertsList.appendChild(item);
  }
}

function createActionButton(label, handler, isDanger = false) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = `button button-secondary button-small${isDanger ? " button-danger" : ""}`;
  button.textContent = label;
  button.addEventListener("click", handler);
  return button;
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
    return;
  }

  if (state.chickens.length === 0) {
    addSelectOption(elements.eggChickenSelect, "", "Add a chicken first");
    setFormFieldsEnabled(elements.eggForm, false);
    return;
  }

  for (const chicken of getVisibleChickens().reverse()) {
    addSelectOption(elements.eggChickenSelect, String(chicken.id), getChickenSelectLabel(chicken));
  }

  elements.eggChickenSelect.value =
    findMatchingSelectValue(elements.eggChickenSelect, selectedValue) ||
    elements.eggChickenSelect.options[0]?.value ||
    "";
  setFormFieldsEnabled(elements.eggForm, true);
}

function renderFeedChickenOptions() {
  const selectedValue = elements.feedChickenSelect.value;
  elements.feedChickenSelect.innerHTML = "";
  addSelectOption(elements.feedChickenSelect, "", "General coop");

  for (const chicken of getVisibleChickens().reverse()) {
    addSelectOption(elements.feedChickenSelect, String(chicken.id), getChickenSelectLabel(chicken));
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
  setFormOpen("chicken", false);
}

function resetEggForm() {
  state.editing.eggId = null;
  elements.eggForm.reset();
  elements.eggFormTitle.textContent = "Add Egg Record";
  elements.eggSubmitButton.textContent = "Save Egg Record";
  elements.eggCancelButton.classList.add("hidden");
  elements.eggForm.elements.count.value = "";
  elements.eggForm.elements.date.value = new Date().toISOString().slice(0, 10);
  setFormOpen("egg", false);
  renderEggChickenOptions();
}

function resetFeedForm() {
  state.editing.feedId = null;
  elements.feedForm.reset();
  elements.feedFormTitle.textContent = "Add Feed Record";
  elements.feedSubmitButton.textContent = "Save Feed Record";
  elements.feedCancelButton.classList.add("hidden");
  elements.feedForm.elements.date.value = new Date().toISOString().slice(0, 10);
  elements.feedChickenSelect.value = "";
  setFormOpen("feed", false);
  renderFeedChickenOptions();
}

function resetExpenseForm() {
  state.editing.expenseId = null;
  elements.expenseForm.reset();
  elements.expenseFormTitle.textContent = "Add Expense";
  elements.expenseSubmitButton.textContent = "Save Expense";
  elements.expenseCancelButton.classList.add("hidden");
  elements.expenseForm.elements.date.value = new Date().toISOString().slice(0, 10);
  setFormOpen("expense", false);
}

function resetCleaningForm() {
  state.editing.cleaningId = null;
  elements.cleaningForm.reset();
  elements.cleaningFormTitle.textContent = "Add Cleaning Log";
  elements.cleaningSubmitButton.textContent = "Save Cleaning Log";
  elements.cleaningCancelButton.classList.add("hidden");
  elements.cleaningForm.elements.date.value = new Date().toISOString().slice(0, 10);
  setFormOpen("cleaning", false);
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
  setFormOpen("chicken", true);
  hideResourceNotice("chicken");
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
  setFormOpen("egg", true);
  hideResourceNotice("egg");
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
  elements.feedForm.elements.cost.value = feedRecord.cost == null ? "" : String(feedRecord.cost);
  elements.feedChickenSelect.value = feedRecord.chicken_id == null ? "" : String(feedRecord.chicken_id);
  elements.feedFormTitle.textContent = "Edit Feed Record";
  elements.feedSubmitButton.textContent = "Update Feed Record";
  elements.feedCancelButton.classList.remove("hidden");
  setFormOpen("feed", true);
  hideResourceNotice("feed");
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
  setFormOpen("expense", true);
  hideResourceNotice("expense");
}

function startCleaningEdit(cleaningId) {
  const cleaningLog = state.cleaningLogs.find((item) => item.id === cleaningId);
  if (!cleaningLog) {
    return;
  }

  state.editing.cleaningId = cleaningLog.id;
  elements.cleaningForm.elements.date.value = cleaningLog.date;
  elements.cleaningForm.elements.task_type.value = cleaningLog.task_type;
  elements.cleaningForm.elements.notes.value = cleaningLog.notes || "";
  elements.cleaningForm.elements.cost.value = cleaningLog.cost == null ? "" : String(cleaningLog.cost);
  elements.cleaningFormTitle.textContent = "Edit Cleaning Log";
  elements.cleaningSubmitButton.textContent = "Update Cleaning Log";
  elements.cleaningCancelButton.classList.remove("hidden");
  setFormOpen("cleaning", true);
  hideResourceNotice("cleaning");
}

async function loadChickens() {
  state.loading.chickens = true;
  setStatus(elements.chickensStatus, "Loading...");
  hideMessage(elements.chickensError);
  renderChickens();
  refreshDashboard();

  try {
    state.chickens = await api.getChickens();
    renderChickenOptions();
    renderChickens();
    renderEggs();
    renderFeedRecords();
    setStatus(elements.chickensStatus, `${state.chickens.length} loaded`);
  } catch (error) {
    state.chickens = [];
    renderChickenOptions();
    renderChickens();
    renderEggs();
    renderFeedRecords();
    setStatus(elements.chickensStatus, "Unavailable");
    showMessage(elements.chickensError, error.message, "error");
  } finally {
    state.loading.chickens = false;
    renderChickens();
    renderEggs();
    renderFeedRecords();
    refreshDashboard();
    if (!elements.chickensError.textContent) {
      setStatus(elements.chickensStatus, `${state.chickens.length} loaded`);
    }
  }
}

async function loadEggs() {
  state.loading.eggs = true;
  setStatus(elements.eggsStatus, "Loading...");
  hideMessage(elements.eggsError);
  renderEggs();
  renderEggChart();
  refreshDashboard();

  try {
    state.eggs = await api.getEggs();
    renderEggs();
    setStatus(elements.eggsStatus, `${getVisibleEggs().length} shown`);
  } catch (error) {
    state.eggs = [];
    renderEggs();
    setStatus(elements.eggsStatus, "Unavailable");
    showMessage(elements.eggsError, error.message, "error");
  } finally {
    state.loading.eggs = false;
    renderEggs();
    refreshDashboard();
    if (!elements.eggsError.textContent) {
      setStatus(elements.eggsStatus, `${getVisibleEggs().length} shown`);
    }
  }
}

async function loadFeedRecords() {
  state.loading.feed = true;
  setStatus(elements.feedStatus, "Loading...");
  hideMessage(elements.feedError);
  renderFeedRecords();

  try {
    state.feedRecords = await api.getFeedRecords();
    renderFeedRecords();
    setStatus(elements.feedStatus, `${getVisibleFeedRecords().length} shown`);
  } catch (error) {
    state.feedRecords = [];
    renderFeedRecords();
    setStatus(elements.feedStatus, "Unavailable");
    showMessage(elements.feedError, error.message, "error");
  } finally {
    state.loading.feed = false;
    renderFeedRecords();
    if (!elements.feedError.textContent) {
      setStatus(elements.feedStatus, `${getVisibleFeedRecords().length} shown`);
    }
  }
}

async function loadExpenses() {
  state.loading.expenses = true;
  setStatus(elements.expensesStatus, "Loading...");
  hideMessage(elements.expensesError);
  renderExpenses();
  renderExpenseChart();
  refreshDashboard();

  try {
    state.expenses = await api.getExpenses();
    renderExpenses();
    setStatus(elements.expensesStatus, `${getVisibleExpenses().length} shown`);
  } catch (error) {
    state.expenses = [];
    renderExpenses();
    setStatus(elements.expensesStatus, "Unavailable");
    showMessage(elements.expensesError, error.message, "error");
  } finally {
    state.loading.expenses = false;
    renderExpenses();
    refreshDashboard();
    if (!elements.expensesError.textContent) {
      setStatus(elements.expensesStatus, `${getVisibleExpenses().length} shown`);
    }
  }
}

async function loadCleaningLogs() {
  state.loading.cleaning = true;
  setStatus(elements.cleaningStatus, "Loading...");
  hideMessage(elements.cleaningError);
  renderCleaningLogs();
  refreshDashboard();

  try {
    state.cleaningLogs = await api.getCleaningLogs();
    renderCleaningLogs();
    setStatus(elements.cleaningStatus, `${getVisibleCleaningLogs().length} shown`);
  } catch (error) {
    state.cleaningLogs = [];
    renderCleaningLogs();
    setStatus(elements.cleaningStatus, "Unavailable");
    showMessage(elements.cleaningError, error.message, "error");
  } finally {
    state.loading.cleaning = false;
    renderCleaningLogs();
    refreshDashboard();
    if (!elements.cleaningError.textContent) {
      setStatus(elements.cleaningStatus, `${getVisibleCleaningLogs().length} shown`);
    }
  }
}

async function loadAlerts() {
  state.loading.alerts = true;
  setStatus(elements.alertsStatus, "Loading...");
  hideMessage(elements.alertsError);
  renderAlerts();

  try {
    state.alerts = await api.getAlerts();
    renderAlerts();
    setStatus(elements.alertsStatus, state.alerts.length ? `${state.alerts.length} active` : "All clear");
  } catch (error) {
    state.alerts = [];
    renderAlerts();
    setStatus(elements.alertsStatus, "Unavailable");
    showMessage(elements.alertsError, error.message, "error");
  } finally {
    state.loading.alerts = false;
    renderAlerts();
    if (!elements.alertsError.textContent) {
      setStatus(elements.alertsStatus, state.alerts.length ? `${state.alerts.length} active` : "All clear");
    }
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
  hideResourceNotice("chicken");

  const isEditing = state.editing.chickenId !== null;
  elements.chickenSubmitButton.disabled = true;
  elements.chickenSubmitButton.textContent = isEditing ? "Saving..." : "Saving...";

  const formData = new FormData(elements.chickenForm);
  const payload = {
    name: String(formData.get("name") || "").trim(),
    breed: String(formData.get("breed") || "").trim() || null,
  };

  try {
    if (isEditing) {
      await api.updateChicken(state.editing.chickenId, payload);
    } else {
      await api.createChicken(payload);
    }

    await loadChickens();
    resetChickenForm();
    showResourceNotice("chicken", "Saved successfully.", "success");
  } catch (error) {
    showResourceNotice("chicken", error.message, "error");
  } finally {
    elements.chickenSubmitButton.disabled = false;
    elements.chickenSubmitButton.textContent =
      state.editing.chickenId !== null ? "Update Chicken" : "Save Chicken";
  }
}

async function handleEggSubmit(event) {
  event.preventDefault();
  hideResourceNotice("egg");

  const isEditing = state.editing.eggId !== null;
  elements.eggSubmitButton.disabled = true;
  elements.eggSubmitButton.textContent = "Saving...";

  const formData = new FormData(elements.eggForm);
  const payload = {
    date: String(formData.get("date") || ""),
    count: Number(formData.get("count") || 0),
    chicken_id: Number(formData.get("chicken_id")),
  };

  try {
    if (isEditing) {
      await api.updateEgg(state.editing.eggId, payload);
    } else {
      await api.createEgg(payload);
    }

    await Promise.all([loadEggs(), loadAlerts()]);
    resetEggForm();
    showResourceNotice("egg", "Saved successfully.", "success");
  } catch (error) {
    showResourceNotice("egg", error.message, "error");
  } finally {
    elements.eggSubmitButton.disabled = false;
    elements.eggSubmitButton.textContent =
      state.editing.eggId !== null ? "Update Egg Record" : "Save Egg Record";
  }
}

async function handleFeedSubmit(event) {
  event.preventDefault();
  hideResourceNotice("feed");

  const isEditing = state.editing.feedId !== null;
  elements.feedSubmitButton.disabled = true;
  elements.feedSubmitButton.textContent = "Saving...";

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
    } else {
      await api.createFeedRecord(payload);
    }

    await Promise.all([loadFeedRecords(), loadAlerts()]);
    resetFeedForm();
    showResourceNotice("feed", "Saved successfully.", "success");
  } catch (error) {
    showResourceNotice("feed", error.message, "error");
  } finally {
    elements.feedSubmitButton.disabled = false;
    elements.feedSubmitButton.textContent =
      state.editing.feedId !== null ? "Update Feed Record" : "Save Feed Record";
  }
}

async function handleExpenseSubmit(event) {
  event.preventDefault();
  hideResourceNotice("expense");

  const isEditing = state.editing.expenseId !== null;
  elements.expenseSubmitButton.disabled = true;
  elements.expenseSubmitButton.textContent = "Saving...";

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
    } else {
      await api.createExpense(payload);
    }

    await loadExpenses();
    resetExpenseForm();
    showResourceNotice("expense", "Saved successfully.", "success");
  } catch (error) {
    showResourceNotice("expense", error.message, "error");
  } finally {
    elements.expenseSubmitButton.disabled = false;
    elements.expenseSubmitButton.textContent =
      state.editing.expenseId !== null ? "Update Expense" : "Save Expense";
  }
}

async function handleCleaningSubmit(event) {
  event.preventDefault();
  hideResourceNotice("cleaning");

  const isEditing = state.editing.cleaningId !== null;
  elements.cleaningSubmitButton.disabled = true;
  elements.cleaningSubmitButton.textContent = "Saving...";

  const formData = new FormData(elements.cleaningForm);
  const payload = {
    date: String(formData.get("date") || ""),
    task_type: String(formData.get("task_type") || "").trim(),
    notes: String(formData.get("notes") || "").trim() || null,
    cost: parseOptionalNumber(formData.get("cost")),
  };

  try {
    if (isEditing) {
      await api.updateCleaningLog(state.editing.cleaningId, payload);
    } else {
      await api.createCleaningLog(payload);
    }

    await Promise.all([loadCleaningLogs(), loadAlerts()]);
    resetCleaningForm();
    showResourceNotice("cleaning", "Saved successfully.", "success");
  } catch (error) {
    showResourceNotice("cleaning", error.message, "error");
  } finally {
    elements.cleaningSubmitButton.disabled = false;
    elements.cleaningSubmitButton.textContent =
      state.editing.cleaningId !== null ? "Update Cleaning Log" : "Save Cleaning Log";
  }
}

async function handleChickenDelete(chickenId) {
  if (!window.confirm("Delete this chicken?")) {
    return;
  }

  hideResourceNotice("chicken");
  try {
    await api.deleteChicken(chickenId);
    if (state.editing.chickenId === chickenId) {
      resetChickenForm();
    }
    await loadChickens();
    showResourceNotice("chicken", "Deleted successfully.", "success");
  } catch (error) {
    showResourceNotice("chicken", error.message, "error");
  }
}

async function handleEggDelete(eggId) {
  if (!window.confirm("Delete this egg record?")) {
    return;
  }

  hideResourceNotice("egg");
  try {
    await api.deleteEgg(eggId);
    if (state.editing.eggId === eggId) {
      resetEggForm();
    }
    await Promise.all([loadEggs(), loadAlerts()]);
    showResourceNotice("egg", "Deleted successfully.", "success");
  } catch (error) {
    showResourceNotice("egg", error.message, "error");
  }
}

async function handleFeedDelete(feedId) {
  if (!window.confirm("Delete this feed record?")) {
    return;
  }

  hideResourceNotice("feed");
  try {
    await api.deleteFeedRecord(feedId);
    if (state.editing.feedId === feedId) {
      resetFeedForm();
    }
    await Promise.all([loadFeedRecords(), loadAlerts()]);
    showResourceNotice("feed", "Deleted successfully.", "success");
  } catch (error) {
    showResourceNotice("feed", error.message, "error");
  }
}

async function handleExpenseDelete(expenseId) {
  if (!window.confirm("Delete this expense?")) {
    return;
  }

  hideResourceNotice("expense");
  try {
    await api.deleteExpense(expenseId);
    if (state.editing.expenseId === expenseId) {
      resetExpenseForm();
    }
    await loadExpenses();
    showResourceNotice("expense", "Deleted successfully.", "success");
  } catch (error) {
    showResourceNotice("expense", error.message, "error");
  }
}

async function handleCleaningDelete(cleaningId) {
  if (!window.confirm("Delete this cleaning log?")) {
    return;
  }

  hideResourceNotice("cleaning");
  try {
    await api.deleteCleaningLog(cleaningId);
    if (state.editing.cleaningId === cleaningId) {
      resetCleaningForm();
    }
    await Promise.all([loadCleaningLogs(), loadAlerts()]);
    showResourceNotice("cleaning", "Deleted successfully.", "success");
  } catch (error) {
    showResourceNotice("cleaning", error.message, "error");
  }
}

async function handleAlertMarkRead(alertId) {
  hideMessage(elements.alertsNotice);
  try {
    await api.markAlertAsRead(alertId);
    await loadAlerts();
    showMessage(elements.alertsNotice, "Alert marked as read.", "success");
  } catch (error) {
    showMessage(elements.alertsError, error.message, "error");
  }
}

async function handleAlertDelete(alertId) {
  if (!window.confirm("Delete this alert?")) {
    return;
  }

  hideMessage(elements.alertsNotice);
  try {
    await api.deleteAlert(alertId);
    await loadAlerts();
    showMessage(elements.alertsNotice, "Alert deleted.", "success");
  } catch (error) {
    showMessage(elements.alertsError, error.message, "error");
  }
}

function getNiceMax(values) {
  const rawMax = Math.max(...values, 1);
  const magnitude = 10 ** Math.floor(Math.log10(rawMax));
  const normalized = rawMax / magnitude;
  let niceNormalized = 1;
  if (normalized > 5) {
    niceNormalized = 10;
  } else if (normalized > 2) {
    niceNormalized = 5;
  } else if (normalized > 1) {
    niceNormalized = 2;
  }
  return niceNormalized * magnitude;
}

function getYAxisTicks(maxValue) {
  const steps = 4;
  return Array.from({ length: steps + 1 }, (_, index) => (maxValue / steps) * index);
}

function getLabelIndices(length, maxLabels) {
  if (length <= maxLabels) {
    return new Set(Array.from({ length }, (_, index) => index));
  }

  const indices = new Set();
  const step = Math.max(1, Math.floor((length - 1) / (maxLabels - 1)));
  for (let index = 0; index < length; index += step) {
    indices.add(index);
  }
  indices.add(length - 1);
  return indices;
}

function parseOptionalNumber(value) {
  const parsedValue = String(value || "").trim();
  return parsedValue ? Number(parsedValue) : null;
}

function formatAverage(value) {
  return Number(value || 0).toFixed(2);
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
  const date = parseDateString(value);
  if (!date) {
    return value;
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function formatLongDate(value) {
  const date = parseDateString(value);
  if (!date) {
    return value;
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatDateTime(value) {
  const date = parseDateString(value);
  if (!date) {
    return value;
  }

  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function capitalize(value) {
  const text = String(value || "");
  return text ? text[0].toUpperCase() + text.slice(1) : text;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
