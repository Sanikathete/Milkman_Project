import { useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'

import { authApi } from '../api/endpoints'
import { getApiErrorMessage } from '../utils/error'

function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [form, setForm] = useState({ password: '', confirm_password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const resetData = useMemo(
    () => ({
      uid: searchParams.get('uid') || '',
      token: searchParams.get('token') || '',
    }),
    [searchParams],
  )

  const onSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setLoading(true)

    try {
      await authApi.resetPassword({
        ...resetData,
        password: form.password,
        confirm_password: form.confirm_password,
      })
      navigate('/login', {
        replace: true,
        state: { message: 'Password changed successfully. Log in with your new password.' },
      })
    } catch (err) {
      setError(getApiErrorMessage(err, 'Unable to reset password.'))
    } finally {
      setLoading(false)
    }
  }

  if (!resetData.uid || !resetData.token) {
    return (
      <div className="mx-auto max-w-md card p-6">
        <h1 className="mb-4 text-2xl font-bold text-brandBlue">Reset Password</h1>
        <p className="text-sm text-brandRed">This reset link is invalid, expired, or incomplete.</p>
        <p className="mt-4 text-sm text-slate-600">
          Start again from{' '}
          <Link to="/forgot-password" className="font-semibold text-brandBlue">
            Forgot Password
          </Link>
          , and use the link sent to your email.
        </p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-md card p-6">
      <h1 className="mb-6 text-2xl font-bold text-brandBlue">Set New Password</h1>
      <form onSubmit={onSubmit} className="space-y-4">
        <input
          className="w-full rounded-lg border border-slate-200 px-3 py-2"
          type="password"
          placeholder="New password"
          value={form.password}
          onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
          required
        />
        <input
          className="w-full rounded-lg border border-slate-200 px-3 py-2"
          type="password"
          placeholder="Confirm new password"
          value={form.confirm_password}
          onChange={(event) =>
            setForm((prev) => ({ ...prev, confirm_password: event.target.value }))
          }
          required
        />
        {error && <p className="text-sm text-brandRed">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-brandBlue px-4 py-2 font-semibold text-white disabled:opacity-70"
        >
          {loading ? 'Updating password...' : 'Reset Password'}
        </button>
      </form>
    </div>
  )
}

export default ResetPasswordPage
