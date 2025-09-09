import { existsSync, readFileSync, writeFileSync } from 'fs'
import { join } from 'path'
import type { Post, Comment } from '~/types/board'

const dbFile = join(process.cwd(), 'board.json')

interface Data {
  posts: Post[]
  comments: Comment[]
}

function readData(): Data {
  if (!existsSync(dbFile)) {
    return { posts: [], comments: [] }
  }
  try {
    const data = JSON.parse(readFileSync(dbFile, 'utf-8')) as Partial<Data>
    return { posts: data.posts ?? [], comments: data.comments ?? [] }
  } catch {
    return { posts: [], comments: [] }
  }
}

function writeData(data: Data) {
  writeFileSync(dbFile, JSON.stringify(data, null, 2))
}

function nextId(items: { id: number }[]): number {
  return items.length ? Math.max(...items.map(i => i.id)) + 1 : 1
}

export function listPosts(): Post[] {
  const data = readData()
  return data.posts.sort((a, b) => b.id - a.id)
}

export function insertPost(title: string): number {
  const data = readData()
  const id = nextId(data.posts)
  data.posts.push({ id, title })
  writeData(data)
  return id
}

export function listComments(postId: number): Comment[] {
  const data = readData()
  return data.comments.filter(c => c.postId === postId).sort((a, b) => a.id - b.id)
}

export function insertComment(postId: number, body: string): number {
  const data = readData()
  const id = nextId(data.comments)
  data.comments.push({ id, postId, body })
  writeData(data)
  return id
}
