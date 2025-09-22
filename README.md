# Chess Academy Management System

A comprehensive MERN stack application for managing chess academy operations with role-based access control, batch management, and Lichess integration.

## Features

- **Role-based Authentication**: Admin, Teacher, and Student roles
- **Batch Management**: Signup code-based student enrollment
- **Class Management**: Visibility controls and enrollment systems
- **Attendance Tracking**: Daily session-based attendance
- **Announcements**: Three-tier announcement system
- **Lichess Integration**: OAuth-based chess performance tracking
- **Profile Management**: Comprehensive user profiles with image upload
- **Mobile Ready**: Capacitor integration for APK export

## Tech Stack

- **Frontend**: React + Vite, Chakra UI, Tailwind CSS, Framer Motion
- **Backend**: Node.js, Express.js, MongoDB
- **Authentication**: JWT tokens
- **File Upload**: Multer
- **Email**: Nodemailer

## Quick Start

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or cloud)
- npm or yarn

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd chess-academy-management-system
   ```

2. **Install dependencies**

   ```bash
   npm run install-all
   ```

3. **Environment Setup**

   ```bash
   # Copy environment files
   cp backend/.env.example backend/.env
   ```

4. **Configure Environment Variables**
   Edit `backend/.env` with your settings:

   - MongoDB connection string
   - JWT secret key
   - Email configuration (for password reset)
   - Lichess API credentials (optional)

5. **Start Development Servers**

   ```bash
   npm run dev
   ```

   This will start:

   - Backend server on http://localhost:5000
   - Frontend development server on http://localhost:5173

## Project Structure

```
chess-academy-management-system/
├── frontend/                 # React frontend
│   ├── src/
│   │   ├── pages/
│   │   │   ├── auth/        # Authentication pages
│   │   │   ├── admin/       # Admin dashboard pages
│   │   │   ├── teacher/     # Teacher dashboard pages
│   │   │   ├── student/     # Student dashboard pages
│   │   │   └── common/      # Shared pages
│   │   ├── components/      # Reusable components
│   │   ├── utils/          # Utility functions
│   │   └── AppRoutes.jsx   # Route configuration
│   └── package.json
├── backend/                 # Node.js backend
│   ├── models/             # MongoDB models
│   ├── routes/             # API routes
│   ├── middleware/         # Custom middleware
│   ├── utils/              # Utility functions
│   ├── uploads/            # File uploads
│   └── server.js           # Express server
└── package.json            # Root package.json
```

## Available Scripts

- `npm run dev` - Start both frontend and backend in development mode
- `npm run server` - Start only backend server
- `npm run client` - Start only frontend development server
- `npm run build` - Build frontend for production
- `npm run install-all` - Install dependencies for both frontend and backend

## Authentication Flow

### Student Registration

1. Admin creates batch with auto-generated signup code
2. Student uses signup code to self-register
3. Account automatically assigned to batch
4. Student can access classes linked to their batch

### Admin/Teacher Account Creation

1. Admin creates accounts for teachers and other admins
2. Temporary passwords provided
3. Users can update profiles and change passwords

## API Endpoints

### Authentication

- `POST /api/auth/register` - Student registration with signup code
- `POST /api/auth/login` - User login
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password/:token` - Reset password
- `GET /api/auth/verify` - Verify JWT token

### Users (Protected)

- `GET /api/users` - Get users (role-based access)
- `PUT /api/users/profile` - Update user profile
- `POST /api/users/profile/image` - Upload profile image

### Batches (Admin only)

- `GET /api/batches` - Get all batches
- `POST /api/batches` - Create new batch
- `PUT /api/batches/:id` - Update batch
- `DELETE /api/batches/:id` - Delete batch

## Database Schema

### Core Collections

- **Users**: Authentication and basic user info
- **UserDetails**: Extended profile information
- **Batches**: Student batch management with signup codes
- **Classes**: Class management with batch linking
- **Attendance**: Session-based attendance tracking
- **Announcements**: Three-tier announcement system
- **LichessIntegration**: OAuth integration with Lichess

## Role-Based Access Control

### Admin

- Full system access
- Batch and user management
- Class oversight
- System settings

### Teacher

- Class creation and management
- Attendance marking
- Student performance tracking
- Limited to assigned batches

### Student

- Class enrollment
- Attendance viewing
- Profile management
- Lichess integration

## Development Guidelines

1. **Code Style**: Follow ESLint configuration
2. **Commits**: Use conventional commit messages
3. **Security**: Never commit sensitive data
4. **Documentation**: Update README for new features

## Deployment

### Production Build

```bash
npm run build
```

### Environment Variables

Ensure all production environment variables are set:

- `NODE_ENV=production`
- `MONGODB_URI` (production database)
- `JWT_SECRET` (strong secret key)
- Email configuration for password reset

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:

- Create an issue in the repository
- Contact the development team

---

**Note**: This is a development setup. For production deployment, additional security measures, environment configuration, and performance optimizations should be implemented.
