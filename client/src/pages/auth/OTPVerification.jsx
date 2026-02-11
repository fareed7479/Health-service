import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate, useLocation } from 'react-router-dom'
import { verifyOTP } from '../../store/slices/authSlice'
import toast from 'react-hot-toast'
import Layout from '../../components/Layout'

const OTPVerification = () => {
  const [otp, setOtp] = useState('')
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const userId = location.state?.userId

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!userId) {
      toast.error('User ID not found. Please register again.')
      navigate('/register')
      return
    }

    try {
      const result = await dispatch(verifyOTP({ userId, otp })).unwrap()
      toast.success('OTP verified successfully!')
      const user = result.user
      if (user.role === 'customer') {
        navigate('/customer/dashboard')
      } else if (user.role === 'provider') {
        navigate('/provider/dashboard')
      } else if (user.role === 'admin') {
        navigate('/admin/dashboard')
      } else {
        navigate('/')
      }
    } catch (error) {
      toast.error(error || 'OTP verification failed')
    }
  }

  return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Verify OTP
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Enter the OTP sent to your email and phone
            </p>
          </div>
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="otp" className="block text-sm font-medium text-gray-700">
                OTP Code
              </label>
              <input
                id="otp"
                name="otp"
                type="text"
                required
                maxLength={6}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm text-center text-2xl tracking-widest"
                placeholder="000000"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              />
            </div>

            <div>
              <button
                type="submit"
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Verify OTP
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  )
}

export default OTPVerification
