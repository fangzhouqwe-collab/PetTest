
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getPetAdvice = async (prompt: string, imageBase64?: string) => {
  const model = 'gemini-3-flash-preview';
  const systemInstruction = `你是一位专业的AI宠物顾问。提供科学建议。如果包含图片请分析。用中文回答。`;

  try {
    const contents: any[] = [];
    if (imageBase64) {
      contents.push({
        parts: [
          { inlineData: { data: imageBase64.split(',')[1], mimeType: 'image/jpeg' } },
          { text: prompt || "请分析这张宠物的照片并给出建议。" }
        ]
      });
    } else {
      contents.push({ parts: [{ text: prompt }] });
    }

    const response = await ai.models.generateContent({
      model,
      contents,
      config: { systemInstruction, temperature: 0.7 }
    });
    return response.text;
  } catch (error) {
    return "抱歉，出错了。";
  }
};

export const generatePetImage = async (prompt: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [{ text: `A high quality, cute pet related image of: ${prompt}. Cinematic lighting, detailed fur.` }] },
      config: {
        imageConfig: { aspectRatio: "1:1" }
      }
    });

    const part = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
    if (part?.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
    return null;
  } catch (error) {
    console.error("Image generation error:", error);
    return null;
  }
};

export const generateStreamingAdvice = async (prompt: string, imageBase64: string | null, onChunk: (text: string) => void) => {
  const model = 'gemini-3-flash-preview';
  const systemInstruction = "你是一位专业的AI宠物顾问。如果用户要求你画图、绘图或生成图片，请先回答'好的，我为您生成一张图片...'，之后我将触发图像生成。";

  try {
    const parts: any[] = [{ text: prompt }];
    if (imageBase64) {
      parts.push({ inlineData: { data: imageBase64.split(',')[1], mimeType: 'image/jpeg' } });
    }

    const result = await ai.models.generateContentStream({
      model,
      contents: { parts },
      config: { systemInstruction }
    });

    for await (const chunk of result) {
      const chunkText = chunk.text;
      if (chunkText) onChunk(chunkText);
    }
  } catch (error) {
    onChunk("抱歉，出错了。");
  }
};
