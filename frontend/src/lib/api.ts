// SentinelX — Centralized API Client
// All backend communication goes through this module.
// Never hardcode API URLs in components.

const API_URL = import.meta.env.VITE_API_URL || '';

export interface AnalyzePayload {
  input: string;
  chain?: string;
}

export interface AnalyzeResponse {
  contract_address?: string;
  risk_score: number;
  risk_level?: string;
  flags?: Array<{ name: string; severity: string; description?: string }>;
  signals?: Array<{ name: string; severity: string; description?: string }>;
  model?: string;
  features_used?: number;
  response_time?: string;
  ai_assessment?: string;
  explanation?: string;
  shap_values?: Record<string, number>;
}

export interface HealthResponse {
  status: string;
  model_loaded?: boolean;
  shap_loaded?: boolean;
}

class SentinelXApi {
  private baseUrl: string;
  private timeout: number;

  constructor() {
    this.baseUrl = API_URL;
    this.timeout = 30000; // 30s timeout
  }

  get isConfigured(): boolean {
    return this.baseUrl.length > 0;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    if (!this.baseUrl) {
      throw new Error(
        'Backend API not configured. Set VITE_API_URL environment variable.'
      );
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      clearTimeout(timeoutId);

      if (response.status === 429) {
        throw new Error(
          'Too many requests. Please wait a moment and try again.'
        );
      }

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(
          body.detail ||
            body.message ||
            `Analysis failed with status ${response.status}`
        );
      }

      return response.json();
    } catch (error: any) {
      clearTimeout(timeoutId);

      if (error.name === 'AbortError') {
        throw new Error(
          'The analysis request timed out. Please try again.'
        );
      }

      if (
        error.message?.includes('Failed to fetch') ||
        error.message?.includes('NetworkError')
      ) {
        throw new Error(
          'SentinelX analysis is temporarily unavailable. Please try again.'
        );
      }

      throw error;
    }
  }

  async analyze(
    payload: AnalyzePayload
  ): Promise<AnalyzeResponse> {
    const body = {
      input: payload.input,
      chain: payload.chain || 'ETH',
    };

    return this.request<AnalyzeResponse>('/analyze', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  async health(): Promise<HealthResponse> {
    return this.request<HealthResponse>('/health');
  }
}

export const api = new SentinelXApi();
export default api;
