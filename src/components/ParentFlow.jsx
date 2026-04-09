import { useState, useRef, useEffect } from 'react'
import { supabase } from '../supabase'
import { TEACHERS } from '../teachers'

const GRADES = ['Grade R', 'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6',
  'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12']

export default function ParentFlow({ goBack }) {
  const [step, setStep] = useState('form') // 'form' | 'success'
  const [parentName, setParentName] = useState('')
  const [search, setSearch] = useState('')
  const [selectedTeacher, setSelectedTeacher] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)
  const [isCustomMode, setIsCustomMode] = useState(false)
  const [customTeacherInput, setCustomTeacherInput] = useState('')
  const [customTeachers, setCustomTeachers] = useState([])
  const [grade, setGrade] = useState('')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const dropdownRef = useRef(null)

  // Fetch custom teachers from DB on mount
  useEffect(() => {
    supabase.from('custom_teachers').select('name').order('name').then(({ data }) => {
      if (data) setCustomTeachers(data.map(r => r.name))
    })
  }, [])

  // Merged + deduped teacher list for search
  const allTeachers = [...new Set([...TEACHERS, ...customTeachers])].sort((a, b) =>
    a.localeCompare(b)
  )

  const filtered = allTeachers.filter(t =>
    t.toLowerCase().includes(search.toLowerCase())
  )

  useEffect(() => {
    function handleClick(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function selectTeacher(teacher) {
    setSelectedTeacher(teacher)
    setSearch(teacher)
    setShowDropdown(false)
  }

  function switchToCustomMode() {
    setIsCustomMode(true)
    setSearch('')
    setSelectedTeacher('')
    setShowDropdown(false)
  }

  function switchToSearchMode() {
    setIsCustomMode(false)
    setCustomTeacherInput('')
    setSelectedTeacher('')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    const teacherName = isCustomMode ? customTeacherInput.trim() : selectedTeacher

    if (!parentName.trim()) { setError('Please enter your name.'); return }
    if (!teacherName) { setError('Please select or enter a teacher name.'); return }
    if (!grade) { setError('Please select a grade.'); return }
    if (!subject.trim()) { setError('Please enter a subject.'); return }
    if (!message.trim()) { setError('Please type your query.'); return }

    setSubmitting(true)

    // If custom teacher name not in either list, save it
    if (isCustomMode && !allTeachers.includes(teacherName)) {
      await supabase.from('custom_teachers').upsert({ name: teacherName }, { onConflict: 'name' })
    }

    const { error: dbError } = await supabase.from('tickets').insert({
      parent_name: parentName.trim(),
      teacher: teacherName,
      grade,
      subject: subject.trim(),
      message: message.trim(),
      status: 'open',
    })

    setSubmitting(false)
    if (dbError) {
      setError('Something went wrong. Please try again.')
      console.error(dbError)
    } else {
      setStep('success')
    }
  }

  if (step === 'success') {
    const teacherName = isCustomMode ? customTeacherInput.trim() : selectedTeacher
    return (
      <div className="min-h-screen bg-amber-50 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-sm text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-amber-900 mb-2">Query Submitted!</h2>
          <p className="text-amber-700 text-sm mb-1">
            Your query has been sent to <span className="font-semibold">{teacherName}</span>.
          </p>
          <p className="text-amber-600 text-sm mb-8">Please proceed to their consultation area. A teacher will attend to you shortly.</p>
          <button
            onClick={goBack}
            className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold py-3.5 rounded-xl transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    )
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
          <h2 className="text-xl font-bold text-amber-900 mb-1">Submit a Query</h2>
          <p className="text-amber-600 text-sm mb-6">Fill in your details below and we'll notify the teacher.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Parent name */}
            <div>
              <label className="block text-sm font-medium text-amber-800 mb-1.5">Your Name</label>
              <input
                type="text"
                value={parentName}
                onChange={e => setParentName(e.target.value)}
                placeholder="e.g. John Smith"
                className="w-full border border-amber-200 rounded-xl px-4 py-3 text-amber-900 bg-amber-50 focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm placeholder-amber-300"
              />
            </div>

            {/* Teacher search or custom input */}
            <div>
              <label className="block text-sm font-medium text-amber-800 mb-1.5">Select Teacher</label>
              {isCustomMode ? (
                <div>
                  <input
                    type="text"
                    value={customTeacherInput}
                    onChange={e => setCustomTeacherInput(e.target.value)}
                    placeholder="Type teacher's full name…"
                    className="w-full border border-amber-200 rounded-xl px-4 py-3 text-amber-900 bg-amber-50 focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm placeholder-amber-300"
                  />
                  <button
                    type="button"
                    onClick={switchToSearchMode}
                    className="mt-1.5 text-xs text-amber-500 hover:text-amber-700 underline underline-offset-2 transition-colors"
                  >
                    Search the list instead
                  </button>
                </div>
              ) : (
                <div className="relative" ref={dropdownRef}>
                  <input
                    type="text"
                    value={search}
                    onChange={e => {
                      setSearch(e.target.value)
                      setSelectedTeacher('')
                      setShowDropdown(true)
                    }}
                    onFocus={() => setShowDropdown(true)}
                    placeholder="Search teacher name…"
                    className="w-full border border-amber-200 rounded-xl px-4 py-3 text-amber-900 bg-amber-50 focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm placeholder-amber-300"
                  />
                  {showDropdown && filtered.length > 0 && (
                    <ul className="absolute z-20 left-0 right-0 mt-1 bg-white border border-amber-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                      {filtered.map(teacher => (
                        <li key={teacher}>
                          <button
                            type="button"
                            onMouseDown={() => selectTeacher(teacher)}
                            className="w-full text-left px-4 py-2.5 text-sm text-amber-900 hover:bg-amber-50 transition-colors"
                          >
                            {teacher}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                  {showDropdown && search.length > 0 && filtered.length === 0 && (
                    <div className="absolute z-20 left-0 right-0 mt-1 bg-white border border-amber-200 rounded-xl shadow-lg px-4 py-3 text-sm text-amber-400">
                      No teachers found
                    </div>
                  )}
                  {selectedTeacher && (
                    <p className="text-xs text-green-600 mt-1.5 flex items-center gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                      {selectedTeacher} selected
                    </p>
                  )}
                  <button
                    type="button"
                    onClick={switchToCustomMode}
                    className="mt-1.5 text-xs text-amber-500 hover:text-amber-700 underline underline-offset-2 transition-colors"
                  >
                    Teacher not listed? Type their name
                  </button>
                </div>
              )}
            </div>

            {/* Grade */}
            <div>
              <label className="block text-sm font-medium text-amber-800 mb-1.5">Grade</label>
              <select
                value={grade}
                onChange={e => setGrade(e.target.value)}
                className="w-full border border-amber-200 rounded-xl px-4 py-3 text-amber-900 bg-amber-50 focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm"
              >
                <option value="">— Select grade —</option>
                {GRADES.map(g => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>

            {/* Subject */}
            <div>
              <label className="block text-sm font-medium text-amber-800 mb-1.5">Subject</label>
              <input
                type="text"
                value={subject}
                onChange={e => setSubject(e.target.value)}
                placeholder="e.g. Mathematics"
                className="w-full border border-amber-200 rounded-xl px-4 py-3 text-amber-900 bg-amber-50 focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm placeholder-amber-300"
              />
            </div>

            {/* Message */}
            <div>
              <label className="block text-sm font-medium text-amber-800 mb-1.5">Your Query</label>
              <textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="Describe your concern or question…"
                rows={4}
                className="w-full border border-amber-200 rounded-xl px-4 py-3 text-amber-900 bg-amber-50 focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm placeholder-amber-300 resize-none"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-amber-500 hover:bg-amber-600 active:bg-amber-700 disabled:opacity-60 text-white font-semibold py-3.5 rounded-xl transition-colors duration-150 mt-2"
            >
              {submitting ? 'Submitting…' : 'Submit Query'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
