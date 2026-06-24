import '../config/env.js';
import { getFirestore, getAuth } from '../config/firebase.js';

const email = process.argv[2];

if (!email) {
  console.error('Please provide an email address. Example: node src/scripts/makeAdmin.js user@example.com');
  process.exit(1);
}

const run = async () => {
  try {
    const auth = getAuth();
    const db = getFirestore();

    console.log(`Searching for user with email: ${email}...`);
    const userRecord = await auth.getUserByEmail(email);
    const uid = userRecord.uid;
    console.log(`Found user: ${uid}`);

    // 1. Set Firebase Custom Claim role = admin
    await auth.setCustomUserClaims(uid, { role: 'admin' });
    console.log('Set custom claim role=admin in Firebase Auth.');

    // 2. Set Firestore document isAdmin = true
    await db.collection('users').doc(uid).set({
      isAdmin: true,
      email: email,
    }, { merge: true });
    console.log('Set isAdmin=true in Firestore.');

    console.log('Success! This user is now a verified admin.');
    process.exit(0);
  } catch (error) {
    console.error('Error making user admin:', error.message);
    process.exit(1);
  }
};

run();
