import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import connectDB from './config/database.js';
import config from './config/index.js';
import { globalLimiter } from './middleware/rateLimiter.js';

// Import routes
import authRoutes from './routes/auth.js';
import codeRoutes from './routes/code.js';
import analysisRoutes from './routes/analysis.js';
import conversionRoutes from './routes/conversion.js';
import settingsRoutes from './routes/settings.js';

const app = express();

// Connect to database
await connectDB();

// Middleware
app.set('trust proxy', 1);
app.use(helmet());
app.use((req, res, next) => {
  if (config.env === 'production' && req.headers['x-forwarded-proto'] !== 'https') {
    return res.redirect(301, `https://${req.headers.host}${req.originalUrl}`);
  }

  return next();
});
app.use(cors({ origin: config.frontendUrl }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Rate limiting
app.use(globalLimiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/code', codeRoutes);
app.use('/api/analysis', analysisRoutes);
app.use('/api/conversion', conversionRoutes);
app.use('/api/settings', settingsRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error',
    status: err.status || 500,
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Start server
const PORT = config.port;
app.listen(PORT, () => {
  console.log(`CodeLingo Backend running on port ${PORT}`);
  console.log(`Environment: ${config.env}`);
});
