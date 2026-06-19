const supportedLanguages = [
  "Python",
  "JavaScript",
  "TypeScript",
  "Java",
  "Kotlin",
  "C",
  "C++",
  "C#",
  "Go",
  "PHP",
  "Ruby",
  "Swift",
  "Rust",
  "Dart",
  "R"
];

const translationSchema = {
  type: "json_schema",
  name: "code_translation_result",
  strict: true,
  schema: {
    type: "object",
    additionalProperties: false,
    properties: {
      detectedLanguage: { type: "string" },
      requiredDependencies: {
        type: "array",
        items: { type: "string" }
      },
      compatibilityNotes: {
        type: "array",
        items: { type: "string" }
      },
      translatedCode: { type: "string" }
    },
    required: [
      "detectedLanguage",
      "requiredDependencies",
      "compatibilityNotes",
      "translatedCode"
    ]
  }
};

function buildStyleGuidance(style) {
  const guidance = {
    "production-ready": [
      "Prefer idiomatic, maintainable, production-safe code.",
      "Use clear naming, explicit imports, and complete executable structure."
    ],
    "beginner-friendly": [
      "Favor straightforward code paths and simpler constructs when equivalent.",
      "Include helpful comments that explain non-obvious steps without changing behavior."
    ],
    "performance-focused": [
      "Prefer efficient data structures and algorithms when behavior remains unchanged.",
      "Avoid unnecessary allocations, redundant passes, and obvious performance regressions."
    ],
    "framework-neutral": [
      "Avoid framework-specific patterns unless the source code requires them.",
      "Keep the translation portable and dependency-light where possible."
    ]
  };

  return guidance[style] || guidance["production-ready"];
}

function buildSystemPrompt(payload) {
  const styleGuidance = buildStyleGuidance(payload.style).join(" ");

  return [
    payload.systemPrompt || "You are an expert multilingual software engineer and code transpilation specialist.",
    "Translate code with semantic accuracy, not token replacement.",
    "Preserve logic, algorithms, data structures, comments, side effects, input/output behavior, errors, edge cases, and observable behavior.",
    "Return complete executable target-language code with required imports, entry points, dependencies, and compatibility notes.",
    styleGuidance,
    "Return JSON only and make sure the final response is valid JSON with the required keys.",
    "If perfect equivalence is impossible because of undefined behavior, platform APIs, dependencies, or missing context, explain that in compatibilityNotes and produce the closest executable equivalent.",
    "Do not include Markdown fences in translatedCode."
  ].join(" ");
}

function buildUserPrompt(payload) {
  return [
    `Detected source language from frontend: ${payload.sourceLanguage || "Unknown"}`,
    `Target language: ${payload.targetLanguage}`,
    `Style: ${payload.style || "production-ready"}`,
    `Optimize without changing behavior: ${Boolean(payload.options?.optimize)}`,
    `Add helpful comments: ${Boolean(payload.options?.addComments)}`,
    "",
    "Source code:",
    payload.sourceCode
  ].join("\n");
}

module.exports = {
  buildSystemPrompt,
  buildUserPrompt,
  supportedLanguages,
  translationSchema
};