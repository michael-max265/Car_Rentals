// Car model/schema definition
export const CarModel = {
  id: '',
  name: '',
  brand: '',
  model: '',
  year: 0,
  description: '',
  pricePerDay: 0,
  image: '',
  color: '',
  fuelType: '',
  transmission: '',
  seats: 0,
  available: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

// Booking model/schema definition
export const BookingModel = {
  id: '',
  userId: '',
  carId: '',
  startDate: new Date(),
  endDate: new Date(),
  insuranceType: 'basic', // basic, standard, premium
  insuranceCost: 0,
  totalPrice: 0,
  status: 'pending', // pending, confirmed, cancelled, completed
  createdAt: new Date(),
  updatedAt: new Date(),
};

// User model/schema definition
export const UserModel = {
  id: '',
  email: '',
  name: '',
  phone: '',
  address: '',
  licenseNumber: '',
  createdAt: new Date(),
  updatedAt: new Date(),
};
