import { useState } from 'react'
import Home from './components/Home'
import ParentFlow from './components/ParentFlow'
import TeacherLogin from './components/TeacherLogin'
import TeacherDashboard from './components/TeacherDashboard'
import AdminPage from './components/AdminPage'

export default function App() {
  const [view, setView] = useState('home')
  const [currentTeacher, setCurrentTeacher] = useState(null)

  return (
    <div className="min-h-screen bg-amber-50">
      {view === 'home' && <Home setView={setView} />}

      {view === 'parent' && <ParentFlow goBack={() => setView('home')} />}

      {view === 'teacher-login' && (
        <TeacherLogin
          goBack={() => setView('home')}
          onLogin={(teacher) => {
            setCurrentTeacher(teacher)
            setView('teacher-dashboard')
          }}
        />
      )}

      {view === 'teacher-dashboard' && (
        <TeacherDashboard
          teacher={currentTeacher}
          goBack={() => {
            setCurrentTeacher(null)
            setView('home')
          }}
          goAdmin={() => setView('admin')}
        />
      )}

      {view === 'admin' && (
        <AdminPage
          teacher={currentTeacher}
          goBack={() => setView('teacher-dashboard')}
        />
      )}
    </div>
  )
}
