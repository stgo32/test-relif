import OpenAI from 'openai';
import {
  ChatCompletionAssistantMessageParam,
  ChatCompletionSystemMessageParam,
  ChatCompletionUserMessageParam,
} from 'openai/resources/chat';
import { Message } from '../models/Message';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'api-key',
});

const availableCars = [
  { model: 'Ferrari 488 GTB', price: '$220.000.000', type: 'coupé', year: 2020 },
  { model: 'Lamborghini Huracán EVO', price: '$250.000.000', type: 'coupé', year: 2021 },
  { model: 'Porsche 911 Turbo S', price: '$190.000.000', type: 'coupé', year: 2022 },
  { model: 'Ferrari Roma', price: '$230.000.000', type: 'coupé', year: 2023 },
  { model: 'Lamborghini Urus', price: '$210.000.000', type: 'SUV', year: 2022 },
];

function mapRole(role: string): 'user' | 'assistant' {
  return role === 'client' ? 'user' : 'assistant';
}

export function buildChatHistory(
  messages: Message[]
): (
  | ChatCompletionUserMessageParam
  | ChatCompletionAssistantMessageParam
  | ChatCompletionSystemMessageParam
)[] {
  const carsList = availableCars
    .map((car) => `${car.model} (${car.type}, ${car.year}) - ${car.price}`)
    .join('\n');

  const systemPrompt: ChatCompletionSystemMessageParam = {
    role: 'system',
    content: `You are Santiago, a professional car sales advisor in Chile.
You are assisting a client in buying a new car. You only sell new Ferrari, Lamborghini, and Porsche models.
The cars are located in Vitacura and Lo Barnechea branches.

Your job is to guide the client with empathy and professionalism.

Available cars:
${carsList}`,
  };

  const chatMessages = messages.map((msg) => ({
    role: mapRole(msg.role),
    content: msg.text,
  }));

  return [systemPrompt, ...chatMessages];
}

export async function generateAIResponse(chatHistory: any[]): Promise<string> {
  const response = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: chatHistory,
  });

  return response.choices[0].message.content || '';
}
