import React from 'react'

const formatDate = (value) => {
  if (!value) return '—'
  try {
    return new Date(value).toLocaleDateString()
  } catch {
    return '—'
  }
}

const computeAge = (value) => {
  if (!value) return '—'
  const birth = new Date(value)
  if (Number.isNaN(birth.getTime())) return '—'
  const diff = Date.now() - birth.getTime()
  return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25)))
}

const TableSkeleton = ({ rows = 5 }) => (
  <tbody>
    {Array.from({ length: rows }).map((_, index) => (
      <tr key={index} className="animate-pulse">
        <td className="px-4 py-4">
          <div className="h-5 rounded bg-slate-200" />
        </td>
        <td className="px-4 py-4">
          <div className="h-5 rounded bg-slate-200" />
        </td>
        <td className="px-4 py-4">
          <div className="h-5 rounded bg-slate-200" />
        </td>
        <td className="px-4 py-4">
          <div className="h-5 rounded bg-slate-200" />
        </td>
        <td className="px-4 py-4">
          <div className="h-8 w-24 rounded bg-slate-200" />
        </td>
      </tr>
    ))}
  </tbody>
)

const StudentTable = ({
  students,
  total,
  page,
  pageSize,
  onPageChange,
  onEdit,
  onDelete,
  isLoading
}) => {
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const startIndex = total === 0 ? 0 : (page - 1) * pageSize + 1
  const endIndex = total === 0 ? 0 : (page - 1) * pageSize + students.length

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-elevated">
      <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Students</h2>
          <p className="text-sm text-slate-500">
            {isLoading
              ? 'Fetching roster...'
              : `${total} student${total === 1 ? '' : 's'} in the catalog`}
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-500">
          Page
          <span className="rounded-full bg-slate-100 px-2 py-1 font-medium text-slate-700">
            {page} / {totalPages}
          </span>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th scope="col" className="px-4 py-3 text-left text-sm font-semibold uppercase tracking-wide text-slate-500">
                ID
              </th>
              <th scope="col" className="px-4 py-3 text-left text-sm font-semibold uppercase tracking-wide text-slate-500">
                Student
              </th>
              <th scope="col" className="px-4 py-3 text-left text-sm font-semibold uppercase tracking-wide text-slate-500">
                Birth Date
              </th>
              <th scope="col" className="px-4 py-3 text-left text-sm font-semibold uppercase tracking-wide text-slate-500">
                Age
              </th>
              <th scope="col" className="px-4 py-3 text-right text-sm font-semibold uppercase tracking-wide text-slate-500">
                Actions
              </th>
            </tr>
          </thead>
          {isLoading ? (
            <TableSkeleton rows={pageSize} />
          ) : (
            <tbody className="divide-y divide-slate-100">
              {students.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-sm text-slate-500">
                    No students match the current filters.
                  </td>
                </tr>
              ) : (
                students.map((student) => (
                  <tr key={student.id ?? `${student.fname}-${student.lname}`} className="transition hover:bg-slate-50">
                    <td className="px-4 py-4 text-sm font-medium text-slate-600">{student.id ?? '—'}</td>
                    <td className="px-4 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-slate-900">
                          {student.fname} {student.lname}
                        </span>
                        {student.email ? (
                          <span className="text-xs uppercase tracking-wide text-slate-400">{student.email}</span>
                        ) : null}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-600">{formatDate(student.birthDate)}</td>
                    <td className="px-4 py-4 text-sm text-slate-600">{computeAge(student.birthDate)}</td>
                    <td className="px-4 py-4 text-right text-sm">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => onEdit?.(student)}
                          className="rounded-full border border-slate-200 px-3 py-1 text-sm font-medium text-slate-600 transition hover:border-primary-500 hover:text-primary-600"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => onDelete?.(student)}
                          className="rounded-full border border-danger/20 bg-danger/10 px-3 py-1 text-sm font-semibold text-danger transition hover:bg-danger/20"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          )}
        </table>
      </div>
      <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/60 px-6 py-3 text-sm text-slate-600">
        <span>
          Showing {startIndex} to {endIndex} of {total} entries
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onPageChange?.(Math.max(1, page - 1))}
            disabled={page <= 1}
            className="rounded-full border border-slate-200 px-3 py-1 font-medium text-slate-600 transition enabled:hover:border-primary-500 enabled:hover:text-primary-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Previous
          </button>
          <button
            type="button"
            onClick={() => onPageChange?.(Math.min(totalPages, page + 1))}
            disabled={page >= totalPages}
            className="rounded-full border border-slate-200 px-3 py-1 font-medium text-slate-600 transition enabled:hover:border-primary-500 enabled:hover:text-primary-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  )
}

export default StudentTable
