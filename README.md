

# NTC Bus Tracking API 🚌

**NIBM Index:** YR4COBSCCOMP232P-032  
**NIBM Registered Name:** R.L.A. Senura Bhawantha  
**Coventry Index:** 14945892

---

## 🎯 Overview

A comprehensive RESTful API for real-time bus tracking with **JWT authentication**, **role-based access control**, and **full admin CRUD operations**. Built with Node.js, Express, MongoDB, and JWT.

### ✨ Key Features

- 🔐 **JWT Authentication** - Secure token-based authentication
- 👥 **Role-Based Access Control** - Three user roles (user, operator, admin)
- 🚀 **Admin Dashboard** - Full CRUD for users, buses, and routes
- 📊 **Real-time Bus Tracking** - Live location and status updates
- 🗓️ **Schedule Management** - Route schedules with future date support
- 🔒 **Secure Password Hashing** - Bcrypt encryption
- ✅ **Input Validation** - Express-validator for request validation
- 📚 **API Documentation** - Comprehensive docs with Postman collection
- 🌐 **CORS Enabled** - Cross-origin resource sharing support

---

## 🚀 Quick Start

### Prerequisites
- Node.js (v14+)
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. **Clone & Install**
```bash
git clone <repository-url>
cd ntc-bus-tracking-api
npm install
```

2. **Configure Environment**
```bash
cp .env.example .env
```

Edit `.env` and set:
```env
JWT_SECRET=your-super-secret-key-here
MONGO_URI=mongodb://127.0.0.1:27017/bus_tracking
ADMIN_EMAIL=admin@bustrack.com
ADMIN_PASSWORD=admin123456
```

3. **Create Admin User**
```bash
npm run create-admin
```

4. **Start Server**
```bash
npm start
```

Server runs on: `http://localhost:5000`

📘 **API Docs:** `http://localhost:5000/docs` (Swagger)

---

## 📋 API Endpoints Summary

### 🔓 Public Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/buses` | Get all buses |
| GET | `/buses/:bus_id` | Get bus by ID |
| GET | `/buses/:bus_id/location` | Get bus location |
| GET | `/buses/:bus_id/status` | Get bus status |
| GET | `/routes` | Get all routes |
| GET | `/routes/:route_id` | Get route by ID |
| GET | `/routes/:route_id/schedule` | Get route schedule |

### 🔐 Authentication Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register new user |
| POST | `/auth/login` | Login (get JWT token) |
| GET | `/auth/profile` | Get user profile 🔒 |
| PUT | `/auth/profile` | Update profile 🔒 |
| PUT | `/auth/change-password` | Change password 🔒 |
| POST | `/auth/refresh` | Refresh JWT token 🔒 |

### 👑 Admin Endpoints (Requires Admin Role)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/stats` | Dashboard statistics |
| **User Management** |||
| GET | `/admin/users` | Get all users (paginated) |
| GET | `/admin/users/:id` | Get user by ID |
| POST | `/admin/users` | Create new user |
| PUT | `/admin/users/:id` | Update user |
| DELETE | `/admin/users/:id` | Delete user |
| PUT | `/admin/users/:id/reset-password` | Reset user password |
| **Bus Management** |||
| POST | `/admin/buses` | Create new bus |
| PUT | `/admin/buses/:bus_id` | Update bus |
| DELETE | `/admin/buses/:bus_id` | Delete bus |
| **Route Management** |||
| POST | `/admin/routes` | Create new route |
| PUT | `/admin/routes/:route_id` | Update route |
| DELETE | `/admin/routes/:route_id` | Delete route |

🔒 = Requires authentication  
👑 = Requires admin role

---

## 🔐 Authentication Flow

### 1. Login
```bash
POST /auth/login
Content-Type: application/json

{
  "email": "admin@bustrack.com",
  "password": "admin123456"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "...",
    "email": "admin@bustrack.com",
    "name": "System Admin",
    "role": "admin"
  }
}
```

### 2. Use Token
Include in Authorization header for protected endpoints:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 👥 User Roles

| Role | Permissions |
|------|-------------|
| **user** | View buses, routes, and schedules |
| **operator** | Update bus locations and status (with API key) |
| **admin** | Full access to all endpoints + user management |

---

## 🧪 Testing

### Using Postman
1. Import `NTC_Bus_API_Postman_Collection.json`
2. Set `base_url` variable to `http://localhost:5000`
3. Login via "Authentication > Login" (token auto-saves)
4. Test admin endpoints!

### Using cURL
```bash
# Login
curl -X POST http://localhost:5000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@bustrack.com","password":"admin123456"}'

# Get all users (admin)
curl -X GET http://localhost:5000/admin/users \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 📁 Project Structure

```
ntc-bus-tracking-api/
├── config/
│   └── db.js                 # MongoDB connection
├── controllers/
│   ├── authController.js     # Authentication logic
│   ├── adminController.js    # Admin user management
│   ├── busController.js      # Bus CRUD operations
│   ├── routeController.js    # Route CRUD operations
│   └── geocodeController.js  # Geocoding services
├── middleware/
│   ├── auth.js              # JWT authentication & authorization
│   └── apiKey.js            # API key validation
├── models/
│   ├── user.js              # User schema with roles
│   ├── bus.js               # Bus schema
│   └── route.js             # Route schema
├── routes/
│   ├── authRoutes.js        # Auth endpoints
│   ├── adminRoutes.js       # Admin endpoints
│   ├── busRoutes.js         # Bus endpoints
│   ├── routeRoutes.js       # Route endpoints
│   └── geocodeRoutes.js     # Geocode endpoints
├── scripts/
│   ├── createAdmin.js       # Create admin user
│   └── reseedFromJson.js    # Reseed database
├── data/
│   └── busSimulation.json   # Simulation data
├── public/                   # Frontend files
├── index.js                 # Main application entry
├── package.json             # Dependencies & scripts
├── .env.example             # Environment template
├── AUTH_API_DOCS.md         # Complete API documentation
├── IMPLEMENTATION_SUMMARY.md # Implementation details
├── QUICK_START.md           # Quick start guide
└── NTC_Bus_API_Postman_Collection.json  # Postman collection
```

---

## 🛠️ NPM Scripts

```bash
npm start              # Start production server
npm run dev            # Start with nodemon (auto-reload)
npm run create-admin   # Create admin user
npm run reseed         # Reseed database from JSON
```

---

## 🗄️ Database Schema

### User Model
```javascript
{
  email: String (unique, required),
  password: String (hashed, required),
  name: String (required),
  role: String (enum: ['user', 'operator', 'admin']),
  isActive: Boolean,
  createdAt: Date,
  lastLogin: Date
}
```

### Bus Model
```javascript
{
  bus_id: Number (unique),
  route_id: Number,
  current_location: { latitude, longitude },
  status: String (enum: ['On Time', 'Delayed']),
  last_updated: Date,
  dailyLocations: Array
}
```

### Route Model
```javascript
{
  route_id: Number (unique),
  name: String
}
```

---

## 🔒 Security Features

- ✅ **JWT Token Authentication** - Secure token-based auth
- ✅ **Password Hashing** - Bcrypt with salt rounds
- ✅ **Role-Based Access Control** - Fine-grained permissions
- ✅ **Input Validation** - Request validation with express-validator
- ✅ **Environment Variables** - Sensitive data in .env
- ✅ **Token Expiration** - Configurable token lifetime
- ✅ **CORS Configuration** - Cross-origin security

---

## 📚 Documentation

- 📖 **[AUTH_API_DOCS.md](./AUTH_API_DOCS.md)** - Complete API reference
- 🚀 **[QUICK_START.md](./QUICK_START.md)** - Quick start guide
- 📝 **[IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)** - Technical details
- 📬 **[Postman Collection](./NTC_Bus_API_Postman_Collection.json)** - Import & test

---

## 🌐 Deployment

### Environment Variables for Production
```env
NODE_ENV=production
JWT_SECRET=<strong-random-secret>
JWT_EXPIRE=24h
MONGO_URI=<mongodb-atlas-connection-string>
PORT=5000
```

### Deploy to Railway/Heroku
1. Set environment variables in platform
2. Ensure MongoDB is accessible
3. Run `npm run create-admin` once deployed
4. Update CORS origins in `index.js`

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

---

## 📄 License

This project is licensed under the ISC License.

---

## 👨‍💻 Author

**R.L.A. Senura Bhawantha**
- NIBM Index: YR4COBSCCOMP232P-032
- Coventry Index: 14945892

---

## 🙏 Acknowledgments

- Express.js for the web framework
- MongoDB for the database
- JWT for secure authentication
- Bcrypt for password hashing

---

## 📞 Support

For issues or questions:
1. Check documentation in `AUTH_API_DOCS.md`
2. Review `QUICK_START.md` for setup help
3. Check server logs for errors
4. Verify `.env` configuration

---

**Built with ❤️ for NTC Bus Tracking System**
