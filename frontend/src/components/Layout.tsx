import { Outlet, Link, useNavigate } from 'react-router-dom'
import { useStore } from '@/store/useStore'
import { Menu, X, LogOut, Home, MessageSquare, CheckCircle, BookOpen, Ticket, User } from 'lucide-react'
import { useState } from 'react'
import styles from './Layout.module.css'

export default function Layout() {
  const { user, logout } = useStore()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const handleLogout = () => {
    logout()
    localStorage.removeItem('token')
    navigate('/login')
  }

  const employeeNavItems = [
    { path: '/', label: user?.role === 'hr' ? 'HR Dashboard' : user?.role === 'it' ? 'IT Dashboard' : 'Dashboard', icon: Home },
    { path: '/chat', label: 'AI Chat', icon: MessageSquare },
    { path: '/tasks', label: 'Tasks', icon: CheckCircle },
    { path: '/training', label: 'Training', icon: BookOpen },
    { path: '/tickets', label: 'Support', icon: Ticket },
    { path: '/profile', label: 'Profile', icon: User },
  ]
  const navItems = user?.role === 'hr'
    ? [employeeNavItems[0], employeeNavItems[1], employeeNavItems[5], { path: '/hr-requests', label: 'HR Requests', icon: MessageSquare }]
    : user?.role === 'it'
      ? [employeeNavItems[0], employeeNavItems[1], employeeNavItems[5], { path: '/it-support', label: 'IT Support', icon: Ticket }]
      : employeeNavItems

  return (
    <div className={styles.layout}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <button 
            className={styles.toggleBtn}
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          
          <div className={styles.logo}>
            <h1>OnboardAI</h1>
          </div>
          
          <div className={styles.userMenu}>
            <span className={styles.userName}>{user?.name}</span>
            <button 
              className={styles.logoutBtn}
              onClick={handleLogout}
              title="Logout"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <aside className={`${styles.sidebar} ${sidebarOpen ? styles.open : styles.closed}`}>
        <nav className={styles.nav}>
          {navItems.map(({ path, label, icon: Icon }) => (
            <Link
              key={path}
              to={path}
              className={styles.navItem}
              title={label}
            >
              <Icon size={20} />
              <span>{label}</span>
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  )
}
