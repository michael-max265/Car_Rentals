import { getAuth, getFirestore } from '../config/firebase.js';

const auth = getAuth();
const db = getFirestore();

export const createUser = async (req, res) => {
  try {
    const { uid, email, name, phone } = req.body;
    
    if (!uid) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    // Store additional user info in Firestore
    await db.collection('users').doc(uid).set({
      email,
      name: name || '',
      phone: phone || '',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    res.status(201).json({ uid, email, name });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getUser = async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await db.collection('users').doc(id).get();
    if (!doc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ id: doc.id, ...doc.data() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    await db.collection('users').doc(id).set({
      ...req.body,
      updatedAt: new Date(),
    }, { merge: true });
    res.json({ id, ...req.body });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
