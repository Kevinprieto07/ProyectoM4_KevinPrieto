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
      const tasks = snapshot.docs.map((taskDoc) => ({
        id: taskDoc.id,
        // 'estimate' evita que createdAt sea null mientras el servidor confirma la tarea.
        ...(taskDoc.data({ serverTimestamps: 'estimate' }) as Omit<Task, 'id'>),
      }))
      onChange(tasks)
    },
    onError,
  )
}

export async function toggleTask(taskId: string, completed: boolean) {
  await updateDoc(doc(db, 'tasks', taskId), { completed })
}

export async function deleteTask(taskId: string) {
  await deleteDoc(doc(db, 'tasks', taskId))
}
