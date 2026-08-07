import { GoogleGenAI, Content, FunctionCallingConfigMode } from '@google/genai';

const googleAi = new GoogleGenAI({
    apiKey: process.env.GEMINI_KEY
});

function getTimeOfDay() {
    return '5:45';
}

async function callGeminiAIWithTools() {
    // 1. Context should only contain valid chat turns ('user' or 'model')
    const context: Content[] = [
        {
            role: "user",
            parts: [{ text: "What is the time of day?" }]
        }
    ];

    // First request: Gemini decides to invoke a tool
    const response = await googleAi.models.generateContent({
        model: "gemini-2.5-flash",
        contents: context,
        config: {
            systemInstruction: "You are a helpful assistant that gives information about the time of the day",
            tools: [
                {
                    functionDeclarations: [{
                        name: 'getTimeOfDay',
                        description: 'Get the time of the day'
                    }]
                }
            ],
            toolConfig: {
                functionCallingConfig: {
                    mode: FunctionCallingConfigMode.AUTO
                },
            },
        }
    });

    const functionCalls = response.functionCalls;

    if (functionCalls && functionCalls.length > 0) {
        const toolCall = functionCalls[0];

        if (toolCall.name === 'getTimeOfDay') {
            const toolResp = getTimeOfDay();
            const modelContent = response.candidates?.[0]?.content;

            // 2. Push Gemini's tool invocation turn to context
            if (modelContent) {
                context.push(modelContent);
            }

            // 3. Push your function response turn under role 'user'
            context.push({
                role: 'user', 
                parts: [
                    {
                        functionResponse: {
                            name: toolCall.name,
                            response: { result: toolResp },
                        },
                    },
                ],
            });

            // 4. SECOND API CALL: Send the updated context back to get final text
            const finalResponse = await googleAi.models.generateContent({
                model: "gemini-2.5-flash",
                contents: context,
            });

            // Log the final conversational text response
            console.log(finalResponse.text);
        }
    }
}

callGeminiAIWithTools();