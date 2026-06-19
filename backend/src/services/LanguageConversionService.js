import AIProviderService from './AIProviderService.js';
import EncryptionService from './EncryptionService.js';

class LanguageConversionService {
  constructor() {
    this.aiProvider = new AIProviderService();
    this.encryptionService = new EncryptionService();
  }

  // Define supported conversions
  getSupportedConversions() {
    const pairs = [
      ['java', 'python'],
      ['java', 'javascript'],
      ['java', 'cpp'],
      ['python', 'javascript'],
      ['python', 'cpp'],
      ['c', 'cpp'],
      ['cpp', 'javascript'],
      ['csharp', 'java'],
      ['go', 'python'],
      ['rust', 'cpp'],
    ];

    return pairs.reduce((conversions, [from, to]) => {
      conversions[`${from}-${to}`] = { from, to };
      conversions[`${to}-${from}`] = { from: to, to: from };
      return conversions;
    }, {});
  }

  isConversionSupported(fromLang, toLang) {
    const supportedConversions = this.getSupportedConversions();
    const key = `${this.normalizeLanguage(fromLang)}-${this.normalizeLanguage(toLang)}`;
    return key in supportedConversions;
  }

  async convertCode(
    user,
    sourceCode,
    fromLanguage,
    toLanguage,
    selectedProvider,
    addHelpfulComments = false
  ) {
    try {
      const normalizedFrom = this.normalizeLanguage(fromLanguage);
      const normalizedTo = this.normalizeLanguage(toLanguage);

      if (!this.isConversionSupported(fromLanguage, toLanguage)) {
        throw new Error(
          `Conversion from ${fromLanguage} to ${toLanguage} is not supported`
        );
      }

      const provider = selectedProvider || user.preferredProvider || 'groq';
      const apiKey = this.getDecryptedApiKey(user, provider);

      if (!apiKey) {
        throw new Error(
          `No API key configured for ${provider}. Please add your API key in settings.`
        );
      }

      const prompt = this.getConversionPrompt(
        sourceCode,
        normalizedFrom,
        normalizedTo,
        addHelpfulComments
      );

      let result;
      switch (provider) {
        case 'gemini':
          result = await this.aiProvider.analyzeWithGemini(apiKey, '', '', prompt);
          break;
        case 'openrouter':
          result = await this.aiProvider.analyzeWithOpenRouter(apiKey, '', '', prompt);
          break;
        case 'groq':
        default:
          result = await this.aiProvider.analyzeWithGroq(apiKey, '', '', prompt);
          break;
      }

      return {
        convertedCode: result,
        conversionNotes: this.getConversionNotes(normalizedFrom, normalizedTo),
      };
    } catch (error) {
      throw new Error(`Language conversion error: ${error.message}`);
    }
  }

  getConversionPrompt(sourceCode, fromLanguage, toLanguage, addHelpfulComments = false) {
    const commentInstruction = addHelpfulComments
      ? 'Add concise, meaningful comments for important functions, loops, variables, and algorithms. Do not comment every line.'
      : 'Do not add new comments. Preserve existing user comments only.';

    return `Convert this ${fromLanguage} code to ${toLanguage}.

Rules:
- Preserve logic, functionality, variable names, function names, and class structure where possible.
- Do not change behavior, remove important code, or invent new logic.
- ${commentInstruction}
- Return only the converted code without explanations.

Source code:
\`\`\`${fromLanguage}
${sourceCode}
\`\`\`
`;
  }

  getConversionNotes(fromLanguage, toLanguage) {
    const notes = {
      'java-python': [
        'Java ArrayList becomes Python list',
        'Java String.split() becomes Python str.split()',
        'Java System.out.println() becomes Python print()',
        'Java null becomes Python None',
        'Java int becomes Python int (no type declarations needed)',
      ],
      'java-javascript': [
        'Java classes become JavaScript classes or objects',
        'Java ArrayList becomes JavaScript Array',
        'Java System.out.println() becomes JavaScript console.log()',
        'Java null becomes JavaScript null',
        'Java exception handling becomes JavaScript try/catch',
      ],
      'python-javascript': [
        'Python list becomes JavaScript array',
        'Python dict becomes JavaScript object',
        'Python print() becomes JavaScript console.log()',
        'Python None becomes JavaScript null',
        'Python indentation becomes JavaScript braces',
      ],
      'c-cpp': [
        'C-style structs become C++ classes',
        'C arrays can use C++ std::array',
        'C malloc/free become C++ new/delete',
        'C FILE I/O can use C++ iostreams',
      ],
    };

    const key = `${fromLanguage}-${toLanguage}`;
    return notes[key] || [];
  }

  normalizeLanguage(language) {
    const normalized = String(language || '').toLowerCase();
    const aliases = {
      'c++': 'cpp',
      'c#': 'csharp',
      js: 'javascript',
      ts: 'typescript',
    };

    return aliases[normalized] || normalized;
  }

  getDecryptedApiKey(user, provider) {
    if (!user.apiKeys || !user.apiKeys[provider]) {
      return null;
    }

    const encryptedKey = user.apiKeys[provider].key;
    return this.encryptionService.decrypt(encryptedKey);
  }
}

export default LanguageConversionService;
