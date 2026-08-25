import { useEffect, useState } from 'react'
import { Headphones, RefreshCw } from 'lucide-react'
import { api } from '@/services/api'
import styles from './ITSupportPage.module.css'

interface Ticket { id: number; ticket_number: string; employee_id: number; title: string; description: string; status: string; priority: string; resolution_notes?: string }

export default function ITSupportPage() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [savingId, setSavingId] = useState<number | null>(null)

  const loadTickets = async () => {
    try {
      const response = await api.getOpenTickets()
      setTickets(response.data)
    } catch (error) {
      console.error('Error loading IT tickets:', error)
    } finally { setLoading(false) }
  }

  useEffect(() => { loadTickets() }, [])

  const updateStatus = async (ticket: Ticket, status: string) => {
    setSavingId(ticket.id)
    try {
      const response = await api.updateTicket(ticket.id, { status, assigned_to: 'IT Support' })
      setTickets((current) => current.map((item) => item.id === ticket.id ? response.data : item))
    } catch (error) { console.error('Error updating ticket:', error) }
    finally { setSavingId(null) }
  }

  if (loading) return <div className={styles.loading}>Loading IT support queue...</div>
  return <div className={styles.container}>
    <div className={styles.header}><div><h1>IT Support Queue</h1><p>Review and resolve employee support tickets.</p></div><button className="btn-secondary" onClick={loadTickets}><RefreshCw size={16} /> Refresh</button></div>
    <div className={styles.list}>
      {tickets.length === 0 ? <div className={styles.empty}><Headphones size={40} /><p>No open tickets.</p></div> : tickets.map((ticket) => <article className={styles.ticket} key={ticket.id}>
        <div className={styles.ticketHeader}><div><span className={styles.number}>{ticket.ticket_number}</span><h2>{ticket.title}</h2></div><span className={styles.priority}>{ticket.priority}</span></div>
        <p>{ticket.description}</p><small>Employee ID: {ticket.employee_id}</small>
        <div className={styles.actions}><button className="btn-secondary" disabled={savingId === ticket.id} onClick={() => updateStatus(ticket, 'in_progress')}>In Progress</button><button className="btn-primary" disabled={savingId === ticket.id} onClick={() => updateStatus(ticket, 'resolved')}>Resolve</button></div>
      </article>)}
    </div>
  </div>
}
