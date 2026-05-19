import { createAgent, HumanMessage, tool } from 'langchain'
import z from 'zod'

import { model } from '../libs/model.js'

export async function main() {
  const contextSchema = z.object({
    user_name: z.string(),
  })

  const getUserName = tool(
    (_, config) => {
      return config.context?.user_name
    },
    {
      name: 'get_user_name',
      description: '获取用户名称',
      schema: z.object({}),
    },
  )

  const agent = createAgent({
    model,
    tools: [getUserName],
    contextSchema,
  })

  const result = await agent.invoke(
    {
      messages: [new HumanMessage('我是谁')],
    },
    {
      context: {
        user_name: '张三',
      },
    },
  )

  console.log(result)
}
