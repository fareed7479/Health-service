import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../../store/api'
import Layout from '../../components/Layout'
import toast from 'react-hot-toast'

const ProviderJobs = () => {
  const [jobs, setJobs] = useState([])
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchJobs()
  }, [filter])

  const fetchJobs = async () => {
    try {
      const params = filter !== 'all' ? { status: filter } : {}
      const response = await api.get('/provider/jobs', { params })
      setJobs(response.data.jobs)
    } catch (error) {
      toast.error('Failed to fetch jobs')
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (jobId, status) => {
    try {
      await api.patch(`/provider/jobs/${jobId}/status`, { status })
      toast.success('Status updated successfully')
      fetchJobs()
    } catch (error) {
      toast.error('Failed to update status')
    }
  }

  const acceptReject = async (jobId, action) => {
    try {
      await api.patch(`/provider/jobs/${jobId}/accept-reject`, { action })
      toast.success(`Job ${action}ed successfully`)
      fetchJobs()
    } catch (error) {
      toast.error(`Failed to ${action} job`)
    }
  }

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      accepted: 'bg-blue-100 text-blue-800',
      provider_arriving: 'bg-purple-100 text-purple-800',
      in_progress: 'bg-indigo-100 text-indigo-800',
      completed: 'bg-green-100 text-green-800',
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
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
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">My Jobs</h1>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md"
            >
              <option value="all">All Jobs</option>
              <option value="pending">Pending</option>
              <option value="accepted">Accepted</option>
              <option value="provider_arriving">Arriving</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div className="space-y-4">
            {jobs.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <p className="text-gray-600">No jobs found</p>
              </div>
            ) : (
              jobs.map((job) => (
                <div
                  key={job._id}
                  className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-semibold">{job.service?.name}</h3>
                      <p className="text-gray-600 mt-1">Customer: {job.customer?.name}</p>
                      <p className="text-sm text-gray-500">{job.customer?.phone}</p>
                      <span className={`inline-block mt-2 px-3 py-1 rounded text-sm ${getStatusColor(job.status)}`}>
                        {job.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-primary-600">
                        ₹{job.amount?.finalAmount}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(job.scheduledDate).toLocaleDateString()} at {job.scheduledTime}
                      </p>
                    </div>
                  </div>

                  {job.address && (
                    <div className="mb-4 p-3 bg-gray-50 rounded">
                      <p className="font-medium text-sm">Address:</p>
                      <p className="text-sm text-gray-600">
                        {job.address.addressLine1}, {job.address.city}, {job.address.state} -{' '}
                        {job.address.pincode}
                      </p>
                      {job.address.coordinates && (
                        <a
                          href={`https://www.google.com/maps/dir/?api=1&destination=${job.address.coordinates.latitude},${job.address.coordinates.longitude}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary-600 hover:text-primary-700 text-sm mt-1 inline-block"
                        >
                          Open in Google Maps →
                        </a>
                      )}
                    </div>
                  )}

                  <div className="flex space-x-2">
                    {job.status === 'pending' && (
                      <>
                        <button
                          onClick={() => acceptReject(job._id, 'accept')}
                          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => acceptReject(job._id, 'reject')}
                          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                        >
                          Reject
                        </button>
                      </>
                    )}
                    {job.status === 'accepted' && (
                      <button
                        onClick={() => updateStatus(job._id, 'provider_arriving')}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        Mark as Arriving
                      </button>
                    )}
                    {job.status === 'provider_arriving' && (
                      <button
                        onClick={() => updateStatus(job._id, 'in_progress')}
                        className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                      >
                        Start Service
                      </button>
                    )}
                    {job.status === 'in_progress' && (
                      <Link
                        to={`/provider/upload-report/${job._id}`}
                        className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700"
                      >
                        Upload Report & Complete
                      </Link>
                    )}
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

export default ProviderJobs
