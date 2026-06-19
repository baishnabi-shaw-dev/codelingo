# CodeLingo Development Setup Guide

## Quick Start

This guide will help you set up the CodeLingo platform for development or production.

### System Requirements

- Node.js 16+ (LTS recommended)
- MongoDB 4.4+
- npm or yarn
- Git

### Step 1: Clone and Install Dependencies

```bash
# Clone the repository
git clone <repository-url>
cd codelingo

# Backend setup
cd backend
npm install

# Frontend setup
cd ../frontend
npm install

cd ..
```

### Step 2: Database Setup

#### Local MongoDB Setup

**Windows (via Chocolatey)**
```bash
choco install mongodb
```

**macOS (via Homebrew)**
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

**Linux (Ubuntu/Debian)**
```bash
curl -fsSL https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu $(lsb_release -cs)/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org
sudo systemctl start mongod
```

**Docker (Recommended)**
```bash
docker run -d -p 27017:27017 -e MONGO_INITDB_ROOT_USERNAME=admin -e MONGO_INITDB_ROOT_PASSWORD=password mongo:latest
```

### Step 3: API Keys Setup

1. **Groq API** (Free, Recommended)
   - Visit: https://console.groq.com
   - Sign up and get your API key
   - It's free to use with generous limits

2. **Google Gemini API**
   - Visit: https://makersuite.google.com/app/apikey
   - Create your API key
   - Add to your settings

3. **OpenRouter API**
   - Visit: https://openrouter.ai
   - Sign up and get your API key
   - Add to your settings

### Step 4: Environment Configuration

**Backend (.env)**
```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:
```
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/codelingo

JWT_SECRET=your_very_secret_key_change_in_production
JWT_EXPIRE=7d

JUDGE0_API_URL=https://judge0-ce.p.rapidapi.com
JUDGE0_API_KEY=your_judge0_api_key

RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

FRONTEND_URL=http://localhost:3000
```

### Step 5: Judge0 API Setup

Judge0 is a free API for code execution.

**Option 1: Using RapidAPI (Easiest)**
1. Go to: https://rapidapi.com/judge0-official/api/judge0
2. Subscribe to the free tier
3. Copy your API key
4. Add to your `.env` as `JUDGE0_API_KEY`

**Option 2: Self-hosted Judge0**
See: https://judge0.com/#installation

### Step 6: Run the Application

**Terminal 1 - Backend**
```bash
cd backend
npm run dev
```

Backend will run on: http://localhost:5000

**Terminal 2 - Frontend**
```bash
cd frontend
npm run dev
```

Frontend will run on: http://localhost:3000

### Step 7: Access the Application

1. Open your browser
2. Visit: http://localhost:3000
3. Register a new account
4. Go to Settings
5. Add your Groq API key (or other providers)
6. Start coding!

## Useful Commands

### Backend Commands
```bash
cd backend

# Development mode with auto-restart
npm run dev

# Production build
npm start

# Run tests
npm test
```

### Frontend Commands
```bash
cd frontend

# Development server
npm run dev

# Production build
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint

# Type check
npm run type-check
```

## Troubleshooting

### MongoDB Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```

**Solution:**
- Start MongoDB: `mongod` or `brew services start mongodb-community`
- Check MongoDB is running: `mongo --version`

### CORS Error
```
Access to XMLHttpRequest blocked by CORS policy
```

**Solution:**
- Ensure backend is running on port 5000
- Check `FRONTEND_URL` in backend `.env` matches your frontend URL

### Judge0 API Error
```
Error: Judge0 submission error
```

**Solution:**
- Verify `JUDGE0_API_KEY` is valid
- Check rate limits: https://rapidapi.com/judge0-official/api/judge0
- Try using different language ID

### Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::3000
```

**Solution:**
```bash
# Find process using port
lsof -i :3000
# Kill the process
kill -9 <PID>
```

## Development Tips

### Git Workflow
```bash
# Create feature branch
git checkout -b feature/my-feature

# Make changes and commit
git add .
git commit -m "feat: add my feature"

# Push to remote
git push origin feature/my-feature

# Create Pull Request
```

### Code Style
- Use TypeScript for type safety
- Follow existing code patterns
- Use Prettier for formatting (built into Tailwind)

### Testing the API
Use Postman or Thunder Client to test endpoints:

```
POST /api/auth/register
Body:
{
  "email": "test@example.com",
  "username": "testuser",
  "password": "password123"
}

POST /api/auth/login
Body:
{
  "email": "test@example.com",
  "password": "password123"
}
```

## Performance Optimization

### Frontend
- Code splitting with Vite
- Lazy loading for routes
- Monaco Editor optimized with minimap disabled

### Backend
- Database indexing
- API response caching
- Rate limiting to prevent abuse

## Production Deployment

### Backend (Heroku)
```bash
cd backend
heroku create codelingo-backend
heroku config:set JWT_SECRET=<your-secret>
heroku config:set MONGODB_URI=<your-mongodb-uri>
git push heroku main
```

### Frontend (Vercel)
```bash
cd frontend
vercel
# Follow the prompts
```

### Environment Variables for Production
- Use strong JWT secrets
- Use production MongoDB URI
- Set `NODE_ENV=production`
- Use HTTPS in production
- Keep API keys secret (use environment variables, never commit them)

## Support and Resources

- **MongoDB**: https://docs.mongodb.com
- **Express.js**: https://expressjs.com
- **React**: https://react.dev
- **Monaco Editor**: https://microsoft.github.io/monaco-editor
- **Judge0**: https://judge0.com
- **Groq API**: https://console.groq.com

## License

MIT License - See LICENSE file for details

---

Happy coding with CodeLingo! 🚀
