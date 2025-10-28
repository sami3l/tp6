import React from 'react'

const StatsGrid = ({ metrics = [], lastUpdated }) => {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-elevated">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.45em] text-slate-400">Dashboard snapshot</p>
          <h1 className="mt-2 text-2xl font-semibold text-slate-900">Student Success Center</h1>
        </div>
        {lastUpdated && (
          <span className="rounded-full bg-slate-100 px-4 py-1 text-xs font-medium text-slate-500">
            Updated {lastUpdated}
          </span>
        )}
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => (
          <article
            key={metric.label}
            className="group relative overflow-hidden rounded-2xl border border-slate-100 bg-gradient-to-br from-white to-slate-50 p-5 transition hover:-translate-y-1 hover:shadow-xl"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.1),_transparent_60%)] opacity-0 transition group-hover:opacity-100" />
            <div className="relative flex flex-col gap-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                {metric.label}
              </span>
              <span className="text-3xl font-bold text-slate-900">{metric.value}</span>
              {metric.delta && (
                <span className="inline-flex w-fit items-center gap-1 rounded-full bg-success/10 px-2 py-1 text-xs font-semibold text-success">
                  + {metric.delta}
                </span>
              )}
              {metric.helper && <p className="text-sm text-slate-500">{metric.helper}</p>}
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

export default StatsGrid
