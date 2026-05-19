import { InMemoryStore } from '@langchain/langgraph'
import { createAgent, HumanMessage, tool } from 'langchain'
import z from 'zod'

import { model } from '../libs/model.js'

const store = new InMemoryStore()

const saveUserInfo = tool(
  async ({ user_id, name, age, email }) => {
    console.log('save_user_info', { user_id, name, age, email })
    await store.put(['users'], user_id, { name, age, email })
    return '保存成功'
  },
  {
    name: 'save_user_info',
    description: '保存用户信息',
    schema: z.object({
      user_id: z.string(),
      name: z.string(),
      age: z.number(),
      email: z.email(),
    }),
  },
)

const getUserInfo = tool(
  async ({ user_id }) => {
    const user = await store.get(['users'], user_id)
    console.log('get_user_info', user_id, user)
    return user
  },
  {
    name: 'get_user_info',
    description: '获取用户信息',
    schema: z.object({
      user_id: z.string(),
    }),
  },
)

export async function main() {
  const agent = createAgent({
    model,
    tools: [saveUserInfo, getUserInfo],
    store,
  })

  const saveUserResponse = await agent.invoke({
    messages: [
      new HumanMessage('保存用户信息: 用户ID: 1, 姓名: 张三, 年龄: 18, 邮箱: zhangsan@example.com'),
    ],
  })

  console.log('===== saveResponse =====')
  console.log(saveUserResponse)

  const getUserResponse = await agent.invoke({
    messages: [new HumanMessage('获取用户信息: 用户ID: 1')],
  })

  console.log('===== getUserResponse =====')
  console.log(getUserResponse)
}
