# CodeLingo - Professional Code Platform

CodeLingo is a full-stack web platform for professional code development, execution, and AI-powered analysis.

## Features

### Core Features

1. **Code Editor** (Monaco Editor)
   - Syntax highlighting for 10+ languages
   - Line numbers and auto-indentation
   - Dark mode support
   - Language selection dropdown

2. **Code Execution** (Judge0 CE)
   - Secure code execution
   - Support for: Java, Python, JavaScript, TypeScript, C, C++, C#, Go, Rust, PHP
   - Input/Output handling
   - Execution time and memory metrics
   - Compilation and runtime error reporting

3. **AI Code Analysis**
   - Bug detection
   - Code review
   - Optimization suggestions
   - Security analysis
   - Complexity analysis
   - Unit test generation
   - Code refactoring

4. **AI Providers**
   - Groq (default, free)
   - Google Gemini
   - OpenRouter
   - User-provided API keys
   - Secure key encryption

5. **User Settings**
   - API key management per provider
   - Preferred provider selection
   - Execution and analysis history

### Security Features

- JWT authentication
- API key encryption (AES-192)
- Rate limiting
- Input validation
- CSRF protection (via middleware)
- XSS protection (via helmet)
- Secure backend proxy for all API calls

## Tech Stack

### Frontend
- React 18
- TypeScript
- Tailwind CSS
- Vite
- Monaco Editor
- Zustand (state management)
- Axios (HTTP client)

### Backend
- Node.js
- Express.js
- MongoDB
- JWT authentication
- bcryptjs (password hashing)
- Helmet (security headers)
- Express-validator (input validation)
- Express-ratelimit

### Code Execution
- Judge0 CE API

### AI Providers
- Groq API
- Google Gemini API
- OpenRouter API

## Project Structure

```
codelingo/
├── backend/                      # Node.js/Express server
│   ├── src/
│   │   ├── config/              # Configuration files
│   │   ├── models/              # MongoDB models
│   │   ├── controllers/         # Route controllers
│   │   ├── routes/              # API routes
│   │   ├── services/            # Business logic (Judge0, AI, etc.)
│   │   ├── middleware/          # Auth, validation, rate limiting
│   │   └── index.js             # Main server file
│   ├── package.json
│   └── .env.example
│
├── frontend/                     # React application
│   ├── src/
│   │   ├── components/          # React components
│   │   ├── pages/               # Page components
│   │   ├── services/            # API services
│   │   ├── context/             # Zustand stores
│   │   ├── utils/               # Utility functions
│   │   ├── App.tsx              # Main app component
│   │   └── main.tsx             # React entry point
│   ├── public/                  # Static assets
│   ├── index.html               # HTML entry point
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
│
├── README.md
└── vercel.json                  # Deployment config
```

## Installation

### Prerequisites

- Node.js 16+
- MongoDB 4.4+
- npm or yarn

### Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Update .env with your configuration
# - MONGODB_URI
# - JWT_SECRET
# - JUDGE0_API_KEY
# - JUDGE0_API_URL

# Start the server
npm run dev
```

The backend will run on `http://localhost:5000`

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

The frontend will run on `http://localhost:3000`

## Environment Variables

### Backend (.env)

```
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/codelingo

JWT_SECRET=your_jwt_secret_key_here_change_in_production
JWT_EXPIRE=7d

JUDGE0_API_URL=https://judge0-ce.p.rapidapi.com
JUDGE0_API_KEY=your_judge0_api_key_here

RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

FRONTEND_URL=http://localhost:3000
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (requires auth)

### Code Execution
- `POST /api/code/execute` - Execute code (requires auth)
- `GET /api/code/history` - Get execution history (requires auth)

### AI Analysis
- `POST /api/analysis/analyze` - Analyze code (requires auth)
- `GET /api/analysis/history` - Get analysis history (requires auth)

### Settings
- `POST /api/settings/api-key` - Save API key (requires auth)
- `POST /api/settings/provider` - Set preferred provider (requires auth)
- `GET /api/settings` - Get settings (requires auth)

## Usage

1. **Register/Login**
   - Visit the application
   - Create an account or login

2. **Configure AI Providers** (Settings)
   - Go to Settings page
   - Add API keys for Groq, Gemini, or OpenRouter
   - Select preferred provider

3. **Write and Execute Code**
   - Write code in the Monaco Editor
   - Select programming language
   - Add standard input if needed
   - Click "Run" to execute
   - View output and execution metrics

4. **Analyze Code**
   - Select analysis type (Bug Detection, Code Review, etc.)
   - Click "Analyze Code"
   - View AI-powered insights

## Security Considerations

1. **API Keys**
   - Never commit .env files
   - Keys are encrypted in database
   - Use strong JWT secrets in production

2. **Rate Limiting**
   - Global: 100 requests per 15 minutes
   - Code Execution: 10 requests per minute
   - AI Analysis: 5 requests per minute

3. **Input Validation**
   - All inputs are validated server-side
   - CSRF protection via secure headers

4. **Code Execution**
   - Runs in Judge0 sandbox
   - Resource limits enforced
   - Time limits: 5 seconds

## Deployment

### Backend (Heroku Example)
```bash
cd backend
heroku create codelingo-backend
git push heroku main
```

### Frontend (Vercel)
```bash
cd frontend
npm run build
# Deploy dist folder to Vercel
```

## Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running
- Check MONGODB_URI in .env

### Judge0 API Issues
- Verify JUDGE0_API_KEY is valid
- Check Judge0 API status

### CORS Errors
- Ensure FRONTEND_URL matches your frontend URL
- Check that backend is running

### AI Analysis Failures
- Ensure API key is configured in Settings
- Verify API key is valid for selected provider
- Check rate limits haven't been exceeded

## License

MIT License

## Support

For issues and questions, please create an issue in the repository
