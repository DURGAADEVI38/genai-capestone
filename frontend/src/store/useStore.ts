import { create } from 'zustand'

export interface Employee {
  id: number
  employee_id: string
  name: string
  email: string
  role: string
  department: string
  location: string
  joining_date: string
  experience_level: string
  profile_picture?: string
  created_at: string
  updated_at: string
}

export interface DashboardStats {
  total_onboarding_tasks: number
  completed_tasks: number
  pending_tasks: number
  blocked_tasks: number
  training_progress_percentage: number
  open_tickets: number
}

export interface OnboardingTask {
  id: number
  employee_id: number
  title: string
  description: string
  category: string
  status: string
  due_date: string
  priority: string
}

export interface TrainingMaterial {
  id: number
  title: string
  description: string
  content_type: string
  duration_minutes?: number
}

export interface TrainingProgress {
  id: number
  material_id: number
  progress_percentage: number
  is_completed: boolean
}

export interface SupportTicket {
  id: number
  ticket_number: string
  title: string
  description: string
  category: string
  status: string
  priority: string
  assigned_to?: string
  resolution_notes?: string
}

interface StoreState {
  user: Employee | null
  setUser: (user: Employee | null) => void
  stats: DashboardStats | null
  setStats: (stats: DashboardStats) => void
  logout: () => void
}

export const useStore = create<StoreState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  stats: null,
  setStats: (stats) => set({ stats }),
  logout: () => set({ user: null, stats: null }),
}))
