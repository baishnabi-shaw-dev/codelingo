import AIProviderService from './AIProviderService.js';
import EncryptionService from './EncryptionService.js';

class CodeAnalysisService {
  constructor() {
    this.aiProvider = new AIProviderService();
    this.encryptionService = new EncryptionService();
  }

  async analyzeCode(user, code, language, analysisType, selectedProvider) {
    try {
      const provider = selectedProvider || user.preferredProvider || 'groq';
      const apiKey = this.getDecryptedApiKey(user, provider);

      if (!apiKey) {
        throw new Error(
          `No API key configured for ${provider}. Please add your API key in settings.`
        );
      }

      let result;

      switch (provider) {
        case 'gemini':
          result = await this.aiProvider.analyzeWithGemini(apiKey, code, analysisType);
          break;
        case 'openrouter':
          result = await this.aiProvider.analyzeWithOpenRouter(apiKey, code, analysisType);
          break;
        case 'groq':
        default:
          result = await this.aiProvider.analyzeWithGroq(apiKey, code, analysisType);
          break;
      }

      return result;
    } catch (error) {
      throw new Error(`Code analysis error: ${error.message}`);
    }
  }

  getDecryptedApiKey(user, provider) {
    if (!user.apiKeys || !user.apiKeys[provider]) {
      return null;
    }

    const encryptedKey = user.apiKeys[provider].key;
    return this.encryptionService.decrypt(encryptedKey);
  }
}

export default CodeAnalysisService;
