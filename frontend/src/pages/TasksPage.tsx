import { useEffect, useState } from 'react'
import { OnboardingTask, useStore } from '@/store/useStore'
import { api } from '@/services/api'
import { CheckCircle, Clock, AlertCircle } from 'lucide-react'
import styles from './TasksPage.module.css'

export default function TasksPage() {
  const { user } = useStore()
  const [tasks, setTasks] = useState<OnboardingTask[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return

    const fetchTasks = async () => {
      try {
        const response = await api.getTasks(user.id)
        setTasks(response.data)
      } catch (error) {
        console.error('Error fetching tasks:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchTasks()
  }, [user])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle color="#10b981" size={20} />
      case 'in_progress':
        return <Clock color="#f59e0b" size={20} />
      default:
        return <AlertCircle color="#ef4444" size={20} />
    }
  }

  const handleComplete = async (taskId: number) => {
    try {
      const response = await api.completeTask(taskId)
      setTasks((currentTasks) => currentTasks.map((task) => (
        task.id === taskId ? response.data : task
      )))
    } catch (error) {
      console.error('Error completing task:', error)
    }
  }

  if (loading) return <div className={styles.loading}>Loading tasks...</div>

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Onboarding Tasks</h1>
        <p>Complete your onboarding checklist</p>
      </div>

      <div className={styles.tasksList}>
        {tasks.length === 0 ? (
          <div className={styles.emptyState}>
            <CheckCircle size={48} color="#10b981" />
            <p>All caught up! No pending tasks.</p>
          </div>
        ) : (
          tasks.map((task) => (
            <div key={task.id} className={styles.taskItem}>
              <div className={styles.taskStatus}>
                {getStatusIcon(task.status)}
              </div>
              <div className={styles.taskContent}>
                <h3>{task.title}</h3>
                <p>{task.description}</p>
                <div className={styles.taskMeta}>
                  <span className={styles.category}>{task.category}</span>
                  <span className={styles.status} data-status={task.status}>
                    {task.status.replace('_', ' ')}
                  </span>
                </div>
              </div>
              <button
                className="btn-primary"
                disabled={task.status === 'completed'}
                onClick={() => handleComplete(task.id)}
              >
                {task.status === 'completed' ? 'Completed' : 'Complete'}
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
