import { Timestamp } from 'firebase/firestore'
import type { Task } from '../../src/types/task'

export function makeTask(overrides: Partial<Task> = {}): Task {
  return {
    id: 'task-1',
    title: 'Comprar pan',
    description: 'Integral',
    completed: false,
    important: false,
    userId: 'user-1',
    createdAt: Timestamp.fromMillis(0),
    ...overrides,
  }
}
