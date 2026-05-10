import { apiClient } from './client';

export interface AiAssistParams {
  recordId?: number;
  placeName?: string;
  recordedAt?: string;
  weather?: string;
  temperature?: number;
  type?: string;
  content?: string;
}

export interface AiAssistResult {
  result: string;
}

// AI 요청은 Gemini 응답이 느릴 수 있어서 30초로 설정
const AI_TIMEOUT = 30000;

export const aiApi = {
  draft: (params: AiAssistParams) =>
    apiClient.post<{ data: AiAssistResult }>('/api/v1/ai/assist/draft', params, { timeout: AI_TIMEOUT }),

  continueWriting: (params: AiAssistParams) =>
    apiClient.post<{ data: AiAssistResult }>('/api/v1/ai/assist/continue', params, { timeout: AI_TIMEOUT }),

  title: (params: AiAssistParams) =>
    apiClient.post<{ data: AiAssistResult }>('/api/v1/ai/assist/title', params, { timeout: AI_TIMEOUT }),
};
