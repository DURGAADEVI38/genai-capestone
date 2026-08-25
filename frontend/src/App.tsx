import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useStore } from './store/useStore'
import Layout from './components/Layout'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import ChatPage from './pages/ChatPage'
import TasksPage from './pages/TasksPage'
import TrainingPage from './pages/TrainingPage'
import TicketsPage from './pages/TicketsPage'
import ProfilePage from './pages/ProfilePage'
import HRRequestsPage from './pages/HRRequestsPage'
import ITSupportPage from './pages/ITSupportPage'

export default function App() {
  const { user } = useStore()

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        
        {user ? (
          <Route element={<Layout />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/tasks" element={<TasksPage />} />
            <Route path="/training" element={<TrainingPage />} />
            <Route path="/tickets" element={<TicketsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/hr-requests" element={user.role === 'hr' ? <HRRequestsPage /> : <Navigate to="/" replace />} />
            <Route path="/it-support" element={user.role === 'it' ? <ITSupportPage /> : <Navigate to="/" replace />} />
          </Route>
        ) : (
          <Route path="*" element={<Navigate to="/login" replace />} />
        )}
      </Routes>
    </BrowserRouter>
  )
}
