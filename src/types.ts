export type AIProvider = 'gemini' | 'openai' | 'deepseek';

export interface AISettings {
  provider: AIProvider;
  model: string;
  apiKeys: {
    gemini: string;
    openai: string;
    deepseek: string;
  };
}

export interface ProductData {
  name: string;
  modelNumber: string;
  voltage: string;
  power: string;
  features: string;
  application: string;
}

export interface GeneratedContent {
  facebookPost: {
    english: string;
    chinese: string;
    spanish: string;
    hashtags: string;
  };
  detailPage: string;
  imagePrompt: string;
}
