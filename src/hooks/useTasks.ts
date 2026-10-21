import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { subscribeToTasks } from '../services/taskService'
import type { Task } from '../types/task'

interface LoadedTasks {
  userId: string
  tasks: Task[]
}

function sortByNewest(tasks: Task[]) {
  return [...tasks].sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis())
}

export function useTasks(userId: string | null) {
  const [loadedTasks, setLoadedTasks] = useState<LoadedTasks | null>(null)

  useEffect(() => {
    if (!userId) return
    return subscribeToTasks(
      userId,
      (tasks) => setLoadedTasks({ userId, tasks: sortByNewest(tasks) }),
      (error) => {
        console.error('No se pudieron cargar las tareas:', error)
        toast.error('No se pudieron cargar tus tareas.')
        setLoadedTasks({ userId, tasks: [] })
      },
    )
  }, [userId])

  const ready = userId !== null && loadedTasks?.userId === userId

  return {
    tasks: ready ? loadedTasks.tasks : [],
    loading: !ready,
  }
}
