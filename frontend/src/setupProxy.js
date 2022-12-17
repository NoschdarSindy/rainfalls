const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function (app) {
  const pathFilter = (path, req) => {
    return (
      !["js", "json", "map"].includes(path.split(".").pop()) && // don't send requests of these filetypes to server (used for hot-update)
      req.get("Sec-Fetch-Dest") === "empty"
    );
  };

  app.use(
    createProxyMiddleware(pathFilter, {
      target: process.env.REACT_APP_URL ?? "http://localhost:8080",
      changeOrigin: true,
      logLevel: "error",
    })
  );
};
