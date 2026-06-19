# CodeLingo - Quick Start Guide

Welcome to CodeLingo! This is a professional, full-stack code execution and AI analysis platform.

## What is CodeLingo?

CodeLingo is a web-based platform designed specifically for **programming tasks only**. It provides:

✅ **Code Execution** - Run code in 10+ languages safely  
✅ **AI Analysis** - Get intelligent insights on your code  
✅ **Secure Setup** - Each user provides their own API keys  
✅ **Professional Features** - For developers and teams

❌ **Not a chatbot** - We don't do general conversation, essays, or creative writing  
❌ **Not for homework help** - We focus on code quality and professional development  
❌ **Not for non-programming** - Strictly code-related features

## Key Features at a Glance

### 🎨 Code Editor (Monaco Editor)
- VS Code-like experience
- Syntax highlighting for 10 languages
- Real-time code editing
- Dark theme optimized for development

### ▶️ Code Execution (Judge0 CE)
Supported languages:
- Java, Python, JavaScript, TypeScript
- C, C++, C#, Go, Rust, PHP

Features:
- Secure sandbox execution
- Standard input/output support
- Execution time and memory metrics
- Compilation error reporting

### 🤖 AI Code Analysis
Select analysis type:
- 🐛 **Bug Detection** - Find bugs in your code
- 👀 **Code Review** - Get feedback on your code quality
- ⚡ **Optimization** - Improve performance
- 🔒 **Security Analysis** - Identify security issues
- 📊 **Complexity Analysis** - Understand time/space complexity
- ✅ **Test Generation** - Auto-generate unit tests
- 🔄 **Refactoring** - Suggestions for better code structure

### 🔄 Language Conversion
Convert code between:
- Java ↔ Python, JavaScript, C++
- Python ↔ JavaScript, C++
- C ↔ C++
- And more!

### 🔐 Security First
- User-provided API keys (we don't use shared keys)
- AES-192 encryption for stored keys
- Rate limiting to prevent abuse
- Secure backend proxy for all API calls
- JWT authentication

## Getting Started (5 minutes)

### Step 1: Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend (in another terminal)
cd frontend
npm install
```

### Step 2: Setup MongoDB

**Option A: Local MongoDB**
```bash
# macOS
brew install mongodb-community
brew services start mongodb-community

# Windows (Chocolatey)
choco install mongodb

# Linux
sudo apt-get install mongodb
sudo systemctl start mongodb
```

**Option B: Docker (Recommended)**
```bash
docker run -d -p 27017:27017 mongo:latest
```

### Step 3: Get API Keys

**Groq API** (Free - Recommended)
1. Visit: https://console.groq.com
2. Sign up and get your API key
3. It's completely free!

Optional: Add Gemini and OpenRouter keys later

### Step 4: Configure Environment

```bash
# Backend setup
cd backend
cp .env.example .env

# Edit .env with:
MONGODB_URI=mongodb://localhost:27017/codelingo
JWT_SECRET=your-secret-key-here
JUDGE0_API_KEY=your-judge0-key-here
```

### Step 5: Run the Application

**Terminal 1 - Start Backend**
```bash
cd backend
npm run dev
```

You'll see: `CodeLingo Backend running on port 5000`

**Terminal 2 - Start Frontend**
```bash
cd frontend
npm run dev
```

You'll see: `VITE v... ready in X ms`

### Step 6: Access the App

1. Open browser: http://localhost:3000
2. Register a new account
3. Go to **Settings** (top right)
4. Add your Groq API key
5. Start coding!

## Usage Examples

### Example 1: Execute Python Code

1. Write code:
```python
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

print(fibonacci(10))
```

2. Select language: Python
3. Click "Run"
4. See output: `55`

### Example 2: Bug Detection

1. Paste buggy code:
```java
public class Calculator {
    public int divide(int a, int b) {
        return a / b;  // Bug: no zero check!
    }
}
```

2. Select Analysis: "Bug Detection"
3. Click "Analyze Code"
4. Get AI feedback with fix suggestions

### Example 3: Code Optimization

1. Add unoptimized code
2. Select: "Optimization"
3. Get suggestions for performance improvements
4. See refactored version

## File Structure

```
codelingo/
├── backend/           # Node.js/Express API
├── frontend/          # React web app
├── README.md          # Full documentation
├── SETUP.md           # Detailed setup guide
├── DEPLOYMENT.md      # Production deployment
└── QUICKSTART.md      # This file
```

## Important Concepts

### API Key Security
- Your API keys are **never exposed** to the frontend
- They're encrypted in the database
- All API calls go through our secure backend
- Each user manages their own keys

### Rate Limiting
- **Global**: 100 requests per 15 minutes
- **Code Execution**: 10 times per minute
- **AI Analysis**: 5 times per minute

### Execution Limits
- **Time limit**: 5 seconds per execution
- **Memory limit**: 128 MB
- **Runs in Judge0 sandbox** for security

## Common Issues & Solutions

### "Cannot connect to MongoDB"
```
Solution: Make sure MongoDB is running
macOS: brew services start mongodb-community
Docker: docker run -d -p 27017:27017 mongo:latest
```

### "CORS Error" / "Cannot reach backend"
```
Solution: 
1. Check backend is running on port 5000
2. Check frontend .env has VITE_API_URL=http://localhost:5000
3. Restart both servers
```

### "Invalid API Key"
```
Solution:
1. Go to Settings
2. Remove old key
3. Add new key from Groq console
4. Verify key is correct (no spaces)
```

### "Code execution timeout"
```
Solution: Your code took too long (>5 seconds)
Optimize your code or test with smaller input
```

## Next Steps

1. ✅ Get CodeLingo running locally
2. 📖 Read [SETUP.md](SETUP.md) for detailed configuration
3. 🚀 Read [DEPLOYMENT.md](DEPLOYMENT.md) to deploy to production
4. 📚 Explore the [README.md](README.md) for full documentation
5. 🔧 Customize for your needs

## Tips & Tricks

### Pro Tips
- Use Groq API first (free, fast, reliable)
- Add Gemini as backup provider
- Keep your API keys secret (never commit .env)
- Use meaningful variable names for better AI analysis
- Provide context in comments for better results

### Keyboard Shortcuts (Monaco Editor)
- `Ctrl+/` - Toggle comment
- `Ctrl+Shift+F` - Format code
- `Ctrl+F` - Find
- `Ctrl+H` - Find and replace
- `Tab` - Indent
- `Shift+Tab` - Unindent

## Architecture Overview

```
User Browser
    ↓
React Frontend (TypeScript + Tailwind)
    ↓
Express Backend (Node.js)
    ↓
├── MongoDB (Database)
├── Judge0 API (Code Execution)
├── Groq/Gemini/OpenRouter (AI Analysis)
└── User's API Keys (Encrypted)
```

## Support & Community

- 📖 Check [README.md](README.md) for full docs
- 🐛 Report bugs in GitHub issues
- 💬 Ask questions in discussions
- 🚀 Star the project if you like it!

## What's Next?

- Implement language conversion UI
- Add code history/favorites
- Create team workspaces
- Add code snippets library
- Mobile app version
- IDE extensions

## License

MIT License - Free for personal and commercial use

---

## Quick Reference

| Task | Command |
|------|---------|
| Install deps | `npm install` in both folders |
| Start MongoDB | `brew services start mongodb-community` |
| Run backend | `cd backend && npm run dev` |
| Run frontend | `cd frontend && npm run dev` |
| Build frontend | `cd frontend && npm run build` |
| Deploy to Heroku | See [DEPLOYMENT.md](DEPLOYMENT.md) |

---

Happy coding! 🚀

**Questions?** Check the [README.md](README.md) or [SETUP.md](SETUP.md)
