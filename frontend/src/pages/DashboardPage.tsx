import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { OnboardingTask, useStore } from '@/store/useStore'
import { api } from '@/services/api'
import { CheckCircle, AlertCircle, BookOpen, Ticket, TrendingUp, ArrowRight, MessageCircle, FileText, MapPin, Clock, UserCheck } from 'lucide-react'
import styles from './DashboardPage.module.css'

export default function DashboardPage() {
  const { user, stats, setStats } = useStore()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [recommendedTask, setRecommendedTask] = useState<OnboardingTask | null>(null)
  const [startingTask, setStartingTask] = useState(false)
  const [documents, setDocuments] = useState([
    { label: 'Government ID', complete: false },
    { label: 'Certificates', complete: false },
    { label: 'Photo', complete: false },
    { label: 'Bank details', complete: false },
    { label: 'Offer letter', complete: false },
  ])

  useEffect(() => {
    if (!user) return

    const savedDocuments = localStorage.getItem(`onboardai-documents-${user.id}`)
    if (savedDocuments) setDocuments(JSON.parse(savedDocuments))
  }, [user])

  useEffect(() => {
    if (!user) return

    const fetchDashboard = async () => {
      try {
        const response = await api.getDashboard(user.id)
        setStats(response.data.stats)
        setRecommendedTask(response.data.recommended_next_task)
      } catch (error) {
        console.error('Error fetching dashboard:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboard()
  }, [user, setStats])

  const handleStartTask = async () => {
    if (!recommendedTask || startingTask) return

    setStartingTask(true)
    try {
      await api.updateTask(recommendedTask.id, { status: 'in_progress' })
      navigate('/tasks')
    } catch (error) {
      console.error('Error starting recommended task:', error)
    } finally {
      setStartingTask(false)
    }
  }

  const toggleDocument = (index: number) => {
    const updatedDocuments = documents.map((document, documentIndex) => (
      documentIndex === index ? { ...document, complete: !document.complete } : document
    ))
    setDocuments(updatedDocuments)
    if (user) localStorage.setItem(`onboardai-documents-${user.id}`, JSON.stringify(updatedDocuments))
  }

  const completedDocuments = documents.filter((document) => document.complete).length

  if (loading) {
    return <div className={styles.loading}>Loading dashboard...</div>
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Welcome, {user?.name}!</h1>
        <p>Your personalized onboarding journey at TechNova Solutions</p>
      </div>

      {/* Stats Grid */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: '#dbeafe' }}>
            <CheckCircle color="#2563eb" size={24} />
          </div>
          <div>
            <div className={styles.statLabel}>Tasks Completed</div>
            <div className={styles.statValue}>{stats?.completed_tasks || 0}</div>
            <small>of {stats?.total_onboarding_tasks || 0} total</small>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: '#d1fae5' }}>
            <TrendingUp color="#10b981" size={24} />
          </div>
          <div>
            <div className={styles.statLabel}>Training Progress</div>
            <div className={styles.statValue}>{stats?.training_progress_percentage || 0}%</div>
            <small>Complete your courses</small>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: '#fef3c7' }}>
            <AlertCircle color="#f59e0b" size={24} />
          </div>
          <div>
            <div className={styles.statLabel}>Pending Tasks</div>
            <div className={styles.statValue}>{stats?.pending_tasks || 0}</div>
            <small>Action required</small>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: '#fee2e2' }}>
            <Ticket color="#ef4444" size={24} />
          </div>
          <div>
            <div className={styles.statLabel}>Support Tickets</div>
            <div className={styles.statValue}>{stats?.open_tickets || 0}</div>
            <small>Open tickets</small>
          </div>
        </div>
      </div>

      {/* Recommended Next Step */}
      {recommendedTask && (
        <div className={styles.recommended}>
          <div className={styles.recommendedHeader}>
            <h2>What Should You Do Next?</h2>
            <BookOpen color="#2563eb" size={24} />
          </div>
          <div className={styles.taskCard}>
            <h3>{recommendedTask.title}</h3>
            <p>{recommendedTask.description}</p>
            <div className={styles.taskMeta}>
              <span className={styles.category}>{recommendedTask.category}</span>
              <span className={styles.priority} data-priority={recommendedTask.priority}>
                {recommendedTask.priority}
              </span>
            </div>
            <button
              className="btn-primary"
              style={{ marginTop: 'var(--spacing-md)' }}
              onClick={handleStartTask}
              disabled={startingTask}
            >
              {startingTask ? 'Starting...' : 'Start Task'} <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {user?.role !== 'hr' && user?.role !== 'it' && <div className={styles.firstDayGrid}>
        <section className={styles.firstDayCard}>
          <div className={styles.firstDayCardHeader}>
            <div>
              <h2>First Day Essentials</h2>
              <p>Documents to bring for a smooth start.</p>
            </div>
            <FileText color="#2563eb" size={24} />
          </div>
          <div className={styles.documentProgress}>
            <span>{completedDocuments} of {documents.length} ready</span>
            <div className={styles.documentProgressTrack}>
              <div className={styles.documentProgressFill} style={{ width: `${(completedDocuments / documents.length) * 100}%` }} />
            </div>
          </div>
          <div className={styles.documentList}>
            {documents.map((document, index) => (
              <label key={document.label} className={styles.documentItem}>
                <input type="checkbox" checked={document.complete} onChange={() => toggleDocument(index)} />
                <span className={document.complete ? styles.documentComplete : ''}>{document.label}</span>
              </label>
            ))}
          </div>
        </section>

        <section className={styles.firstDayCard}>
          <div className={styles.firstDayCardHeader}>
            <div>
              <h2>First Day Information</h2>
              <p>Everything you need for arrival.</p>
            </div>
            <UserCheck color="#10b981" size={24} />
          </div>
          <div className={styles.infoList}>
            <div className={styles.firstDayInfo}>
              <MapPin size={18} color="#2563eb" />
              <span><strong>Reporting location</strong>{user?.location || 'TechNova Solutions HQ'}</span>
            </div>
            <div className={styles.firstDayInfo}>
              <Clock size={18} color="#2563eb" />
              <span><strong>Reporting time</strong>9:00 AM local time</span>
            </div>
            <div className={styles.firstDayInfo}>
              <UserCheck size={18} color="#2563eb" />
              <span><strong>Person to report to</strong>People Operations Desk</span>
            </div>
          </div>
          <div className={styles.instructions}>
            <strong>First-day instructions</strong>
            <p>Bring the documents above, arrive 15 minutes early, and check in with the People Operations Desk for your welcome schedule.</p>
          </div>
        </section>
      </div>}

      {/* Quick Stats */}
      <div className={styles.quickLinks}>
        <h2>Quick Links</h2>
        <div className={styles.linkGrid}>
          <Link to="/chat" className={styles.link}>
            <MessageCircle size={20} />
            <span>Ask AI Assistant</span>
          </Link>
          <Link to="/tasks" className={styles.link}>
            <CheckCircle size={20} />
            <span>View All Tasks</span>
          </Link>
          <Link to="/training" className={styles.link}>
            <BookOpen size={20} />
            <span>Continue Training</span>
          </Link>
          <Link to="/tickets" className={styles.link}>
            <Ticket size={20} />
            <span>Support Tickets</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
