# Admin User Management Guide

## 📋 Overview

This guide explains how to create, update, and manage admin users in the Healthcare Service Platform.

## 🔐 Admin User Creation

### Quick Start

The easiest way to create an admin user is using the provided seeder script:

```bash
cd server
npm run create-admin
```

This will create a default admin user with:
- **Email**: `admin@healthcare.com`
- **Password**: `Admin@123`
- **Phone**: `9999999999`
- **Name**: `Super Admin`
- **Role**: `admin`
- **Verified**: `true`

---

## 🛠️ Creating Admin Users

### Method 1: Using Seeder Script (Recommended)

#### Create Default Admin

```bash
cd server
npm run create-admin
```

#### Create Custom Admin

You can specify custom admin details using command line arguments:

```bash
npm run create-admin -- --email=admin@yourdomain.com --name="Admin Name" --phone=1234567890 --password=SecurePassword123
```

**Available Arguments:**
- `--email=value` - Admin email address
- `--name=value` - Admin full name
- `--phone=value` - Admin phone number
- `--password=value` - Admin password

**Example:**
```bash
npm run create-admin -- --email=superadmin@company.com --name="John Doe" --phone=9876543210 --password=MySecure@Pass123
```

#### Update Existing Admin

If an admin with the specified email already exists, the script will update it:

```bash
# Update password for existing admin
npm run create-admin -- --email=admin@healthcare.com --password=NewPassword123

# Update name and phone
npm run create-admin -- --email=admin@healthcare.com --name="Updated Name" --phone=1111111111
```

**Note**: The script will:
- ✅ Check if admin exists by email
- ✅ Create new admin if email doesn't exist
- ✅ Update existing admin if email is found
- ✅ Automatically hash passwords with bcrypt
- ✅ Set role to 'admin' and isVerified to true
- ✅ Ensure admin is not blocked

---

## 📝 Script Behavior

### Creating New Admin

When you run the script with a new email:

1. Script connects to MongoDB
2. Checks if user with email exists
3. If not found, creates new admin user
4. Hashes password securely
5. Sets all required fields
6. Displays success message with admin details

**Output Example:**
```
🔌 Connecting to MongoDB...
✅ Connected to MongoDB successfully

✅ Admin created successfully!
📋 Admin Details:
   Name: Super Admin
   Email: admin@healthcare.com
   Phone: 9999999999
   Role: admin
   Verified: true
   ID: 507f1f77bcf86cd799439011

🔌 Database connection closed
✨ Process completed successfully
```

### Updating Existing Admin

When you run the script with an existing email:

1. Script connects to MongoDB
2. Finds existing user by email
3. Updates user details
4. Updates password if provided
5. Ensures role is 'admin'
6. Displays success message

**Output Example:**
```
🔌 Connecting to MongoDB...
✅ Connected to MongoDB successfully

⚠️  Admin with email "admin@healthcare.com" already exists.
Updating existing admin...

✅ Admin updated successfully!
📋 Admin Details:
   Name: Super Admin
   Email: admin@healthcare.com
   Phone: 9999999999
   Role: admin
   Verified: true
   Password: Updated

🔌 Database connection closed
✨ Process completed successfully
```

---

## 🔒 Security Best Practices

### Password Requirements

When creating admin users, use strong passwords:
- Minimum 8 characters
- Mix of uppercase and lowercase letters
- Include numbers
- Include special characters

**Examples of Strong Passwords:**
- `Admin@123`
- `SecurePass!2024`
- `MyAdmin#Password1`

### Email Security

- Use a dedicated admin email address
- Don't use personal email addresses
- Consider using a domain-specific email (e.g., `admin@yourdomain.com`)

### Access Control

- Admin accounts have full system access
- Only create admin accounts for trusted personnel
- Regularly review admin user list
- Disable unused admin accounts

---

## 🚨 Error Handling

### Common Errors

#### 1. MongoDB Connection Error

**Error:**
```
❌ Error: MONGODB_URI not found in environment variables
```

**Solution:**
- Ensure `.env` file exists in `server/` directory
- Verify `MONGODB_URI` is set in `.env`
- Check MongoDB is running (if local)

#### 2. Duplicate Phone Number

**Error:**
```
❌ Error: Phone number "9999999999" is already registered
```

**Solution:**
- Use a different phone number
- Or update the existing user with that phone number

#### 3. Duplicate Email (MongoDB Error)

**Error:**
```
⚠️  Duplicate key error: Email or phone already exists
```

**Solution:**
- The script will update existing admin if email matches
- If you see this error, the email might be used by a non-admin user
- Check existing users in database

---

## 📋 Admin User Properties

When created, admin users have the following properties:

| Property | Value | Description |
|----------|-------|-------------|
| `role` | `'admin'` | User role set to admin |
| `isVerified` | `true` | Account is verified (no OTP needed) |
| `isBlocked` | `false` | Account is active |
| `password` | Hashed | Password is securely hashed with bcrypt |

---

## 🔄 Updating Admin Users

### Update Password

```bash
npm run create-admin -- --email=admin@healthcare.com --password=NewPassword123
```

### Update Name

```bash
npm run create-admin -- --email=admin@healthcare.com --name="New Admin Name"
```

### Update Phone

```bash
npm run create-admin -- --email=admin@healthcare.com --phone=9876543210
```

### Update Multiple Fields

```bash
npm run create-admin -- --email=admin@healthcare.com --name="New Name" --phone=9876543210 --password=NewPass123
```

---

## 🗑️ Removing Admin Users

To remove an admin user, you can:

1. **Block the admin** (via admin panel):
   - Login as another admin
   - Go to User Management
   - Block the admin user

2. **Delete from database** (MongoDB):
```javascript
use healthcare-platform
db.users.deleteOne({ email: "admin@healthcare.com" })
```

---

## 🔍 Verifying Admin User

### Check Admin Exists

You can verify admin creation by:

1. **Login to the application:**
   - Go to login page
   - Use admin email and password
   - Should redirect to `/admin/dashboard`

2. **Check database:**
```javascript
use healthcare-platform
db.users.findOne({ role: "admin" })
```

3. **Check via API** (if logged in as admin):
```bash
GET /api/admin/users
```

---

## 📝 Multiple Admin Users

You can create multiple admin users:

```bash
# Create first admin
npm run create-admin -- --email=admin1@healthcare.com --name="Admin One" --password=Pass1

# Create second admin
npm run create-admin -- --email=admin2@healthcare.com --name="Admin Two" --password=Pass2
```

Each admin will have full access to the admin panel.

---

## 🛡️ Security Notes

1. **Never expose admin creation via API** - The seeder script is the only safe way to create admins
2. **Change default password** - Always change the default password after first login
3. **Use strong passwords** - Follow password best practices
4. **Limit admin accounts** - Only create admin accounts for necessary personnel
5. **Regular audits** - Periodically review admin user list

---

## 📞 Troubleshooting

### Script Not Running

**Issue**: `npm run create-admin` fails

**Solutions**:
1. Ensure you're in the `server/` directory
2. Check `package.json` has the script defined
3. Verify Node.js is installed: `node --version`
4. Check MongoDB connection in `.env`

### Admin Can't Login

**Issue**: Admin user created but can't login

**Solutions**:
1. Verify email and password are correct
2. Check `isVerified` is `true` in database
3. Check `isBlocked` is `false` in database
4. Verify `role` is set to `'admin'`

### Password Not Working

**Issue**: Password doesn't work after creation

**Solutions**:
1. Re-run script to update password
2. Ensure password meets requirements (min 6 characters)
3. Check for typos in password

---

## ✅ Quick Reference

### Create Default Admin
```bash
cd server && npm run create-admin
```

### Create Custom Admin
```bash
cd server && npm run create-admin -- --email=admin@domain.com --password=Pass123
```

### Update Admin Password
```bash
cd server && npm run create-admin -- --email=admin@healthcare.com --password=NewPass123
```

### Update Admin Name
```bash
cd server && npm run create-admin -- --email=admin@healthcare.com --name="New Name"
```

---

**Last Updated**: Current Date  
**Version**: 1.0.0
