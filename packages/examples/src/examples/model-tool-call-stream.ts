import { AIMessageChunk } from 'langchain'

import { model } from '../libs/model.js'

import { getWeather } from './get-weather.js'

export async function main() {
  const modelWithTools = model.bindTools([getWeather])
  const stream = await modelWithTools.stream('上海和北京的天气怎么样')

  let full: AIMessageChunk | null = null
  for await (const chunk of stream) {
    full = full ? full.concat(chunk) : chunk
    console.log(full.contentBlocks)

    if (chunk.tool_call_chunks) {
      for (const toolChunk of chunk.tool_call_chunks) {
        console.log(`Tool: ${toolChunk.name || 'unknown'}`)
        console.log(`Args: ${toolChunk.args ? JSON.stringify(toolChunk.args) : 'unknown'}`)
      }
    }
  }
}
