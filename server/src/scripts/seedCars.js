import dotenv from 'dotenv';
import { initializeFirebase, getFirestore } from '../config/firebase.js';

dotenv.config();

// Initialize Firebase
initializeFirebase();

const db = getFirestore();

const carsData = [
  {
    name: 'Tesla Model 3',
    price: '$120/day',
    color: '#e2e8f0',
    image: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?w=800&q=80',
    description: 'The Tesla Model 3 is a fully electric sedan with autopilot capability and up to 358 miles of range. Features include a minimalist interior, 15-inch touchscreen, over-the-air software updates, and lightning-fast 0–60 mph in 3.1 seconds.',
    specs: { seats: 5, fuel: 'Electric', range: '358 miles', transmission: 'Automatic' },
  },
  {
    name: 'BMW M3',
    price: '$150/day',
    color: '#1e293b',
    image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&q=80',
    description: 'The BMW M3 Competition is a high-performance sports sedan powered by a 3.0L twin-turbo inline-6 producing 503 hp. Rear-wheel drive, 8-speed M Steptronic transmission, and adaptive M suspension deliver an electrifying driving experience.',
    specs: { seats: 5, fuel: 'Petrol', range: '400 miles', transmission: 'Automatic' },
  },
  {
    name: 'Ford Mustang GT',
    price: '$130/day',
    color: '#dc2626',
    image: 'https://images.unsplash.com/photo-1584345604476-8ec5e12e42dd?w=800&q=80',
    description: 'The Ford Mustang GT is an iconic American muscle car with a 5.0L V8 engine producing 450 hp and a spine-tingling exhaust note. Features include launch control, digital cluster, and SYNC 4.',
    specs: { seats: 4, fuel: 'Petrol', range: '380 miles', transmission: 'Manual / Auto' },
  },
  {
    name: 'Toyota Camry',
    price: '$50/day',
    color: '#2563eb',
    image: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800&q=80',
    description: 'The Toyota Camry XSE is a refined full-size sedan renowned for its reliability and comfort. Powered by a 2.5L 4-cylinder, it offers an 8-inch infotainment display and Toyota Safety Sense.',
    specs: { seats: 5, fuel: 'Petrol', range: '500 miles', transmission: 'Automatic' },
  },
  {
    name: 'Honda Civic',
    price: '$45/day',
    color: '#16a34a',
    image: 'https://images.unsplash.com/photo-1590362891991-f776e747a588?w=800&q=80',
    description: 'The Honda Civic Sport is a sporty and fuel-efficient compact car with a turbocharged 1.5L engine. Excellent city and motorway performance with comfortable seating.',
    specs: { seats: 5, fuel: 'Petrol', range: '420 miles', transmission: 'CVT' },
  },
  {
    name: 'Toyota Prius',
    price: '$40/day',
    color: '#7c3aed',
    image: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800&q=80',
    description: 'The Toyota Prius Prime is the world\'s best-selling hybrid, achieving outstanding fuel economy. Features Toyota Safety Sense, a multimedia screen, and zero guilt.',
    specs: { seats: 5, fuel: 'Hybrid', range: '600 miles', transmission: 'CVT' },
  },
  {
    name: 'Porsche 911 Carrera',
    price: '$250/day',
    color: '#fbbf24',
    image: 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?w=800&q=80',
    description: 'The Porsche 911 Carrera is the gold standard for performance sports cars. Featuring a twin-turbo flat-six engine and the legendary PDK transmission, it offers peerless handling and style.',
    specs: { seats: 4, fuel: 'Petrol', range: '320 miles', transmission: 'Automatic' },
  },
  {
    name: 'Audi R8 V10',
    price: '$300/day',
    color: '#94a3b8',
    image: 'https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?w=800&q=80',
    description: 'The Audi R8 is a mid-engine supercar powered by a screaming 5.2L V10 engine. Coupled with Quattro all-wheel drive, it delivers massive grip and dramatic performance.',
    specs: { seats: 2, fuel: 'Petrol', range: '280 miles', transmission: 'Automatic' },
  },
  {
    name: 'Mercedes-Benz AMG GT',
    price: '$280/day',
    color: '#0f172a',
    image: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&q=80',
    description: 'The Mercedes-AMG GT combines racetrack performance with grand touring comfort. Handcrafted 4.0L twin-turbo V8 engine, rear-wheel drive, and custom driving dynamics.',
    specs: { seats: 2, fuel: 'Petrol', range: '310 miles', transmission: 'Automatic' },
  },
  {
    name: 'Nissan GT-R',
    price: '$220/day',
    color: '#64748b',
    image: 'https://images.unsplash.com/photo-1563720223185-11003d516935?w=800&q=80',
    description: 'Nicknamed "Godzilla", the Nissan GT-R offers raw twin-turbo V6 power and advanced all-wheel drive systems. Accelerates 0-60 in under 3 seconds with absolute control.',
    specs: { seats: 4, fuel: 'Petrol', range: '300 miles', transmission: 'Automatic' },
  },
  {
    name: 'Chevrolet Corvette C8',
    price: '$180/day',
    color: '#ea580c',
    image: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&q=80',
    description: 'The mid-engine Chevrolet Corvette C8 Stingray reimagines American performance. A naturally aspirated 6.2L V8 sits behind the driver, producing 495 horsepower.',
    specs: { seats: 2, fuel: 'Petrol', range: '350 miles', transmission: 'Automatic' },
  },
  {
    name: 'Lamborghini Huracán',
    price: '$450/day',
    color: '#84cc16',
    image: 'https://images.unsplash.com/photo-1525609004556-c46c7d6cf0a3?w=800&q=80',
    description: 'An exotic Italian masterpiece powered by a naturally aspirated V10. The Huracán delivers emotional styling, active aerodynamics, and an auditory experience like no other.',
    specs: { seats: 2, fuel: 'Petrol', range: '260 miles', transmission: 'Automatic' },
  },
  {
    name: 'Land Rover Defender',
    price: '$160/day',
    color: '#14532d',
    image: 'https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=800&q=80',
    description: 'Capable of conquering any terrain, the Defender is an iconic 4x4. Features rugged luxury, electronic air suspension, and advanced off-road camera suites.',
    specs: { seats: 5, fuel: 'Diesel', range: '450 miles', transmission: 'Automatic' },
  },
  {
    name: 'Jeep Wrangler Rubicon',
    price: '$110/day',
    color: '#eab308',
    image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&q=80',
    description: 'The ultimate open-air adventure vehicle. Featuring heavy-duty axles, front/rear lockers, and standard 4WD, it is ready to explore trails or city streets.',
    specs: { seats: 5, fuel: 'Petrol', range: '340 miles', transmission: 'Manual / Auto' },
  },
  {
    name: 'Range Rover Sport',
    price: '$190/day',
    color: '#ffffff',
    image: 'https://images.unsplash.com/photo-1506015391300-4802dc74de2e?w=800&q=80',
    description: 'The Range Rover Sport delivers dynamic on-road performance alongside world-class refinement. Features semi-aniline leather seating and premium sound systems.',
    specs: { seats: 5, fuel: 'Diesel', range: '480 miles', transmission: 'Automatic' },
  },
  {
    name: 'Aston Martin Vantage',
    price: '$290/day',
    color: '#064e3b',
    image: 'https://images.unsplash.com/photo-1600706432502-75a0e2b74859?w=800&q=80',
    description: 'A British sports car defined by dramatic proportions and sensory intensity. Equipped with a AMG-sourced 4.0L twin-turbo V8, it offers pure visceral thrill.',
    specs: { seats: 2, fuel: 'Petrol', range: '330 miles', transmission: 'Automatic' },
  },
  {
    name: 'Ferrari F8 Tributo',
    price: '$500/day',
    color: '#b91c1c',
    image: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800&q=80',
    description: 'The Ferrari F8 Tributo pays homage to the most powerful V8 in Ferrari history. 710 hp, twin-turbocharged, zero turbo lag, and pure F1-derived driving dynamics.',
    specs: { seats: 2, fuel: 'Petrol', range: '270 miles', transmission: 'Automatic' },
  },
  {
    name: 'Subaru WRX STI',
    price: '$90/day',
    color: '#1d4ed8',
    image: 'https://images.unsplash.com/photo-1607603750909-408e19385117?w=800&q=80',
    description: 'A rally-bred sedan featuring Subaru\'s symmetrical all-wheel drive, a turbocharged boxer engine, and a 6-speed manual. Unmatched all-weather sport performance.',
    specs: { seats: 5, fuel: 'Petrol', range: '360 miles', transmission: 'Manual' },
  },
  {
    name: 'Tesla Model S Plaid',
    price: '$170/day',
    color: '#7f1d1d',
    image: 'https://images.unsplash.com/photo-1614200179396-2bab57ef3301?w=800&q=80',
    description: 'Boasting tri-motor all-wheel drive and over 1,020 horsepower, the Model S Plaid accelerates 0-60 in 1.99 seconds. The pinnacle of electric sedan range and speed.',
    specs: { seats: 5, fuel: 'Electric', range: '396 miles', transmission: 'Automatic' },
  },
  {
    name: 'Lexus LC 500',
    price: '$180/day',
    color: '#701a75',
    image: 'https://images.unsplash.com/photo-1617531653332-bd46c24f2068?w=800&q=80',
    description: 'A striking luxury coupe powered by a naturally aspirated 5.0L V8 engine. Offers an unmatched blend of design details, cabin luxury, and smooth linear power.',
    specs: { seats: 4, fuel: 'Petrol', range: '380 miles', transmission: 'Automatic' },
  },
];

const seedCars = async () => {
  try {
    console.log('Clearing existing cars...');
    const snapshot = await db.collection('cars').get();
    
    // Batch delete
    const batch = db.batch();
    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });
    await batch.commit();

    console.log('Seeding new cars...');
    // Seed new data
    for (const car of carsData) {
      await db.collection('cars').add({
        ...car,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    console.log('Cars seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding cars:', error);
    process.exit(1);
  }
};

seedCars();
