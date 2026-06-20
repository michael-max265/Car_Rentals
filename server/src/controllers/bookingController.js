import { getFirestore } from '../config/firebase.js';
import { sendBookingConfirmation } from '../utils/emailService.js';

const db = getFirestore();

export const createBooking = async (req, res) => {
  try {
    const { userId, carId, startDate, endDate, insuranceType, insuranceCost, totalPrice, paymentIntentId, paymentProvider } = req.body;
    const docRef = await db.collection('bookings').add({
      userId,
      carId,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      insuranceType: insuranceType || 'basic',
      insuranceCost: insuranceCost || 0,
      totalPrice,
      paymentIntentId: paymentIntentId || null,
      paymentProvider: paymentProvider || 'stripe',
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    try {
      const userDoc = await db.collection('users').doc(userId).get();
      const carDoc = await db.collection('cars').doc(carId).get();
      
      if (userDoc.exists && carDoc.exists) {
        const userEmail = userDoc.data().email;
        const carDetails = carDoc.data();
        
        sendBookingConfirmation(
          userEmail, 
          { startDate, endDate, totalPrice }, 
          carDetails
        );
      }
    } catch (emailError) {
      console.error("Error fetching details for email confirmation:", emailError);
    }

    res.status(201).json({ id: docRef.id, ...req.body });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getBookings = async (req, res) => {
  try {
    const { userId } = req.query;
    let query = db.collection('bookings');
    if (userId) {
      query = query.where('userId', '==', userId);
    }
    const snapshot = await query.get();
    const bookings = [];
    snapshot.forEach(doc => {
      bookings.push({ id: doc.id, ...doc.data() });
    });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;
    await db.collection('bookings').doc(id).update({
      status: 'cancelled',
      updatedAt: new Date(),
    });
    res.json({ message: 'Booking cancelled successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    await db.collection('bookings').doc(id).update({
      status,
      updatedAt: new Date(),
    });
    res.json({ message: 'Booking status updated successfully', status });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Returns only date ranges for a specific car — used by booking calendar
export const getBookingsByCarId = async (req, res) => {
  try {
    const { carId } = req.params;
    const snapshot = await db
      .collection('bookings')
      .where('carId', '==', carId)
      .where('status', '!=', 'cancelled')
      .get();

    const ranges = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      ranges.push({
        startDate: data.startDate?.toDate?.() ?? data.startDate,
        endDate: data.endDate?.toDate?.() ?? data.endDate,
      });
    });
    res.json(ranges);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
