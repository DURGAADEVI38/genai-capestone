import { useEffect, useState } from 'react'
import { SupportTicket, useStore } from '@/store/useStore'
import { api } from '@/services/api'
import { Ticket, Plus } from 'lucide-react'
import styles from './TicketsPage.module.css'

export default function TicketsPage() {
  const { user } = useStore()
  const [tickets, setTickets] = useState<SupportTicket[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ title: '', description: '', category: 'general', priority: 'medium' })

  useEffect(() => {
    if (!user) return

    const fetchTickets = async () => {
      try {
        const response = await api.getEmployeeTickets(user.id)
        setTickets(response.data)
      } catch (error) {
        console.error('Error fetching tickets:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchTickets()
  }, [user])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return { bg: '#fee2e2', color: '#ef4444' }
      case 'in_progress':
        return { bg: '#fef3c7', color: '#f59e0b' }
      case 'resolved':
        return { bg: '#d1fae5', color: '#10b981' }
      default:
        return { bg: '#e5e7eb', color: '#6b7280' }
    }
  }

  const handleCreateTicket = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!user || submitting) return

    setSubmitting(true)
    setError('')
    try {
      const response = await api.createTicket({ ...form, employee_id: user.id })
      setTickets((currentTickets) => [response.data, ...currentTickets])
      setForm({ title: '', description: '', category: 'general', priority: 'medium' })
      setShowForm(false)
    } catch (requestError) {
      console.error('Error creating ticket:', requestError)
      setError('Unable to create the ticket. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <div className={styles.loading}>Loading support tickets...</div>

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Support Tickets</h1>
        <p>Manage your IT support requests</p>
        <button className="btn-primary" onClick={() => setShowForm((visible) => !visible)}>
          <Plus size={20} />
          {showForm ? 'Cancel' : 'New Ticket'}
        </button>
      </div>

      {showForm && (
        <form className={styles.newTicketForm} onSubmit={handleCreateTicket}>
          <h2>Create Support Ticket</h2>
          <label>
            Issue title
            <input
              required
              value={form.title}
              onChange={(event) => setForm({ ...form, title: event.target.value })}
              placeholder="Briefly describe the issue"
            />
          </label>
          <label>
            Description
            <textarea
              required
              rows={4}
              value={form.description}
              onChange={(event) => setForm({ ...form, description: event.target.value })}
              placeholder="Include steps to reproduce and any error messages"
            />
          </label>
          <div className={styles.formRow}>
            <label>
              Category
              <select value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })}>
                <option value="general">General</option>
                <option value="access">Access</option>
                <option value="hardware">Hardware</option>
                <option value="network">Network</option>
                <option value="vpn">VPN</option>
                <option value="software">Software</option>
              </select>
            </label>
            <label>
              Priority
              <select value={form.priority} onChange={(event) => setForm({ ...form, priority: event.target.value })}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </label>
          </div>
          {error && <p className={styles.formError}>{error}</p>}
          <button className="btn-primary" type="submit" disabled={submitting}>
            {submitting ? 'Creating...' : 'Create Ticket'}
          </button>
        </form>
      )}

      <div className={styles.ticketsList}>
        {tickets.length === 0 ? (
          <div className={styles.emptyState}>
            <Ticket size={48} color="#cbd5e1" />
            <p>No support tickets yet</p>
          </div>
        ) : (
          tickets.map((ticket) => {
            const statusColor = getStatusColor(ticket.status)
            return (
              <div key={ticket.id} className={styles.ticketCard}>
                <div className={styles.ticketHeader}>
                  <h3>{ticket.title}</h3>
                  <span className={styles.ticketNumber}>{ticket.ticket_number}</span>
                </div>
                <p className={styles.description}>{ticket.description}</p>
                <div className={styles.ticketMeta}>
                  <span className={styles.category}>{ticket.category}</span>
                  <span
                    className={styles.status}
                    style={{
                      background: statusColor.bg,
                      color: statusColor.color,
                    }}
                  >
                    {ticket.status === 'resolved' ? 'Resolved' : ticket.status.replace('_', ' ')}
                  </span>
                  <span className={styles.priority} data-priority={ticket.priority}>
                    {ticket.priority}
                  </span>
                </div>
                {ticket.status === 'resolved' && (
                  <div className={styles.resolution}>
                    <h4>Resolution</h4>
                    <p>{ticket.resolution_notes || 'This ticket was resolved by the IT team.'}</p>
                    {ticket.assigned_to && <small>Resolved by {ticket.assigned_to}</small>}
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
