import { create } from 'zustand';
import { auth } from '../utils/firebase';

const useCarStore = create((set) => ({
  cars: [],
  loading: false,
  error: null,
  selectedCar: null,
  carReviews: [],
  reviewsLoading: false,

  // Fetch all cars
  fetchCars: async () => {
    set({ loading: true, error: null });
    try {
      const base = process.env.REACT_APP_API_URL || '';
      const response = await fetch(`${base}/api/cars`);
      if (!response.ok) {
        throw new Error('Failed to fetch cars');
      }
      const data = await response.json();
      set({ cars: data, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  setSelectedCar: (car) => {
    set({ selectedCar: car, carReviews: [] });
  },

  // Fetch reviews for a specific car
  fetchCarReviews: async (carId) => {
    set({ reviewsLoading: true });
    try {
      const base = process.env.REACT_APP_API_URL || '';
      const response = await fetch(`${base}/api/reviews/${carId}`);
      if (!response.ok) throw new Error('Failed to fetch reviews');
      const data = await response.json();
      set({ carReviews: data, reviewsLoading: false });
    } catch (error) {
      console.error(error);
      set({ reviewsLoading: false });
    }
  },

  // Submit a new review
  submitReview: async (carId, rating, comment, userName, token) => {
    try {
      const actualToken = token || (auth.currentUser ? await auth.currentUser.getIdToken() : '');
      const base = process.env.REACT_APP_API_URL || '';
      const response = await fetch(`${base}/api/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${actualToken}`,
        },
        body: JSON.stringify({ carId, rating, comment, userName }),
      });
      if (!response.ok) throw new Error('Failed to submit review');
      const newReview = await response.json();
      set((state) => ({ carReviews: [newReview, ...state.carReviews] }));
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  },

  // Create a new car
  createCar: async (carData, token) => {
    try {
      const actualToken = token || (auth.currentUser ? await auth.currentUser.getIdToken() : '');
      const base = process.env.REACT_APP_API_URL || '';
      const response = await fetch(`${base}/api/cars`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${actualToken}`,
        },
        body: JSON.stringify(carData),
      });
      if (!response.ok) throw new Error('Failed to create car');
      const newCar = await response.json();
      set((state) => ({ cars: [...state.cars, newCar] }));
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  },

  // Update an existing car
  updateCar: async (id, carData, token) => {
    try {
      const actualToken = token || (auth.currentUser ? await auth.currentUser.getIdToken() : '');
      const base = process.env.REACT_APP_API_URL || '';
      const response = await fetch(`${base}/api/cars/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${actualToken}`,
        },
        body: JSON.stringify(carData),
      });
      if (!response.ok) throw new Error('Failed to update car');
      const updatedCar = await response.json();
      set((state) => ({
        cars: state.cars.map((c) => (c.id === id ? updatedCar : c)),
      }));
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  },

  // Delete a car
  deleteCar: async (id, token) => {
    try {
      const actualToken = token || (auth.currentUser ? await auth.currentUser.getIdToken() : '');
      const base = process.env.REACT_APP_API_URL || '';
      const response = await fetch(`${base}/api/cars/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${actualToken}`,
        },
      });
      if (!response.ok) throw new Error('Failed to delete car');
      set((state) => ({
        cars: state.cars.filter((c) => c.id !== id),
      }));
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  },
}));

export default useCarStore;
