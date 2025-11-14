import express, { Application } from 'express';
import cors from 'cors';
import { nansenConfig } from './config/nansen';
import tradingVolumeRoutes from './routes/tradingVolumeRoute';

const app: Application = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api/trading-volume', tradingVolumeRoutes);

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: err.message,
  });
});

// Start server
const PORT = nansenConfig.port;
app.listen(PORT, () => {
  console.log(`🚀 Nansen API POC server running on port ${PORT}`);
  console.log(`📊 Trading volume endpoint: http://localhost:${PORT}/api/trading-volume/:walletAddress`);
  console.log(`🔑 Using API key: ${nansenConfig.apiKey.substring(0, 10)}...`);
});

export default app;

