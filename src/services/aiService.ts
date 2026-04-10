import { GoogleGenAI, Type, ThinkingLevel } from "@google/genai";
import { ProductData, GeneratedContent, AISettings } from "../types";

const SYSTEM_INSTRUCTION = `You are a professional power tools marketing expert and commercial director for XCORT, a leading brand in the industry. 
Your goal is to help distributors and sales teams generate high-conversion marketing materials and professional video scripts.

When generating content:
1. Facebook Post: Professional tone, focus on performance and cost-effectiveness. Provide separate sections for English, Chinese, Spanish, and Hashtags.
2. Product Detail Page: Structured with Title, Short Intro, 5 Bullet Selling Points, Technical Parameters, Usage Scenarios, and a Brand Trust closing.
3. Image Prompt: Generate highly realistic, professional product photography prompts. 
   - Avoid generic "AI" styles. 
   - Use photography-specific language: "shot on 35mm lens", "f/2.8", "cinematic lighting", "depth of field", "high-resolution industrial photography".
   - Describe authentic textures: "weathered metal", "ergonomic rubber grip with realistic wear", "dust particles in sunlight".
   - Focus on professional settings: "authentic busy construction site background", "organized professional workshop with tools in the background", "clean studio shot with softbox lighting and natural reflections".
   - Ensure the product (XCORT brand) is the hero, looking like a real, tangible tool used by professionals.
4. Video Script: Generate a professional 30-second director's storyboard script.
   - Structure: 3 parts (10s each). Part 1: Scene/Problem, Part 2: Product/Solution, Part 3: Result/Brand.
   - Style: International industrial (Bosch/Makita style). High contrast, mechanical texture, realistic.
   - Fields: Shot ID, Duration, Description (EN & ZH), Shot Type, Angle, Movement, Composition, Action (EN & ZH), Lighting, Style, Rhythm.

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
  "imagePrompt": "string",
  "videoScript": {
    "part1": [{"id": "string", "duration": "string", "descriptionEn": "string", "descriptionZh": "string", "shotType": "string", "angle": "string", "movement": "string", "composition": "string", "actionEn": "string", "actionZh": "string", "lighting": "string", "style": "string", "rhythm": "string"}],
    "part2": [{"id": "string", "duration": "string", "descriptionEn": "string", "descriptionZh": "string", "shotType": "string", "angle": "string", "movement": "string", "composition": "string", "actionEn": "string", "actionZh": "string", "lighting": "string", "style": "string", "rhythm": "string"}],
    "part3": [{"id": "string", "duration": "string", "descriptionEn": "string", "descriptionZh": "string", "shotType": "string", "angle": "string", "movement": "string", "composition": "string", "actionEn": "string", "actionZh": "string", "lighting": "string", "style": "string", "rhythm": "string"}]
  }
}
`;

function extractJson(text: string) {
  try {
    const match = text.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]);
    return JSON.parse(text);
  } catch (e) {
    console.error("Failed to parse JSON from text:", text);
    throw new Error("AI returned invalid JSON format. Please try again.");
  }
}

async function callGemini(product: ProductData, settings: AISettings, persuasive: boolean): Promise<GeneratedContent> {
  const apiKey = settings.apiKeys.gemini || process.env.GEMINI_API_KEY || "";
  if (!apiKey) throw new Error("Gemini API Key is missing. Please check settings.");

  const ai = new GoogleGenAI({ apiKey });
  const modelName = settings.model || "gemini-3-flash-preview";

  const response = await ai.models.generateContent({
    model: modelName,
    contents: [{
      role: "user",
      parts: [{
        text: `Generate complete marketing materials for: ${product.name}. ${persuasive ? "Make it highly persuasive." : ""}
        Product Details: ${JSON.stringify(product)}
        
        Please provide:
        1. Facebook Post (English, Chinese, Spanish, and Hashtags)
        2. Product Detail Page copy
        3. Professional Image Generation Prompt
        4. A 30-second professional video script in 3 parts (10s each) with full director parameters.
        
        IMPORTANT: For the video script, provide both English and Chinese for 'descriptionEn/Zh' and 'actionEn/Zh' fields.`
      }]
    }],
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
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
          imagePrompt: { type: Type.STRING },
          videoScript: {
            type: Type.OBJECT,
            properties: {
              part1: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { id: { type: Type.STRING }, duration: { type: Type.STRING }, descriptionEn: { type: Type.STRING }, descriptionZh: { type: Type.STRING }, shotType: { type: Type.STRING }, angle: { type: Type.STRING }, movement: { type: Type.STRING }, composition: { type: Type.STRING }, actionEn: { type: Type.STRING }, actionZh: { type: Type.STRING }, lighting: { type: Type.STRING }, style: { type: Type.STRING }, rhythm: { type: Type.STRING } } } },
              part2: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { id: { type: Type.STRING }, duration: { type: Type.STRING }, descriptionEn: { type: Type.STRING }, descriptionZh: { type: Type.STRING }, shotType: { type: Type.STRING }, angle: { type: Type.STRING }, movement: { type: Type.STRING }, composition: { type: Type.STRING }, actionEn: { type: Type.STRING }, actionZh: { type: Type.STRING }, lighting: { type: Type.STRING }, style: { type: Type.STRING }, rhythm: { type: Type.STRING } } } },
              part3: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { id: { type: Type.STRING }, duration: { type: Type.STRING }, descriptionEn: { type: Type.STRING }, descriptionZh: { type: Type.STRING }, shotType: { type: Type.STRING }, angle: { type: Type.STRING }, movement: { type: Type.STRING }, composition: { type: Type.STRING }, actionEn: { type: Type.STRING }, actionZh: { type: Type.STRING }, lighting: { type: Type.STRING }, style: { type: Type.STRING }, rhythm: { type: Type.STRING } } } }
            },
            required: ["part1", "part2", "part3"]
          }
        },
        required: ["facebookPost", "detailPage", "imagePrompt", "videoScript"]
      }
    }
  });

  const text = response.text;
  if (!text) throw new Error("Content generation failed: AI returned an empty response.");

  return extractJson(text) as GeneratedContent;
}

async function callOpenAICompatible(product: ProductData, settings: AISettings, persuasive: boolean, baseUrl: string): Promise<GeneratedContent> {
  const apiKey = settings.provider === 'openai' ? settings.apiKeys.openai : settings.apiKeys.deepseek;
  if (!apiKey) throw new Error(`${settings.provider.toUpperCase()} API Key is missing.`);

  const prompt = `
    ${SYSTEM_INSTRUCTION}
    Generate complete marketing materials for: ${product.name}. ${persuasive ? "Make it highly persuasive." : ""}
    Details: ${JSON.stringify(product)}
    
    Provide JSON: { 
      facebookPost: { english, chinese, spanish, hashtags }, 
      detailPage, 
      imagePrompt,
      videoScript: { part1: [], part2: [], part3: [] }
    }
    
    Each video shot must have: id, duration, descriptionEn, descriptionZh, shotType, angle, movement, composition, actionEn, actionZh, lighting, style, rhythm.
  `;

  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: settings.model,
      messages: [{ role: 'system', content: SYSTEM_INSTRUCTION }, { role: 'user', content: prompt }],
      response_format: { type: "json_object" }
    })
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`API request failed: ${err}`);
  }

  const data = await res.json();
  const content = extractJson(data.choices[0].message.content);

  return content as GeneratedContent;
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
