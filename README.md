# Car Rental Platform

A full-stack car rental application with a 3D interactive showroom built with React, Three.js, Node.js/Express, and Firebase.

## Features

- **3D Car Showroom**: Interactive 3D car viewer with rotating models using Three.js
- **Car Catalog**: Browse and search through available rental cars
- **Booking System**: Reserve cars for specific dates
- **User Authentication**: Secure user registration and login via Firebase
- **Payment Integration**: Stripe integration for secure payments
- **Responsive Design**: Mobile-friendly interface
- **Real-time Database**: Firebase Firestore for data management

## Project Structure

```
rentals/
├── client/                 # React frontend
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.js
│   │   │   └── CarViewer3D.js
│   │   ├── pages/
│   │   │   ├── Home.js
│   │   │   ├── Showroom.js
│   │   │   ├── Bookings.js
│   │   │   └── Dashboard.js
│   │   ├── hooks/
│   │   ├── utils/
│   │   ├── store/
│   │   ├── App.js
│   │   ├── index.js
│   │   ├── App.css
│   │   └── index.css
│   ├── .gitignore
│   └── package.json
├── server/                 # Node.js/Express backend
│   ├── src/
│   │   ├── routes/
│   │   │   ├── cars.js
│   │   │   ├── bookings.js
│   │   │   └── users.js
│   │   ├── controllers/
│   │   │   ├── carController.js
│   │   │   ├── bookingController.js
│   │   │   └── userController.js
│   │   ├── models/
│   │   │   └── index.js
│   │   ├── middleware/
│   │   ├── config/
│   │   │   └── firebase.js
│   │   └── index.js
│   ├── .env
│   ├── .gitignore
│   └── package.json
├── .github/
│   └── copilot-instructions.md
└── README.md
```

## Tech Stack

### Frontend
- **React 18**: UI library
- **Three.js**: 3D graphics library for car visualization
- **React Router**: Client-side routing
- **Tailwind CSS**: Utility-first CSS framework
- **Axios**: HTTP client
- **Zustand**: State management

### Backend
- **Node.js**: JavaScript runtime
- **Express.js**: Web framework
- **Firebase Admin SDK**: Firebase integration
- **Stripe API**: Payment processing
- **Firebase Auth**: User authentication
- **Firestore**: Cloud database

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Firebase project account
- Stripe account

### Installation

#### 1. Clone or navigate to the project
```bash
cd rentals
```

#### 2. Setup Frontend
```bash
cd client
npm install
```

#### 3. Setup Backend
```bash
cd ../server
npm install
```

### Configuration

#### Firebase Setup
1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com)
2. Enable Firestore Database
3. Enable Firebase Authentication
4. Get your credentials and update `.env` file

#### Backend Environment Variables
Create a `.env` file in the `server` directory:
```env
PORT=5000
NODE_ENV=development

# Firebase Configuration
FIREBASE_API_KEY=your_firebase_api_key
FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your_sender_id
FIREBASE_APP_ID=your_app_id

# Stripe Configuration
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key

# JWT Secret
JWT_SECRET=your_jwt_secret_key_change_this

# Client URL
CLIENT_URL=http://localhost:3000
```

### Running the Application

#### Development Mode

**Terminal 1 - Frontend:**
```bash
cd client
npm start
```
The React app will open at `http://localhost:3000`

**Terminal 2 - Backend:**
```bash
cd server
npm run dev
```
The backend server will run at `http://localhost:5000`

#### Production Build

**Frontend:**
```bash
cd client
npm run build
```

**Backend:**
```bash
cd server
npm start
```

## API Endpoints

### Cars
- `GET /api/cars` - Get all cars
- `GET /api/cars/:id` - Get car by ID
- `POST /api/cars` - Create new car (Admin)
- `PUT /api/cars/:id` - Update car (Admin)
- `DELETE /api/cars/:id` - Delete car (Admin)

### Bookings
- `POST /api/bookings` - Create booking
- `GET /api/bookings` - Get user bookings
- `PUT /api/bookings/:id/cancel` - Cancel booking

### Users
- `POST /api/users` - Register user
- `GET /api/users/:id` - Get user profile
- `PUT /api/users/:id` - Update user profile

## Features to Implement

- [x] User authentication UI
- [x] Payment checkout integration
- [x] User Dashboard & Profile Management
- [x] Admin dashboard
- [x] Review and ratings system
- [x] Booking confirmation emails
- [x] Advanced 3D car models
- [x] Insurance options
- [x] Driver's license verification
- [x] Real-time booking calendar
- [x] Analytics dashboard

## Security Considerations

- Use HTTPS in production
- Validate all inputs on both frontend and backend
- Implement rate limiting on API endpoints
- Secure JWT tokens with proper expiration
- Use environment variables for sensitive data
- Enable CORS only for trusted domains
- Implement proper authentication middleware

## Contributing

1. Create a feature branch (`git checkout -b feature/AmazingFeature`)
2. Commit changes (`git commit -m 'Add AmazingFeature'`)
3. Push to branch (`git push origin feature/AmazingFeature`)
4. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, email support@carrental.com or open an issue on GitHub.

## Roadmap

- [ ] Mobile app (React Native)
- [ ] Advanced 3D visualization with WebGL
- [ ] AI-powered car recommendations
- [ ] Integration with Google Maps
- [ ] Multiple language support
- [ ] Loyalty program
- [ ] Corporate fleet management

---

Built with ❤️ for the car rental industry
