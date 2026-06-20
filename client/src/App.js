import React, { useEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import './App.css';
import 'leaflet/dist/leaflet.css';
import useAuthStore from './store/useAuthStore';
// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';

// Lazy‑load pages to break down the monolithic bundle size
const Home = lazy(() => import('./pages/Home'));
const Showroom = lazy(() => import('./pages/Showroom'));
const Catalog = lazy(() => import('./pages/Catalog'));
const Bookings = lazy(() => import('./pages/Bookings'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'));

function PageLoader() {
  return (
    <div className="global-loader-container">
      <div className="global-loader-spinner"></div>
      <p className="global-loader-text">Loading CarRental...</p>
    </div>
  );
}

// Hide nav + footer on auth pages
const AUTH_ROUTES = ['/login', '/register'];

function Layout() {
  const location = useLocation();
  const isAuth = AUTH_ROUTES.includes(location.pathname);

  return (
    <>
      {!isAuth && <Navbar />}
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/showroom" element={<Showroom />} />
          <Route path="/catalog" element={<Catalog />} />
          <Route path="/bookings" element={<ProtectedRoute><Bookings /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/checkout/:carId" element={<CheckoutPage />} />
        </Routes>
      </Suspense>
      {!isAuth && <Footer />}
    </>
  );
}

function App() {
  const initAuthListener = useAuthStore(state => state.initAuthListener);

  useEffect(() => {
    const unsubscribe = initAuthListener();
    return () => unsubscribe && unsubscribe();
  }, [initAuthListener]);

  return (
    <Router>
      <div className="App">
        <Layout />
      </div>
    </Router>
  );
}

export default App;
