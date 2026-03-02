import { GoogleGenAI } from "@google/genai";
import { AnalysisResult, Language, UserPreferences } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const analyzeFoodLabel = async (
  images: string[],
  prefs: UserPreferences
): Promise<AnalysisResult> => {
  const model = "gemini-3-flash-preview";
  
  const languageInstructions: Record<Language, string> = {
    en: "Respond in simple English.",
    hi: "Respond in Hindi (using Devanagari script).",
    hinglish: "Respond in Hinglish (Hindi written in Roman script, common in India).",
    bn: "Respond in Bengali.",
    te: "Respond in Telugu.",
    mr: "Respond in Marathi.",
    ta: "Respond in Tamil.",
    gu: "Respond in Gujarati.",
    ur: "Respond in Urdu.",
    kn: "Respond in Kannada.",
    or: "Respond in Odia.",
    ml: "Respond in Malayalam.",
    pa: "Respond in Punjabi."
  };

  const styleInstruction = prefs.style ? `Follow this style: ${prefs.style}` : "";

  const prompt = `
    You are a food safety expert for Indian consumers.
    Analyze the provided food label image(s).
    
    STEP 1: CLASSIFICATION
    Is this a packaged food product? If not, stop and return isFood: false with a message.
    
    STEP 2: EXTRACTION
    Extract Product Name, Brand, and Ingredient List. If ingredients are not visible, say "Ingredient list not clearly visible".
    
    STEP 3: NUTRITIONAL RISK LOGIC
    Evaluate Sugar, Salt, Oil/Fat quality, Additives (INS/E-numbers), and Ultra-processing indicators.
    
    STEP 4: CONSUMER EXPLANATION
    Explain in simple everyday language.
    
    ${languageInstructions[prefs.language]}
    ${styleInstruction}

    Return the result in this JSON format:
    {
      "product": "Product Name",
      "brand": "Brand Name",
      "overallRisk": "Low" | "Moderate" | "High",
      "whyThisRating": ["point 1", "point 2"],
      "good": ["point 1"],
      "concerns": ["point 1"],
      "forDailyUse": "Safe / Occasional / Avoid frequent use",
      "confidence": number (0-100),
      "ingredients": "Extracted ingredient list or 'Ingredient list not clearly visible'",
      "isFood": true,
      "notFoodMessage": "Only if isFood is false"
    }

    CONFIDENCE CALCULATION RULES:
    - Blurry image: reduce confidence
    - Partial label: reduce confidence
    - Multiple angles: increase confidence
    - Clear ingredient list: increase confidence
    
    Never invent ingredients. If data is unclear, say "Not clearly visible".
  `;

  const imageParts = images.map(img => ({
    inlineData: {
      mimeType: "image/jpeg",
      data: img.split(',')[1] // Remove data:image/jpeg;base64,
    }
  }));

  try {
    const response = await ai.models.generateContent({
      model,
      contents: [
        {
          parts: [
            { text: prompt },
            ...imageParts
          ]
        }
      ],
      config: {
        responseMimeType: "application/json"
      }
    });

    const result = JSON.parse(response.text || "{}");
    return result as AnalysisResult;
  } catch (error) {
    console.error("AI Analysis Error:", error);
    throw new Error("Failed to analyze image. Please try again with a clearer photo.");
  }
};

export const chatWithAI = async (
  previousResult: AnalysisResult,
  question: string,
  language: Language
): Promise<string> => {
  const model = "gemini-3-flash-preview";
  
  const languageInstructions: Record<Language, string> = {
    en: "Respond in simple English.",
    hi: "Respond in Hindi (using Devanagari script).",
    hinglish: "Respond in Hinglish (Hindi written in Roman script, common in India).",
    bn: "Respond in Bengali.",
    te: "Respond in Telugu.",
    mr: "Respond in Marathi.",
    ta: "Respond in Tamil.",
    gu: "Respond in Gujarati.",
    ur: "Respond in Urdu.",
    kn: "Respond in Kannada.",
    or: "Respond in Odia.",
    ml: "Respond in Malayalam.",
    pa: "Respond in Punjabi."
  };

  const prompt = `
    You are a food safety expert. 
    The user previously scanned a product: ${previousResult.product} (${previousResult.brand}).
    The analysis was: ${previousResult.overallRisk} risk. 
    Concerns were: ${previousResult.concerns.join(", ")}.
    
    The user is now asking a follow-up question: "${question}"
    
    Provide a helpful, accurate, and simple answer based on food safety standards.
    ${languageInstructions[language]}
    Keep the answer concise and direct.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: [{ parts: [{ text: prompt }] }]
    });

    return response.text || "I'm sorry, I couldn't process that question.";
  } catch (error) {
    console.error("AI Chat Error:", error);
    return "I'm having trouble connecting to my brain. Please try again.";
  }
};
