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
  sellingPoints: string;
}

export interface VideoShot {
  id: string;
  duration: string;
  descriptionEn: string;
  descriptionZh: string;
  shotType: string;
  angle: string;
  movement: string;
  composition: string;
  actionEn: string;
  actionZh: string;
  lighting: string;
  style: string;
  rhythm: string;
}

export interface VideoScript {
  part1: VideoShot[];
  part2: VideoShot[];
  part3: VideoShot[];
}

export interface GeneratedContent {
  facebookPost: {
    english: string;
    chinese: string;
    spanish: string;
    hashtags: string;
  };
  detailPage: {
    english: string;
    chinese: string;
  };
  imagePrompt: {
    english: string;
    chinese: string;
  };
  videoScript: VideoScript;
}
