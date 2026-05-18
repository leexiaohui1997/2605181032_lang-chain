import { createAgent } from 'langchain'
import z from 'zod'

import { model } from '../libs/model.js'

const ContactInfo = z.object({
  name: z.string(),
  email: z.email(),
  phone: z.string(),
})

export async function main() {
  const agent = createAgent({
    model,
    responseFormat: ContactInfo,
  })

  const result = await agent.invoke({
    messages: [
      {
        role: 'user',
        content: '请识别以下信息：张三，13800138000，zhangsan@example.com',
      },
    ],
  })

  console.log(result.structuredResponse)
}
