export default function Home({ setView }) {
  return (
    <div className="min-h-screen bg-amber-50 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-amber-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 3.741-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-amber-900 tracking-tight">School Help Desk</h1>
          <p className="text-amber-600 mt-1 text-sm font-medium uppercase tracking-widest">Parent–Teacher Week</p>
        </div>

        {/* Role buttons */}
        <div className="space-y-4">
          <button
            onClick={() => setView('parent')}
            className="w-full bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white font-semibold py-5 px-5 rounded-2xl flex items-center justify-between shadow-md transition-colors duration-150"
          >
            <div className="flex items-center gap-4">
              <span className="text-3xl">👨‍👩‍👧</span>
              <div className="text-left">
                <div className="text-lg leading-tight">I'm a Parent</div>
                <div className="text-sm text-amber-100 font-normal mt-0.5">Submit a query to a teacher</div>
              </div>
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-amber-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </button>

          <button
            onClick={() => setView('teacher-login')}
            className="w-full bg-white hover:bg-amber-50 active:bg-amber-100 text-amber-900 font-semibold py-5 px-5 rounded-2xl flex items-center justify-between shadow-md border border-amber-200 transition-colors duration-150"
          >
            <div className="flex items-center gap-4">
              <span className="text-3xl">👩‍🏫</span>
              <div className="text-left">
                <div className="text-lg leading-tight">I'm a Teacher</div>
                <div className="text-sm text-amber-600 font-normal mt-0.5">View and manage queries</div>
              </div>
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </button>
        </div>

        <p className="text-center text-amber-400 text-xs mt-8">
          Queries are received in real time
        </p>
      </div>
    </div>
  )
}
