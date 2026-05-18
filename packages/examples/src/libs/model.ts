import { ChatOpenAI } from '@langchain/openai'

export const model = new ChatOpenAI({
  model: process.env.OPENAI_MODEL!,
  apiKey: process.env.OPENAI_API_KEY!,
  temperature: 0,
  // timeout: 300,
  // maxTokens: 25000,
  configuration: {
    baseURL: process.env.OPENAI_BASE_PATH!,
  },
})
