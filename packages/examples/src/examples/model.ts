// import { HumanMessage, SystemMessage } from 'langchain'

import { model } from '../libs/model.js'

import { getWeather } from './get-weather.js'

export async function main() {
  // 单条消息
  // console.log(await model.invoke('你好，你是什么模型'))
  // 多条消息
  // console.log(
  //   await model.invoke([
  //     new SystemMessage('你叫小明，你的身份是一个翻译助手'),
  //     new HumanMessage('你是谁'),
  //   ]),
  // )

  // 流式输出
  // const stream = await model.stream('你好，你是什么模型')
  // for await (const chunk of stream) {
  //   process.stdout.write(chunk.text)
  // }

  // 使用工具
  console.log(await model.bindTools([getWeather]).invoke('今天北京天气如何'))
}
