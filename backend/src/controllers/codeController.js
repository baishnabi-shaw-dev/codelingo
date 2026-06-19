import Judge0Service from '../services/Judge0Service.js';
import User from '../models/User.js';

const judge0Service = new Judge0Service();

export const executeCode = async (req, res) => {
  try {
    const { code, language, stdin = '' } = req.body;

    if (!code || !language) {
      return res.status(400).json({ message: 'Code and language are required' });
    }

    const result = await judge0Service.executeCode(code, language, stdin);

    // Save to user history
    const execution = {
      code,
      language,
      input: stdin,
      output: result.output,
      status: result.status,
      executionTime: result.executionTime,
      memory: result.memory,
    };

    await User.findByIdAndUpdate(req.user._id, {
      $push: {
        codeExecutionHistory: {
          $each: [execution],
          $slice: -50, // Keep only last 50
        },
      },
    });

    res.json({
      success: result.success,
      output: result.output,
      error: result.error,
      status: result.status,
      executionTime: result.executionTime,
      memory: result.memory,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getExecutionHistory = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json(user.codeExecutionHistory || []);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
