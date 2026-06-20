import { create } from 'zustand';
import { auth } from '../utils/firebase';

const useBookingStore = create((set) => ({
  bookings: [],
  loading: false,
  error: null,

  fetchUserBookings: async (userId, token) => {
    set({ loading: true, error: null });
    try {
      const actualToken = token || (auth.currentUser ? await auth.currentUser.getIdToken() : '');
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/bookings?userId=${userId}`, {
        headers: {
          'Authorization': `Bearer ${actualToken}`
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch bookings');
      }
      const data = await response.json();
      set({ bookings: data, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  fetchAllBookings: async (token) => {
    set({ loading: true, error: null });
    try {
      const actualToken = token || (auth.currentUser ? await auth.currentUser.getIdToken() : '');
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/bookings`, {
        headers: {
          'Authorization': `Bearer ${actualToken}`
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch all bookings');
      }
      const data = await response.json();
      set({ bookings: data, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  createBooking: async (bookingData, token) => {
    set({ loading: true, error: null });
    try {
      const actualToken = token || (auth.currentUser ? await auth.currentUser.getIdToken() : '');
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${actualToken}`
        },
        body: JSON.stringify(bookingData)
      });
      if (!response.ok) {
        throw new Error('Failed to create booking');
      }
      const data = await response.json();
      set((state) => ({ 
        bookings: [...state.bookings, data], 
        loading: false 
      }));
      return data;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  updateBookingStatus: async (id, status, token) => {
    try {
      const actualToken = token || (auth.currentUser ? await auth.currentUser.getIdToken() : '');
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/bookings/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${actualToken}`
        },
        body: JSON.stringify({ status })
      });
      if (!response.ok) throw new Error('Failed to update booking status');
      
      set((state) => ({
        bookings: state.bookings.map(b => b.id === id ? { ...b, status } : b)
      }));
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  }
}));

export default useBookingStore;
