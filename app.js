const languages = [
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

const supportedBraceLanguages = new Set(["JavaScript", "TypeScript", "Java", "Kotlin", "C", "C++", "C#", "Go", "Rust"]);
const cLikeReturnLanguages = new Set(["C", "C++"]);
const singleClosingBraceLanguages = new Set(["Kotlin", "Go", "Rust"]);
const noSemicolonLanguages = new Set(["Kotlin", "Go", "Swift", "Ruby"]);
const localTranslationPairs = new Set([
  "C->Python",
  "C++->Python",
  "Java->Python",
  "JavaScript->Python",
  "C#->Python",
  "Python->JavaScript",
  "Python->TypeScript",
  "Python->Java",
  "Python->Kotlin",
  "Python->C",
  "Python->C++",
  "Python->C#",
  "Python->Go",
  "Python->Rust"
]);

const expertTranslationSystemPrompt = [
  "You are an expert multilingual software engineer and code transpilation specialist.",
  "Automatically detect the source language and translate it to the requested target language.",
  "Preserve behavior, logic, algorithms, data structures, comments, side effects, input/output behavior, error handling, and edge cases.",
  "Generate complete executable, idiomatic, production-ready, syntax-valid target-language code.",
  "Add all required imports, package/library usage, entry points, and dependency notes.",
  "Handle OOP, functional, asynchronous, generic/type-system, memory, module, and language-specific features correctly.",
  "Optimize readability and performance only when behavior is unchanged.",
  "If exact translation is impossible because of missing runtime context, platform APIs, dependencies, or undefined behavior, say so in compatibility notes and choose the closest executable equivalent.",
  "Return: detected language, required dependencies, compatibility notes, and complete translated code."
].join(" ");

const sourceCode = document.getElementById("sourceCode");
const detectedLanguage = document.getElementById("detectedLanguage");
const confidenceText = document.getElementById("confidenceText");
const targetLanguage = document.getElementById("targetLanguage");
const optimizeToggle = document.getElementById("optimizeToggle");
const commentsToggle = document.getElementById("commentsToggle");
const styleSelect = document.getElementById("styleSelect");
const styleButtons = [...styleSelect.querySelectorAll(".mode-button")];
const translateButton = document.getElementById("translateButton");
const translatedOutput = document.getElementById("translatedOutput");
const originalCodeBlock = document.getElementById("originalCodeBlock");
const optimizedCodeBlock = document.getElementById("optimizedCodeBlock");
const optimizationList = document.getElementById("optimizationList");
const statusPill = document.getElementById("statusPill");
const sampleButton = document.getElementById("sampleButton");
const copyReportButton = document.getElementById("copyReportButton");
const copyOutputButton = document.getElementById("copyOutputButton");
let targetOptions = [];

const defaultStyle = "production-ready";
const styleLabels = {
  "production-ready": "Production",
  "beginner-friendly": "Beginner",
  "performance-focused": "Performance",
  "framework-neutral": "Neutral"
};
let selectedStyle = defaultStyle;
const endpointCacheKey = "codeLingoTranslationEndpoint";
const defaultBackendCandidates = (() => {
  const candidates = [];

  if (window.CODE_TRANSLATE_API_URL) {
    candidates.push(window.CODE_TRANSLATE_API_URL);
  }

  if (window.location.origin && window.location.origin !== "null") {
    candidates.push(new URL("/api/translate", window.location.origin).toString());
  }

  candidates.push("http://localhost:3000/api/translate");
  candidates.push("http://127.0.0.1:3000/api/translate");

  for (let port = 3001; port <= 3010; port += 1) {
    candidates.push(`http://localhost:${port}/api/translate`);
    candidates.push(`http://127.0.0.1:${port}/api/translate`);
  }

  return [...new Set(candidates)];
})();

const sampleJava = `public class Main {
  public static void main(String[] args) {
    int[] numbers = {4, 8, 15, 16, 23, 42};
    int total = 0;

    for (int i = 0; i < numbers.length; i++) {
      total = total + numbers[i];
    }

    System.out.println("Total: " + total);
  }
}`;

const detectors = [
  { name: "Python", tests: [[/^\s*def\s+\w+\(/m, 4], [/^\s*from\s+\w+\s+import\s+/m, 4], [/^\s*import\s+\w+/m, 3], [/^\s*print\s*\(/m, 2], [/:\s*(#.*)?$/m, 2], [/\bself\b/, 2]] },
  { name: "JavaScript", tests: [[/\bfunction\s+\w+\(/, 4], [/\bconst\b|\blet\b/, 2], [/console\.log/, 4], [/=>/, 3], [/document\./, 3]] },
  { name: "TypeScript", tests: [[/\binterface\s+\w+/, 5], [/:\s*(string|number|boolean)\b/, 4], [/\btype\s+\w+\s*=/, 5], [/<[^>]+>\s*\(/, 2]] },
  { name: "Java", tests: [[/\bpublic\s+class\b/, 5], [/\bstatic\s+void\s+main\b/, 5], [/System\.out\.println/, 5], [/\bString\[\]\s+args\b/, 4]] },
  { name: "Kotlin", tests: [[/\bfun\s+main\(/, 5], [/\bval\b|\bvar\b/, 2], [/println\(/, 3], [/:\s*(Int|String|Boolean)\b/, 4]] },
  { name: "C++", tests: [[/#include\s*<iostream>/, 5], [/\bstd::/, 4], [/\bcout\s*<</, 5], [/\bvector\s*</, 4]] },
  { name: "C", tests: [[/#include\s*<stdio\.h>/, 5], [/\bprintf\(/, 4], [/\bscanf\(/, 4], [/\bint\s+main\s*\(/, 3]] },
  { name: "C#", tests: [[/\busing\s+System;/, 5], [/\bnamespace\s+\w+/, 3], [/Console\.WriteLine/, 5], [/\bclass\s+\w+/, 2]] },
  { name: "Go", tests: [[/\bpackage\s+main\b/, 5], [/\bfunc\s+main\(/, 5], [/fmt\.Print/, 5], [/\b:=/, 3]] },
  { name: "PHP", tests: [[/<\?php/, 5], [/\$\w+/, 3], [/echo\s+/, 3], [/->/, 2]] },
  { name: "Ruby", tests: [[/\bdef\s+\w+/, 3], [/\bputs\s+/, 4], [/\bend\b/, 3], [/@\w+/, 2]] },
  { name: "Swift", tests: [[/\bfunc\s+\w+\(/, 4], [/\bvar\b|\blet\b/, 2], [/^\s*print\s*\(/m, 1], [/\bimport\s+Foundation\b/, 5]] },
  { name: "Rust", tests: [[/\bfn\s+main\(/, 5], [/\blet\s+mut\b/, 4], [/println!\(/, 5], [/\buse\s+std::/, 4]] },
  { name: "Dart", tests: [[/\bvoid\s+main\s*\(/, 5], [/\bimport\s+['"]dart:/, 5], [/\bfinal\b|\bvar\b/, 2], [/\bprint\s*\(/, 2]] },
  { name: "R", tests: [[/<-/, 4], [/\bfunction\s*\(/, 4], [/\bcat\s*\(/, 3], [/\bprint\s*\(/, 1]] }
];

const typeMap = {
  Python: { int: "", double: "", float: "", char: "", String: "", boolean: "", bool: "" },
  JavaScript: { int: "let", double: "let", float: "let", char: "let", String: "let", boolean: "let", bool: "let" },
  TypeScript: { int: "let", double: "let", float: "let", char: "let", String: "let", boolean: "let", bool: "let" },
  Java: { int: "int", double: "double", float: "float", char: "char", String: "String", boolean: "boolean", bool: "boolean" },
  Kotlin: { int: "var", double: "var", float: "var", char: "var", String: "var", boolean: "var", bool: "var" },
  C: { int: "int", double: "double", float: "float", char: "char", String: "char*", boolean: "int", bool: "int" },
  "C++": { int: "int", double: "double", float: "float", char: "char", String: "std::string", boolean: "bool", bool: "bool" },
  "C#": { int: "int", double: "double", float: "float", char: "char", String: "string", boolean: "bool", bool: "bool" },
  Go: { int: "var", double: "var", float: "var", char: "var", String: "var", boolean: "var", bool: "var" },
  PHP: { int: "", double: "", float: "", char: "", String: "", boolean: "", bool: "" },
  Ruby: { int: "", double: "", float: "", char: "", String: "", boolean: "", bool: "" },
  Swift: { int: "var", double: "var", float: "var", char: "var", String: "var", boolean: "var", bool: "var" },
  Rust: { int: "let mut", double: "let mut", float: "let mut", char: "let mut", String: "let mut", boolean: "let mut", bool: "let mut" },
  Dart: { int: "int", double: "double", float: "double", char: "String", String: "String", boolean: "bool", bool: "bool" },
  R: { int: "", double: "", float: "", char: "", String: "", boolean: "", bool: "" }
};

const commentPattern = /(\/\/.*|#.*)$/;
const cLikeSkipPattern = /^(?:#include\b|using\s+|package\s+)/;
const classDeclarationPattern = /^(?:public\s+)?class\s+\w+\s*\{?$/;
const primitiveDeclarationPattern = /(int|double|float|String|boolean|bool|let|var)/;
const errorHandlingPattern = /try|catch|throw|except|raise/;
const memoryManagementPattern = /malloc|free|new\s+\w+|\*+\w|&\w/;
const complexRuntimePattern = /(scanf|malloc|free|pointer|\*+\w|try\s*\{|catch\s*\(|async|await|class\s+\w+\s+extends)/;
const linesPattern = /\r?\n/;
const repeatedBlankLinesPattern = /\n{3,}/g;
const compoundAssignmentPattern = /^(\s*)([A-Za-z_]\w*)\s*=\s*\2\s*([+\-*/])\s*(.+?)(;?)\s*$/gm;
const pythonSumLoopPattern = /^(\s*)([A-Za-z_]\w*)\s*=\s*0\s*\n\1for\s+([A-Za-z_]\w*)\s+in\s+([A-Za-z_]\w*)\s*:\s*\n\1\s{2,}\2\s*\+=\s*\3\s*$/gm;
const pythonIndexedSumLoopPattern = /^(\s*)([A-Za-z_]\w*)\s*=\s*0\s*\n(?:\s*\n)*\1for\s+([A-Za-z_]\w*)\s+in\s+range\(\s*len\(\s*([A-Za-z_]\w*)\s*\)\s*\)\s*:\s*\n\1\s+\2\s*(?:\+=\s*\4\[\3\]|=\s*\2\s*\+\s*\4\[\3\])\s*$/gm;
const pythonIndexedPrintLoopPattern = /^(\s*)for\s+([A-Za-z_]\w*)\s+in\s+range\(\s*len\(\s*([A-Za-z_]\w*)\s*\)\s*\)\s*:\s*\n\1\s+print\(\s*\3\[\2\]\s*\)\s*$/gm;
const pythonAppendComprehensionPattern = /^(\s*)([A-Za-z_]\w*)\s*=\s*\[\]\s*\n(?:\s*\n)*\1for\s+([A-Za-z_]\w*)\s+in\s+([A-Za-z_]\w*)\s*:\s*\n\1\s+\2\.append\((.+)\)\s*$/gm;
const pythonFilterAppendComprehensionPattern = /^(\s*)([A-Za-z_]\w*)\s*=\s*\[\]\s*\n(?:\s*\n)*\1for\s+([A-Za-z_]\w*)\s+in\s+([A-Za-z_]\w*)\s*:\s*\n\1\s+if\s+(.+):\s*\n\1\s{4,}\2\.append\((.+)\)\s*$/gm;
const pythonCountIfPattern = /^(\s*)([A-Za-z_]\w*)\s*=\s*0\s*\n(?:\s*\n)*\1for\s+([A-Za-z_]\w*)\s+in\s+([A-Za-z_]\w*)\s*:\s*\n\1\s+if\s+(.+):\s*\n\1\s{4,}\2\s*\+=\s*1\s*$/gm;
const pythonBooleanComparisonPattern = /\bif\s+([A-Za-z_]\w*)\s*==\s*(True|False)\s*:/g;
const pythonEmptyLengthPattern = /\bif\s+len\(([^)]+)\)\s*==\s*0\s*:/g;
const pythonNonEmptyLengthPattern = /\bif\s+len\(([^)]+)\)\s*>\s*0\s*:/g;
const jsVarDeclarationPattern = /^(\s*)var\s+([A-Za-z_]\w*)\s*=/gm;
const jsIndexedPrintLoopPattern = /^(\s*)for\s*\(\s*(?:let|var)\s+([A-Za-z_]\w*)\s*=\s*0\s*;\s*\2\s*<\s*([A-Za-z_]\w*)\.length\s*;\s*\2\+\+\s*\)\s*\{\s*\n\s*console\.log\(\s*\3\[\2\]\s*\);\s*\n\s*\}/gm;
const jsIndexedSumLoopPattern = /^(\s*)(?:(let|var)\s+)?([A-Za-z_]\w*)\s*=\s*0\s*;?\s*\n(?:\s*\n)*\1for\s*\(\s*(?:let|var)\s+([A-Za-z_]\w*)\s*=\s*0\s*;\s*\4\s*<\s*([A-Za-z_]\w*)\.length\s*;\s*\4\+\+\s*\)\s*\{\s*\n\s*\3\s*(?:\+=\s*\5\[\4\]|=\s*\3\s*\+\s*\5\[\4\])\s*;?\s*\n\s*\}/gm;
const javaEnhancedForPattern = /^(\s*)for\s*\(\s*int\s+([A-Za-z_]\w*)\s*=\s*0\s*;\s*\2\s*<\s*([A-Za-z_]\w*)\.length\s*;\s*\2\+\+\s*\)\s*\{\s*\n\s*([A-Za-z_]\w*)\s*\+=\s*\3\[\2\]\s*;\s*\n\s*\}/gm;
const jsForOfPattern = /^(\s*)for\s*\(\s*(?:let|var)\s+([A-Za-z_]\w*)\s*=\s*0\s*;\s*\2\s*<\s*([A-Za-z_]\w*)\.length\s*;\s*\2\+\+\s*\)\s*\{\s*\n\s*([A-Za-z_]\w*)\s*\+=\s*\3\[\2\]\s*;\s*\n\s*\}/gm;

function populateTargets() {
  targetLanguage.innerHTML = languages
    .map((language) => `<option value="${language}">${language}</option>`)
    .join("");
  targetOptions = [...targetLanguage.options];
  targetLanguage.value = "Python";
}

function detectLanguage(code) {
  if (!code.trim()) {
    return { name: "Unknown", score: 0 };
  }

  let bestName = "Unknown";
  let bestScore = 0;

  for (const detector of detectors) {
    let score = 0;

    for (const [test, weight] of detector.tests) {
      if (test.test(code)) {
        score += weight;
      }
    }

    if (score > bestScore) {
      bestName = detector.name;
      bestScore = score;
    }
  }

  if (bestScore <= 0) {
    return { name: "Unknown", score: 0.18 };
  }

  return { name: bestName, score: Math.min(0.98, bestScore / 8) };
}

function normalizeExpression(expression, target) {
  let normalized = expression.trim();

  if (target === "Python") {
    normalized = normalized
      .replace(/\btrue\b/g, "True")
      .replace(/\bfalse\b/g, "False")
      .replace(/\bnull\b/g, "None")
      .replace(/\bNULL\b/g, "None")
      .replace(/&&/g, " and ")
      .replace(/\|\|/g, " or ")
      .replace(/!(?!=)/g, "not ");
  }

  return normalized
    .replace(/\s+/g, " ")
    .replace(/\s*([+\-*/%<>]=?|==|!=)\s*/g, " $1 ")
    .replace(/\s*,\s*/g, ", ")
    .trim()
    .replace(/\btrue\b/g, target === "Python" ? "True" : "true")
    .replace(/\bfalse\b/g, target === "Python" ? "False" : "false")
    .replace(/\bnull\b/g, target === "Python" ? "None" : "null")
    .replace(/\b(\w+)\.length\b/g, target === "Python" ? "len($1)" : "$1.length")
    .replace(/([A-Za-z_]\w*)\.length\b/g, "$1.length");
}

function formatStyle(style) {
  return styleLabels[style] || styleLabels[defaultStyle];
}

function getStandardDependencies(language) {
  const dependencies = {
    Python: ["Python 3 standard library"],
    JavaScript: ["Node.js or modern browser runtime"],
    TypeScript: ["TypeScript compiler", "Node.js or browser runtime"],
    Java: ["JDK"],
    Kotlin: ["Kotlin compiler/JVM"],
    C: ["C compiler", "stdio.h"],
    "C++": ["C++17 compiler", "iostream", "vector"],
    "C#": [".NET SDK"],
    Go: ["Go toolchain", "fmt"],
    PHP: ["PHP runtime"],
    Ruby: ["Ruby runtime"],
    Swift: ["Swift toolchain"],
    Rust: ["Rust toolchain"],
    Dart: ["Dart SDK"],
    R: ["R runtime"]
  };

  return dependencies[language] || ["Target language runtime/toolchain"];
}

function buildCompatibilityNotes(sourceLanguage, target, mode) {
  const notes = [];

  if (mode === "local") {
    notes.push("Local browser translation uses deterministic rules and is intended for simple imperative code only.");
    notes.push("For production-grade accuracy across arbitrary languages, configure window.CODE_TRANSLATE_API_URL and validate with target-language compilers/tests.");
  }

  if (sourceLanguage === "Unknown") {
    notes.push("Source language could not be detected confidently.");
  }

  if (target === "Python") {
    notes.push("C/C-like input functions named input are renamed to read_bounded_int to avoid shadowing Python's built-in input().");
  }

  return notes.length ? notes : ["No special compatibility notes."];
}

function formatTranslationResult({ code }) {
  return code;
}

function buildExpertTranslationRequest(payload) {
  return {
    ...payload,
    systemPrompt: expertTranslationSystemPrompt,
    requirements: {
      preserveBehavior: true,
      preserveComments: true,
      preserveIoBehavior: true,
      completeExecutableCode: true,
      includeImportsAndDependencies: true,
      optimizeWithoutBehaviorChanges: payload.options?.optimize ?? true,
      includeHelpfulComments: payload.options?.addComments ?? true,
      validateSyntax: true,
      responseSections: ["detectedLanguage", "requiredDependencies", "compatibilityNotes", "translatedCode"]
    }
  };
}

function setSelectedStyle(style, shouldRender = true) {
  selectedStyle = styleLabels[style] ? style : defaultStyle;

  styleButtons.forEach((button) => {
    const isActive = button.dataset.style === selectedStyle;
    button.classList.toggle("active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });

  if (shouldRender) {
    render();
  }
}

function buildTranslatePayload(source, sourceLanguage, target) {
  return {
    sourceCode: source,
    sourceLanguage,
    targetLanguage: target,
    style: selectedStyle,
    options: {
      optimize: optimizeToggle.checked,
      addComments: commentsToggle.checked
    }
  };
}

function stripComment(line) {
  const commentMatch = line.match(commentPattern);
  if (!commentMatch) {
    return { code: line, comment: "" };
  }

  return {
    code: line.slice(0, commentMatch.index).trimEnd(),
    comment: commentMatch[0].replace(/^\/\//, "#")
  };
}

function normalizeStatementStream(source) {
  const statements = [];
  let current = "";
  let quote = "";
  let escaped = false;
  let parenDepth = 0;

  const pushCurrent = () => {
    const value = current.trim();
    if (value) {
      statements.push(value);
    }
    current = "";
  };

  for (const char of source) {
    if (quote) {
      current += char;
      if (escaped) {
        escaped = false;
      } else if (char === "\\") {
        escaped = true;
      } else if (char === quote) {
        quote = "";
      }
      continue;
    }

    if (char === '"' || char === "'") {
      quote = char;
      current += char;
      continue;
    }

    if (char === "(") {
      parenDepth += 1;
      current += char;
      continue;
    }

    if (char === ")") {
      parenDepth = Math.max(0, parenDepth - 1);
      current += char;
      continue;
    }

    if (char === "{" || char === "}" || (char === ";" && parenDepth === 0)) {
      pushCurrent();
      if (char === "{" || char === "}") {
        statements.push(char);
      }
      continue;
    }

    if (char === "\n" || char === "\r") {
      pushCurrent();
      continue;
    }

    current += char;
  }

  pushCurrent();
  return statements;
}

function normalizePythonName(name) {
  return name === "input" ? "read_bounded_int" : name;
}

function normalizePythonCondition(condition) {
  const normalized = normalizeExpression(condition, "Python")
    .replace(/\bwhile\s+/, "")
    .replace(/\bif\s+/, "")
    .trim();

  if (normalized === "1") return "True";
  if (normalized === "0") return "False";
  return normalized;
}

function convertCDeclarationToPython(line) {
  const match = line.match(/^(?:int|double|float|char|String|boolean|bool)\s+(.+)$/);
  if (!match || /\)\s*$/.test(line)) {
    return [];
  }

  return match[1]
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const array2d = part.match(/^([A-Za-z_]\w*)\s*\[(\d+)\]\s*\[(\d+)\]$/);
      if (array2d) {
        return `${array2d[1]} = [[0 for _ in range(${array2d[3]})] for _ in range(${array2d[2]})]`;
      }

      const array1d = part.match(/^([A-Za-z_]\w*)\s*\[(\d+)\]$/);
      if (array1d) {
        return `${array1d[1]} = [0 for _ in range(${array1d[2]})]`;
      }

      const initialized = part.match(/^([A-Za-z_]\w*)\s*=\s*(.+)$/);
      if (initialized) {
        return `${initialized[1]} = ${normalizeExpression(initialized[2], "Python")}`;
      }

      return `${part} = 0`;
    });
}

function convertPrintfToPython(line) {
  const match = line.match(/^printf\s*\(\s*"([^"]*)"\s*(?:,\s*(.*))?\)\s*;?$/);
  if (!match) {
    return null;
  }

  const format = match[1].replace(/\\n/g, "");
  const args = match[2] ? match[2].split(",").map((item) => item.trim()) : [];

  if (!args.length) {
    return `print("${format}")`;
  }

  let index = 0;
  const template = format.replace(/%-?\d*[dfs]/g, () => `{${args[index++] ?? ""}}`);
  return `print(f"${template}")`;
}

function convertScanfToPython(line) {
  const match = line.match(/^scanf\s*\(\s*"([^"]+)"\s*,\s*(.*)\)\s*;?$/);
  if (!match) {
    return null;
  }

  const names = match[2]
    .split(",")
    .map((item) => item.replace(/&/g, "").trim())
    .filter(Boolean);

  if (names.length === 1) {
    return `${names[0]} = int(input())`;
  }

  return `${names.join(", ")} = map(int, input().split())`;
}

function toPython(source) {
  const output = [];
  let indent = 0;
  let pendingSingleLineBlocks = 0;
  const functionNames = new Map();

  const emit = (line) => {
    output.push(`${"  ".repeat(indent)}${line}`);
  };

  const statements = normalizeStatementStream(source);

  for (let index = 0; index < statements.length; index += 1) {
    let line = statements[index].trim();

    if (!line || cLikeSkipPattern.test(line) || line === "{") {
      continue;
    }

    if (line === "}") {
      indent = Math.max(0, indent - 1);
      continue;
    }

    const { code, comment } = stripComment(line);
    line = code;

    if (!line || classDeclarationPattern.test(line)) {
      continue;
    }

    const functionMatch = line.match(/^(?:public\s+|private\s+|static\s+|inline\s+)*(?:int|void|double|float|char|String|boolean|bool)\s+([A-Za-z_]\w*)\s*\((.*)\)$/);
    if (functionMatch) {
      const sourceName = functionMatch[1];
      const pythonName = normalizePythonName(sourceName);
      functionNames.set(sourceName, pythonName);
      const params = functionMatch[2]
        .split(",")
        .map((param) => param.trim().replace(/^(?:int|double|float|char|String|boolean|bool)\s+/, ""))
        .filter((param) => param && param !== "void")
        .join(", ");
      emit(`def ${pythonName}(${params}):`);
      indent += 1;
      continue;
    }

    const forMatch = line.match(/^for\s*\(\s*(?:int\s+)?(\w+)\s*=\s*([^;]+);\s*\1\s*([<>]=?)\s*([^;]+);\s*\1(\+\+|--)\s*\)$/);
    if (forMatch) {
      const [, variable, start, operator, end, stepOperator] = forMatch;
      const step = stepOperator === "--" ? ", -1" : "";
      const comparator = operator.includes("=") ? (stepOperator === "--" ? " - 1" : " + 1") : "";
      emit(`for ${variable} in range(${normalizeExpression(start, "Python")}, ${normalizeExpression(end, "Python")}${comparator}${step}):`);
      indent += 1;
      if (statements[index + 1]?.trim() !== "{") {
        pendingSingleLineBlocks += 1;
      }
      continue;
    }

    const scanfLine = convertScanfToPython(line);
    if (scanfLine) {
      emit(`${scanfLine}${comment ? ` ${comment}` : ""}`);
      if (pendingSingleLineBlocks) {
        indent = Math.max(0, indent - pendingSingleLineBlocks);
        pendingSingleLineBlocks = 0;
      }
      continue;
    }

    const printfLine = convertPrintfToPython(line);
    if (printfLine) {
      emit(`${printfLine}${comment ? ` ${comment}` : ""}`);
      if (pendingSingleLineBlocks) {
        indent = Math.max(0, indent - pendingSingleLineBlocks);
        pendingSingleLineBlocks = 0;
      }
      continue;
    }

    const whileMatch = line.match(/^while\s*\((.*)\)\s*\{?$/);
    if (whileMatch) {
      const decrementMatch = whileMatch[1].trim().match(/^([A-Za-z_]\w*)--$/);
      if (decrementMatch) {
        emit(`while ${decrementMatch[1]} > 0:`);
        indent += 1;
        emit(`${decrementMatch[1]} -= 1`);
      } else {
        emit(`while ${normalizePythonCondition(whileMatch[1])}:`);
        indent += 1;
      }
      if (statements[index + 1]?.trim() !== "{") {
        pendingSingleLineBlocks += 1;
      }
      continue;
    }

    const ifMatch = line.match(/^if\s*\((.*)\)$/);
    if (ifMatch) {
      const nextLine = statements[index + 1]?.trim() || "";
      emit(`if ${normalizePythonCondition(ifMatch[1])}:`);
      indent += 1;
      if (nextLine !== "{") {
        pendingSingleLineBlocks += 1;
      }
      continue;
    }

    const declarations = convertCDeclarationToPython(line);
    if (declarations.length) {
      declarations.forEach((declaration) => emit(declaration));
      if (pendingSingleLineBlocks) {
        indent = Math.max(0, indent - pendingSingleLineBlocks);
        pendingSingleLineBlocks = 0;
      }
      continue;
    }

    const converted = convertSimplePythonStatement(line, functionNames);
    emit(`${converted}${comment ? ` ${comment}` : ""}`);
    if (pendingSingleLineBlocks) {
      indent = Math.max(0, indent - pendingSingleLineBlocks);
      pendingSingleLineBlocks = 0;
    }
  }

  if (output.some((line) => /^def main\(\):$/.test(line.trim()))) {
    output.push("");
    output.push('if __name__ == "__main__":');
    output.push("  main()");
  }

  return output.join("\n");
}

function convertSimplePythonStatement(line, functionNames = new Map()) {
  const scanfLine = convertScanfToPython(line);
  if (scanfLine) {
    return scanfLine;
  }

  const printfLine = convertPrintfToPython(line);
  if (printfLine) {
    return printfLine;
  }

  const incrementMatch = line.match(/^([A-Za-z_]\w*)\+\+$/);
  if (incrementMatch) {
    return `${incrementMatch[1]} += 1`;
  }

  const decrementMatch = line.match(/^([A-Za-z_]\w*)--$/);
  if (decrementMatch) {
    return `${decrementMatch[1]} -= 1`;
  }

  let converted = line
    .replace(/^return\s+(.+)$/, (_, value) => `return ${normalizeExpression(value, "Python")}`)
    .replace(/^System\.out\.println\s*\((.*)\)$/, "print($1)")
    .replace(/^Console\.WriteLine\s*\((.*)\)$/, "print($1)")
    .replace(/^console\.log\s*\((.*)\)$/, "print($1)")
    .replace(/\b(\w+)\.length\b/g, "len($1)")
    .replace(/;$/, "");

  for (const [sourceName, pythonName] of functionNames) {
    if (sourceName !== pythonName) {
      converted = converted.replace(new RegExp(`\\b${sourceName}\\s*\\(`, "g"), `${pythonName}(`);
    }
  }

  const assignmentMatch = converted.match(/^(.+?)=\s*(.+)$/);
  if (assignmentMatch && !/[!<>]=|==/.test(converted)) {
    return `${assignmentMatch[1].trim()} = ${normalizeExpression(assignmentMatch[2], "Python")}`;
  }

  return normalizeExpression(converted, "Python");
}

function convertPrint(line, target) {
  const body = line
    .replace(/^System\.out\.println\s*\((.*)\);?$/, "$1")
    .replace(/^Console\.WriteLine\s*\((.*)\);?$/, "$1")
    .replace(/^console\.log\s*\((.*)\);?$/, "$1")
    .replace(/^print\s*\((.*)\)$/, "$1")
    .replace(/^println\s*\((.*)\);?$/, "$1")
    .replace(/^printf\s*\((.*)\);?$/, "$1");

  if (body === line) {
    return null;
  }

  if (target === "JavaScript" || target === "TypeScript") return `console.log(${body});`;
  if (target === "Java") return `System.out.println(${body});`;
  if (target === "Kotlin") return `println(${body})`;
  if (target === "C#") return `Console.WriteLine(${body});`;
  if (target === "C") return `printf(${body});`;
  if (target === "C++") return `std::cout << ${body} << std::endl;`;
  if (target === "Go") return `fmt.Println(${body})`;
  if (target === "PHP") return `echo ${body};`;
  if (target === "Ruby") return `puts ${body}`;
  if (target === "Swift") return `print(${body})`;
  if (target === "Rust") return `println!("{}", ${body});`;
  return line;
}

function convertDeclaration(line, target) {
  const arrayMatch = line.match(/^(?:int|double|float|char|String|boolean|bool)\[\]\s+(\w+)\s*=\s*\{(.*)\};?$/);
  if (arrayMatch) {
    const values = arrayMatch[2].trim();
    if (target === "JavaScript" || target === "TypeScript") return `let ${arrayMatch[1]} = [${values}];`;
    if (target === "Kotlin") return `val ${arrayMatch[1]} = arrayOf(${values})`;
    if (target === "Python") return `${arrayMatch[1]} = [${values}]`;
    if (target === "C++") return `std::vector<int> ${arrayMatch[1]} = {${values}};`;
    return line;
  }

  const declarationMatch = line.match(/^(int|double|float|char|String|boolean|bool)\s+(\w+)\s*=\s*(.*);?$/);
  if (!declarationMatch) {
    return line;
  }

  const [, sourceType, name, value] = declarationMatch;
  const targetType = typeMap[target]?.[sourceType] ?? "let";

  if (target === "Python" || target === "Ruby") return `${name} = ${value.replace(/;$/, "")}`;
  if (target === "PHP") return `$${name} = ${value.replace(/;$/, "")};`;
  if (target === "Kotlin" || target === "Swift" || target === "Go") return `${targetType} ${name} = ${value.replace(/;$/, "")}`;
  if (target === "Rust") return `${targetType} ${name} = ${value.replace(/;$/, "")};`;
  if (target === "JavaScript" || target === "TypeScript") return `${targetType} ${name} = ${value.replace(/;$/, "")};`;
  return `${targetType} ${name} = ${value.replace(/;$/, "")};`;
}

function toBraceLanguage(source, target) {
  const output = [];
  const isJsLike = target === "JavaScript" || target === "TypeScript";

  if (target === "C++") output.push("#include <iostream>", "#include <vector>", "");
  if (target === "C") output.push("#include <stdio.h>", "");
  if (target === "Go") output.push("package main", "", 'import "fmt"', "");
  if (target === "C#") output.push("using System;", "");
  if (target === "Java") output.push("public class Main {");

  for (const rawLine of source.split(linesPattern)) {
    let line = rawLine.trim();

    if (!line || cLikeSkipPattern.test(line) || /^public\s+class\b/.test(line)) {
      continue;
    }

    if (/main\s*\(/.test(line) || line === 'if __name__ == "__main__":' || line === "main()") {
      if (target === "Java") output.push("  public static void main(String[] args) {");
      else if (target === "Kotlin") output.push("fun main() {");
      else if (target === "C#") output.push("class Program {", "  static void Main() {");
      else if (target === "Go") output.push("func main() {");
      else if (target === "Rust") output.push("fn main() {");
      else output.push("int main() {");
      continue;
    }

    const printLine = convertPrint(line, target);
    if (printLine) {
      output.push(`  ${printLine}`);
      continue;
    }

    const forPython = line.match(/^for\s+(\w+)\s+in\s+range\((.*?),(.*?)\):$/);
    if (forPython) {
      const keyword = isJsLike ? "let " : "int ";
      output.push(`  for (${keyword}${forPython[1]} = ${forPython[2].trim()}; ${forPython[1]} < ${forPython[3].trim()}; ${forPython[1]}++) {`);
      continue;
    }

    const declaration = convertDeclaration(line, target);
    if (declaration !== line) {
      output.push(`  ${declaration}`);
      continue;
    }

    if (line === "}" || line === "{") {
      output.push(line);
      continue;
    }

    if (!line.endsWith(";") && !line.endsWith("{") && !line.endsWith("}") && !noSemicolonLanguages.has(target)) {
      line += ";";
    }

    output.push(`  ${normalizeExpression(line, target)}`);
  }

  if (target === "Java") output.push("  }", "}");
  else if (target === "C#") output.push("  }", "}");
  else if (cLikeReturnLanguages.has(target)) output.push("  return 0;", "}");
  else if (singleClosingBraceLanguages.has(target)) output.push("}");

  return output.join("\n");
}

function translateCode(payload) {
  const { sourceCode: source, sourceLanguage, targetLanguage: target, style, options = {} } = payload;

  if (!source.trim()) {
    return "Paste code first, then click Translate Code.";
  }

  const pair = `${sourceLanguage}->${target}`;
  const dependencies = getStandardDependencies(target);
  const notes = buildCompatibilityNotes(sourceLanguage, target, "local");
  let translated;

  if (!localTranslationPairs.has(pair)) {
    const unsupportedCode = [
      `// Full ${sourceLanguage} to ${target} translation requires a backend transpilation/AI service.`,
      `// Configure window.CODE_TRANSLATE_API_URL to enable the expert multilingual translator contract.`,
      `// The original source is preserved below so no logic is silently mistranslated.`,
      "",
      source
    ].join("\n");

    return formatTranslationResult({
      detected: sourceLanguage,
      target,
      dependencies,
      notes: [
        ...notes,
        "This language pair is not handled by the local deterministic translator, so the app did not fabricate a runnable translation."
      ],
      code: unsupportedCode
    });
  }

  if (target === "Python") {
    translated = toPython(source);
  } else if (supportedBraceLanguages.has(target)) {
    translated = toBraceLanguage(source, target);
  } else {
    translated = `// ${target} translation needs a backend AI model for full accuracy.\n// Detected source language: ${sourceLanguage}\n// Translation style: ${formatStyle(style)}\n\n${source}`;
  }

  if (options.optimize) {
    const optimization = analyzeOptimization(translated, target);
    translated = optimization.optimized || translated;
  }

  return formatTranslationResult({
    detected: sourceLanguage,
    target,
    dependencies,
    notes,
    code: translated
  });
}

function normalizeCodeLayout(code, changes) {
  let optimized = code.replace(/[ \t]+$/gm, "");

  if (optimized !== code) {
    changes.push("Removed trailing whitespace to reduce noise, improve readability, and prevent unnecessary diff churn.");
  }

  const collapsed = optimized.replace(repeatedBlankLinesPattern, "\n\n");
  if (collapsed !== optimized) {
    changes.push("Collapsed excessive blank lines so related code stays visually grouped without changing execution.");
  }

  return collapsed.trimEnd();
}

function applyCompoundAssignments(code, changes) {
  let changed = false;
  const optimized = code.replace(compoundAssignmentPattern, (match, indent, variable, operator, expression, semicolon) => {
    if (operator === "/" && /\b0(?:\.0+)?\b/.test(expression)) {
      return match;
    }

    changed = true;
    return `${indent}${variable} ${operator}= ${expression.trim()}${semicolon}`;
  });

  if (changed) {
    changes.push("Replaced repeated self-assignment expressions with compound assignments, reducing duplicated variable reads and improving intent.");
  }

  return optimized;
}

function applyPythonOptimizations(code, changes) {
  let convertedIndexedLoop = false;
  let renamedShadowedSum = false;
  let optimized = code.replace(pythonIndexedSumLoopPattern, (match, indent, total, index, collection) => {
    convertedIndexedLoop = true;
    const targetName = total === "sum" ? "total" : total;

    if (targetName !== total) {
      renamedShadowedSum = true;
    }

    return `${indent}${targetName} = sum(${collection})`;
  });

  if (renamedShadowedSum) {
    optimized = renamePythonBinding(optimized, "sum", "total");
  }

  if (convertedIndexedLoop) {
    changes.push("Replaced the Python range(len(...)) indexed accumulation loop with sum(), removing index management and using the faster built-in reduction.");
  }

  if (renamedShadowedSum) {
    changes.push("Renamed the accumulator from sum to total so the optimized code can call Python's built-in sum() without shadowing it.");
  }

  let convertedDirectLoop = false;
  optimized = optimized.replace(pythonSumLoopPattern, (match, indent, total, item, collection) => {
    convertedDirectLoop = true;
    return `${indent}${total} = sum(${collection})`;
  });

  if (convertedDirectLoop) {
    changes.push("Replaced a manual Python accumulation loop with sum(), using the optimized built-in implementation while preserving the numeric result.");
  }

  let convertedIndexedPrint = false;
  optimized = optimized.replace(pythonIndexedPrintLoopPattern, (match, indent, index, collection) => {
    convertedIndexedPrint = true;
    const itemName = collection.replace(/s$/, "") || "item";
    return `${indent}for ${itemName} in ${collection}:\n${indent}    print(${itemName})`;
  });

  if (convertedIndexedPrint) {
    changes.push("Replaced range(len(...)) indexed iteration with direct iteration, removing unnecessary index handling and improving readability.");
  }

  let convertedFilterAppendLoop = false;
  optimized = optimized.replace(pythonFilterAppendComprehensionPattern, (match, indent, target, item, collection, condition, expression) => {
    convertedFilterAppendLoop = true;
    return `${indent}${target} = [${expression.trim()} for ${item} in ${collection} if ${condition.trim()}]`;
  });

  if (convertedFilterAppendLoop) {
    changes.push("Converted a conditional list-building loop into a filtered list comprehension, reducing loop overhead and making the transformation explicit.");
  }

  let convertedAppendLoop = false;
  optimized = optimized.replace(pythonAppendComprehensionPattern, (match, indent, target, item, collection, expression) => {
    convertedAppendLoop = true;
    return `${indent}${target} = [${expression.trim()} for ${item} in ${collection}]`;
  });

  if (convertedAppendLoop) {
    changes.push("Converted a list-building append loop into a list comprehension, reducing boilerplate and using Python's idiomatic allocation path.");
  }

  let convertedCountIf = false;
  optimized = optimized.replace(pythonCountIfPattern, (match, indent, counter, item, collection, condition) => {
    convertedCountIf = true;
    return `${indent}${counter} = sum(1 for ${item} in ${collection} if ${condition.trim()})`;
  });

  if (convertedCountIf) {
    changes.push("Replaced a manual conditional counter loop with sum(1 for ...), removing mutable loop state while preserving the count.");
  }

  let simplifiedBoolean = false;
  optimized = optimized.replace(pythonBooleanComparisonPattern, (match, variable, value) => {
    simplifiedBoolean = true;
    return value === "True" ? `if ${variable}:` : `if not ${variable}:`;
  });

  if (simplifiedBoolean) {
    changes.push("Simplified explicit boolean comparisons to idiomatic truth checks without changing branch behavior.");
  }

  let simplifiedLengthCheck = false;
  optimized = optimized
    .replace(pythonEmptyLengthPattern, (match, collection) => {
      simplifiedLengthCheck = true;
      return `if not ${collection.trim()}:`;
    })
    .replace(pythonNonEmptyLengthPattern, (match, collection) => {
      simplifiedLengthCheck = true;
      return `if ${collection.trim()}:`;
    });

  if (simplifiedLengthCheck) {
    changes.push("Replaced len(...)-based emptiness checks with direct truthiness checks, which are clearer and avoid an unnecessary length call.");
  }

  return optimized;
}

function applyJavaOptimizations(code, changes) {
  let changed = false;
  const optimized = code.replace(javaEnhancedForPattern, (match, indent, index, arrayName, total) => {
    changed = true;
    const itemName = arrayName.replace(/s$/, "") || "item";
    return `${indent}for (int ${itemName} : ${arrayName}) {\n${indent}  ${total} += ${itemName};\n${indent}}`;
  });

  if (changed) {
    changes.push("Converted index-based Java array iteration to an enhanced for loop, removing repeated bounds/index operations and improving readability.");
  }

  return optimized;
}

function applyJavaScriptOptimizations(code, changes) {
  let convertedForOf = false;
  let optimized = code.replace(jsForOfPattern, (match, indent, index, arrayName, total) => {
    convertedForOf = true;
    const itemName = arrayName.replace(/s$/, "") || "item";
    return `${indent}for (const ${itemName} of ${arrayName}) {\n${indent}  ${total} += ${itemName};\n${indent}}`;
  });

  if (convertedForOf) {
    changes.push("Converted index-based JavaScript array iteration to for...of, reducing indexing boilerplate and making the loop's intent clearer.");
  }

  let convertedPrintLoop = false;
  optimized = optimized.replace(jsIndexedPrintLoopPattern, (match, indent, index, arrayName) => {
    convertedPrintLoop = true;
    const itemName = arrayName.replace(/s$/, "") || "item";
    return `${indent}for (const ${itemName} of ${arrayName}) {\n${indent}  console.log(${itemName});\n${indent}}`;
  });

  if (convertedPrintLoop) {
    changes.push("Converted an indexed JavaScript logging loop to for...of, avoiding repeated array indexing.");
  }

  let convertedReduce = false;
  optimized = optimized.replace(jsIndexedSumLoopPattern, (match, indent, declaration, total, index, arrayName) => {
    convertedReduce = true;
    const prefix = declaration ? "const " : "";
    return `${indent}${prefix}${total} = ${arrayName}.reduce((acc, value) => acc + value, 0);`;
  });

  if (convertedReduce) {
    changes.push("Replaced a manual JavaScript summation loop with reduce(), expressing the reduction directly and removing mutable loop state.");
  }

  let convertedVar = false;
  optimized = optimized.replace(jsVarDeclarationPattern, (match, indent, name) => {
    convertedVar = true;
    return `${indent}let ${name} =`;
  });

  if (convertedVar) {
    changes.push("Replaced var declarations with block-scoped let declarations to avoid function-scope leakage and modernize the code.");
  }

  const constResult = promoteStableLetDeclarations(optimized);
  optimized = constResult.code;

  if (constResult.changed) {
    changes.push("Promoted never-reassigned let declarations to const, making immutability explicit and helping prevent accidental mutation.");
  }

  return optimized;
}

function promoteStableLetDeclarations(code) {
  const lines = code.split(linesPattern);
  let changed = false;

  const optimizedLines = lines.map((line, index) => {
    const declaration = line.match(/^(\s*)let\s+([A-Za-z_]\w*)\s*=/);

    if (!declaration) {
      return line;
    }

    const [, indent, name] = declaration;
    const laterCode = lines.slice(index + 1).join("\n");
    const reassignmentPattern = new RegExp(`\\b${name}\\s*(?:=|\\+=|-=|\\*=|/=|\\+\\+|--)`);

    if (reassignmentPattern.test(laterCode)) {
      return line;
    }

    changed = true;
    return line.replace(`${indent}let ${name}`, `${indent}const ${name}`);
  });

  return {
    code: optimizedLines.join("\n"),
    changed
  };
}

function renamePythonBinding(code, fromName, toName) {
  const identifierPattern = new RegExp(`\\b${fromName}\\b(?!\\s*\\()`, "g");
  return code.replace(identifierPattern, toName);
}

function analyzeOptimization(code, language) {
  const trimmedCode = code.trim();
  const changes = [];

  if (!trimmedCode) {
    return {
      original: "Paste code to compare optimization results.",
      optimized: "Optimized code will appear here.",
      changes: ["Paste code to analyze performance, readability, memory usage, and best-practice opportunities."]
    };
  }

  let optimized = normalizeCodeLayout(code, changes);
  optimized = applyCompoundAssignments(optimized, changes);

  if (language === "Python") {
    optimized = applyPythonOptimizations(optimized, changes);
  }

  if (language === "Java") {
    optimized = applyJavaOptimizations(optimized, changes);
  }

  if (language === "JavaScript" || language === "TypeScript") {
    optimized = applyJavaScriptOptimizations(optimized, changes);
  }

  if (changes.length === 0) {
    return {
      original: code,
      optimized: normalizeCodeLayout(code, []),
      changes: ["The code is totally optimized."]
    };
  }

  return {
    original: code,
    optimized,
    changes
  };
}

function renderList(node, items) {
  const fragment = document.createDocumentFragment();

  node.replaceChildren();

  for (const item of items) {
    const listItem = document.createElement("li");
    listItem.textContent = item;
    fragment.appendChild(listItem);
  }

  node.appendChild(fragment);
}

function renderOptimizedCode(original, optimized) {
  const fragment = document.createDocumentFragment();
  const originalLineSet = new Set(
    original
      .split(linesPattern)
      .map((line) => line.trim())
      .filter(Boolean)
  );
  const optimizedLines = optimized.split(linesPattern);

  optimizedCodeBlock.replaceChildren();

  optimizedLines.forEach((line, index) => {
    const lineNode = document.createElement("span");
    lineNode.textContent = line || " ";

    if (line.trim() && !originalLineSet.has(line.trim())) {
      lineNode.classList.add("changed-line");
    }

    fragment.appendChild(lineNode);

    if (index < optimizedLines.length - 1) {
      fragment.appendChild(document.createTextNode("\n"));
    }
  });

  optimizedCodeBlock.appendChild(fragment);
}

function render() {
  const code = sourceCode.value;
  const detected = detectLanguage(code);
  const confidence = Math.round(detected.score * 100);
  const payload = buildTranslatePayload(code, detected.name, targetLanguage.value);
  const optimization = analyzeOptimization(code, detected.name);

  detectedLanguage.textContent = detected.name;
  confidenceText.textContent = detected.name === "Unknown" ? "Waiting for clearer syntax" : `${confidence}% confidence`;

  for (const option of targetOptions) {
    option.disabled = option.value === detected.name;
  }

  if (targetLanguage.value === detected.name) {
    const nextTarget = languages.find((language) => language !== detected.name) || "Python";
    targetLanguage.value = nextTarget;
    payload.targetLanguage = nextTarget;
  }

  originalCodeBlock.textContent = optimization.original;
  renderOptimizedCode(optimization.original, optimization.optimized);
  renderList(optimizationList, optimization.changes);
}

async function requestTranslation(payload) {
  const endpoint = await resolveTranslationEndpoint();

  let response;

  try {
    response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(buildExpertTranslationRequest(payload))
    });
  } catch {
    throw new Error(`Translation backend is not reachable at ${endpoint}. Start it with npm start and make sure OPENAI_API_KEY is set.`);
  }

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.error || `Translation API failed with status ${response.status}`);
  }

  const data = await response.json();
  if (data.detectedLanguage || data.requiredDependencies || data.compatibilityNotes || data.translatedCode) {
    return formatTranslationResult({
      detected: data.detectedLanguage || payload.sourceLanguage,
      target: payload.targetLanguage,
      dependencies: data.requiredDependencies || getStandardDependencies(payload.targetLanguage),
      notes: data.compatibilityNotes || ["Backend translation completed."],
      code: data.translatedCode || data.output || ""
    });
  }

  throw new Error("Translation API returned an unexpected response shape.");
}

async function resolveTranslationEndpoint() {
  const cached = window.localStorage.getItem(endpointCacheKey);
  const candidates = cached ? [cached, ...defaultBackendCandidates] : defaultBackendCandidates;

  for (const endpoint of candidates) {
    if (await probeBackend(endpoint)) {
      window.localStorage.setItem(endpointCacheKey, endpoint);
      return endpoint;
    }
  }

  throw new Error(`Translation backend is not reachable. Tried: ${candidates.join(", ")}. Start the backend with npm start and make sure OPENAI_API_KEY is set.`);
}

async function probeBackend(endpoint) {
  const healthUrl = endpoint.replace(/\/api\/translate$/, "/api/health");
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), 1200);

  try {
    const response = await fetch(healthUrl, {
      method: "GET",
      signal: controller.signal
    });

    return response.ok;
  } catch {
    return false;
  } finally {
    window.clearTimeout(timeoutId);
  }
}

function translate() {
  statusPill.textContent = "Translating";
  translateButton.disabled = true;

  window.setTimeout(async () => {
    const detected = detectLanguage(sourceCode.value);
    const payload = buildTranslatePayload(sourceCode.value, detected.name, targetLanguage.value);

    try {
      const output = await requestTranslation(payload);
      translatedOutput.textContent = output;
      render();
      statusPill.textContent = "Validated";
    } catch (error) {
      translatedOutput.textContent = error.message;
      statusPill.textContent = "API Error";
    } finally {
      translateButton.disabled = false;
    }
  }, 300);
}

async function copyText(text, button) {
  await navigator.clipboard.writeText(text);
  const original = button.textContent;
  button.textContent = "Copied";
  window.setTimeout(() => {
    button.textContent = original;
  }, 1200);
}

populateTargets();
setSelectedStyle(defaultStyle, false);
render();

sourceCode.addEventListener("input", render);
targetLanguage.addEventListener("change", render);
optimizeToggle.addEventListener("change", render);
commentsToggle.addEventListener("change", render);
styleSelect.addEventListener("click", (event) => {
  const button = event.target.closest(".mode-button");

  if (button && styleSelect.contains(button)) {
    setSelectedStyle(button.dataset.style);
  }
});
translateButton.addEventListener("click", translate);

sampleButton.addEventListener("click", () => {
  sourceCode.value = sampleJava;
  render();
  translate();
});

copyReportButton.addEventListener("click", () => {
  const report = [
    "Original Code:",
    originalCodeBlock.textContent,
    "",
    "Optimized Code:",
    optimizedCodeBlock.textContent,
    "",
    "Changes Made:",
    ...[...optimizationList.querySelectorAll("li")]
      .map((item) => `- ${item.textContent}`)
  ].join("\n");
  copyText(report, copyReportButton);
});

copyOutputButton.addEventListener("click", () => {
  copyText(translatedOutput.textContent, copyOutputButton);
});
