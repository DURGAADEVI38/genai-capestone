import { useState } from 'react'
import { api } from '@/services/api'
import { useStore } from '@/store/useStore'
import { User, Mail, Briefcase, MapPin, Calendar } from 'lucide-react'
import styles from './ProfilePage.module.css'

export default function ProfilePage() {
  const { user, setUser } = useStore()
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    name: user?.name || '',
    location: user?.location || '',
    role: user?.role || 'engineer',
    department: user?.department || 'engineering',
    experience_level: user?.experience_level || 'junior',
  })

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const handleEdit = () => {
    if (!user) return
    setForm({
      name: user.name,
      location: user.location,
      role: user.role,
      department: user.department,
      experience_level: user.experience_level,
    })
    setError('')
    setEditing(true)
  }

  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!user || saving) return

    setSaving(true)
    setError('')
    try {
      const response = await api.updateEmployee(user.id, form)
      setUser(response.data)
      setEditing(false)
    } catch (requestError) {
      console.error('Error updating profile:', requestError)
      setError('Unable to save profile changes. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Employee Profile</h1>
        <p>Your profile information</p>
      </div>

      <div className={styles.profileCard}>
        <div className={styles.profileHeader}>
          <div className={styles.avatar}>
            <User size={64} color="#2563eb" />
          </div>
          <div className={styles.profileTitle}>
            <h2>{user?.name}</h2>
            <p className={styles.empId}>{user?.employee_id}</p>
          </div>
        </div>

        {editing ? (
          <form className={styles.editForm} onSubmit={handleSave}>
            <label>
              Name
              <input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
            </label>
            <label>
              Location
              <input required value={form.location} onChange={(event) => setForm({ ...form, location: event.target.value })} />
            </label>
            <label>
              Role
              <select value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value })}>
                <option value="engineer">Engineer</option>
                <option value="designer">Designer</option>
                <option value="product_manager">Product Manager</option>
                <option value="data_scientist">Data Scientist</option>
              </select>
            </label>
            <label>
              Department
              <select value={form.department} onChange={(event) => setForm({ ...form, department: event.target.value })}>
                <option value="engineering">Engineering</option>
                <option value="design">Design</option>
                <option value="product">Product</option>
                <option value="data">Data</option>
                <option value="operations">Operations</option>
              </select>
            </label>
            <label>
              Experience Level
              <select value={form.experience_level} onChange={(event) => setForm({ ...form, experience_level: event.target.value })}>
                <option value="junior">Junior</option>
                <option value="mid">Mid</option>
                <option value="senior">Senior</option>
                <option value="lead">Lead</option>
              </select>
            </label>
            {error && <p className={styles.formError}>{error}</p>}
            <div className={styles.formActions}>
              <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</button>
              <button type="button" className="btn-secondary" onClick={() => setEditing(false)} disabled={saving}>Cancel</button>
            </div>
          </form>
        ) : (
        <div className={styles.profileInfo}>
          <div className={styles.infoGroup}>
            <label>
              <Mail size={18} />
              Email
            </label>
            <p>{user?.email}</p>
          </div>

          <div className={styles.infoGroup}>
            <label>
              <Briefcase size={18} />
              Role
            </label>
            <p className={styles.capitalize}>{user?.role}</p>
          </div>

          <div className={styles.infoGroup}>
            <label>
              <Briefcase size={18} />
              Department
            </label>
            <p className={styles.capitalize}>{user?.department}</p>
          </div>

          <div className={styles.infoGroup}>
            <label>
              <MapPin size={18} />
              Location
            </label>
            <p>{user?.location}</p>
          </div>

          <div className={styles.infoGroup}>
            <label>
              <Calendar size={18} />
              Joining Date
            </label>
            <p>{formatDate(user?.joining_date || '')}</p>
          </div>

          <div className={styles.infoGroup}>
            <label>
              <User size={18} />
              Experience Level
            </label>
            <p className={styles.capitalize}>{user?.experience_level}</p>
          </div>
        </div>
        )}

        {!editing && <button className="btn-primary" style={{ marginTop: 'var(--spacing-lg)' }} onClick={handleEdit}>
          Edit Profile
        </button>}
      </div>
    </div>
  )
}
