const { createProxyMiddleware } = require('http-proxy-middleware');

//Any request that is an extension of "http://localhost:3000/" and is not requesting a file will be interpreted as an API call and redirected to the server
module.exports = function(app) {
    const pathFilter = (path, req) => {
        return path.length > 1 && !path.includes(".")
    }

    app.use(
        createProxyMiddleware(pathFilter, {
            target: 'http://localhost:8080',
            changeOrigin: true,
        })
    );
};