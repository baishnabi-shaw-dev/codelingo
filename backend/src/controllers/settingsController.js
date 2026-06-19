import User from '../models/User.js';
import EncryptionService from '../services/EncryptionService.js';

const encryptionService = new EncryptionService();
const VALID_PROVIDERS = ['groq', 'gemini', 'openrouter'];
const AI_PROVIDER_CONSENT_TEXT =
  'I understand that my submitted code may be sent to my selected AI provider for processing.';

export const updateApiKey = async (req, res) => {
  try {
    const { provider, apiKey, consentAccepted, consentText } = req.body;

    if (!VALID_PROVIDERS.includes(provider)) {
      return res.status(400).json({ message: 'Invalid provider' });
    }

    if (!apiKey || apiKey.trim().length === 0) {
      return res.status(400).json({ message: 'API key is required' });
    }

    if (consentAccepted !== true || consentText !== AI_PROVIDER_CONSENT_TEXT) {
      return res.status(400).json({
        message:
          'You must agree that submitted code may be sent to your selected AI provider before saving an API key.',
      });
    }

    const encryptedKey = encryptionService.encrypt(apiKey);

    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        $set: {
          [`apiKeys.${provider}.key`]: encryptedKey,
          [`apiKeys.${provider}.encrypted`]: true,
          'aiProviderConsent.accepted': true,
          'aiProviderConsent.acceptedAt': new Date(),
          'aiProviderConsent.consentText': AI_PROVIDER_CONSENT_TEXT,
        },
      },
      { new: true }
    );

    res.json({
      message: `${provider} API key updated successfully`,
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        preferredProvider: user.preferredProvider,
        aiProviderConsent: user.aiProviderConsent,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const setPreferredProvider = async (req, res) => {
  try {
    const { provider } = req.body;

    if (!VALID_PROVIDERS.includes(provider)) {
      return res.status(400).json({ message: 'Invalid provider' });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { preferredProvider: provider },
      { new: true }
    );

    res.json({
      message: 'Preferred provider updated',
      preferredProvider: user.preferredProvider,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteApiKey = async (req, res) => {
  try {
    const { provider } = req.params;

    if (!VALID_PROVIDERS.includes(provider)) {
      return res.status(400).json({ message: 'Invalid provider' });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        $unset: {
          [`apiKeys.${provider}.key`]: '',
          [`apiKeys.${provider}.encrypted`]: '',
        },
      },
      { new: true }
    ).select('preferredProvider apiKeys aiProviderConsent');

    const configuredProviders = VALID_PROVIDERS.filter(
      (candidate) => user.apiKeys?.[candidate]?.encrypted
    );

    res.json({
      message: `${provider} API key deleted`,
      preferredProvider: user.preferredProvider,
      configuredProviders,
      aiProviderConsent: user.aiProviderConsent,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getSettings = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select(
      'preferredProvider apiKeys.*.encrypted aiProviderConsent'
    );

    const settings = {
      preferredProvider: user.preferredProvider,
      configuredProviders: [],
      aiProviderConsent: user.aiProviderConsent || {
        accepted: false,
        acceptedAt: null,
        consentText: '',
      },
      consentText: AI_PROVIDER_CONSENT_TEXT,
    };

    VALID_PROVIDERS.forEach((provider) => {
      if (user.apiKeys && user.apiKeys[provider] && user.apiKeys[provider].encrypted) {
        settings.configuredProviders.push(provider);
      }
    });

    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
