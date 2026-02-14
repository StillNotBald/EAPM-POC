import { GoogleGenAI } from "@google/genai";
import { Application } from "../types";

export const getPortfolioInsights = async (apps: Application[], query: string, apiKey: string): Promise<string> => {
  if (!apiKey) {
    return "⚠️ **Configuration Error**: Please provide a valid Gemini API Key to continue.";
  }

  try {
    // Initialize the client with the user-provided key
    const ai = new GoogleGenAI({ apiKey });

    const context = `
      You are an Enterprise Architect analyzing an application portfolio.
      Here is the raw JSON data of the current portfolio:
      ${JSON.stringify(apps.map(a => ({ name: a.name, tier: a.tier, health: a.health, value: a.value, pii: a.security.piiRisk })))}
      
      The user asks: "${query}"
      
      Provide a concise, executive summary answer using the data provided. 
      Focus on strategic recommendations (Invest, Migrate, Tolerate, Eliminate).
      Format with markdown. Use bolding for key app names.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: context,
    });

    return response.text || "No insights generated.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "❌ **Analysis Failed**: Unable to reach the AI service. Please verify your API Key and connection.";
  }
};