import CodeAnalysisService from '../services/CodeAnalysisService.js';
import User from '../models/User.js';

const analysisService = new CodeAnalysisService();

const ALLOWED_ANALYSIS_TYPES = [
  'bug-detection',
  'code-review',
  'optimization',
  'security-analysis',
  'complexity-analysis',
  'test-generation',
  'refactoring',
];

export const analyzeCode = async (req, res) => {
  try {
    const { code, language, analysisType, provider } = req.body;

    if (!code || !language || !analysisType) {
      return res.status(400).json({ message: 'Code, language, and analysis type are required' });
    }

    if (!ALLOWED_ANALYSIS_TYPES.includes(analysisType)) {
      return res.status(400).json({ message: 'Invalid analysis type' });
    }

    const analysis = await analysisService.analyzeCode(req.user, code, language, analysisType, provider);

    // Save to user history
    await User.findByIdAndUpdate(req.user._id, {
      $push: {
        codeAnalysisHistory: {
          $each: [
            {
              code,
              language,
              analysisType,
              result: analysis,
            },
          ],
          $slice: -50, // Keep only last 50
        },
      },
    });

    res.json({ analysis });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAnalysisHistory = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json(user.codeAnalysisHistory || []);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
