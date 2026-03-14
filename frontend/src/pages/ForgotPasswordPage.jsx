import { useState } from 'react'
import { Link } from 'react-router-dom'

import { authApi } from '../api/endpoints'
import { getApiErrorMessage } from '../utils/error'

function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const onSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      await authApi.forgotPassword({ email: email.trim().toLowerCase() })
      setSuccess('If an account exists for this email, a reset link has been sent.')
    } catch (err) {
      setError(getApiErrorMessage(err, 'Unable to start password reset.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-md card p-6">
      <h1 className="mb-6 text-2xl font-bold text-brandBlue">Forgot Password</h1>
      <form onSubmit={onSubmit} className="space-y-4">
        <input
          className="w-full rounded-lg border border-slate-200 px-3 py-2"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
        {success && <p className="text-sm text-green-700">{success}</p>}
        {error && <p className="text-sm text-brandRed">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-brandBlue px-4 py-2 font-semibold text-white disabled:opacity-70"
        >
          {loading ? 'Checking account...' : 'Continue'}
        </button>
      </form>
      <p className="mt-4 text-sm text-slate-600">
        Remembered it?{' '}
        <Link to="/login" className="font-semibold text-brandBlue">
          Back to login
        </Link>
      </p>
    </div>
  )
}

export default ForgotPasswordPage
