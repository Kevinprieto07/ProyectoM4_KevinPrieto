import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  where,
  type FirestoreError,
} from 'firebase/firestore'
import { db } from './firebase'
import type { NewTask, Task } from '../types/task'

const tasksCollection = collection(db, 'tasks')

export async function createTask(userId: string, task: NewTask) {
  await addDoc(tasksCollection, {
    ...task,
    completed: false,
    userId,
    createdAt: serverTimestamp(),
  })
}

export function subscribeToTasks(
  userId: string,
  onChange: (tasks: Task[]) => void,
  onError: (error: FirestoreError) => void,
) {
  const userTasks = query(tasksCollection, where('userId', '==', userId))

  return onSnapshot(
    userTasks,
    (snapshot) => {
      const tasks = snapshot.docs.map((taskDoc) => {
        const data = taskDoc.data({ serverTimestamps: 'estimate' }) as Omit<Task, 'id'>
        return { ...data, id: taskDoc.id, important: data.important === true }
      })
      onChange(tasks)
    },
    onError,
  )
}

export async function toggleTask(taskId: string, completed: boolean) {
  await updateDoc(doc(db, 'tasks', taskId), { completed })
}

export async function updateTask(taskId: string, changes: NewTask) {
  await updateDoc(doc(db, 'tasks', taskId), {
    title: changes.title,
    description: changes.description,
    important: changes.important,
  })
}

export async function deleteTask(taskId: string) {
  await deleteDoc(doc(db, 'tasks', taskId))
}
