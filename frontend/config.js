(function () {
  const existingConfig = window.CoopKeeperConfig || {};
  const hostname = window.location.hostname;
  const isLocalHost =
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "[::1]" ||
    hostname === "";
  const defaultApiBaseUrl = isLocalHost ? "http://127.0.0.1:8000" : "https://api.coopkeeper.net";

  window.CoopKeeperConfig = {
    apiBaseUrl: existingConfig.apiBaseUrl || defaultApiBaseUrl,
    docsUrl: existingConfig.docsUrl || (isLocalHost ? `${defaultApiBaseUrl}/docs` : ""),
  };
})();
