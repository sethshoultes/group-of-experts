import { useDebug } from '../contexts/DebugContext';

interface ApiOptions extends RequestInit {
  skipDebug?: boolean;
}

class ApiDebugger {
  private static instance: ApiDebugger;
  private debugLog: ((type: 'info' | 'error' | 'warn', message: string, data?: any) => void) | null = null;

  private constructor() {}

  public static getInstance(): ApiDebugger {
    if (!ApiDebugger.instance) {
      ApiDebugger.instance = new ApiDebugger();
    }
    return ApiDebugger.instance;
  }

  public setDebugLog(log: (type: 'info' | 'error' | 'warn', message: string, data?: any) => void) {
    this.debugLog = log;
  }

  public async fetch(url: string, options: ApiOptions = {}): Promise<Response> {
    const { skipDebug, ...fetchOptions } = options;
    const startTime = performance.now();
    const requestId = Math.random().toString(36).substring(7);

    if (!skipDebug && this.debugLog) {
      this.debugLog('info', `API Request [${requestId}]`, {
        url,
        method: options.method || 'GET',
        headers: options.headers,
        body: options.body ? JSON.parse(options.body as string) : undefined
      });
    }

    try {
      const response = await fetch(url, fetchOptions);
      const endTime = performance.now();
      const duration = Math.round(endTime - startTime);

      if (!skipDebug && this.debugLog) {
        if (!response.ok) {
          const errorData = await response.clone().json().catch(() => null);
          this.debugLog('error', `API Error [${requestId}]`, {
            url,
            status: response.status,
            statusText: response.statusText,
            duration: `${duration}ms`,
            error: errorData
          });
        } else {
          const responseData = await response.clone().json().catch(() => null);
          this.debugLog('info', `API Response [${requestId}]`, {
            url,
            status: response.status,
            duration: `${duration}ms`,
            data: responseData
          });
        }
      }

      return response;
    } catch (error) {
      const endTime = performance.now();
      const duration = Math.round(endTime - startTime);

      if (!skipDebug && this.debugLog) {
        this.debugLog('error', `API Error [${requestId}]`, {
          url,
          duration: `${duration}ms`,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }

      throw error;
    }
  }
}

export const apiDebugger = ApiDebugger.getInstance();