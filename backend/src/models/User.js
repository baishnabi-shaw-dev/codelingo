import mongoose from 'mongoose';
import bcryptjs from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
    },
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    apiKeys: {
      groq: {
        key: String,
        encrypted: Boolean,
      },
      gemini: {
        key: String,
        encrypted: Boolean,
      },
      openrouter: {
        key: String,
        encrypted: Boolean,
      },
    },
    aiProviderConsent: {
      accepted: {
        type: Boolean,
        default: false,
      },
      acceptedAt: Date,
      consentText: String,
    },
    preferredProvider: {
      type: String,
      enum: ['groq', 'gemini', 'openrouter'],
      default: 'groq',
    },
    codeExecutionHistory: [
      {
        code: String,
        language: String,
        input: String,
        output: String,
        status: String,
        executionTime: Number,
        memory: Number,
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    codeAnalysisHistory: [
      {
        code: String,
        language: String,
        analysisType: String,
        result: String,
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }

  const salt = await bcryptjs.genSalt(10);
  this.password = await bcryptjs.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcryptjs.compare(enteredPassword, this.password);
};

export default mongoose.model('User', userSchema);
