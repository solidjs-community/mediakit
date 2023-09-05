import fs from 'fs'

async function getData<T>() {
  const fileData = await fs.promises.readFile('db.json')
  const data = JSON.parse(fileData.toString())
  return data as T
}

async function saveData<T>(data: T) {
  await fs.promises.writeFile('db.json', JSON.stringify(data))
}

export type Todo = {
  title: string
  completed: boolean
  userId: string
}

export const Todos = {
  get: getData<Todo[]>,
  save: saveData<Todo[]>,
}
