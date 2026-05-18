import { createAgent, tool } from 'langchain'
import * as z from 'zod'

import { model } from '../libs/model.js'

export const getWeather = tool(
  ({ city }) => {
    return `今天${city}天气晴朗，温度25度`
  },
  {
    name: 'get-weather',
    description: '查询指定城市的天气',
    schema: z.object({
      city: z.string().describe('城市名称'),
    }),
  },
)

export async function main() {
  const agent = createAgent({
    model,
    tools: [getWeather],
  })

  const result = await agent.invoke({
    messages: [{ role: 'user', content: '深圳今天天气怎么样' }],
  })

  console.log(result)
}
