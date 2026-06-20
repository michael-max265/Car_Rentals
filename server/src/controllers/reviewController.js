import { getFirestore } from '../config/firebase.js';

const db = getFirestore();

export const addReview = async (req, res) => {
  try {
    const { carId, rating, comment, userName } = req.body;
    const userId = req.user.uid; // from verifyToken

    if (!carId || !rating) {
      return res.status(400).json({ error: 'Car ID and rating are required' });
    }

    const docRef = await db.collection('reviews').add({
      carId,
      userId,
      userName: userName || 'Anonymous',
      rating: Number(rating),
      comment: comment || '',
      createdAt: new Date().toISOString(),
    });

    res.status(201).json({ 
      id: docRef.id, 
      carId, 
      userId, 
      userName: userName || 'Anonymous', 
      rating: Number(rating), 
      comment: comment || '',
      createdAt: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getCarReviews = async (req, res) => {
  try {
    const { carId } = req.params;
    
    // In Firestore, if we need to query and orderBy different fields, we might need an index.
    // To keep it simple for now, we'll fetch and sort in memory if the dataset is small,
    // or just fetch by carId and let the client sort it.
    const snapshot = await db.collection('reviews')
      .where('carId', '==', carId)
      .get();
      
    const reviews = [];
    snapshot.forEach(doc => {
      reviews.push({ id: doc.id, ...doc.data() });
    });
    
    // Sort descending by date
    reviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
