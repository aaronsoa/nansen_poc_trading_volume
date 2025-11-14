import dotenv from 'dotenv';

dotenv.config();

export interface NansenConfig {
  apiKey: string;
  baseUrl: string;
  port: number;
}

export const nansenConfig: NansenConfig = {
  apiKey: process.env.NANSEN_API_KEY || '',
  baseUrl: process.env.NANSEN_API_BASE_URL || 'https://api.nansen.ai',
  port: parseInt(process.env.PORT || '3000', 10),
};

// Only throw error if not in test environment
if (!nansenConfig.apiKey && process.env.NODE_ENV !== 'test') {
  throw new Error('NANSEN_API_KEY is required in environment variables');
}

