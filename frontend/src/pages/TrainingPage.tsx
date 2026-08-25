import { useEffect, useState } from 'react'
import { TrainingMaterial, TrainingProgress, useStore } from '@/store/useStore'
import { api } from '@/services/api'
import { BookOpen, Play } from 'lucide-react'
import styles from './TrainingPage.module.css'

export default function TrainingPage() {
  const { user } = useStore()
  const [materials, setMaterials] = useState<TrainingMaterial[]>([])
  const [progress, setProgress] = useState<TrainingProgress[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return

    const fetchTraining = async () => {
      try {
        const [materialsRes, progressRes] = await Promise.all([
          api.getTrainingMaterials(),
          api.getEmployeeTraining(user.id),
        ])
        setMaterials(materialsRes.data)
        setProgress(progressRes.data)
      } catch (error) {
        console.error('Error fetching training:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchTraining()
  }, [user])

  const handleStartTraining = async (materialId: number) => {
    if (!user) return

    try {
      const response = await api.startTraining(materialId, user.id)
      setProgress((currentProgress) => [...currentProgress, response.data])
    } catch (error) {
      console.error('Error starting training:', error)
    }
  }

  if (loading) return <div className={styles.loading}>Loading training materials...</div>

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Training & Development</h1>
        <p>Enhance your skills with our training programs</p>
      </div>

      <div className={styles.materialsGrid}>
        {materials.map((material) => {
          const userProgress = progress.find((p) => p.material_id === material.id)
          return (
            <div key={material.id} className={styles.card}>
              <div className={styles.cardIcon}>
                <BookOpen color="#2563eb" size={32} />
              </div>
              <h3>{material.title}</h3>
              <p>{material.description}</p>
              <div className={styles.meta}>
                <span className={styles.type}>{material.content_type}</span>
                {material.duration_minutes && (
                  <span className={styles.duration}>{material.duration_minutes}m</span>
                )}
              </div>
              {userProgress ? (
                <div className={styles.progress}>
                  <div className={styles.progressBar}>
                    <div
                      className={styles.progressFill}
                      style={{ width: `${userProgress.progress_percentage}%` }}
                    />
                  </div>
                  <span>{userProgress.progress_percentage}% complete</span>
                </div>
              ) : (
                <button
                  className="btn-primary"
                  style={{ width: '100%' }}
                  onClick={() => handleStartTraining(material.id)}
                >
                  <Play size={16} />
                  Start Course
                </button>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
