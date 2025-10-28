import React, { useEffect, useMemo, useState } from 'react'
import StatsGrid from './components/StatsGrid.jsx'
import StudentTable from './components/StudentTable.jsx'
import StudentForm from './components/StudentForm.jsx'
import YearDistribution from './components/YearDistribution.jsx'
import Notification from './components/Notification.jsx'
import {
  fetchAllStudents,
  fetchStudentCount,
  fetchStudentsByYear,
  createStudent,
  updateStudent,
  deleteStudent
} from './services/studentApi.js'

const pageSize = 8

const toIsoDateTime = (inputDate) => {
  if (!inputDate) return null
  const normalized = `${inputDate}T00:00:00`
  const date = new Date(normalized)
  if (Number.isNaN(date.getTime())) {
    return null
  }
  return date.toISOString()
}

const computeAge = (value) => {
  if (!value) return null
  const birth = new Date(value)
  if (Number.isNaN(birth.getTime())) return null
  const diff = Date.now() - birth.getTime()
  return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25)))
}

const formatRelativeDays = (days) => {
  if (days === 0) return 'Today'
  if (days === 1) return 'Tomorrow'
  return `${days} days`
}

const UpcomingBirthdaysCard = ({ items }) => (
  <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-elevated">
    <h2 className="text-lg font-semibold text-slate-900">Upcoming birthdays</h2>
    <p className="text-sm text-slate-500">Celebrate your students and strengthen relationships.</p>
    <ul className="mt-4 space-y-3">
      {items.length === 0 ? (
        <li className="rounded-2xl border border-dashed border-slate-200 py-6 text-center text-sm text-slate-500">
          No birthdays on the horizon.
        </li>
      ) : (
        items.map((item) => (
          <li key={item.id ?? `${item.fname}-${item.lname}`} className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50/60 px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-slate-800">
                {item.fname} {item.lname}
              </p>
              <p className="text-xs uppercase tracking-wide text-slate-400">
                {item.birthDate ? new Date(item.birthDate).toLocaleDateString() : '—'}
              </p>
            </div>
            <span className="rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold text-primary-700">
              {formatRelativeDays(item.daysUntil)}
            </span>
          </li>
        ))
      )}
    </ul>
  </section>
)

function App() {
  const [students, setStudents] = useState([])
  const [totalCount, setTotalCount] = useState(0)
  const [yearStats, setYearStats] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [page, setPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [birthYearFilter, setBirthYearFilter] = useState('all')
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [notification, setNotification] = useState(null)
  const [notificationTone, setNotificationTone] = useState('success')
  const [lastSyncedAt, setLastSyncedAt] = useState(null)

  const showToast = (message, tone = 'success') => {
    setNotification(message)
    setNotificationTone(tone)
  }

  const loadData = async ({ silent = false } = {}) => {
    if (!silent) {
      setLoading(true)
    }
    setError(null)
    try {
      const [studentList, countResponse, byYear] = await Promise.all([
        fetchAllStudents(),
        fetchStudentCount(),
        fetchStudentsByYear()
      ])
      setStudents(studentList)
      setTotalCount(typeof countResponse === 'number' ? countResponse : studentList.length)
      setYearStats(byYear)
      setLastSyncedAt(new Date())
    } catch (err) {
      setError(err.message ?? 'Failed to load data')
    } finally {
      if (!silent) {
        setLoading(false)
      }
    }
  }

  useEffect(() => {
    loadData().catch(() => null)
  }, [])

  useEffect(() => {
    setPage(1)
  }, [searchTerm, birthYearFilter])

  const availableBirthYears = useMemo(() => {
    const years = new Set()
    students.forEach((student) => {
      if (!student.birthDate) return
      const year = new Date(student.birthDate).getFullYear()
      if (!Number.isNaN(year)) {
        years.add(year)
      }
    })
    return Array.from(years).sort((a, b) => b - a)
  }, [students])

  const filteredStudents = useMemo(() => {
    const query = searchTerm.trim().toLowerCase()
    return students.filter((student) => {
      const matchesSearch = query
        ? `${student.fname} ${student.lname}`.toLowerCase().includes(query) || String(student.id ?? '').includes(query)
        : true

      const matchesYear = birthYearFilter === 'all'
        ? true
        : new Date(student.birthDate).getFullYear().toString() === birthYearFilter

      return matchesSearch && matchesYear
    })
  }, [students, searchTerm, birthYearFilter])

  const paginatedStudents = useMemo(() => {
    const start = (page - 1) * pageSize
    return filteredStudents.slice(start, start + pageSize)
  }, [filteredStudents, page])

  const averageAge = useMemo(() => {
    const ages = students
      .map((student) => computeAge(student.birthDate))
      .filter((age) => typeof age === 'number' && !Number.isNaN(age))
    if (ages.length === 0) return '—'
    const sum = ages.reduce((total, age) => total + age, 0)
    return `${Math.round((sum / ages.length) * 10) / 10} yrs`
  }, [students])

  const upcomingBirthdays = useMemo(() => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const msInDay = 1000 * 60 * 60 * 24

    return students
      .filter((student) => Boolean(student.birthDate))
      .map((student) => {
        const birth = new Date(student.birthDate)
        if (Number.isNaN(birth.getTime())) {
          return null
        }
        const next = new Date(today)
        next.setMonth(birth.getMonth(), birth.getDate())
        if (next < today) {
          next.setFullYear(next.getFullYear() + 1)
        }
        const diffDays = Math.round((next.getTime() - today.getTime()) / msInDay)
        return {
          ...student,
          daysUntil: diffDays
        }
      })
      .filter(Boolean)
      .sort((a, b) => a.daysUntil - b.daysUntil)
      .slice(0, 4)
  }, [students])

  const stats = useMemo(() => [
    {
      label: 'Total students',
      value: totalCount ?? students.length,
      helper: 'Across every cohort'
    },
    {
      label: 'In current view',
      value: filteredStudents.length,
      helper: 'Matching filters and search'
    },
    {
      label: 'Average age',
      value: averageAge,
      helper: 'Based on birth dates on file'
    },
    {
      label: 'Next birthday',
      value: upcomingBirthdays[0]
        ? `${upcomingBirthdays[0].fname} ${upcomingBirthdays[0].lname}`
        : '—',
      helper: upcomingBirthdays[0]
        ? formatRelativeDays(upcomingBirthdays[0].daysUntil)
        : 'No upcoming birthdays'
    }
  ], [totalCount, students.length, filteredStudents.length, averageAge, upcomingBirthdays])

  const handleAddStudent = () => {
    setSelectedStudent(null)
    setIsFormOpen(true)
  }

  const handleEditStudent = (student) => {
    setSelectedStudent(student)
    setIsFormOpen(true)
  }

  const handleDeleteStudent = async (student) => {
    if (!student?.id) {
      showToast('Unable to delete student without ID', 'danger')
      return
    }
    const confirmation = window.confirm(`Remove ${student.fname} ${student.lname} from the roster?`)
    if (!confirmation) return
    try {
      await deleteStudent(student.id)
      await loadData({ silent: true })
      showToast('Student successfully removed', 'info')
    } catch (err) {
      showToast(err.message ?? 'Deletion failed', 'danger')
    }
  }

  const handleSubmitStudent = async (form) => {
    const payload = {
      fname: form.fname.trim(),
      lname: form.lname.trim(),
      birthDate: toIsoDateTime(form.birthDate)
    }

    if (!payload.birthDate) {
      showToast('Invalid birth date. Please use the YYYY-MM-DD format.', 'danger')
      return
    }

    setIsSubmitting(true)
    try {
      if (selectedStudent?.id) {
        await updateStudent(selectedStudent.id, payload)
        showToast('Student profile updated')
      } else {
        await createStudent(payload)
        showToast('New student added to the system')
      }
      await loadData({ silent: true })
      setIsFormOpen(false)
      setSelectedStudent(null)
    } catch (err) {
      showToast(err.message ?? 'Unable to save student', 'danger')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-slate-200 pb-16">
      <Notification
        message={notification}
        tone={notificationTone}
        onDismiss={() => setNotification(null)}
      />

      <header className="mx-auto max-w-6xl px-6 pt-12">
        <StatsGrid
          metrics={stats}
          lastUpdated={lastSyncedAt ? lastSyncedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : null}
        />
      </header>

      <main className="mx-auto mt-10 max-w-6xl space-y-8 px-6">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-elevated">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Student directory</h2>
              <p className="text-sm text-slate-500">Search, filter, and manage your student roster in one place.</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <input
                  type="search"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search by name or ID"
                  className="w-56 rounded-full border border-slate-200 px-4 py-2 pl-10 text-sm shadow-sm transition focus:border-primary-500 focus:outline-none focus:ring-4 focus:ring-primary-500/10"
                />
                <svg
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M14.5 14.5L18 18"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M9 15C12.3137 15 15 12.3137 15 9C15 5.68629 12.3137 3 9 3C5.68629 3 3 5.68629 3 9C3 12.3137 5.68629 15 9 15Z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <select
                value={birthYearFilter}
                onChange={(event) => setBirthYearFilter(event.target.value)}
                className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 shadow-sm transition focus:border-primary-500 focus:outline-none focus:ring-4 focus:ring-primary-500/10"
              >
                <option value="all">All birth years</option>
                {availableBirthYears.map((year) => (
                  <option key={year} value={year.toString()}>{year}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => loadData()}
                className="rounded-full border border-slate-200 px-5 py-2 text-sm font-medium text-slate-600 transition hover:border-primary-500 hover:text-primary-600"
              >
                Refresh
              </button>
              <button
                type="button"
                onClick={handleAddStudent}
                className="rounded-full bg-primary-600 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-primary-500/30 transition hover:bg-primary-500"
              >
                Add student
              </button>
            </div>
          </div>

          {error && (
            <div className="mt-4 rounded-2xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
              <p>{error}</p>
              <button
                type="button"
                onClick={() => loadData()}
                className="mt-2 rounded-full border border-danger/20 px-3 py-1 text-xs font-semibold text-danger transition hover:border-danger/40"
              >
                Try again
              </button>
            </div>
          )}

          <div className="mt-6">
            <StudentTable
              students={paginatedStudents}
              total={filteredStudents.length}
              page={page}
              pageSize={pageSize}
              onPageChange={setPage}
              onEdit={handleEditStudent}
              onDelete={handleDeleteStudent}
              isLoading={loading}
            />
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-2">
          <YearDistribution items={yearStats} />
          <UpcomingBirthdaysCard items={upcomingBirthdays} />
        </div>
      </main>

      <StudentForm
        open={isFormOpen}
        onClose={() => {
          setIsFormOpen(false)
          setSelectedStudent(null)
        }}
        onSubmit={handleSubmitStudent}
        initialData={selectedStudent}
        isSubmitting={isSubmitting}
      />
    </div>
  )
}

export default App
