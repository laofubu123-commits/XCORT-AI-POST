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
