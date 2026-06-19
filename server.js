const http = require("http");
const fs = require("fs");
const path = require("path");
const {
  buildSystemPrompt,
  buildUserPrompt,
  supportedLanguages
} = require("./translation-contract");

loadConfigurationFiles();

const PORT = Number(process.env.PORT || 3000);
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_BASE_URL = process.env.OPENAI_BASE_URL || inferBaseUrl(OPENAI_API_KEY);
const OPENAI_MODEL = process.env.OPENAI_MODEL || defaultModelForBaseUrl(OPENAI_BASE_URL);
const ROOT = __dirname;
const PORT_SEARCH_LIMIT = 10;

const CONTENT_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".txt": "text/plain; charset=utf-8"
};

const supportedLanguageSet = new Set(supportedLanguages);

const server = http.createServer(async (request, response) => {
  try {
    if (request.method === "OPTIONS") {
      sendCors(response);
      response.writeHead(204);
      response.end();
      return;
    }

    if (request.url === "/api/health") {
      sendJson(response, 200, {
        ok: true,
        aiConfigured: Boolean(OPENAI_API_KEY),
        model: OPENAI_MODEL
      });
      return;
    }

    if (request.url === "/api/translate" && request.method === "POST") {
      const payload = await readJsonBody(request);
      const result = await translateWithOpenAI(payload);
      sendJson(response, 200, result);
      return;
    }

    serveStatic(request, response);
  } catch (error) {
    const status = error.statusCode || 500;
    sendJson(response, status, {
      error: error.message || "Unexpected server error"
    });
  }
});

startServer(PORT);

async function translateWithOpenAI(payload) {
  validateTranslatePayload(payload);

  if (!OPENAI_API_KEY) {
    const error = new Error("OPENAI_API_KEY is not configured. Create api.properties and restart the server.");
    error.statusCode = 503;
    throw error;
  }

  const response = await fetch(`${OPENAI_BASE_URL.replace(/\/$/, "")}/chat/completions`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${OPENAI_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      messages: [
        {
          role: "system",
          content: buildSystemPrompt(payload)
        },
        {
          role: "user",
          content: buildUserPrompt(payload)
        }
      ],
      temperature: 0,
      response_format: {
        type: "json_object"
      }
    })
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = data.error?.message || `OpenAI request failed with status ${response.status}`;
    const error = new Error(message);
    error.statusCode = response.status;
    throw error;
  }

  const parsed = parseStructuredOutput(data);
  return {
    detectedLanguage: parsed.detectedLanguage || payload.sourceLanguage,
    requiredDependencies: parsed.requiredDependencies || [],
    compatibilityNotes: parsed.compatibilityNotes || [],
    translatedCode: parsed.translatedCode || ""
  };
}

function validateTranslatePayload(payload) {
  if (!payload || typeof payload !== "object") {
    const error = new Error("Request body must be JSON.");
    error.statusCode = 400;
    throw error;
  }

  if (!payload.sourceCode || typeof payload.sourceCode !== "string") {
    const error = new Error("sourceCode is required.");
    error.statusCode = 400;
    throw error;
  }

  if (!payload.targetLanguage || !supportedLanguageSet.has(payload.targetLanguage)) {
    const error = new Error("targetLanguage is required and must be supported.");
    error.statusCode = 400;
    throw error;
  }
}

function parseStructuredOutput(data) {
  const content = data.choices?.[0]?.message?.content;

  if (typeof content !== "string" || !content.trim()) {
    throw new Error("Translation response did not contain structured output.");
  }

  const cleaned = content.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  return JSON.parse(cleaned);
}

function serveStatic(request, response) {
  const url = new URL(request.url, `http://${request.headers.host}`);
  const requestedPath = url.pathname === "/" ? "/index.html" : url.pathname;
  const filePath = path.normalize(path.join(ROOT, requestedPath));

  if (!filePath.startsWith(ROOT)) {
    response.writeHead(403);
    response.end("Forbidden");
    return;
  }

  fs.readFile(filePath, (error, content) => {
    if (error) {
      response.writeHead(404);
      response.end("Not found");
      return;
    }

    const extension = path.extname(filePath);
    response.writeHead(200, {
      "Content-Type": CONTENT_TYPES[extension] || "application/octet-stream"
    });
    response.end(content);
  });
}

function readJsonBody(request) {
  return new Promise((resolve, reject) => {
    let body = "";

    request.on("data", (chunk) => {
      body += chunk;
      if (body.length > 1_000_000) {
        const error = new Error("Request body is too large.");
        error.statusCode = 413;
        reject(error);
        request.destroy();
      }
    });

    request.on("end", () => {
      try {
        resolve(JSON.parse(body || "{}"));
      } catch {
        const error = new Error("Invalid JSON body.");
        error.statusCode = 400;
        reject(error);
      }
    });

    request.on("error", reject);
  });
}

function sendJson(response, statusCode, payload) {
  sendCors(response);
  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8"
  });
  response.end(JSON.stringify(payload));
}

function sendCors(response) {
  response.setHeader("Access-Control-Allow-Origin", "*");
  response.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  response.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

function loadConfigurationFiles() {
  loadKeyValueFile(path.join(__dirname, "api.properties"));
  loadKeyValueFile(path.join(__dirname, ".env"));
}

function loadKeyValueFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return;
  }

  const lines = fs.readFileSync(filePath, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) {
      continue;
    }

    const index = trimmed.indexOf("=");
    const key = trimmed.slice(0, index).trim();
    const value = trimmed.slice(index + 1).trim().replace(/^["']|["']$/g, "");

    if (key && !process.env[key]) {
      process.env[key] = value;
    }
  }
}

function inferBaseUrl(apiKey) {
  if (apiKey && apiKey.startsWith("gsk_")) {
    return "https://api.groq.com/openai/v1";
  }

  return "https://api.openai.com/v1";
}

function defaultModelForBaseUrl(baseUrl) {
  if (baseUrl.includes("api.groq.com")) {
    return "llama-3.3-70b-versatile";
  }

  return "gpt-4.1-mini";
}

function startServer(preferredPort, retries = 0) {
  const portToTry = preferredPort + retries;

  server.listen(portToTry, () => {
    console.log(`CodeLingo server running at http://localhost:${portToTry}`);
    if (!OPENAI_API_KEY) {
      console.log("OPENAI_API_KEY is missing. Add it to api.properties to enable AI translation.");
    } else {
      console.log(`Translation provider: ${OPENAI_BASE_URL}`);
      console.log(`Translation model: ${OPENAI_MODEL}`);
    }
  });

  server.once("error", (error) => {
    if (error.code === "EADDRINUSE" && retries < PORT_SEARCH_LIMIT) {
      server.removeAllListeners("error");
      startServer(preferredPort, retries + 1);
      return;
    }

    console.error(error);
    process.exit(1);
  });
}
