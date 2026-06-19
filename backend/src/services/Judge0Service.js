import axios from 'axios';
import config from '../config/index.js';

const languageMap = {
  java: 26,
  python: 71,
  javascript: 63,
  typescript: 74,
  c: 50,
  cpp: 54,
  'c++': 54,
  csharp: 51,
  'c#': 51,
  go: 60,
  rust: 73,
  php: 68,
};

class Judge0Service {
  constructor() {
    this.apiUrl = config.judge0.apiUrl;
    this.apiKey = config.judge0.apiKey;
    this.client = axios.create({
      baseURL: this.apiUrl,
      headers: {
        'Content-Type': 'application/json',
        'X-RapidAPI-Key': this.apiKey,
        'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com',
      },
    });
  }

  getLanguageId(language) {
    return languageMap[language.toLowerCase()] || null;
  }

  async submitCode(code, language, stdin = '', timeLimit = 5) {
    try {
      const languageId = this.getLanguageId(language);
      if (!languageId) {
        throw new Error(`Unsupported language: ${language}`);
      }

      const response = await this.client.post('/submissions', {
        source_code: code,
        language_id: languageId,
        stdin: stdin,
        cpu_time_limit: timeLimit,
        memory_limit: 128000,
      });

      return response.data;
    } catch (error) {
      throw new Error(`Judge0 submission error: ${error.message}`);
    }
  }

  async getSubmissionResult(token) {
    try {
      const response = await this.client.get(`/submissions/${token}`);
      return response.data;
    } catch (error) {
      throw new Error(`Judge0 result error: ${error.message}`);
    }
  }

  async executeCode(code, language, stdin = '') {
    try {
      // Submit code
      const submission = await this.submitCode(code, language, stdin);
      const token = submission.token;

      // Poll for result (max 30 seconds)
      let result = null;
      let attempts = 0;
      const maxAttempts = 60; // 30 seconds with 500ms interval

      while (attempts < maxAttempts) {
        result = await this.getSubmissionResult(token);

        if (result.status && result.status.id > 2) {
          // Status > 2 means execution finished
          break;
        }

        await new Promise((resolve) => setTimeout(resolve, 500));
        attempts++;
      }

      if (!result || result.status.id <= 2) {
        throw new Error('Execution timeout');
      }

      return {
        success: result.status.id === 3, // 3 = Accepted
        output: result.stdout || '',
        error: result.stderr || result.compile_output || '',
        status: result.status.description,
        executionTime: result.time || 0,
        memory: result.memory || 0,
        statusId: result.status.id,
      };
    } catch (error) {
      throw new Error(`Code execution error: ${error.message}`);
    }
  }
}

export default Judge0Service;
