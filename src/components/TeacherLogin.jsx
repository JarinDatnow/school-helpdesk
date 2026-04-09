import { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import { TEACHERS } from '../teachers'

const PIN = '2024'

export default function TeacherLogin({ goBack, onLogin }) {
  const [allTeachers, setAllTeachers] = useState([...TEACHERS].sort((a, b) => a.localeCompare(b)))
  const [selectedTeacher, setSelectedTeacher] = useState('')
  const [isCustomMode, setIsCustomMode] = useState(false)
  const [customNameInput, setCustomNameInput] = useState('')
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    supabase.from('custom_teachers').select('name').order('name').then(({ data }) => {
      if (data && data.length > 0) {
        const names = data.map(r => r.name)
        setAllTeachers(prev =>
          [...new Set([...prev, ...names])].sort((a, b) => a.localeCompare(b))
        )
      }
    })
  }, [])

  async function handleLogin(e) {
    e.preventDefault()
    setError('')

    const teacherName = isCustomMode ? customNameInput.trim() : selectedTeacher

    if (!teacherName) {
      setError(isCustomMode ? 'Please enter your name.' : 'Please select your name.')
      return
    }
    if (pin !== PIN) {
      setError('Incorrect PIN. Please try again.')
      setPin('')
      return
    }

    setLoading(true)

    // Save custom name if not already in the list
    if (isCustomMode && !allTeachers.includes(teacherName)) {
      await supabase.from('custom_teachers').upsert({ name: teacherName }, { onConflict: 'name' })
    }

    setTimeout(() => {
      setLoading(false)
      onLogin(teacherName)
    }, 400)
  }

  return (
    <div className="min-h-screen bg-amber-50 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <button
          onClick={goBack}
          className="flex items-center gap-1.5 text-amber-700 hover:text-amber-900 mb-6 text-sm font-medium transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          Back
        </button>

        <div className="bg-white rounded-2xl shadow-md border border-amber-100 p-6">
          <h2 className="text-xl font-bold text-amber-900 mb-1">Teacher Login</h2>
          <p className="text-amber-600 text-sm mb-6">Select your name and enter the staff PIN.</p>

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Name selector or custom input */}
            <div>
              <label className="block text-sm font-medium text-amber-800 mb-1.5">Your Name</label>
              {isCustomMode ? (
                <div>
                  <input
                    type="text"
                    value={customNameInput}
                    onChange={e => setCustomNameInput(e.target.value)}
                    placeholder="Type your full name…"
                    className="w-full border border-amber-200 rounded-xl px-4 py-3 text-amber-900 bg-amber-50 focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm placeholder-amber-300"
                  />
                  <button
                    type="button"
                    onClick={() => { setIsCustomMode(false); setCustomNameInput('') }}
                    className="mt-1.5 text-xs text-amber-500 hover:text-amber-700 underline underline-offset-2 transition-colors"
                  >
                    Select from list instead
                  </button>
                </div>
              ) : (
                <div>
                  <select
                    value={selectedTeacher}
                    onChange={e => setSelectedTeacher(e.target.value)}
                    className="w-full border border-amber-200 rounded-xl px-4 py-3 text-amber-900 bg-amber-50 focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm"
                  >
                    <option value="">— Select your name —</option>
                    {allTeachers.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => { setIsCustomMode(true); setSelectedTeacher('') }}
                    className="mt-1.5 text-xs text-amber-500 hover:text-amber-700 underline underline-offset-2 transition-colors"
                  >
                    My name isn't listed
                  </button>
                </div>
              )}
            </div>

            {/* PIN */}
            <div>
              <label className="block text-sm font-medium text-amber-800 mb-1.5">Staff PIN</label>
              <input
                type="password"
                inputMode="numeric"
                value={pin}
                onChange={e => setPin(e.target.value)}
                placeholder="••••"
                maxLength={6}
                className="w-full border border-amber-200 rounded-xl px-4 py-3 text-amber-900 bg-amber-50 focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm tracking-widest"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-amber-500 hover:bg-amber-600 active:bg-amber-700 disabled:opacity-60 text-white font-semibold py-3.5 rounded-xl transition-colors duration-150 mt-2"
            >
              {loading ? 'Logging in…' : 'Login'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
