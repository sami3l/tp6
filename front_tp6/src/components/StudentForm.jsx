import React, { useEffect, useMemo, useState } from 'react'

const emptyForm = {
  fname: '',
  lname: '',
  birthDate: ''
}

const toInputDate = (value) => {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }
  return date.toISOString().split('T')[0]
}

const StudentForm = ({ open, onClose, onSubmit, initialData, isSubmitting }) => {
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (open) {
      setForm({
        fname: initialData?.fname ?? '',
        lname: initialData?.lname ?? '',
        birthDate: toInputDate(initialData?.birthDate)
      })
      setErrors({})
    }
  }, [open, initialData])

  useEffect(() => {
    const handleKeydown = (event) => {
      if (event.key === 'Escape') {
        onClose?.()
      }
    }

    if (open) {
      window.addEventListener('keydown', handleKeydown)
    }
    return () => window.removeEventListener('keydown', handleKeydown)
  }, [open, onClose])

  const isEditMode = useMemo(() => Boolean(initialData?.id), [initialData])

  const validate = () => {
    const nextErrors = {}
    if (!form.fname.trim()) {
      nextErrors.fname = 'First name is required'
    }
    if (!form.lname.trim()) {
      nextErrors.lname = 'Last name is required'
    }
    if (!form.birthDate) {
      nextErrors.birthDate = 'Birth date is required'
    }
    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    if (!validate()) return
    onSubmit?.(form)
  }

  if (!open) {
    return null
  }

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-slate-900/50 px-4 py-10 backdrop-blur">
      <div className="relative w-full max-w-xl overflow-hidden rounded-3xl bg-white shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full border border-slate-200 px-3 py-1 text-sm font-medium text-slate-500 transition hover:border-slate-300 hover:text-slate-700"
        >
          Close
        </button>
        <div className="bg-gradient-to-r from-primary-500 to-primary-700 px-8 py-6 text-white">
          <p className="text-sm uppercase tracking-[0.35em] text-white/70">{isEditMode ? 'Update student' : 'Add student'}</p>
          <h2 className="text-2xl font-semibold">
            {isEditMode ? 'Edit Student Profile' : 'New Student Profile'}
          </h2>
        </div>
        <form className="space-y-6 px-8 py-8" onSubmit={handleSubmit}>
          <div className="grid gap-6 md:grid-cols-2">
            <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
              First name
              <input
                type="text"
                name="fname"
                value={form.fname}
                onChange={handleChange}
                placeholder="Jane"
                className="rounded-xl border border-slate-200 px-4 py-3 text-base text-slate-900 shadow-sm transition focus:border-primary-500 focus:outline-none focus:ring-4 focus:ring-primary-500/10"
              />
              {errors.fname && <span className="text-xs font-semibold text-danger">{errors.fname}</span>}
            </label>
            <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
              Last name
              <input
                type="text"
                name="lname"
                value={form.lname}
                onChange={handleChange}
                placeholder="Doe"
                className="rounded-xl border border-slate-200 px-4 py-3 text-base text-slate-900 shadow-sm transition focus:border-primary-500 focus:outline-none focus:ring-4 focus:ring-primary-500/10"
              />
              {errors.lname && <span className="text-xs font-semibold text-danger">{errors.lname}</span>}
            </label>
          </div>
          <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
            Birth date
            <input
              type="date"
              name="birthDate"
              value={form.birthDate}
              onChange={handleChange}
              className="rounded-xl border border-slate-200 px-4 py-3 text-base text-slate-900 shadow-sm transition focus:border-primary-500 focus:outline-none focus:ring-4 focus:ring-primary-500/10"
            />
            {errors.birthDate && <span className="text-xs font-semibold text-danger">{errors.birthDate}</span>}
          </label>
          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-slate-200 px-6 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:text-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-full bg-primary-600 px-6 py-2 text-sm font-semibold text-white shadow-lg shadow-primary-500/30 transition hover:bg-primary-500 disabled:cursor-not-allowed disabled:bg-primary-600/60"
            >
              {isSubmitting ? 'Saving...' : isEditMode ? 'Save changes' : 'Create student'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default StudentForm
