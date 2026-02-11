import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../../store/api'
import Layout from '../../components/Layout'
import toast from 'react-hot-toast'

const UploadReport = () => {
  const { bookingId } = useParams()
  const navigate = useNavigate()
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)

  const handleFileChange = (e) => {
    setFile(e.target.files[0])
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!file) {
      toast.error('Please select a file')
      return
    }

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('report', file)
      formData.append('bookingId', bookingId)

      await api.post('/provider/upload-report', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      // Update status to completed
      await api.patch(`/provider/jobs/${bookingId}/status`, {
        status: 'completed',
      })

      toast.success('Report uploaded and job completed successfully!')
      navigate('/provider/dashboard')
    } catch (error) {
      toast.error('Failed to upload report')
    } finally {
      setUploading(false)
    }
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold mb-8">Upload Report</h1>

          <div className="bg-white rounded-lg shadow-md p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Report File (PDF, Image)
                </label>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500"
                  required
                />
                <p className="mt-1 text-sm text-gray-500">
                  Accepted formats: PDF, JPG, JPEG, PNG (Max 10MB)
                </p>
              </div>

              <div className="flex space-x-4">
                <button
                  type="submit"
                  disabled={uploading || !file}
                  className="flex-1 bg-primary-600 text-white py-2 rounded-md hover:bg-primary-700 transition-colors disabled:opacity-50"
                >
                  {uploading ? 'Uploading...' : 'Upload & Complete Job'}
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/provider/dashboard')}
                  className="px-6 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default UploadReport
