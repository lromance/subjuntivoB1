import { GoogleGenAI } from "@google/genai";
import { Attempt } from '../types';

const getAiInstance = () => {
    if (!process.env.API_KEY) {
        throw new Error("API_KEY environment variable not set");
    }
    return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const getAIFeedback = async (attempts: Attempt[]): Promise<string> => {
    const errors = attempts.filter(att => !att.isCorrect && att.userAnswer.toLowerCase() !== 'no respondió');

    if (errors.length === 0) {
        return '¡Genial! No hemos detectado errores recientes o no has corregido ningún ejercicio. ¡Sigue practicando!';
    }
    
    const ai = getAiInstance();

    let errorSummary = "Errores detectados en la práctica de Subjuntivo (con conjugaciones y contextos):\n\n";
    const errorsToSend = errors.slice(-10); // Limit to last 10 errors

    errorsToSend.forEach((error, index) => {
        errorSummary += `[Error #${index + 1}] Ejercicio: ${error.exerciseId} (Pregunta: ${error.question || 'N/A'})\n`;
        errorSummary += `- Tu Respuesta: "${error.userAnswer}"\n`;
        errorSummary += `- Respuesta Correcta: "${error.correctAnswer}"\n\n`;
    });

    const systemPrompt = "Actúa como un tutor de español B1 experto, amigable y motivador. Tu objetivo es analizar los errores del estudiante. Identifica el patrón de error más frecuente (ej. 'Confunde Indicativo con Subjuntivo', 'Error en irregulares como ser/ir/haber'). Ofrece una explicación concisa (máximo 4 frases) y muy clara sobre la regla que se está fallando y un consejo práctico. Muestra ánimo al estudiante. El output debe ser solo el texto del análisis. Usa párrafos para separar ideas.";
    const userQuery = `Analiza los siguientes ${errorsToSend.length} errores, identifica el patrón principal y explica la regla de forma simple:\n\n${errorSummary}`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: userQuery,
            config: {
                systemInstruction: systemPrompt,
            }
        });
        
        const text = response.text;
        if (!text) {
            throw new Error("API response missing text content.");
        }
        return text;
    } catch (error) {
        console.error("Gemini API Error:", error);
        throw new Error("Failed to get response from Gemini API.");
    }
};

export const getTutorResponse = async (systemPrompt: string, userQuery: string, retries = 3): Promise<string> => {
    const ai = getAiInstance();

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: userQuery,
            config: {
                systemInstruction: systemPrompt,
            }
        });

        const text = response.text;
        if (text) {
            return text;
        } else {
            // Check for blocked content
            const safetyFeedback = response?.promptFeedback;
            if (safetyFeedback && safetyFeedback.blockReason) {
                throw new Error(`Contenido bloqueado: ${safetyFeedback.blockReason}`);
            }
            throw new Error("La IA no devolvió una respuesta válida.");
        }
    } catch (error) {
        console.error("Error in getTutorResponse:", error);
        if (retries > 0) {
            const delay = Math.pow(2, 3 - retries) * 1000;
            await new Promise(res => setTimeout(res, delay));
            return getTutorResponse(systemPrompt, userQuery, retries - 1);
        } else {
            throw error;
        }
    }
};