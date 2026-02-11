import { useState, useEffect } from 'react'
import api from '../../store/api'
import Layout from '../../components/Layout'
import toast from 'react-hot-toast'

const ProviderApproval = () => {
  const [providers, setProviders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProviders()
  }, [])

  const fetchProviders = async () => {
    try {
      const response = await api.get('/admin/providers/pending')
      setProviders(response.data.providers)
    } catch (error) {
      toast.error('Failed to fetch providers')
    } finally {
      setLoading(false)
    }
  }

  const handleApproveReject = async (providerId, action, rejectionReason = '') => {
    try {
      await api.patch(`/admin/providers/${providerId}/approve-reject`, {
        action,
        rejectionReason,
      })
      toast.success(`Provider ${action}d successfully`)
      fetchProviders()
    } catch (error) {
      toast.error(`Failed to ${action} provider`)
    }
  }

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold mb-8">Provider Approval</h1>

          <div className="space-y-6">
            {providers.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <p className="text-gray-600">No pending provider registrations</p>
              </div>
            ) : (
              providers.map((provider) => (
                <div
                  key={provider._id}
                  className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-semibold">{provider.user?.name}</h3>
                      <p className="text-gray-600">{provider.user?.email}</p>
                      <p className="text-gray-600">{provider.user?.phone}</p>
                    </div>
                    <span className="px-3 py-1 rounded bg-yellow-100 text-yellow-800">
                      Pending
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-600">Specialization</p>
                      <p className="font-medium">{provider.specialization}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">License Number</p>
                      <p className="font-medium">{provider.licenseNumber}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Experience</p>
                      <p className="font-medium">{provider.experience} years</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Bio</p>
                      <p className="font-medium">{provider.bio || 'N/A'}</p>
                    </div>
                  </div>

                  {provider.licenseDocument && (
                    <div className="mb-4">
                      <p className="text-sm text-gray-600 mb-2">License Document</p>
                      <a
                        href={provider.licenseDocument.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary-600 hover:text-primary-700"
                      >
                        View Document →
                      </a>
                    </div>
                  )}

                  <div className="flex space-x-4">
                    <button
                      onClick={() => handleApproveReject(provider._id, 'approve')}
                      className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => {
                        const reason = prompt('Enter rejection reason:')
                        if (reason) {
                          handleApproveReject(provider._id, 'reject', reason)
                        }
                      }}
                      className="px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default ProviderApproval
