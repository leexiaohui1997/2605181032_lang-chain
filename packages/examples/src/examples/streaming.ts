import { AIMessage, createAgent } from 'langchain'
import z from 'zod'

import { model } from '../libs/model.js'

export async function main() {
  const agent = createAgent({
    model,
    tools: [],
    responseFormat: z.object({
      roles: z.array(
        z.object({
          name: z.string(),
          gender: z.enum(['male', 'female']),
          description: z.string(),
        }),
      ),
    }),
  })

  const stream = await agent.stream(
    {
      messages: [
        {
          role: 'user',
          content: '请生成三个角色',
        },
      ],
    },
    { streamMode: 'values' },
  )

  for await (const chunk of stream) {
    const latestMessage = chunk.messages.at(-1)
    if (latestMessage?.content) {
      console.log(`Agent: ${latestMessage.content}`)
    } else if (AIMessage.isInstance(latestMessage) && latestMessage.tool_calls) {
      const toolCallNames = latestMessage.tool_calls.map((tc) => tc.name)
      console.log(`Calling tools: ${toolCallNames.join(', ')}`)
    }
  }
}
