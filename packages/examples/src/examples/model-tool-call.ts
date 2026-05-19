import { BaseMessage, HumanMessage } from 'langchain'

import { model } from '../libs/model.js'

import { getWeather } from './get-weather.js'

export async function main() {
  const modelWithTools = model.bindTools([getWeather], {
    // 是否并行调用工具
    parallel_tool_calls: true,
  })

  const messages: BaseMessage[] = [new HumanMessage('上海和北京的天气怎么样')]
  const response = await modelWithTools.invoke(messages)
  const toolCalls = response.tool_calls || []

  if (toolCalls.length === 0) {
    console.log('No tool calls found')
    return
  }

  for await (const toolCall of toolCalls) {
    console.log(`Tool: ${toolCall.name}`)
    console.log(`Args: ${JSON.stringify(toolCall.args)}`)
    if (getWeather.name === toolCall.name) {
      const result = await getWeather.invoke(toolCall)
      messages.push(result)
    }
  }

  const finalResponse = await modelWithTools.invoke(messages)
  console.log(JSON.stringify(messages))
  console.log(finalResponse.text)
}
