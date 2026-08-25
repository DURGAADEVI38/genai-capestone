import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '@/store/useStore'
import { api } from '@/services/api'
import { Loader } from 'lucide-react'
import styles from './LoginPage.module.css'

export default function LoginPage() {
  const [employeeId, setEmployeeId] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { setUser } = useStore()
  const navigate = useNavigate()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    const identifier = employeeId.trim()
    if (!identifier) {
      setError('Enter your employee ID or staff code.')
      return
    }
    setLoading(true)

    try {
      const response = await api.login(identifier)
      setUser(response.data)
      localStorage.setItem('token', 'mock-token-' + employeeId)
      navigate('/')
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to login. Please check your employee ID.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h1>OnboardAI</h1>
          <p>Personalized AI Employee Onboarding Assistant</p>
        </div>

        <form onSubmit={handleLogin} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="employeeId">Employee ID</label>
            <input
              id="employeeId"
              type="text"
              inputMode="text"
              autoComplete="username"
              placeholder="Enter employee ID or staff code"
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              required
              disabled={loading}
            />
            <small>Demo: 1, 2, 3, HR001, or IT001</small>
          </div>

          {error && <div className={styles.error}>{error}</div>}

          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
            style={{ width: '100%' }}
          >
            {loading ? (
              <>
                <Loader size={16} style={{ animation: 'spin 1s linear infinite' }} />
                <span>Logging in...</span>
              </>
            ) : (
              'Login'
            )}
          </button>
        </form>

        <div className={styles.footer}>
          <p>Welcome to TechNova Solutions</p>
          <small>Your AI-powered onboarding experience starts here</small>
        </div>
      </div>
    </div>
  )
}
