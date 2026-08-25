# Frontend Architecture - OnboardAI

## Overview

The OnboardAI frontend is built with **React + Vite** using a modern, scalable component-based architecture with TypeScript for type safety.

```
frontend/
├── src/
│   ├── components/     # Reusable UI components
│   ├── pages/         # Page components (routed)
│   ├── store/         # Zustand state management
│   ├── services/      # API client and utilities
│   ├── styles/        # Global CSS
│   ├── App.tsx        # Main app component with routing
│   └── main.tsx       # Entry point
├── index.html         # HTML template
├── vite.config.ts     # Vite configuration
├── tsconfig.json      # TypeScript configuration
└── package.json       # Dependencies
```

## Technology Stack

- **React 18**: UI library with hooks
- **Vite**: Build tool and dev server
- **React Router v6**: Client-side routing
- **Zustand**: Lightweight state management
- **Axios**: HTTP client
- **TypeScript**: Type safety
- **CSS Modules**: Scoped styling
- **Lucide React**: Icon library

## Architecture Layers

### 1. Components (components/)
**Responsibility**: Reusable UI components

#### Layout Component
- Main application shell
- Header with user menu and logout
- Sidebar navigation
- Responsive design with mobile menu toggle

**Features**:
- Persistent navigation
- User profile display
- Quick access to all pages
- Mobile-first responsive design

**File Structure**:
```
Layout.tsx              # Component logic
Layout.module.css       # Component styles
```

### 2. Pages (pages/)
**Responsibility**: Route-specific screen components

#### Login Page
- Employee ID login form
- Error handling and loading states
- Demo credentials (1, 2, 3)
- Styled card layout

#### Dashboard Page
- Summary statistics (tasks, training, tickets)
- Recommended next task widget
- Quick links to main features
- Real-time data loading

#### Chat Page
- Multi-turn conversation interface
- Agent type display
- Source document attribution
- Chat history loading
- Message streaming UI

#### Tasks Page
- List of onboarding tasks
- Status indicators (pending, in progress, completed)
- Task categorization and prioritization
- Quick actions (complete, view details)

#### Training Page
- Available training courses grid
- Progress bars for in-progress trainings
- Course metadata (duration, type, requirement)
- Start course functionality

#### Support Tickets Page
- Employee's support tickets
- Ticket status and priority indicators
- Quick ticket creation
- Ticket number tracking

#### Profile Page
- Employee information display
- Profile fields (name, email, role, department, location, experience)
- Edit profile capability
- Clean card-based layout

### 3. State Management (store/)
**Responsibility**: Application state and data persistence

#### Zustand Store
```typescript
interface StoreState {
  user: Employee | null
  setUser: (user: Employee | null) => void
  stats: DashboardStats | null
  setStats: (stats: DashboardStats) => void
  logout: () => void
}
```

**Key Features**:
- Lightweight and performant
- No boilerplate compared to Redux
- Minimal bundle size
- Simple API (subscribe/get/set)

**Data Persisted**:
- Current user profile
- Dashboard statistics
- Authentication state

**Best Practices**:
- Single store with focused state
- Actions as store methods
- No nested objects
- Simple derivations only

### 4. Services (services/)
**Responsibility**: HTTP communication and utilities

#### API Client
- Axios instance with interceptors
- Base URL from environment
- Automatic request/response transformation
- Error handling with 401 redirect
- Token-based authentication

**API Methods**:
```typescript
api.login(employeeId)
api.getEmployee(id)
api.getDashboard(id)
api.getTasks(employeeId)
api.sendMessage(message)
api.getChatHistory(employeeId)
// ... all other endpoints
```

**Request Interceptor**:
- Automatically adds auth token
- Retrieves from localStorage

**Response Interceptor**:
- Handles 401 errors (redirect to login)
- Centralized error logging

### 5. Styling (styles/)
**Responsibility**: Design system and global styles

#### Global CSS
- CSS custom properties (variables)
- Light enterprise color scheme
- Typography scale
- Spacing system
- Utility classes

**Design Tokens**:
```css
--primary-color: #2563eb
--success-color: #10b981
--warning-color: #f59e0b
--danger-color: #ef4444
--spacing-md: 1rem
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1)
```

**Component Styling Approach**:
- CSS Modules for component styles
- Global CSS for shared patterns
- BEM naming convention in modules
- Responsive design with media queries

### 6. Routing (App.tsx)
**Responsibility**: Application routing and page layout

**Routes**:
```
/login                 → LoginPage (public)
/                      → Dashboard (protected)
/chat                  → Chat (protected)
/tasks                 → Tasks (protected)
/training              → Training (protected)
/tickets               → Support Tickets (protected)
/profile               → Profile (protected)
```

**Protection**: Private routes check for authenticated user in store

### 7. Entry Point (main.tsx)
**Responsibility**: React app initialization

- Renders App component to DOM
- StrictMode for development warnings
- Global style imports

## Data Flow

### Authentication Flow
```
User Login
    ↓
POST /api/employees/{id}
    ↓
Store user in Zustand
    ↓
Save token to localStorage
    ↓
Redirect to Dashboard
```

### Chat Interaction Flow
```
User types message
    ↓
Click send button
    ↓
POST /api/chat (with employee_id, message)
    ↓
Display user message in UI
    ↓
Show loading indicator
    ↓
Receive agent response
    ↓
Display message + agent type + sources
    ↓
Save to chat history
```

### Dashboard Data Loading
```
Component mounts
    ↓
GET /api/dashboard/{id}
    ↓
Parse response (employee, stats, tasks, training)
    ↓
Update Zustand store
    ↓
Render with data
```

## Component Communication

### Props Down, Events Up
- Parent components pass data via props
- Child components emit changes via callbacks
- Avoid prop drilling with Zustand for global state

### Example: Task List
```typescript
<Tasks>
  {tasks.map(task => (
    <TaskItem 
      key={task.id}
      task={task}
      onComplete={(taskId) => handleCompleteTask(taskId)}
    />
  ))}
</Tasks>
```

## Performance Optimizations

1. **Code Splitting**: Lazy load pages with React.lazy()
2. **Memoization**: Use React.memo() for expensive renders
3. **Debouncing**: Debounce search and filter inputs
4. **Image Optimization**: Use responsive images
5. **Bundling**: Vite ensures optimized production build
6. **Caching**: API responses cached in browser

## Responsive Design

### Breakpoints
- Mobile: < 480px
- Tablet: 480px - 768px
- Desktop: > 768px

### Mobile-First Approach
- Base styles for mobile
- Media queries for larger screens
- Sidebar collapses on mobile
- Touch-friendly tap targets

## Error Handling

### User Errors
- Form validation errors
- API error messages displayed
- Toast notifications (can be added)
- User-friendly language

### Developer Errors
- Console logging
- TypeScript compile errors
- Runtime error boundaries (can be added)

## Type Safety

### TypeScript Benefits
- Compile-time error checking
- IDE autocomplete
- Self-documenting code
- Refactoring confidence

### Key Types
```typescript
interface Employee {
  id: number
  name: string
  email: string
  role: string
  // ...
}

interface DashboardStats {
  total_onboarding_tasks: number
  completed_tasks: number
  // ...
}
```

## Development Workflow

### Local Development
```bash
cd frontend
npm install
npm run dev
# Open http://localhost:5173
```

### Building
```bash
npm run build
# Output in dist/
```

### Type Checking
```bash
npm run type-check
```

### Linting
```bash
npm run lint
```

## Environment Configuration

### .env.example
```
VITE_API_URL=http://localhost:8000
```

### Build-time vs Runtime
- VITE_ prefix: Available at build time
- Use Vite's import.meta.env for access

## Browser Support

- Chrome/Edge (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- iOS Safari 12+

## Accessibility

- Semantic HTML elements
- ARIA labels where needed
- Keyboard navigation support
- Color contrast compliance
- Form label associations

## State Management Decisions

### Why Zustand?
- Minimal boilerplate
- No provider wrapper needed (optional)
- Fast performance
- Simple API
- Great TypeScript support

### Alternatives Considered
- Redux: Too much boilerplate for app size
- Jotai: Similar to Zustand
- Context API: Good but more verbose

## Future Enhancements

1. **Real-time Updates**: WebSocket integration
2. **Offline Support**: Service workers
3. **Dark Mode**: Theme switching
4. **Internationalization**: Multi-language support
5. **Accessibility**: Enhanced a11y features
6. **Testing**: Unit and E2E tests
7. **Analytics**: User behavior tracking
8. **Progressive Web App**: PWA features

## File Organization Principles

1. **Colocation**: Keep related files together
2. **Naming**: Descriptive, consistent names
3. **Exports**: Prefer default exports for pages
4. **Imports**: Absolute paths via tsconfig paths
5. **CSS Organization**: CSS Module per component

## Performance Metrics

- Lighthouse score target: 90+
- First Contentful Paint: < 1.5s
- Time to Interactive: < 3s
- Bundle size: < 200KB (gzipped)
