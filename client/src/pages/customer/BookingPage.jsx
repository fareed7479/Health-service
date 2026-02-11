import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { createBooking } from '../../store/slices/bookingSlice'
import { getServices } from '../../store/slices/serviceSlice'
import api from '../../store/api'
import toast from 'react-hot-toast'
import Layout from '../../components/Layout'
import { LoadScript, Autocomplete } from '@react-google-maps/api'

const BookingPage = () => {
  const { serviceId } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { services } = useSelector((state) => state.service)
  const { user } = useSelector((state) => state.auth)
  const [addresses, setAddresses] = useState([])
  const [formData, setFormData] = useState({
    addressId: '',
    scheduledDate: '',
    scheduledTime: '',
  })
  const [autocomplete, setAutocomplete] = useState(null)

  const service = services.find((s) => s._id === serviceId)

  useEffect(() => {
    if (serviceId) {
      dispatch(getServices())
    }
    fetchAddresses()
  }, [serviceId, dispatch])

  const fetchAddresses = async () => {
    try {
      const response = await api.get('/customer/addresses')
      setAddresses(response.data.addresses)
      if (response.data.addresses.length > 0) {
        const defaultAddr = response.data.addresses.find((a) => a.isDefault) || response.data.addresses[0]
        setFormData({ ...formData, addressId: defaultAddr._id })
      }
    } catch (error) {
      console.error('Failed to fetch addresses:', error)
    }
  }

  const handlePlaceSelect = async () => {
    if (autocomplete) {
      const place = autocomplete.getPlace()
      const addressData = {
        label: 'Other',
        addressLine1: place.formatted_address,
        city: place.address_components.find((c) => c.types.includes('locality'))?.long_name || '',
        state: place.address_components.find((c) => c.types.includes('administrative_area_level_1'))?.long_name || '',
        pincode: place.address_components.find((c) => c.types.includes('postal_code'))?.long_name || '',
        coordinates: {
          latitude: place.geometry.location.lat(),
          longitude: place.geometry.location.lng(),
        },
      }

      try {
        const response = await api.post('/customer/addresses', addressData)
        setAddresses([...addresses, response.data.address])
        setFormData({ ...formData, addressId: response.data.address._id })
        toast.success('Address added successfully')
      } catch (error) {
        toast.error('Failed to add address')
      }
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.addressId || !formData.scheduledDate || !formData.scheduledTime) {
      toast.error('Please fill all fields')
      return
    }

    try {
      const result = await dispatch(
        createBooking({
          serviceId,
          addressId: formData.addressId,
          scheduledDate: formData.scheduledDate,
          scheduledTime: formData.scheduledTime,
        })
      ).unwrap()
      toast.success('Booking created successfully!')
      navigate(`/payment/${result.booking._id}`)
    } catch (error) {
      toast.error(error || 'Booking failed')
    }
  }

  if (!service) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <p>Loading service...</p>
        </div>
      </Layout>
    )
  }

  const finalAmount = service.basePrice - (service.basePrice * (service.discount?.percentage || 0)) / 100

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold mb-8">Book Service</h1>

          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-2">{service.name}</h2>
            <p className="text-gray-600 mb-4">{service.description}</p>
            <div className="flex justify-between">
              <span className="text-2xl font-bold text-primary-600">₹{finalAmount}</span>
              <span className="text-gray-500">Duration: {service.duration} min</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Address
                </label>
                <select
                  value={formData.addressId}
                  onChange={(e) => setFormData({ ...formData, addressId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500"
                  required
                >
                  <option value="">Select an address</option>
                  {addresses.map((addr) => (
                    <option key={addr._id} value={addr._id}>
                      {addr.label}: {addr.addressLine1}, {addr.city}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Or Add New Address
                </label>
                <LoadScript googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''}>
                  <Autocomplete
                    onLoad={(auto) => setAutocomplete(auto)}
                    onPlaceChanged={handlePlaceSelect}
                  >
                    <input
                      type="text"
                      placeholder="Search for an address"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500"
                    />
                  </Autocomplete>
                </LoadScript>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Scheduled Date
                </label>
                <input
                  type="date"
                  value={formData.scheduledDate}
                  onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Scheduled Time
                </label>
                <input
                  type="time"
                  value={formData.scheduledTime}
                  onChange={(e) => setFormData({ ...formData, scheduledTime: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-primary-600 text-white py-2 rounded-md hover:bg-primary-700 transition-colors"
              >
                Continue to Payment
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  )
}

export default BookingPage
