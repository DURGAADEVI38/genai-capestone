import { useEffect, useState } from 'react'
import { FileText, RefreshCw } from 'lucide-react'
import { api } from '@/services/api'
import styles from './HRRequestsPage.module.css'

interface HRRequest { id: number; user_message: string; agent_response: string; created_at: string }

export default function HRRequestsPage() {
  const [requests, setRequests] = useState<HRRequest[]>([])
  const [loading, setLoading] = useState(true)

  const loadRequests = async () => {
    try {
      const response = await api.getHrRequests()
      setRequests(response.data)
    } catch (error) {
      console.error('Error loading HR requests:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadRequests() }, [])

  if (loading) return <div className={styles.loading}>Loading HR requests...</div>

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div><h1>HR Requests</h1><p>Review employee questions handled by the HR Agent.</p></div>
        <button className="btn-secondary" onClick={loadRequests}><RefreshCw size={16} /> Refresh</button>
      </div>
      <div className={styles.list}>
        {requests.length === 0 ? <div className={styles.empty}><FileText size={40} /><p>No HR requests yet.</p></div> : requests.map((request) => (
          <article className={styles.request} key={request.id}>
            <div className={styles.requestTitle}><FileText size={18} /><strong>{request.user_message}</strong><time>{new Date(request.created_at).toLocaleString()}</time></div>
            <p>{request.agent_response}</p>
          </article>
        ))}
      </div>
    </div>
  )
}
