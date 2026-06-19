import LanguageConversionService from '../services/LanguageConversionService.js';

const conversionService = new LanguageConversionService();

export const convertCode = async (req, res) => {
  try {
    const { sourceCode, fromLanguage, toLanguage, provider, addHelpfulComments = false } = req.body;

    if (!sourceCode || !fromLanguage || !toLanguage) {
      return res
        .status(400)
        .json({ message: 'sourceCode, fromLanguage, and toLanguage are required' });
    }

    if (!conversionService.isConversionSupported(fromLanguage, toLanguage)) {
      return res.status(400).json({
        message: `Conversion from ${fromLanguage} to ${toLanguage} is not supported`,
        supportedConversions: conversionService.getSupportedConversions(),
      });
    }

    const result = await conversionService.convertCode(
      req.user,
      sourceCode,
      fromLanguage,
      toLanguage,
      provider,
      addHelpfulComments
    );

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getSupportedConversions = async (req, res) => {
  try {
    const conversions = conversionService.getSupportedConversions();
    res.json({ conversions });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
