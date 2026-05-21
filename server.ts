import express from 'express';
import path from 'path';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';

// Load environment variables
dotenv.config();

import { connectDB } from './server/config/db.js';
import authRoutes from './server/routes/authRoutes.js';
import userRoutes from './server/routes/userRoutes.js';
import projectRoutes from './server/routes/projectRoutes.js';
import taskRoutes from './server/routes/taskRoutes.js';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Establish Database connection
  await connectDB();

  // Standard Middlewares
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  // CORS Config (Vite server & API run on port 3000 so SAME ORIGIN is used, but CORS is set for insurance)
  app.use(
    cors({
      origin: true,
      credentials: true,
    })
  );

  // Health check API
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date() });
  });

  // REST API Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/projects', projectRoutes);
  app.use('/api/tasks', taskRoutes);

  // Serve Frontend with Vite Middleware in Dev, or static production files in Prod
  if (process.env.NODE_ENV !== 'production') {
    console.log('🚀 Running in DEVELOPMENT mode. Initializing Vite middleware...');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    console.log('📦 Running in PRODUCTION mode. Serving pre-compiled static assets...');
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Handle uncaught errors
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('🔥 Server Error Handler Caught:', err);
    res.status(err.status || 500).json({
      success: false,
      message: err.message || 'An internal Server Error occurred',
    });
  });

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`📡 Full-Stack Team Task Manager server is running at http://localhost:${PORT}`);
  });
}

startServer();
