import axios, { AxiosInstance, AxiosError } from 'axios';
import { nansenConfig } from '../config/nansen';

export interface NansenApiResponse<T> {
  data: T;
  status: number;
  message?: string;
}

export interface NansenDexTrade {
  wallet_address: string;
  token_in: string;
  token_out: string;
  amount_in: string;
  amount_out: string;
  chain: string;
  dex: string;
  lp_pool?: string;
  timestamp: string;
  tx_hash: string;
}

export interface NansenSmartMoneyDexTradesResponse {
  trades: NansenDexTrade[];
  total: number;
  page?: number;
  pageSize?: number;
}

export class NansenClient {
  private client: AxiosInstance;
  private readonly maxRetries = 3;
  private readonly retryDelay = 1000; // 1 second

  constructor() {
    this.client = axios.create({
      baseURL: nansenConfig.baseUrl,
      headers: {
        'apiKey': nansenConfig.apiKey,
        'Content-Type': 'application/json',
        'Accept': '*/*',
      },
      timeout: 30000,
    });

    // Add request interceptor for logging
    this.client.interceptors.request.use(
      (config) => {
        console.log(`[Nansen API] ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        console.error('[Nansen API] Request error:', error);
        return Promise.reject(error);
      }
    );

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const config = error.config as any;
        
        if (!config || !config.retry) {
          config.retry = 0;
        }

        if (config.retry < this.maxRetries) {
          config.retry += 1;
          const delay = this.retryDelay * Math.pow(2, config.retry - 1);
          
          console.log(`[Nansen API] Retrying request (${config.retry}/${this.maxRetries}) after ${delay}ms`);
          
          await new Promise(resolve => setTimeout(resolve, delay));
          return this.client(config);
        }

        console.error('[Nansen API] Request failed after retries:', error.message);
        return Promise.reject(error);
      }
    );
  }

  /**
   * Get wallet counterparties (trading partners) - provides trading volume data
   * This endpoint shows interactions with other addresses including DEXes, LPs, etc.
   */
  async getWalletCounterparties(params: {
    address: string;
    chain?: string;
    dateFrom?: string;
    dateTo?: string;
    groupBy?: string;
    sourceInput?: string;
    page?: number;
    perPage?: number;
  }): Promise<NansenApiResponse<any>> {
    try {
      // Default date range: last year to now
      const defaultDateFrom = new Date();
      defaultDateFrom.setFullYear(defaultDateFrom.getFullYear() - 1);
      
      const requestBody: any = {
        address: params.address,
        chain: params.chain || 'ethereum', // Chain is required by API
        date: {
          from: params.dateFrom || defaultDateFrom.toISOString(),
          to: params.dateTo || new Date().toISOString(),
        },
        group_by: params.groupBy || 'wallet',
        source_input: params.sourceInput || 'Combined',
      };

      console.log('[Nansen API] Request body:', JSON.stringify(requestBody, null, 2));
      const response = await this.client.post('/api/v1/profiler/address/counterparties', requestBody);

      return {
        data: response.data,
        status: response.status,
      };
    } catch (error) {
      const axiosError = error as AxiosError;
      const errorMessage = axiosError.response?.data 
        ? JSON.stringify(axiosError.response.data)
        : axiosError.message;
      console.error('[Nansen API] Error response:', errorMessage);
      throw new Error(
        `Failed to fetch wallet counterparties: ${errorMessage}`
      );
    }
  }

  /**
   * Get Smart Money DEX trades (legacy method - kept for compatibility)
   * Note: This may need to be updated based on actual Nansen API endpoints
   */
  async getSmartMoneyDexTrades(params: {
    chains?: string[];
    tokens?: string[];
    dex?: string;
    page?: number;
    pageSize?: number;
  }): Promise<NansenApiResponse<NansenSmartMoneyDexTradesResponse>> {
    // For now, return empty result as this endpoint structure needs verification
    return {
      data: {
        trades: [],
        total: 0,
      },
      status: 200,
    };
  }

  /**
   * Get wallet profiler data (if available)
   */
  async getWalletProfiler(walletAddress: string): Promise<NansenApiResponse<any>> {
    try {
      const response = await this.client.get(`/v1/wallet/${walletAddress}/profiler`);
      return {
        data: response.data,
        status: response.status,
      };
    } catch (error) {
      const axiosError = error as AxiosError;
      // This endpoint might not exist, so we'll handle gracefully
      console.warn(`Wallet profiler endpoint not available: ${axiosError.message}`);
      throw error;
    }
  }

  /**
   * Get token God Mode data (if available)
   */
  async getTokenGodMode(tokenAddress: string, chain?: string): Promise<NansenApiResponse<any>> {
    try {
      const url = chain 
        ? `/v1/token/${tokenAddress}/god-mode?chain=${chain}`
        : `/v1/token/${tokenAddress}/god-mode`;
      
      const response = await this.client.get(url);
      return {
        data: response.data,
        status: response.status,
      };
    } catch (error) {
      const axiosError = error as AxiosError;
      console.warn(`Token God Mode endpoint not available: ${axiosError.message}`);
      throw error;
    }
  }

  /**
   * Generic GET request helper
   */
  async get<T>(endpoint: string, params?: Record<string, any>): Promise<NansenApiResponse<T>> {
    try {
      const response = await this.client.get(endpoint, { params });
      return {
        data: response.data,
        status: response.status,
      };
    } catch (error) {
      const axiosError = error as AxiosError;
      throw new Error(`API request failed: ${axiosError.message}`);
    }
  }

  /**
   * Generic POST request helper
   */
  async post<T>(endpoint: string, data?: any): Promise<NansenApiResponse<T>> {
    try {
      const response = await this.client.post(endpoint, data);
      return {
        data: response.data,
        status: response.status,
      };
    } catch (error) {
      const axiosError = error as AxiosError;
      throw new Error(`API request failed: ${axiosError.message}`);
    }
  }
}

