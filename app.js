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
  "Rust"
];

const supportedBraceLanguages = new Set(["JavaScript", "TypeScript", "Java", "Kotlin", "C", "C++", "C#", "Go", "Rust"]);
const cLikeReturnLanguages = new Set(["C", "C++"]);
const singleClosingBraceLanguages = new Set(["Kotlin", "Go", "Rust"]);
const noSemicolonLanguages = new Set(["Kotlin", "Go", "Swift", "Ruby"]);

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
const optimizationList = document.getElementById("optimizationList");
const statusPill = document.getElementById("statusPill");
const sampleButton = document.getElementById("sampleButton");
const copyReportButton = document.getElementById("copyReportButton");
const copyOutputButton = document.getElementById("copyOutputButton");
const sourceHighlightCode = document.getElementById("sourceHighlightCode");
const optimizedCodeBlock = document.getElementById("optimizedCodeBlock");
let targetOptions = [];

const defaultStyle = "production-ready";
const styleLabels = {
  "production-ready": "Production",
  "beginner-friendly": "Beginner",
  "performance-focused": "Performance",
  "framework-neutral": "Neutral"
};
let selectedStyle = defaultStyle;

// Map language names to Prism language identifiers
const prismLangMap = {
  Python: "python",
  JavaScript: "javascript",
  TypeScript: "typescript",
  Java: "java",
  Kotlin: "kotlin",
  "C": "c",
  "C++": "cpp",
  "C#": "csharp",
  Go: "go",
  PHP: "php",
  Ruby: "ruby",
  Swift: "swift",
  Rust: "rust"
};

function highlightCode(code, langName) {
  const lang = prismLangMap[langName] || "plain";
  if (!code || !window.Prism) return escapeHtml(code);
  try {
    const grammar = Prism.languages[lang];
    if (grammar) return Prism.highlight(code, grammar, lang);
    // Trigger autoloader then return escaped for now; will update on next input
    if (Prism.plugins && Prism.plugins.autoloader) {
      Prism.plugins.autoloader.loadLanguages([lang]);
    }
  } catch (_) { /* fall through */ }
  return escapeHtml(code);
}

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function applySourceHighlight(code, langName) {
  sourceHighlightCode.className = `language-${prismLangMap[langName] || "plain"}`;
  sourceHighlightCode.innerHTML = highlightCode(code, langName);
}

function applyOutputHighlight(code, langName) {
  const lang = prismLangMap[langName] || "plain";
  translatedOutput.className = `language-${lang}`;
  translatedOutput.innerHTML = highlightCode(code, langName);
}

function applyOptimizedHighlight(code, langName) {
  const lang = prismLangMap[langName] || "plain";
  optimizedCodeBlock.className = `language-${lang}`;
  optimizedCodeBlock.innerHTML = highlightCode(code, langName);
}

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
  { name: "Rust", tests: [[/\bfn\s+main\(/, 5], [/\blet\s+mut\b/, 4], [/println!\(/, 5], [/\buse\s+std::/, 4]] }
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
  Rust: { int: "let mut", double: "let mut", float: "let mut", char: "let mut", String: "let mut", boolean: "let mut", bool: "let mut" }
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
  return expression
    .replace(/\btrue\b/g, target === "Python" ? "True" : "true")
    .replace(/\bfalse\b/g, target === "Python" ? "False" : "false")
    .replace(/\bnull\b/g, target === "Python" ? "None" : "null")
    .replace(/([A-Za-z_]\w*)\.length\b/g, "$1.length");
}

function formatStyle(style) {
  return styleLabels[style] || styleLabels[defaultStyle];
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
  let previousWasHeader = false;
  let inClass = false;

  for (const rawLine of source.split(linesPattern)) {
    let line = rawLine.trim();

    if (!line || cLikeSkipPattern.test(line)) continue;

    if (line.startsWith("}")) {
      indent = Math.max(0, indent - 1);
      line = line.replace(/^}+\s*/, "");
      if (!line) continue;
    }

    if (classDeclarationPattern.test(line)) {
      // class Foo { or public class Foo extends Bar {
      const classMatch = line.match(/(?:public\s+)?(?:abstract\s+)?class\s+(\w+)(?:\s+extends\s+(\w+))?(?:\s+implements\s+[\w,\s]+)?\s*\{?$/);
      if (classMatch) {
        const base = classMatch[2] ? `(${classMatch[2]})` : "";
        output.push(`${"  ".repeat(indent)}class ${classMatch[1]}${base}:`);
        indent += 1;
        inClass = true;
        previousWasHeader = true;
        continue;
      }
      continue;
    }

    // interface → class (abstract base)
    if (/^\s*(?:public\s+)?interface\s+(\w+)/.test(line)) {
      const m = line.match(/interface\s+(\w+)/);
      if (m) {
        output.push(`${"  ".repeat(indent)}class ${m[1]}:`);
        indent += 1;
        previousWasHeader = true;
        continue;
      }
    }

    // Constructor
    if (/^\s*(?:public\s+)?\w+\s*\(/.test(line) && inClass && !line.startsWith("if") && !line.startsWith("while") && !line.startsWith("for")) {
      const ctorMatch = line.match(/^(?:public\s+)?(\w+)\s*\(([^)]*)\)\s*\{?$/);
      if (ctorMatch && ctorMatch[1] === ctorMatch[1]) {
        const params = convertParams(ctorMatch[2], "Python");
        output.push(`${"  ".repeat(indent)}def __init__(self${params ? ", " + params : ""}):`);
        indent += 1;
        previousWasHeader = true;
        continue;
      }
    }

    // Method declarations: public int foo(int x) {
    const methodMatch = line.match(/^(?:(?:public|private|protected|static|final|override|async)\s+)*(?:[\w<>\[\]]+\s+)?(\w+)\s*\(([^)]*)\)\s*(?:throws\s+\w+\s*)?\{?$/);
    if (methodMatch && !line.startsWith("if") && !line.startsWith("while") && !line.startsWith("for") && !line.startsWith("switch")) {
      const fnName = methodMatch[1];
      const params = convertParams(methodMatch[2], "Python");
      const isStatic = /\bstatic\b/.test(line);
      const selfParam = inClass && !isStatic ? "self" + (params ? ", " + params : "") : params;
      if (isStatic && inClass) {
        output.push(`${"  ".repeat(indent)}@staticmethod`);
        output.push(`${"  ".repeat(indent)}def ${fnName}(${params}):`);
      } else {
        output.push(`${"  ".repeat(indent)}def ${fnName}(${selfParam}):`);
      }
      indent += 1;
      previousWasHeader = true;
      continue;
    }

    if (/main\s*\(/.test(line) && !/\.\s*main/.test(line)) {
      output.push(`${"  ".repeat(indent)}def main():`);
      indent = indent + 1;
      previousWasHeader = true;
      continue;
    }

    const { code, comment } = stripComment(line);
    line = code.trim();

    // for (int i = 0; i < n; i++)
    const forMatch = line.match(/^for\s*\(\s*(?:int\s+)?(\w+)\s*=\s*([^;]+);\s*\1\s*<\s*([^;]+);\s*\1\+\+\s*\)\s*\{?$/);
    if (forMatch) {
      output.push(`${"  ".repeat(indent)}for ${forMatch[1]} in range(${normalizeExpression(forMatch[2].trim(), "Python")}, ${normalizeExpression(forMatch[3].trim(), "Python")}):`);
      indent += 1; previousWasHeader = true; continue;
    }

    // for (Type item : collection)
    const forEachMatch = line.match(/^for\s*\(\s*(?:\w+[\w<>, ]*)\s+(\w+)\s*:\s*(\w+[\w.]*)\s*\)\s*\{?$/);
    if (forEachMatch) {
      output.push(`${"  ".repeat(indent)}for ${forEachMatch[1]} in ${forEachMatch[2]}:`);
      indent += 1; previousWasHeader = true; continue;
    }

    // while
    const whileMatch = line.match(/^while\s*\((.*)\)\s*\{?$/);
    if (whileMatch) {
      output.push(`${"  ".repeat(indent)}while ${normalizeExpression(whileMatch[1], "Python")}:`);
      indent += 1; previousWasHeader = true; continue;
    }

    // do { → while True: (approximation)
    if (/^do\s*\{?$/.test(line)) {
      output.push(`${"  ".repeat(indent)}while True:`);
      indent += 1; previousWasHeader = true; continue;
    }

    // if/else if/else
    const ifMatch = line.match(/^(else\s+)?if\s*\((.*)\)\s*\{?$/);
    if (ifMatch) {
      const kw = ifMatch[1] ? "elif" : "if";
      output.push(`${"  ".repeat(indent)}${kw} ${normalizeExpression(ifMatch[2], "Python")}:`);
      indent += 1; previousWasHeader = true; continue;
    }
    if (/^else\s*\{?$/.test(line)) {
      output.push(`${"  ".repeat(Math.max(0, indent - 1))}else:`);
      previousWasHeader = true; continue;
    }

    // switch → if/elif chain (basic)
    const switchMatch = line.match(/^switch\s*\((\w+)\)\s*\{?$/);
    if (switchMatch) {
      output.push(`${"  ".repeat(indent)}# switch ${switchMatch[1]}`);
      previousWasHeader = true; continue;
    }
    const caseMatch = line.match(/^case\s+(.+):$/);
    if (caseMatch) {
      output.push(`${"  ".repeat(indent)}if ${output.length > 0 && output[output.length-1].includes("if ") ? "... == " : ""}${caseMatch[1]}:`);
      previousWasHeader = true; continue;
    }
    if (/^default:$/.test(line)) {
      output.push(`${"  ".repeat(indent)}else:`);
      previousWasHeader = true; continue;
    }

    // try/catch/finally
    if (/^try\s*\{?$/.test(line)) {
      output.push(`${"  ".repeat(indent)}try:`);
      indent += 1; previousWasHeader = true; continue;
    }
    const catchMatch = line.match(/^catch\s*\(([^)]*)\)\s*\{?$/);
    if (catchMatch) {
      const exType = catchMatch[1].split(" ")[0] || "Exception";
      const exVar = catchMatch[1].split(" ")[1] || "e";
      output.push(`${"  ".repeat(Math.max(0, indent - 1))}except ${exType} as ${exVar}:`);
      previousWasHeader = true; continue;
    }
    if (/^finally\s*\{?$/.test(line)) {
      output.push(`${"  ".repeat(Math.max(0, indent - 1))}finally:`);
      previousWasHeader = true; continue;
    }

    // throw
    if (/^throw\s+new\s+/.test(line)) {
      output.push(`${"  ".repeat(indent)}raise ${line.replace(/^throw\s+new\s+/, "").replace(/;$/, "")}`);
      continue;
    }

    // return
    const returnMatch = line.match(/^return\s*(.*?);?$/);
    if (returnMatch && !line.startsWith("//")) {
      output.push(`${"  ".repeat(indent)}return ${normalizeExpression(returnMatch[1], "Python")}`);
      previousWasHeader = false; continue;
    }

    const scanfLine = convertScanfToPython(line);
    if (scanfLine) { output.push(`${"  ".repeat(indent)}${scanfLine}${comment ? ` ${comment}` : ""}`); previousWasHeader = false; continue; }

    const printfLine = convertPrintfToPython(line);
    if (printfLine) { output.push(`${"  ".repeat(indent)}${printfLine}${comment ? ` ${comment}` : ""}`); previousWasHeader = false; continue; }

    line = line
      .replace(/^System\.out\.println\s*\((.*)\);?$/, "print($1)")
      .replace(/^System\.out\.print\s*\((.*)\);?$/, "print($1, end='')")
      .replace(/^Console\.WriteLine\s*\((.*)\);?$/, "print($1)")
      .replace(/^Console\.Write\s*\((.*)\);?$/, "print($1, end='')")
      .replace(/^console\.log\s*\((.*)\);?$/, "print($1)")
      .replace(/^printf\s*\("([^"]*)\\n"\s*\);?$/, 'print("$1")')
      .replace(/^printf\s*\("([^"]*)"\s*\);?$/, 'print("$1", end="")')
      .replace(/^printf\s*\((.*)\);?$/, "print($1)")
      .replace(/^fmt\.Println\s*\((.*)\);?$/, "print($1)")
      .replace(/^puts\s+(.*);?$/, "print($1)")
      .replace(/^echo\s+(.*);?$/, "print($1)")
      .replace(/\bnew\s+ArrayList\s*<[^>]*>\s*\(\)/g, "[]")
      .replace(/\bnew\s+HashMap\s*<[^>]*>\s*\(\)/g, "{}")
      .replace(/\bnew\s+HashSet\s*<[^>]*>\s*\(\)/g, "set()")
      .replace(/(\w+)\.add\((.+)\)/g, "$1.append($2)")
      .replace(/(\w+)\.size\(\)/g, "len($1)")
      .replace(/(\w+)\.get\((.+)\)/g, "$1[$2]")
      .replace(/(\w+)\.put\((.+),\s*(.+)\)/g, "$1[$2] = $3")
      .replace(/(\w+)\.containsKey\((.+)\)/g, "$2 in $1")
      .replace(/(\w+)\.contains\((.+)\)/g, "$2 in $1")
      .replace(/(\w+)\.toUpperCase\(\)/g, "$1.upper()")
      .replace(/(\w+)\.toLowerCase\(\)/g, "$1.lower()")
      .replace(/(\w+)\.trim\(\)/g, "$1.strip()")
      .replace(/(\w+)\.length\(\)/g, "len($1)")
      .replace(/\b(\w+)\.length\b/g, "len($1)")
      .replace(/(\w+)\.substring\((\d+),\s*(\d+)\)/g, "$1[$2:$3]")
      .replace(/(\w+)\.charAt\((\d+)\)/g, "$1[$2]")
      .replace(/(\w+)\.indexOf\((.+)\)/g, "$1.index($2)")
      .replace(/(\w+)\.split\((.+)\)/g, "$1.split($2)")
      .replace(/(\w+)\.replace\((.+),\s*(.+)\)/g, "$1.replace($2, $3)")
      .replace(/Integer\.parseInt\((.+)\)/g, "int($1)")
      .replace(/Double\.parseDouble\((.+)\)/g, "float($1)")
      .replace(/String\.valueOf\((.+)\)/g, "str($1)")
      .replace(/Math\.max\((.+),\s*(.+)\)/g, "max($1, $2)")
      .replace(/Math\.min\((.+),\s*(.+)\)/g, "min($1, $2)")
      .replace(/Math\.abs\((.+)\)/g, "abs($1)")
      .replace(/Math\.sqrt\((.+)\)/g, "math.sqrt($1)")
      .replace(/Math\.pow\((.+),\s*(.+)\)/g, "$1 ** $2")
      .replace(/Math\.floor\((.+)\)/g, "math.floor($1)")
      .replace(/Math\.ceil\((.+)\)/g, "math.ceil($1)")
      .replace(/;$/, "");

    line = line
      .replace(/^(?:int|long|double|float)\s+(\w+)\[(\d+)\]\[(\d+)\]$/, "$1 = [[0]*$3 for _ in range($2)]")
      .replace(/^(?:int|long|double|float)\s+(\w+)\[(\d+)\]$/, "$1 = [0] * $2")
      .replace(/^(?:int|long|double|float|char|String|string|boolean|bool)\s+((?:\w+\s*,\s*)+\w+)$/, (_, names) =>
        names.split(",").map(n => n.trim()).join(" = ") + " = 0")
      .replace(/^(?:int|long|double|float|char|String|string|boolean|bool)\s+(\w+)\s*=\s*(.*)$/, "$1 = $2")
      .replace(/^(?:int|long|double|float|char|String|string|boolean|bool)\[\]\s+(\w+)\s*=\s*\{(.*)\}$/, "$1 = [$2]")
      .replace(/^(?:List|ArrayList)<\w+>\s+(\w+)\s*=.*$/, "$1 = []")
      .replace(/^(?:Map|HashMap)<\w+,\s*\w+>\s+(\w+)\s*=.*$/, "$1 = {}");

    if (line.endsWith("{")) {
      line = line.slice(0, -1).trim() + ":";
      output.push(`${"  ".repeat(indent)}${line}${comment ? ` ${comment}` : ""}`);
      indent += 1; previousWasHeader = true; continue;
    }

    if (line && line !== "}") {
      output.push(`${"  ".repeat(indent)}${normalizeExpression(line, "Python")}${comment ? ` ${comment}` : ""}`);
      previousWasHeader = false;
    }
  }

  if (output.some(l => l.trimStart().startsWith("def main():"))) {
    output.push(""); output.push('if __name__ == "__main__":'); output.push("  main()");
  } else if (previousWasHeader) {
    output.push(`${"  ".repeat(indent)}pass`);
  }

  return output.join("\n");
}

function convertParams(paramStr, target) {
  if (!paramStr || !paramStr.trim()) return "";
  return paramStr.split(",").map(p => {
    const parts = p.trim().split(/\s+/);
    if (target === "Python") return parts[parts.length - 1] || p.trim();
    return p.trim();
  }).join(", ");
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
  const isKotlin = target === "Kotlin";
  const isRust = target === "Rust";
  const isGo = target === "Go";
  const isCSharp = target === "C#";
  const isJava = target === "Java";
  const isC = target === "C";
  const isCpp = target === "C++";

  // File headers
  if (isCpp) output.push("#include <iostream>", "#include <vector>", "#include <string>", "#include <map>", "");
  if (isC) output.push("#include <stdio.h>", "#include <stdlib.h>", "#include <string.h>", "");
  if (isGo) output.push("package main", "", 'import "fmt"', "");
  if (isCSharp) output.push("using System;", "using System.Collections.Generic;", "");
  if (isJava) output.push("import java.util.*;", "", "public class Main {");

  let indentLevel = isJava ? 1 : 0;
  const pad = (n) => "  ".repeat(n);

  for (const rawLine of source.split(linesPattern)) {
    const line = rawLine.trim();
    if (!line || cLikeSkipPattern.test(line)) continue;
    if (/^(?:from|import)\s+\w/.test(line) && !isGo) continue; // Python imports

    const { code: lineCode, comment } = stripComment(line);
    const lc = lineCode.trim();
    if (!lc) { if (comment) output.push(pad(indentLevel) + comment); continue; }

    const commentSuffix = comment ? ` ${isJsLike || isJava || isCpp || isC || isCSharp || isGo || isRust ? "//" + comment.replace(/^#\s*/, " ") : comment}` : "";

    // ── class declarations ─────────────────────────────
    const classMatch = lc.match(/^(?:(?:public|private|abstract)\s+)*class\s+(\w+)(?:\s*[\(:]\s*(\w+))?/);
    if (classMatch) {
      const name = classMatch[1];
      const base = classMatch[2];
      if (isJava) output.push(`${pad(indentLevel)}public class ${name}${base ? " extends " + base : ""} {`);
      else if (isCSharp) output.push(`${pad(indentLevel)}public class ${name}${base ? " : " + base : ""} {`);
      else if (isKotlin) output.push(`${pad(indentLevel)}class ${name}${base ? "(" + base + ")" : ""} {`);
      else if (isCpp) output.push(`${pad(indentLevel)}class ${name}${base ? " : public " + base : ""} {`);
      else if (isJsLike) output.push(`${pad(indentLevel)}class ${name}${base ? " extends " + base : ""} {`);
      else output.push(`${pad(indentLevel)}// class ${name}`);
      indentLevel++;
      continue;
    }

    // ── function/method declarations ───────────────────
    const funcMatch = lc.match(/^def\s+(\w+)\s*\(([^)]*)\)(?:\s*->\s*[\w\[\], ]+)?:$/);
    if (funcMatch) {
      const fname = funcMatch[1];
      const rawParams = funcMatch[2].replace(/self,?\s*/, "").trim();
      const params = convertParamsToTarget(rawParams, target);
      if (fname === "__init__") {
        if (isJava) output.push(`${pad(indentLevel)}public ${getClassName(output) || "Main"}(${params}) {`);
        else if (isCSharp) output.push(`${pad(indentLevel)}public ${getClassName(output) || "Program"}(${params}) {`);
        else if (isKotlin) output.push(`${pad(indentLevel)}constructor(${params}) {`);
        else if (isCpp) output.push(`${pad(indentLevel)}${getClassName(output) || "MyClass"}(${params}) {`);
        else if (isJsLike) output.push(`${pad(indentLevel)}constructor(${params}) {`);
        else output.push(`${pad(indentLevel)}// constructor`);
      } else {
        const ret = fname === "main" ? (isC || isCpp ? "int" : isJava ? "void" : isGo ? "" : "") : "auto";
        if (isJava) output.push(`${pad(indentLevel)}public static void ${fname}(${params}) {`);
        else if (isCSharp) output.push(`${pad(indentLevel)}public static void ${fname}(${params}) {`);
        else if (isKotlin) output.push(`${pad(indentLevel)}fun ${fname}(${params}) {`);
        else if (isGo) output.push(`${pad(indentLevel)}func ${fname}(${params}) {`);
        else if (isRust) output.push(`${pad(indentLevel)}fn ${fname}(${params}) {`);
        else if (isCpp || isC) output.push(`${pad(indentLevel)}void ${fname}(${params}) {`);
        else if (isJsLike) output.push(`${pad(indentLevel)}function ${fname}(${params}) {`);
        else output.push(`${pad(indentLevel)}// fn ${fname}`);
      }
      indentLevel++;
      continue;
    }

    // ── main entry point ───────────────────────────────
    if (/^(?:if\s+__name__\s*==\s*["']__main__["']:|main\(\))/.test(lc)) {
      if (isJava) output.push(`${pad(indentLevel)}public static void main(String[] args) {`);
      else if (isCSharp) output.push(`${pad(indentLevel)}static void Main(string[] args) {`);
      else if (isKotlin) output.push(`${pad(indentLevel)}fun main() {`);
      else if (isGo) output.push(`${pad(indentLevel)}func main() {`);
      else if (isRust) output.push(`${pad(indentLevel)}fn main() {`);
      else if (isC || isCpp) output.push(`${pad(indentLevel)}int main() {`);
      else if (isJsLike) output.push(`${pad(indentLevel)}function main() {`);
      indentLevel++;
      continue;
    }

    // ── control flow ───────────────────────────────────
    const ifMatch = lc.match(/^(elif|if|else if)\s+(.+):$/);
    if (ifMatch) {
      const kw = ifMatch[1] === "elif" ? "else if" : ifMatch[1];
      const cond = normalizeExpression(ifMatch[2], target);
      if (isKotlin || isRust || isGo || isJsLike || isJava || isCSharp || isCpp || isC)
        output.push(`${pad(indentLevel)}${kw} (${cond}) {`);
      indentLevel++;
      continue;
    }
    if (/^if\s+.+:$/.test(lc)) {
      const cond = normalizeExpression(lc.replace(/^if\s+/, "").replace(/:$/, ""), target);
      output.push(`${pad(indentLevel)}if (${cond}) {`);
      indentLevel++;
      continue;
    }
    if (/^else:$/.test(lc)) {
      output.push(`${pad(Math.max(0, indentLevel - 1))}} else {`);
      continue;
    }

    // Python for/while
    const forPyRange = lc.match(/^for\s+(\w+)\s+in\s+range\(\s*(\S+?)\s*(?:,\s*(\S+?))?\s*\):$/);
    if (forPyRange) {
      const v = forPyRange[1], start = forPyRange[3] ? forPyRange[2] : "0", end = forPyRange[3] || forPyRange[2];
      const kw = isJsLike ? "let" : isKotlin ? "var" : "int";
      if (isKotlin) output.push(`${pad(indentLevel)}for (${v} in ${start} until ${end}) {`);
      else if (isRust) output.push(`${pad(indentLevel)}for ${v} in ${start}..${end} {`);
      else output.push(`${pad(indentLevel)}for (${kw} ${v} = ${start}; ${v} < ${end}; ${v}++) {`);
      indentLevel++;
      continue;
    }
    const forPyIn = lc.match(/^for\s+(\w+)\s+in\s+(.+):$/);
    if (forPyIn) {
      const v = forPyIn[1], col = forPyIn[2];
      if (isJava) output.push(`${pad(indentLevel)}for (var ${v} : ${col}) {`);
      else if (isCSharp) output.push(`${pad(indentLevel)}foreach (var ${v} in ${col}) {`);
      else if (isKotlin) output.push(`${pad(indentLevel)}for (${v} in ${col}) {`);
      else if (isRust) output.push(`${pad(indentLevel)}for ${v} in ${col}.iter() {`);
      else if (isGo) output.push(`${pad(indentLevel)}for _, ${v} := range ${col} {`);
      else if (isJsLike) output.push(`${pad(indentLevel)}for (const ${v} of ${col}) {`);
      else output.push(`${pad(indentLevel)}for (auto ${v} : ${col}) {`);
      indentLevel++;
      continue;
    }
    const whilePy = lc.match(/^while\s+(.+):$/);
    if (whilePy) {
      output.push(`${pad(indentLevel)}while (${normalizeExpression(whilePy[1], target)}) {`);
      indentLevel++;
      continue;
    }

    // try/except/finally
    if (/^try:$/.test(lc)) { output.push(`${pad(indentLevel)}try {`); indentLevel++; continue; }
    const exceptMatch = lc.match(/^except(?:\s+(\w+)(?:\s+as\s+(\w+))?)?:$/);
    if (exceptMatch) {
      const exc = exceptMatch[1] || "Exception";
      const evar = exceptMatch[2] || "e";
      if (isJava || isCSharp || isCpp || isC) output.push(`${pad(Math.max(0,indentLevel-1))}} catch (${exc} ${evar}) {`);
      else if (isKotlin) output.push(`${pad(Math.max(0,indentLevel-1))}} catch (${evar}: ${exc}) {`);
      else if (isRust) output.push(`${pad(Math.max(0,indentLevel-1))}} // catch`);
      else output.push(`${pad(Math.max(0,indentLevel-1))}} catch (${evar}) {`);
      continue;
    }
    if (/^finally:$/.test(lc)) { output.push(`${pad(Math.max(0,indentLevel-1))}} finally {`); continue; }

    // raise → throw
    const raiseMatch = lc.match(/^raise\s+(.*)/);
    if (raiseMatch) {
      const semi = noSemicolonLanguages.has(target) ? "" : ";";
      output.push(`${pad(indentLevel)}throw new ${raiseMatch[1]}${semi}`);
      continue;
    }

    // return
    const retPy = lc.match(/^return\s*(.*)/);
    if (retPy && !lc.startsWith("//")) {
      const val = normalizeExpression(retPy[1], target);
      const semi = noSemicolonLanguages.has(target) ? "" : ";";
      output.push(`${pad(indentLevel)}return ${val}${semi}${commentSuffix}`);
      continue;
    }

    // pass → {}
    if (/^pass$/.test(lc)) { continue; }

    // print statement
    const printLine = convertPrint(lc, target);
    if (printLine) { output.push(`${pad(indentLevel)}${printLine}${commentSuffix}`); continue; }

    // Variable declarations (Python: x = val  or  x: type = val)
    const pyVarDecl = lc.match(/^(\w+)\s*(?::\s*[\w\[\], ]+)?\s*=\s*(.+)$/);
    if (pyVarDecl && !lc.includes("==") && !lc.startsWith("if ") && !lc.startsWith("elif ") && !lc.startsWith("while ")) {
      const converted = convertDeclaration(lc, target);
      if (converted !== lc) { output.push(`${pad(indentLevel)}${converted}${commentSuffix}`); continue; }
    }

    // C-style for loop pass-through
    const forC = lc.match(/^for\s*\(/);
    if (forC) { output.push(`${pad(indentLevel)}${ensureSemi(lc, target)}${commentSuffix}`); indentLevel++; continue; }

    // Generic declaration conversion
    const decl = convertDeclaration(lc, target);
    if (decl !== lc) { output.push(`${pad(indentLevel)}${decl}${commentSuffix}`); continue; }

    // Closing braces from Python dedent (handled by indentLevel)
    if (lc === "}" || lc === "{") { output.push(lc); continue; }

    // Default: emit with semicolon if needed
    output.push(`${pad(indentLevel)}${ensureSemi(lc, target)}${commentSuffix}`);
  }

  // Close Java outer class
  if (isJava) { output.push("  }"); output.push("}"); }
  else if (isCSharp) { output.push("  }"); output.push("}"); }
  else if (isC || isCpp) { output.push("  return 0;"); output.push("}"); }
  else if (isKotlin || isGo || isRust) { output.push("}"); }

  return output.join("\n");
}

function getClassName(outputLines) {
  for (let i = outputLines.length - 1; i >= 0; i--) {
    const m = outputLines[i].match(/class\s+(\w+)/);
    if (m) return m[1];
  }
  return null;
}

function convertParamsToTarget(paramStr, target) {
  if (!paramStr.trim()) return "";
  return paramStr.split(",").map(p => {
    const name = p.trim().split(/\s+/).pop();
    if (target === "TypeScript") return `${name}: any`;
    if (target === "Java") return `Object ${name}`;
    if (target === "C#") return `object ${name}`;
    if (target === "C++" || target === "C") return `auto ${name}`;
    if (target === "Kotlin") return `${name}: Any`;
    if (target === "Rust") return `${name}: i32`;
    if (target === "Go") return `${name} interface{}`;
    return name;
  }).join(", ");
}

function ensureSemi(line, target) {
  if (noSemicolonLanguages.has(target)) return line;
  if (line.endsWith(";") || line.endsWith("{") || line.endsWith("}") || line.endsWith(":")) return line;
  return line + ";";
}

function translateCode(payload) {
  const { sourceCode: source, sourceLanguage, targetLanguage: target, style, options } = payload;
  const addComments = options && options.addComments;

  if (!source.trim()) {
    return "Paste code first, then click Translate Code.";
  }

  let result;

  if (target === "Python") {
    result = toPython(source);
  } else if (supportedBraceLanguages.has(target)) {
    result = toBraceLanguage(source, target);
  } else if (target === "Ruby") {
    result = toRuby(source);
  } else if (target === "PHP") {
    result = toPHP(source);
  } else if (target === "Swift") {
    result = toSwift(source);
  } else {
    result = `# ${target} translation\n# Source: ${sourceLanguage} | Style: ${formatStyle(style)}\n\n${source}`;
  }

  if (addComments) {
    result = injectComments(result, target, sourceLanguage, style);
  }

  return result;
}

function injectComments(code, target, sourceLanguage, style) {
  const isHash = target === "Python" || target === "Ruby";
  const c = isHash ? "#" : "//";
  const lines = code.split(linesPattern);

  const header = [
    `${c} Translated from ${sourceLanguage} to ${target}`,
    `${c} Style: ${formatStyle(style)}`,
    `${c} Generated by CodeLingo`,
    ""
  ];

  const annotated = lines.map(line => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith(c) || trimmed.startsWith("/*") || trimmed.startsWith("*")) return line;

    // Function / method definition
    if (/^(def |func |function |fun |fn )/.test(trimmed) ||
        (/^(public|private|protected|static)\s/.test(trimmed) && (trimmed.endsWith("{") || trimmed.endsWith(":")))) {
      const nameMatch = trimmed.match(/(?:def|func|function|fun|fn)\s+(\w+)/);
      const name = nameMatch ? nameMatch[1] : "method";
      return `${line}  ${c} ${name}() — translated from ${sourceLanguage}`;
    }

    // Loops
    if (/^(for |while |foreach )/.test(trimmed)) {
      return `${line}  ${c} loop`;
    }

    // Conditionals
    if (/^(if |} else if |else if |elif |} else|else:)/.test(trimmed)) {
      return `${line}  ${c} condition`;
    }

    // Return
    if (/^return /.test(trimmed)) {
      return `${line}  ${c} return value`;
    }

    // Print / output
    if (/^(print|console\.log|System\.out|fmt\.Print|puts|echo|println)/.test(trimmed)) {
      return `${line}  ${c} output`;
    }

    // Variable declaration / assignment (only simple ones)
    if ((/^(const |let |var |int |double |float |string |bool |auto |val )/.test(trimmed) ||
         /^\w+\s*=\s*/.test(trimmed)) && !trimmed.includes("==") && !trimmed.startsWith("if ")) {
      return `${line}  ${c} variable`;
    }

    return line;
  });

  return [...header, ...annotated].join("\n");
}

function toRuby(source) {
  const out = [];
  for (const rawLine of source.split(linesPattern)) {
    let line = rawLine.trim();
    if (!line || cLikeSkipPattern.test(line)) continue;
    if (line.startsWith("}")) { out.push("end"); continue; }
    if (classDeclarationPattern.test(line)) {
      const m = line.match(/class\s+(\w+)/);
      out.push(`class ${m ? m[1] : "MyClass"}`); continue;
    }
    const funcMatch = line.match(/^def\s+(\w+)\s*\(([^)]*)\)/);
    if (funcMatch) { out.push(`def ${funcMatch[1]}(${convertParams(funcMatch[2].replace(/self,?\s*/,""), "Ruby")})`); continue; }
    const methodMatch = line.match(/^(?:(?:public|private|static)\s+)*\w+\s+(\w+)\s*\(([^)]*)\)\s*\{?$/);
    if (methodMatch && !line.startsWith("if") && !line.startsWith("for") && !line.startsWith("while")) {
      out.push(`def ${methodMatch[1]}(${convertParams(methodMatch[2], "Ruby")})`); continue;
    }
    if (/main\s*\(/.test(line)) continue;
    line = line
      .replace(/^System\.out\.println\s*\((.*)\);?$/, "puts $1")
      .replace(/^console\.log\s*\((.*)\);?$/, "puts $1")
      .replace(/^print\s*\((.*)\)$/, "puts $1")
      .replace(/^fmt\.Println\s*\((.*)\);?$/, "puts $1")
      .replace(/\bnew\s+ArrayList\s*<[^>]*>\s*\(\)/g, "[]")
      .replace(/\bnew\s+HashMap\s*<[^>]*>\s*\(\)/g, "{}")
      .replace(/\.size\(\)/g, ".length")
      .replace(/\.add\(/g, ".push(")
      .replace(/\.get\((.+)\)/g, "[$1]")
      .replace(/Integer\.parseInt\((.+)\)/g, "$1.to_i")
      .replace(/Double\.parseDouble\((.+)\)/g, "$1.to_f")
      .replace(/String\.valueOf\((.+)\)/g, "$1.to_s")
      .replace(/;$/, "")
      .replace(/^(?:int|double|float|char|String|boolean|bool)\s+(\w+)\s*=\s*(.*)$/, "$1 = $2");
    const ifM = line.match(/^(?:else\s+)?if\s*\((.*)\)/);
    if (ifM) { out.push(line.includes("else") ? `elsif ${ifM[1]}` : `if ${ifM[1]}`); continue; }
    if (/^else/.test(line)) { out.push("else"); continue; }
    if (/^return\s/.test(line)) { out.push(line.replace(/;$/, "")); continue; }
    out.push(line.replace(/;$/, ""));
  }
  return out.join("\n");
}

function toPHP(source) {
  const out = ["<?php"];
  for (const rawLine of source.split(linesPattern)) {
    let line = rawLine.trim();
    if (!line || cLikeSkipPattern.test(line)) continue;
    if (classDeclarationPattern.test(line)) { out.push(line.replace(/^public\s+/, "")); continue; }
    const methodMatch = line.match(/^(?:(?:public|private|protected|static)\s+)*(?:\w+\s+)?(\w+)\s*\(([^)]*)\)\s*\{?$/);
    if (methodMatch && !line.startsWith("if") && !line.startsWith("for") && !line.startsWith("while")) {
      out.push(`function ${methodMatch[1]}(${convertParams(methodMatch[2], "PHP")}) {`); continue;
    }
    line = line
      .replace(/^System\.out\.println\s*\((.*)\);?$/, "echo $1;")
      .replace(/^console\.log\s*\((.*)\);?$/, "echo $1;")
      .replace(/^print\s*\((.*)\)$/, "echo $1;")
      .replace(/\bnew\s+ArrayList\s*<[^>]*>\s*\(\)/g, "[]")
      .replace(/\bnew\s+HashMap\s*<[^>]*>\s*\(\)/g, "[]")
      .replace(/^(?:int|double|float|char|String|boolean|bool)\s+(\w+)\s*=\s*(.*)$/, (_, n, v) => `$${n} = ${v};`)
      .replace(/\b([A-Za-z_]\w*)\b(?!\s*\(|\s*:)/g, (m) => ["true","false","null","return","if","else","for","while","foreach","echo","new","class","function","public","private","protected","static","void","int","string","float","bool","array","echo"].includes(m) ? m : (m.length > 1 ? `$${m}` : m));
    if (!line.endsWith(";") && !line.endsWith("{") && !line.endsWith("}")) line += ";";
    out.push(line);
  }
  return out.join("\n");
}

function toSwift(source) {
  const out = [];
  for (const rawLine of source.split(linesPattern)) {
    let line = rawLine.trim();
    if (!line || cLikeSkipPattern.test(line)) continue;
    if (line.startsWith("}")) { out.push("}"); continue; }
    if (classDeclarationPattern.test(line)) {
      const m = line.match(/class\s+(\w+)(?:\s+extends\s+(\w+))?/);
      out.push(`class ${m ? m[1] : "MyClass"}${m && m[2] ? " : " + m[2] : ""} {`); continue;
    }
    const funcMatch = line.match(/^def\s+(\w+)\s*\(([^)]*)\)/);
    if (funcMatch) { out.push(`func ${funcMatch[1]}(${convertParams(funcMatch[2].replace(/self,?\s*/,""), "Swift")}) {`); continue; }
    const methodMatch = line.match(/^(?:(?:public|private|static)\s+)*(?:\w+\s+)?(\w+)\s*\(([^)]*)\)\s*\{?$/);
    if (methodMatch && !line.startsWith("if") && !line.startsWith("for") && !line.startsWith("while")) {
      out.push(`func ${methodMatch[1]}(${convertParams(methodMatch[2], "Swift")}) {`); continue;
    }
    if (/main\s*\(/.test(line) && !/\./.test(line)) continue;
    line = line
      .replace(/^System\.out\.println\s*\((.*)\);?$/, "print($1)")
      .replace(/^console\.log\s*\((.*)\);?$/, "print($1)")
      .replace(/^puts\s+(.*);?$/, "print($1)")
      .replace(/^fmt\.Println\s*\((.*)\);?$/, "print($1)")
      .replace(/\bnew\s+ArrayList\s*<[^>]*>\s*\(\)/g, "[]")
      .replace(/\bnew\s+HashMap\s*<[^>]*>\s*\(\)/g, "[:]")
      .replace(/\.add\(/g, ".append(")
      .replace(/\.size\(\)/g, ".count")
      .replace(/Integer\.parseInt\((.+)\)/g, "Int($1)!")
      .replace(/Double\.parseDouble\((.+)\)/g, "Double($1)!")
      .replace(/^(?:int|long)\s+(\w+)\s*=\s*(.*)$/, "var $1: Int = $2")
      .replace(/^(?:double|float)\s+(\w+)\s*=\s*(.*)$/, "var $1: Double = $2")
      .replace(/^(?:String|string)\s+(\w+)\s*=\s*(.*)$/, "var $1: String = $2")
      .replace(/^(?:boolean|bool)\s+(\w+)\s*=\s*(.*)$/, "var $1: Bool = $2")
      .replace(/;$/, "");
    const ifM = line.match(/^(?:else\s+)?if\s*\((.*)\)\s*\{?$/);
    if (ifM) { out.push(`${line.includes("else") ? "} else if" : "if"} ${ifM[1]} {`); continue; }
    if (/^else\s*\{?$/.test(line)) { out.push("} else {"); continue; }
    out.push(line);
  }
  return out.join("\n");
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
      optimized: "The code is totally optimized.",
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

  // Sync source highlight overlay
  applySourceHighlight(code, detected.name);

  // Populate optimized code block with syntax highlighting
  if (code.trim()) {
    applyOptimizedHighlight(optimization.optimized, detected.name);
  } else {
    optimizedCodeBlock.className = "";
    optimizedCodeBlock.textContent = "Paste source code to see the optimized version.";
  }

  renderList(optimizationList, optimization.changes);
}

async function requestTranslation(payload) {
  const endpoint = window.CODE_TRANSLATE_API_URL;

  if (!endpoint) {
    return translateCode(payload);
  }

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error(`Translation API failed with status ${response.status}`);
  }

  const data = await response.json();
  return data.translatedCode || data.output || "";
}

function translate() {
  statusPill.textContent = "Translating";
  translateButton.disabled = true;

  const loader = document.getElementById("translateLoader");
  loader.classList.add("active");

  window.setTimeout(async () => {
    const detected = detectLanguage(sourceCode.value);
    const payload = buildTranslatePayload(sourceCode.value, detected.name, targetLanguage.value);

    try {
      const output = await requestTranslation(payload);
      applyOutputHighlight(output, targetLanguage.value);
      render();
      statusPill.textContent = "Validated";
    } catch (error) {
      translatedOutput.textContent = error.message;
      statusPill.textContent = "API Error";
    } finally {
      loader.classList.remove("active");
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

const optimizationPanel = document.getElementById("optimizationPanel");
const resultGrid = document.getElementById("resultGrid");

function updateOptimizationPanelVisibility() {
  const show = optimizeToggle.checked;
  optimizationPanel.style.display = show ? "" : "none";
  resultGrid.style.gridTemplateColumns = show ? "" : "1fr";
}

// Re-highlight source after Prism autoloader fetches a new language grammar
if (window.Prism && Prism.plugins && Prism.plugins.autoloader) {
  Prism.plugins.autoloader.languages_path =
    "https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/";
}

populateTargets();
setSelectedStyle(defaultStyle, false);
updateOptimizationPanelVisibility();
render();

sourceCode.addEventListener("input", render);
targetLanguage.addEventListener("change", render);
optimizeToggle.addEventListener("change", () => {
  updateOptimizationPanelVisibility();
  render();
});
commentsToggle.addEventListener("change", translate);
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
  copyText(optimizedCodeBlock.textContent, copyReportButton);
});

copyOutputButton.addEventListener("click", () => {
  copyText(translatedOutput.textContent, copyOutputButton);
});

// Keep the highlight pre scrolled in sync with the textarea
sourceCode.addEventListener("scroll", () => {
  const pre = document.getElementById("sourceHighlight");
  if (pre) {
    pre.scrollTop = sourceCode.scrollTop;
    pre.scrollLeft = sourceCode.scrollLeft;
  }
});
