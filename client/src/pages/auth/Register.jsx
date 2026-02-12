import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, Link } from 'react-router-dom'
import { register } from '../../store/slices/authSlice'
import toast from 'react-hot-toast'
import Layout from '../../components/Layout'

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'customer',
    // Provider-specific fields
    specialization: '',
    experience: '',
    licenseNumber: '',
    bio: '',
  })
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { loading } = useSelector((state) => state.auth)

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validate provider fields if provider role selected
    if (formData.role === 'provider') {
      if (!formData.specialization || !formData.experience || !formData.licenseNumber || !formData.bio) {
        toast.error('Please fill all provider details: specialization, experience, license number, and bio')
        return
      }
      
      if (isNaN(formData.experience) || formData.experience < 0) {
        toast.error('Experience must be a valid positive number')
        return
      }
    }
    
    try {
      const result = await dispatch(register(formData)).unwrap()
      toast.success('Registration successful! Please verify OTP.')
      navigate('/verify-otp', { state: { userId: result.userId } })
    } catch (error) {
      toast.error(error || 'Registration failed')
    }
  }

  return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Create your account
            </h2>
          </div>
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Full Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                  Phone
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                  I want to register as
                </label>
                <select
                  id="role"
                  name="role"
                  className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                >
                  <option value="customer">Customer</option>
                  <option value="provider">Provider (Doctor/Technician)</option>
                </select>
                <p className="mt-1 text-xs text-gray-500">
                  {formData.role === 'provider' 
                    ? 'Note: Provider accounts require admin approval after registration.'
                    : 'Select your account type'}
                </p>
              </div>

              {/* Provider-Specific Fields */}
              {formData.role === 'provider' && (
                <>
                  <div className="p-4 bg-blue-50 rounded-md border border-blue-200">
                    <p className="text-sm font-medium text-blue-900 mb-4">Professional Details</p>
                    
                    <div className="mb-4">
                      <label htmlFor="specialization" className="block text-sm font-medium text-gray-700">
                        Specialization *
                      </label>
                      <input
                        id="specialization"
                        name="specialization"
                        type="text"
                        placeholder="e.g., Cardiology, Dentistry, Plumbing"
                        required
                        className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                        value={formData.specialization}
                        onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                      />
                    </div>

                    <div className="mb-4">
                      <label htmlFor="experience" className="block text-sm font-medium text-gray-700">
                        Years of Experience *
                      </label>
                      <input
                        id="experience"
                        name="experience"
                        type="number"
                        min="0"
                        placeholder="e.g., 5"
                        required
                        className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                        value={formData.experience}
                        onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                      />
                    </div>

                    <div className="mb-4">
                      <label htmlFor="licenseNumber" className="block text-sm font-medium text-gray-700">
                        License Number *
                      </label>
                      <input
                        id="licenseNumber"
                        name="licenseNumber"
                        type="text"
                        placeholder="e.g., MED-2024-001"
                        required
                        className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                        value={formData.licenseNumber}
                        onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                      />
                    </div>

                    <div>
                      <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
                        Professional Bio *
                      </label>
                      <textarea
                        id="bio"
                        name="bio"
                        rows="3"
                        placeholder="Tell us about your professional background and expertise"
                        required
                        className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                        value={formData.bio}
                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      />
                      <p className="mt-1 text-xs text-gray-500">Max 500 characters</p>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
              >
                {loading ? 'Registering...' : 'Register'}
              </button>
            </div>

            <div className="text-center text-sm">
              <span className="text-gray-600">Already have an account? </span>
              <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
                Sign in
              </Link>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  )
}

export default Register
