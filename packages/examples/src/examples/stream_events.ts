import { createAgent, HumanMessage, tool } from 'langchain'
import z from 'zod'

import { model } from '../libs/model.js'

import { getWeather } from './get-weather.js'

const agent = createAgent({
  model,
  tools: [getWeather],
})

const weatherAgent = createAgent({
  model,
  tools: [getWeather],
  name: 'weather_agent',
})

const callWeather = tool(
  async ({ query }) => {
    const result = await weatherAgent.invoke({ messages: [new HumanMessage(query)] })
    return result.messages.at(-1)?.text ?? ''
  },
  {
    name: 'call_weather',
    schema: z.object({ query: z.string() }),
  },
)

export async function main() {
  const stream = await agent.streamEvents(
    {
      messages: [new HumanMessage('今天北京天气如何')],
    },
    { version: 'v3' },
  )

  for await (const message of stream.messages) {
    process.stdout.write(`[${message.node}]`)

    for await (const delta of message.reasoning) {
      process.stdout.write(`[reasoning] ${delta}`)
    }

    for await (const delta of message.text) {
      process.stdout.write(delta)
    }

    const fullMessage = await message.output
    console.log('\n== full message ==')
    console.log(fullMessage.content)

    const usage = await message.usage
    if (usage) {
      console.log(usage)
    }
  }

  const finalState = await stream.output
  console.log('\n== final state ==')
  console.log(finalState)
}

export async function toolCallsExample() {
  const stream = await agent.streamEvents(
    {
      messages: [new HumanMessage('今天北京天气如何')],
    },
    { version: 'v3' },
  )

  await Promise.all([
    (async () => {
      for await (const message of stream.messages) {
        for await (const chunk of message.toolCalls) {
          console.log('tool call chunk', chunk)
        }
      }
    })(),
    (async () => {
      for await (const call of stream.toolCalls) {
        console.log(call.name, call.input)
        console.log(await call.output, await call.error)
      }
    })(),
  ])
}

export async function subAgentExample() {
  const supervisor = createAgent({
    model,
    tools: [callWeather],
    name: 'supervisor',
  })

  const stream = await supervisor.streamEvents(
    {
      messages: [new HumanMessage('今天广东天气如何')],
    },
    { version: 'v3' },
  )

  await Promise.all([
    (async () => {
      for await (const message of stream.messages) {
        process.stdout.write(`[${message.node}]`)

        for await (const delta of message.reasoning) {
          process.stdout.write(`[reasoning] ${delta}`)
        }

        for await (const delta of message.text) {
          process.stdout.write(delta)
        }

        const fullMessage = await message.output
        console.log('\n== full message ==')
        console.log(fullMessage.content)

        const usage = await message.usage
        if (usage) {
          console.log(usage)
        }
      }
    })(),
    (async () => {
      for await (const subagent of stream.subgraphs) {
        console.log(`subagent.name: ${subagent.name}`)
        if (subagent.name !== 'weather_agent') continue
        process.stdout.write(`${subagent.name}: `)
        for await (const message of subagent.messages) {
          for await (const token of message.text) {
            process.stdout.write(token)
          }
        }
        process.stdout.write('\n')
      }
    })(),
  ])
}
