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

  const modelName = settings.model || "gemini-3-flash-preview";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

  const basePrompt = `Product Details: ${JSON.stringify(product)}\nNOTE: The "sellingPoints" or "features" in the details might be provided in Chinese. Please understand them and incorporate these specific selling points into the generated marketing materials.`;

  const marketingPayload = {
    contents: [{
      role: "user",
      parts: [{
        text: `Generate marketing copy for: ${product.name}. ${persuasive ? "Make it highly persuasive." : ""}\n${basePrompt}\n\nProvide: 1. Facebook Post (English, Chinese, Spanish, and Hashtags), 2. Product Detail Page copy, 3. Professional Image Generation Prompt.`
      }]
    }],
    systemInstruction: { role: "system", parts: [{ text: SYSTEM_INSTRUCTION }] },
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: {
        type: "OBJECT",
        properties: {
          facebookPost: {
            type: "OBJECT",
            properties: {
              english: { type: "STRING" },
              chinese: { type: "STRING" },
              spanish: { type: "STRING" },
              hashtags: { type: "STRING" }
            },
            required: ["english", "chinese", "spanish", "hashtags"]
          },
          detailPage: { type: "STRING" },
          imagePrompt: { type: "STRING" }
        },
        required: ["facebookPost", "detailPage", "imagePrompt"]
      }
    }
  };

  const videoPayload = {
    contents: [{
      role: "user",
      parts: [{
        text: `Generate a professional 30s video script for: ${product.name}.\n${basePrompt}\n\nProvide: A 30-second professional video script in 3 parts (10s each).\nIMPORTANT: Generate EXACTLY 2 shots per part to keep it concise.\nIMPORTANT: Provide both English and Chinese for 'descriptionEn/Zh' and 'actionEn/Zh' fields.`
      }]
    }],
    systemInstruction: { role: "system", parts: [{ text: SYSTEM_INSTRUCTION }] },
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: {
        type: "OBJECT",
        properties: {
          videoScript: {
            type: "OBJECT",
            properties: {
              part1: { type: "ARRAY", items: { type: "OBJECT", properties: { id: { type: "STRING" }, duration: { type: "STRING" }, descriptionEn: { type: "STRING" }, descriptionZh: { type: "STRING" }, shotType: { type: "STRING" }, angle: { type: "STRING" }, movement: { type: "STRING" }, actionEn: { type: "STRING" }, actionZh: { type: "STRING" }, lighting: { type: "STRING" }, rhythm: { type: "STRING" } } } },
              part2: { type: "ARRAY", items: { type: "OBJECT", properties: { id: { type: "STRING" }, duration: { type: "STRING" }, descriptionEn: { type: "STRING" }, descriptionZh: { type: "STRING" }, shotType: { type: "STRING" }, angle: { type: "STRING" }, movement: { type: "STRING" }, actionEn: { type: "STRING" }, actionZh: { type: "STRING" }, lighting: { type: "STRING" }, rhythm: { type: "STRING" } } } },
              part3: { type: "ARRAY", items: { type: "OBJECT", properties: { id: { type: "STRING" }, duration: { type: "STRING" }, descriptionEn: { type: "STRING" }, descriptionZh: { type: "STRING" }, shotType: { type: "STRING" }, angle: { type: "STRING" }, movement: { type: "STRING" }, actionEn: { type: "STRING" }, actionZh: { type: "STRING" }, lighting: { type: "STRING" }, rhythm: { type: "STRING" } } } }
            },
            required: ["part1", "part2", "part3"]
          }
        },
        required: ["videoScript"]
      }
    }
  };

  const fetchApi = async (payload: any) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 240000); // 240s timeout
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Gemini API Error:", errorText);
        if (response.status === 429) throw new Error("Rate limit exceeded. Please wait a moment.");
        throw new Error(`API request failed with status ${response.status}: ${errorText}`);
      }
      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) throw new Error("Content generation failed: AI returned an empty response.");
      return extractJson(text);
    } catch (error: any) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error("Request timed out. The AI is taking longer than expected.");
      }
      throw error;
    }
  };

  const [marketingData, videoData] = await Promise.all([
    fetchApi(marketingPayload),
    fetchApi(videoPayload)
  ]);

  return {
    ...marketingData,
    videoScript: videoData.videoScript
  } as GeneratedContent;
}

async function callOpenAICompatible(product: ProductData, settings: AISettings, persuasive: boolean, baseUrl: string): Promise<GeneratedContent> {
  const apiKey = settings.provider === 'openai' ? settings.apiKeys.openai : settings.apiKeys.deepseek;
  if (!apiKey) throw new Error(`${settings.provider.toUpperCase()} API Key is missing.`);

  const basePrompt = `Product Details: ${JSON.stringify(product)}\nNOTE: The "sellingPoints" or "features" in the details might be provided in Chinese. Please understand them and incorporate these specific selling points into the generated marketing materials.`;

  const marketingPrompt = `
    ${SYSTEM_INSTRUCTION}
    Generate marketing copy for: ${product.name}. ${persuasive ? "Make it highly persuasive." : ""}
    ${basePrompt}
    Provide JSON: { facebookPost: { english, chinese, spanish, hashtags }, detailPage, imagePrompt }
  `;

  const videoPrompt = `
    ${SYSTEM_INSTRUCTION}
    Generate a professional 30s video script for: ${product.name}.
    ${basePrompt}
    Provide JSON: { videoScript: { part1: [], part2: [], part3: [] } }
    IMPORTANT: Generate EXACTLY 2 shots per part to keep it concise.
    Each video shot must have: id, duration, descriptionEn, descriptionZh, shotType, angle, movement, actionEn, actionZh, lighting, rhythm.
  `;

  const fetchApi = async (promptText: string) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 240000); // 240s timeout

    try {
      const res = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
        body: JSON.stringify({
          model: settings.model,
          messages: [{ role: 'system', content: SYSTEM_INSTRUCTION }, { role: 'user', content: promptText }],
          response_format: { type: "json_object" }
        }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (!res.ok) {
        const err = await res.text();
        throw new Error(`API request failed: ${err}`);
      }
      const data = await res.json();
      return extractJson(data.choices[0].message.content);
    } catch (error: any) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error("Request timed out. The AI is taking longer than expected.");
      }
      throw error;
    }
  };

  const [marketingData, videoData] = await Promise.all([
    fetchApi(marketingPrompt),
    fetchApi(videoPrompt)
  ]);

  return {
    ...marketingData,
    videoScript: videoData.videoScript
  } as GeneratedContent;
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
