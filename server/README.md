# Healthcare Service Platform - Backend

## Setup Instructions

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file from `.env.example` and fill in all required values.

3. Create necessary directories:
```bash
mkdir uploads logs
```

4. Start MongoDB (make sure MongoDB is running on your system).

5. Run the server:
```bash
# Development
npm run dev

# Production
npm start
```

## 👤 Admin User Creation

To create or update an admin user, use the seeder script:

```bash
# Create default admin
npm run create-admin

# Create custom admin
npm run create-admin -- --email=admin@yourdomain.com --password=YourPassword123

# Update existing admin
npm run create-admin -- --email=admin@healthcare.com --password=NewPassword123
```

**Default Admin Credentials:**
- Email: `admin@healthcare.com`
- Password: `Admin@123`

For detailed instructions, see [ADMIN_GUIDE.md](../ADMIN_GUIDE.md)

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/verify-otp` - Verify OTP
- `POST /api/auth/login` - Login
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password
- `GET /api/auth/me` - Get current user

### Customer Routes
- `GET /api/customer/services` - Get all services
- `POST /api/customer/addresses` - Add address
- `GET /api/customer/addresses` - Get my addresses
- `PUT /api/customer/addresses/:id` - Update address
- `DELETE /api/customer/addresses/:id` - Delete address
- `GET /api/customer/bookings` - Get my bookings
- `GET /api/customer/bookings/:id` - Get booking by ID

### Provider Routes
- `POST /api/provider/register` - Register as provider
- `GET /api/provider/profile` - Get provider profile
- `GET /api/provider/jobs` - Get assigned jobs
- `PATCH /api/provider/jobs/:id/accept-reject` - Accept/reject booking
- `PATCH /api/provider/jobs/:id/status` - Update job status
- `POST /api/provider/upload-report` - Upload report
- `GET /api/provider/earnings` - Get earnings

### Admin Routes
- `GET /api/admin/users` - Get all users
- `PATCH /api/admin/users/:id/block` - Block/unblock user
- `GET /api/admin/providers/pending` - Get pending providers
- `PATCH /api/admin/providers/:id/approve-reject` - Approve/reject provider
- `POST /api/admin/services` - Create service
- `GET /api/admin/services` - Get all services
- `PUT /api/admin/services/:id` - Update service
- `DELETE /api/admin/services/:id` - Delete service
- `GET /api/admin/dashboard/stats` - Get dashboard stats
- `GET /api/admin/bookings/export` - Export bookings

### Booking Routes
- `POST /api/bookings` - Create booking
- `PATCH /api/bookings/:id/status` - Update booking status
- `GET /api/bookings/all` - Get all bookings (admin)

### Payment Routes
- `POST /api/payment/create-order` - Create Razorpay order
- `POST /api/payment/verify` - Verify payment
