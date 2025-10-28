import React, { useMemo } from 'react'

const YearDistribution = ({ items = [] }) => {
  const maxValue = useMemo(() => {
    if (items.length === 0) return 0
    return Math.max(...items.map((item) => Number(item.value) || 0))
  }, [items])

  if (items.length === 0) {
    return (
      <section className="rounded-3xl border border-dashed border-slate-200 bg-white p-6 text-center text-sm text-slate-500">
        No enrollment data by academic year yet.
      </section>
    )
  }

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-elevated">
      <header className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Students per Academic Year</h2>
          <p className="text-sm text-slate-500">Track cohort distribution to spot capacity trends.</p>
        </div>
        <span className="rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold text-primary-600">
          Total {items.reduce((sum, item) => sum + (Number(item.value) || 0), 0)} students
        </span>
      </header>
      <div className="space-y-4">
        {items.map((item) => {
          const value = Number(item.value) || 0
          const percentage = maxValue === 0 ? 0 : Math.round((value / maxValue) * 100)
          return (
            <article key={item.label} className="space-y-2">
              <div className="flex items-center justify-between text-sm text-slate-500">
                <span className="font-semibold text-slate-700">{item.label}</span>
                <span>{value} students</span>
              </div>
              <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-primary-500 to-primary-700 transition-all"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}

export default YearDistribution
