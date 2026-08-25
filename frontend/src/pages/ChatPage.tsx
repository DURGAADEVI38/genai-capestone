import { useState, useEffect, useRef } from 'react'
import { useStore } from '@/store/useStore'
import { api } from '@/services/api'
import { Send, Loader } from 'lucide-react'
import styles from './ChatPage.module.css'

interface Message {
  id: number
  type: 'user' | 'agent'
  content: string
  agent_type?: string
  sources?: string[]
  timestamp: string
}

type WorkflowNode = 'user' | 'router' | 'agent' | 'rag' | 'response' | 'ticket' | 'human'

const agentForQuery = (query: string) => {
  const normalized = query.toLowerCase()
  if (['vpn', 'laptop', 'software', 'password', 'network', 'access', 'computer'].some((term) => normalized.includes(term))) return 'IT Agent'
  if (['course', 'training', 'skill', 'learn', 'career'].some((term) => normalized.includes(term))) return 'Training Agent'
  return 'HR Agent'
}

const isITEscalation = (query: string) => {
  const normalized = query.toLowerCase()
  return agentForQuery(query) === 'IT Agent' && ['cannot', "can't", 'failed', 'error', 'not working', 'unable', 'issue', 'problem', 'help'].some((term) => normalized.includes(term))
}

const workflowIndex: Record<WorkflowNode, number> = {
  user: 0,
  router: 1,
  agent: 2,
  rag: 3,
  response: 4,
  ticket: 5,
  human: 6,
}

export default function ChatPage() {
  const { user } = useStore()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingHistory, setLoadingHistory] = useState(true)
  const [workflowQuery, setWorkflowQuery] = useState('')
  const [activeWorkflowNode, setActiveWorkflowNode] = useState<WorkflowNode>('response')
  const [showWorkflow, setShowWorkflow] = useState(false)
  const messagesRef = useRef<HTMLDivElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Load chat history on mount
  useEffect(() => {
    if (!user) return

    const loadHistory = async () => {
      try {
        const response = await api.getChatHistory(user.id, 20)
        const formattedMessages: Message[] = response.data.map((msg: any) => [
          { id: msg.id * 2, type: 'user', content: msg.user_message, timestamp: msg.created_at },
          { id: msg.id * 2 + 1, type: 'agent', content: msg.agent_response, agent_type: msg.agent_type, sources: msg.source_documents, timestamp: msg.created_at },
        ]).flat()
        setMessages(formattedMessages)
      } catch (error) {
        console.error('Error loading chat history:', error)
      } finally {
        setLoadingHistory(false)
      }
    }

    loadHistory()
  }, [user])

  // Scroll to bottom when messages change
  useEffect(() => {
    const messagesContainer = messagesRef.current
    if (!messagesContainer) return

    messagesContainer.scrollTo({
      top: messagesContainer.scrollHeight,
      behavior: 'smooth',
    })
  }, [messages, loading])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || !user) return

    // Add user message to UI
    const userMessage: Message = {
      id: Date.now(),
      type: 'user',
      content: input,
      timestamp: new Date().toISOString(),
    }
    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setLoading(true)
    setWorkflowQuery(input)
    setActiveWorkflowNode('user')

    try {
      setActiveWorkflowNode('router')
      setActiveWorkflowNode('agent')
      const response = await api.sendMessage({
        employee_id: user.id,
        message: input,
      })

      const agentMessage: Message = {
        id: Date.now() + 1,
        type: 'agent',
        content: response.data.agent_response,
        agent_type: response.data.agent_type,
        sources: response.data.source_documents,
        timestamp: response.data.created_at,
      }
      setMessages((prev) => [...prev, agentMessage])
      setActiveWorkflowNode('rag')
      if (isITEscalation(input)) {
        setActiveWorkflowNode('ticket')
        setActiveWorkflowNode('human')
      } else {
        setActiveWorkflowNode('response')
      }
    } catch (error) {
      console.error('Error sending message:', error)
      const errorMessage: Message = {
        id: Date.now() + 1,
        type: 'agent',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setLoading(false)
    }
  }

  if (loadingHistory) {
    return <div className={styles.loading}>Loading chat history...</div>
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>AI Chat Assistant</h1>
        <p>Ask questions about onboarding, policies, IT setup, or training</p>
      </div>

      <button className={styles.workflowToggle} type="button" onClick={() => setShowWorkflow(true)}>
        View AI Workflow
      </button>

      <div className={styles.chatLayout}>
      <aside className={`${styles.workflowPanel} ${showWorkflow ? styles.workflowDrawerOpen : ''}`} aria-label="AI Workflow">
        <div className={styles.workflowHeader}>
          <div>
            <h2>AI Workflow</h2>
            <p>{workflowQuery ? `Processing: ${workflowQuery}` : 'Your request flows through the assistant pipeline.'}</p>
          </div>
          <div className={styles.workflowActions}>
            <span className={styles.workflowStatus}>{loading ? 'Active' : 'Ready'}</span>
            <button className={styles.workflowClose} type="button" onClick={() => setShowWorkflow(false)}>Close</button>
          </div>
        </div>
        <div className={styles.workflowTrack}>
          {(isITEscalation(workflowQuery) ? [
            ['user', 'User'],
            ['router', 'Router'],
            ['agent', workflowQuery ? agentForQuery(workflowQuery) : 'IT Agent'],
            ['rag', 'RAG / Tool'],
            ['ticket', 'Ticket Agent'],
            ['human', 'Human IT Team'],
          ] : [
            ['user', 'User'],
            ['router', 'Router'],
            ['agent', workflowQuery ? agentForQuery(workflowQuery) : 'HR / IT / Training Agent'],
            ['rag', 'RAG / Tool'],
            ['response', 'Response'],
          ]).map(([node, label], index, steps) => (
            <div className={styles.workflowStep} key={node}>
              <div className={`${styles.workflowNode} ${activeWorkflowNode === node ? styles.workflowActive : ''} ${workflowIndex[activeWorkflowNode] > workflowIndex[node as WorkflowNode] ? styles.workflowComplete : ''}`}>
                <span>{index + 1}</span>
                <strong>{label}</strong>
              </div>
              {index < steps.length - 1 && <div className={styles.workflowConnector} />}
            </div>
          ))}
        </div>
      </aside>

      <div className={styles.chatBox}>
        <div className={styles.messages} ref={messagesRef}>
          {messages.length === 0 ? (
            <div className={styles.emptyState}>
              <p>Welcome! I'm your AI assistant. Ask me anything about:</p>
              <ul>
                <li>🏢 HR policies and benefits</li>
                <li>💻 IT setup and support</li>
                <li>📚 Training and development</li>
                <li>📋 Onboarding process</li>
              </ul>
            </div>
          ) : (
            messages.map((msg) => (
              <div key={msg.id} className={`${styles.message} ${styles[msg.type]}`}>
                <div className={styles.messageBubble}>
                  <p>{msg.content}</p>
                  {msg.agent_type && (
                    <div className={styles.agentType}>{msg.agent_type.replace('_', ' ')}</div>
                  )}
                  {msg.sources && msg.sources.length > 0 && (
                    <div className={styles.sources}>
                      <strong>Sources:</strong>
                      {msg.sources.map((source, idx) => (
                        <div key={idx} className={styles.source}>{source}</div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
          {loading && (
            <div className={`${styles.message} ${styles.agent}`}>
              <div className={styles.messageBubble}>
                <Loader size={20} style={{ animation: 'spin 1s linear infinite' }} />
                <span> Thinking...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSendMessage} className={styles.inputBox}>
          <input
            type="text"
            placeholder="Type your question..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
          />
          <button type="submit" disabled={loading || !input.trim()} className="btn-primary">
            <Send size={20} />
          </button>
        </form>
      </div>
      </div>
      {showWorkflow && <button className={styles.workflowBackdrop} type="button" aria-label="Close AI Workflow" onClick={() => setShowWorkflow(false)} />}
    </div>
  )
}
