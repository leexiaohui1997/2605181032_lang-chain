import { BaseMessage, HumanMessage } from 'langchain'
import z from 'zod'

import { model } from '../libs/model.js'

export async function main() {
  const StructuredOutput = z.object({
    cities: z.array(z.tuple([z.string().describe('城市'), z.string().describe('介绍')])),
  })

  const modelWithStructure = model.withStructuredOutput(StructuredOutput)

  const messages: BaseMessage[] = [new HumanMessage('中国一线城市有哪些')]
  const response = await modelWithStructure.invoke(messages)
  console.log(response)
}
