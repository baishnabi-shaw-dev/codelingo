import axios from 'axios';

const SYSTEM_PROMPT = `You are CodeLingo's programming assistant. You only perform programming-related work: code translation, bug detection, code review, optimization, refactoring, documentation, complexity analysis, security review, and unit test generation. Refuse story writing, essays, poems, general chat, personal advice, or any non-programming request. Preserve code behavior and never invent unrelated logic.`;

class AIProviderService {
  async analyzeWithGroq(apiKey, code, analysisType, promptOverride = null) {
    try {
      const prompt = promptOverride || this.getAnalysisPrompt(code, analysisType);

      const response = await axios.post(
        'https://api.groq.com/openai/v1/chat/completions',
        {
          model: 'mixtral-8x7b-32768',
          messages: [
            {
              role: 'system',
              content: SYSTEM_PROMPT,
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 0.2,
          max_tokens: 4096,
        },
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data.choices[0].message.content;
    } catch (error) {
      throw new Error(`Groq API error: ${error.message}`);
    }
  }

  async analyzeWithGemini(apiKey, code, analysisType, promptOverride = null) {
    try {
      const prompt = promptOverride || this.getAnalysisPrompt(code, analysisType);

      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${apiKey}`,
        {
          contents: [
            {
              parts: [
                {
                  text: `${SYSTEM_PROMPT}\n\n${prompt}`,
                },
              ],
            },
          ],
        }
      );

      return response.data.candidates[0].content.parts[0].text;
    } catch (error) {
      throw new Error(`Gemini API error: ${error.message}`);
    }
  }

  async analyzeWithOpenRouter(apiKey, code, analysisType, promptOverride = null) {
    try {
      const prompt = promptOverride || this.getAnalysisPrompt(code, analysisType);

      const response = await axios.post(
        'https://openrouter.ai/api/v1/chat/completions',
        {
          model: 'mistralai/mistral-7b-instruct',
          messages: [
            {
              role: 'system',
              content: SYSTEM_PROMPT,
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 0.2,
          max_tokens: 4096,
        },
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data.choices[0].message.content;
    } catch (error) {
      throw new Error(`OpenRouter API error: ${error.message}`);
    }
  }

  getAnalysisPrompt(code, analysisType) {
    const prompts = {
      'bug-detection': `Analyze this code for bugs and potential issues:\n\n\`\`\`\n${code}\n\`\`\`\n\nReturn findings using this structure for every issue:\nIssue:\nSeverity:\nSuggestion:\n\nIf no issues are found, say "No issues detected."`,
      'code-review': `Review this code for best practices, readability, and maintainability:\n\n\`\`\`\n${code}\n\`\`\`\n\nProvide constructive feedback.`,
      'optimization': `Optimize this code without changing behavior, function names, variable names, public interfaces, or important structure:\n\n\`\`\`\n${code}\n\`\`\`\n\nReturn only the optimized code. Do not include prose outside the code.`,
      'security-analysis': `Analyze this code for security vulnerabilities:\n\n\`\`\`\n${code}\n\`\`\`\n\nProvide security recommendations.`,
      'complexity-analysis': `Analyze the time and space complexity of this code:\n\n\`\`\`\n${code}\n\`\`\`\n\nProvide complexity analysis.`,
      'test-generation': `Generate unit tests for this code:\n\n\`\`\`\n${code}\n\`\`\`\n\nProvide comprehensive unit tests.`,
      'refactoring': `Suggest refactoring improvements for this code:\n\n\`\`\`\n${code}\n\`\`\`\n\nProvide refactored code with explanations.`,
    };

    return prompts[analysisType] || prompts['code-review'];
  }
}

export default AIProviderService;
