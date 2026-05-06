const http = require("http");

const PORT = process.env.PORT || 3000;
const VERSION = process.env.APP_VERSION || "1.0.0";

const server = http.createServer((req, res) => {
  if (req.url === "/health") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ status: "ok", version: VERSION }));
    return;
  }

  res.writeHead(200, { "Content-Type": "text/html" });
  res.end(`
    <!DOCTYPE html>
    <html>
      <head><title>Node CI/CD Demo</title></head>
      <body>
        <h1>Hello from Coimbatore !!</h1>
        <p>Version: <strong>${VERSION}</strong></p>
        <p>Running inside Docker &amp; deployed via GitHub Actions.</p>
      </body>
    </html>
  `);
});

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
