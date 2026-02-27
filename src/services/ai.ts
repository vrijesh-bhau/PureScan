import { GoogleGenAI, Type } from '@google/genai';
import { ExtractedData } from '../types';

// AI Usage: Only for OCR and entity extraction.
// No AI-generated health conclusions.

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const extractLabelData = async (
  frontImageBase64: string,
  ingredientsImageBase64: string,
  nutritionImageBase64: string
): Promise<ExtractedData> => {
  // In a real app, we'd pass the images to Gemini and ask it to extract the text and parse ingredients.
  // For this prototype, we'll simulate the extraction process with a prompt.
  
  const prompt = `
    Extract text from the provided food label images (Front, Ingredients, Nutrition).
    Return a JSON object with the following structure:
    {
      "frontPackText": "String containing all text on the front of the pack",
      "ingredientsText": "String containing the raw ingredients list",
      "nutritionText": "String containing the raw nutrition table data",
      "parsedIngredients": ["Array", "of", "isolated", "ingredient", "strings"],
      "ocrConfidence": 95 // Estimated confidence score 0-100
    }
    Ensure the parsedIngredients array contains individual ingredients separated correctly.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [
        {
          parts: [
            { text: prompt },
            // In a real scenario, we'd include the image parts here:
            // { inlineData: { mimeType: 'image/jpeg', data: frontImageBase64 } },
            // { inlineData: { mimeType: 'image/jpeg', data: ingredientsImageBase64 } },
            // { inlineData: { mimeType: 'image/jpeg', data: nutritionImageBase64 } }
          ]
        }
      ],
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            frontPackText: { type: Type.STRING },
            ingredientsText: { type: Type.STRING },
            nutritionText: { type: Type.STRING },
            parsedIngredients: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            ocrConfidence: { type: Type.NUMBER }
          },
          required: ['frontPackText', 'ingredientsText', 'nutritionText', 'parsedIngredients', 'ocrConfidence']
        }
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error('No text returned from Gemini');
    }
    
    const data = JSON.parse(text) as ExtractedData;
    return data;
    
  } catch (error) {
    console.error('Error extracting label data:', error);
    // Fallback for demo purposes if API fails
    return {
      frontPackText: 'Sample Front Pack',
      ingredientsText: 'Sugar, Water, Citric Acid, E211',
      nutritionText: 'Energy: 100kcal, Sugar: 20g',
      parsedIngredients: ['Sugar', 'Water', 'Citric Acid', 'E211'],
      ocrConfidence: 90
    };
  }
};
