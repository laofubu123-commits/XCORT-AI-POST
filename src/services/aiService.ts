import { GoogleGenAI, Type } from "@google/genai";
import { ProductData, GeneratedContent, AISettings } from "../types";

const SYSTEM_INSTRUCTION = `You are a professional power tools marketing expert for XCORT, a leading brand in the industry. 
Your goal is to help distributors and sales teams generate high-conversion marketing materials.

When generating content:
1. Facebook Post: Professional tone, focus on performance and cost-effectiveness. Provide separate sections for English, Chinese, Spanish, and Hashtags.
2. Product Detail Page: Structured with Title, Short Intro, 5 Bullet Selling Points, Technical Parameters, Usage Scenarios, and a Brand Trust closing.
3. Image Prompt: Generate highly realistic, professional product photography prompts. 
   - Avoid generic "AI" styles. 
   - Use photography-specific language: "shot on 35mm lens", "f/2.8", "cinematic lighting", "depth of field", "high-resolution industrial photography".
   - Describe authentic textures: "weathered metal", "ergonomic rubber grip with realistic wear", "dust particles in sunlight".
   - Focus on professional settings: "authentic busy construction site background", "organized professional workshop with tools in the background", "clean studio shot with softbox lighting and natural reflections".
   - Ensure the product (XCORT brand) is the hero, looking like a real, tangible tool used by professionals.

Always return the response in a structured JSON format.`;

const JSON_SCHEMA_PROMPT = `
The response MUST be a valid JSON object with the following structure:
{
  "facebookPost": {
    "english": "string",
    "chinese": "string",
    "spanish": "string",
    "hashtags": "string"
  },
  "detailPage": "string",
  "imagePrompt": "string"
}
`;

async function callGemini(product: ProductData, settings: AISettings, persuasive: boolean): Promise<GeneratedContent> {
  const apiKey = settings.apiKeys.gemini || process.env.GEMINI_API_KEY || "";
  if (!apiKey) throw new Error("Gemini API Key is missing.");

  const ai = new GoogleGenAI({ apiKey });
  const model = ai.models.generateContent({
    model: settings.model || "gemini-3-flash-preview",
    contents: [
      {
        role: "user",
        parts: [
          {
            text: `Generate marketing content for the following product. ${persuasive ? "Make it extra persuasive and focus on high conversion." : ""}
            
            Product Details:
            - Name: ${product.name}
            - Model Number: ${product.modelNumber}
            - Voltage: ${product.voltage}
            - Power: ${product.power}
            - Features: ${product.features}
            - Application: ${product.application}
            
            Please provide:
            1. A Facebook Post (English, Chinese, Spanish, and Hashtags as separate fields)
            2. A Product Detail Page
            3. Image Generation Prompts`
          }
        ]
      }
    ],
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          facebookPost: {
            type: Type.OBJECT,
            properties: {
              english: { type: Type.STRING },
              chinese: { type: Type.STRING },
              spanish: { type: Type.STRING },
              hashtags: { type: Type.STRING }
            },
            required: ["english", "chinese", "spanish", "hashtags"]
          },
          detailPage: { type: Type.STRING },
          imagePrompt: { type: Type.STRING }
        },
        required: ["facebookPost", "detailPage", "imagePrompt"]
      }
    }
  });

  const response = await model;
  const text = response.text;
  if (!text) throw new Error("No content generated");
  return JSON.parse(text) as GeneratedContent;
}

async function callOpenAICompatible(product: ProductData, settings: AISettings, persuasive: boolean, baseUrl: string): Promise<GeneratedContent> {
  const apiKey = settings.provider === 'openai' ? settings.apiKeys.openai : settings.apiKeys.deepseek;
  if (!apiKey) throw new Error(`${settings.provider.toUpperCase()} API Key is missing.`);

  const prompt = `
    ${SYSTEM_INSTRUCTION}
    
    ${JSON_SCHEMA_PROMPT}

    Product Details:
    - Name: ${product.name}
    - Model Number: ${product.modelNumber}
    - Voltage: ${product.voltage}
    - Power: ${product.power}
    - Features: ${product.features}
    - Application: ${product.application}
    
    ${persuasive ? "Make it extra persuasive and focus on high conversion." : ""}
  `;

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: settings.model,
      messages: [
        { role: 'system', content: SYSTEM_INSTRUCTION },
        { role: 'user', content: prompt }
      ],
      response_format: { type: "json_object" }
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || "API request failed");
  }

  const data = await response.json();
  const content = data.choices[0].message.content;
  return JSON.parse(content) as GeneratedContent;
}

export async function generateMarketingContent(product: ProductData, settings: AISettings, persuasive: boolean = false): Promise<GeneratedContent> {
  switch (settings.provider) {
    case 'gemini':
      return callGemini(product, settings, persuasive);
    case 'openai':
      return callOpenAICompatible(product, settings, persuasive, 'https://api.openai.com/v1');
    case 'deepseek':
      return callOpenAICompatible(product, settings, persuasive, 'https://api.deepseek.com/v1');
    default:
      throw new Error("Unsupported AI Provider");
  }
}
