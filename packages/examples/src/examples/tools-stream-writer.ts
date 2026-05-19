import { AIMessage, createAgent, HumanMessage, tool, ToolRuntime } from 'langchain'
import z from 'zod'

import { model } from '../libs/model.js'

const getWeather = tool(
  async ({ city }, { writer }: ToolRuntime) => {
    if (writer) {
      writer(`正在获取${city}的天气...`)
      await new Promise((resolve) => setTimeout(resolve, 1000))
      writer(`已获取到${city}的天气`)
    }
    return `今天${city}天气晴朗，温度25度`
  },
  {
    name: 'getWeather',
    description: '获取天气',
    schema: z.object({
      city: z.string().describe('城市'),
    }),
  },
)

const agent = createAgent({
  model,
  tools: [getWeather],
})

export async function main() {
  const stream = await agent.stream(
    { messages: [new HumanMessage('查询北京天气')] },
    { streamMode: ['values', 'custom'] },
  )
  for await (const [mode, chunk] of stream) {
    if (mode === 'values') {
      const latestMessage = chunk.messages.at(-1)
      if (latestMessage?.content) {
        process.stdout.write(`${latestMessage.content}\n`)
      } else if (AIMessage.isInstance(latestMessage) && latestMessage.tool_calls?.length) {
        const toolCallNames = latestMessage.tool_calls.map((tc) => tc.name)
        process.stdout.write(`Calling tools: ${toolCallNames.join(', ')}\n`)
      }
    } else if (mode === 'custom') {
      process.stdout.write(`${chunk}\n`)
    }
  }
}
