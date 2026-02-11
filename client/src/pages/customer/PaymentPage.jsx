import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../../store/api'
import toast from 'react-hot-toast'
import Layout from '../../components/Layout'

const PaymentPage = () => {
  const { bookingId } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [order, setOrder] = useState(null)
  const [booking, setBooking] = useState(null)

  useEffect(() => {
    fetchBooking()
    createOrder()
  }, [bookingId])

  const fetchBooking = async () => {
    try {
      const response = await api.get(`/customer/bookings/${bookingId}`)
      setBooking(response.data.booking)
    } catch (error) {
      toast.error('Failed to fetch booking details')
    }
  }

  const createOrder = async () => {
    try {
      const response = await api.post('/payment/create-order', { bookingId })
      setOrder(response.data.order)
    } catch (error) {
      toast.error('Failed to create payment order')
    }
  }

  const handlePayment = async () => {
    if (!order) return

    setLoading(true)
    const options = {
      key: order.key,
      amount: order.amount,
      currency: order.currency,
      name: 'Healthcare Platform',
      description: 'Service Booking Payment',
      order_id: order.id,
      handler: async function (response) {
        try {
          const verifyResponse = await api.post('/payment/verify', {
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            paymentId: response.paymentId,
          })

          if (verifyResponse.data.success) {
            toast.success('Payment successful!')
            navigate('/customer/dashboard')
          }
        } catch (error) {
          toast.error('Payment verification failed')
        } finally {
          setLoading(false)
        }
      },
      prefill: {
        name: 'Customer',
        email: 'customer@example.com',
        contact: '9999999999',
      },
      theme: {
        color: '#0ea5e9',
      },
    }

    const razorpay = new window.Razorpay(options)
    razorpay.open()
    razorpay.on('payment.failed', function (response) {
      toast.error('Payment failed')
      setLoading(false)
    })
  }

  if (!booking || !order) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading payment...</p>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold mb-8">Payment</h1>

          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Booking Summary</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Service:</span>
                <span className="font-medium">{booking.service?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Date:</span>
                <span className="font-medium">
                  {new Date(booking.scheduledDate).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Time:</span>
                <span className="font-medium">{booking.scheduledTime}</span>
              </div>
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total Amount:</span>
                  <span className="text-primary-600">₹{booking.amount?.finalAmount}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <button
              onClick={handlePayment}
              disabled={loading}
              className="w-full bg-primary-600 text-white py-3 rounded-md hover:bg-primary-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Pay Now'}
            </button>
            <p className="text-center text-sm text-gray-600 mt-4">
              Secure payment powered by Razorpay
            </p>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default PaymentPage
