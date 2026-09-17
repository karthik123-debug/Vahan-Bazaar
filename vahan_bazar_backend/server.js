const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = process.env.PORT || 10000;

// ▼▼▼ REPLACE <db_password> WITH YOUR REAL PASSWORD HERE ▼▼▼
const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://royalsaireddy494_db_user:SAVANAM BRO@vahanbazarcluster.nql2ntr.mongodb.net/?appName=VahanBazarCluster';

// --- Middleware ---
app.use(cors());
app.use(express.json());

// --- Model Variables ---
// These will hold your Mongoose schemas
let Bike, Showroom, UpcomingBike, Service, BlogPost, SellStep, FinanceOption, User, HeroSlide;

// --- Attempt to Import Models ---
try {
  Bike = require('./models/Bike');
  Showroom = require('./models/Showroom');
  UpcomingBike = require('./models/UpcomingBike');
  Service = require('./models/Service');
  BlogPost = require('./models/BlogPost');
  SellStep = require('./models/SellStep');
  FinanceOption = require('./models/FinanceOption');
  User = require('./models/User');
  HeroSlide = require('./models/HeroSlide'); // Added model for hero slides
} catch (error) {
  console.warn('⚠️ WARNING: Model imports failed. API routes may not work.', error.message);
  console.warn('Please ensure all model files (e.g., \'./models/Bike.js\') exist.');
}

// --- DATA ARRAYS (For first-time database population) ---

const sampleBikes = [
  { id: 1, title: 'TVS Rider 125cc', brand: 'TVS', price: 80800, km: 56, fuel: 'Petrol', img: 'https://cdn.bikedekho.com/processedimages/tvs/raider/source/raider68b7fd149e32c.jpg?imwidth=412&impolicy=resize', location: 'Bengaluru, KA', condition: 'New', year: 2025, specs: { engine: '124.8 cc', power: '11.38 PS', mileage: '57', brakes: 'Disc' } },
  // ... all other bike data ...
];

const upcomingBikesData = [
  { id: 101, title: 'Vida V2', brand: 'Hero Vida', img: 'https://cdn.bikedekho.com/processedimages/vida/vx2/source/vx268d1139c16533.jpg?imwidth=400&impolicy=resize', launchStatus: 'Coming Soon...' },
  // ... all other upcoming bike data ...
];

const showroomsData = [
  { id: 201, name: 'Guntur Bajaj Auto', city: 'Guntur', address: '4/1, Arundelpet, Guntur, Andhra Pradesh 522002', phone: '0863-222-1111', brands: ['Bajaj'], mapUrl: 'https://www.google.com/maps/search/?api=1&query=Guntur+Bajaj+Auto', imageUrl: 'https://content.jdmagicbox.com/comp/krishna/c6/9999p8676.8676.171224121801.w9c6/catalogue/varun-bajaj-tiruvuru-krishna-car-dealers-fojpfw1uzm.jpg' },
  // ... all other showroom data ...
];

const heroSlidesData = [
  { imageUrl: 'https://content.jdmagicbox.com/comp/krishna/c6/9999p8676.8676.171224121801.w9c6/catalogue/varun-bajaj-tiruvuru-krishna-car-dealers-fojpfw1uzm.jpg', title: 'Authorised Dealers You Can Trust', subtitle: 'Find certified showrooms for all major brands near you.' },
  // ... all other slide data ...
];

const servicesData = [
  { id: 's1', title: 'Bike Servicing', description: 'Get your bike serviced by certified mechanics at the best prices.' },
  // ... all other service data ...
];

const blogPostsData = [
  { id: 'b1', title: 'Top 5 Commuter Bikes for 2025', excerpt: 'We review the most fuel-efficient and reliable commuter bikes available in India right now.', imageUrl: 'https://cdn.bikedekho.com/processedimages/hero/glamour-xtec-2-0/source/glamour-xtec-2-068a5658fc6c3b.jpg?imwidth=408&impolicy=resize', category: 'Reviews', date: 'Oct 25, 2025' },
  // ... all other blog post data ...
];

const sellBikeStepsData = [
  { id: 'sb1', title: '1. Submit Details', description: 'Fill out a simple form with your bike\'s model, year, and condition.' },
  // ... all other sell step data ...
];

const financeOptionsData = [
  { id: 'f1', title: 'Zero Down Payment', description: 'Ride home your dream bike with no upfront payment. Available on select models.' },
  // ... all other finance data ...
];

const testUserData = {
  name: 'Test Admin',
  email: 'admin@test.com',
  password: 'password123',
};


// --- Database Population Function ---
const populateDatabase = async () => {
  try {
    console.log('Checking database population...');
    
    // Helper function to populate a collection
    const populate = async (model, data, name) => {
      if (model && (await model.countDocuments()) === 0 && data.length > 0) {
        await model.insertMany(data);
        console.log(`✅ ${name} populated`);
      }
    };

    // Populate all collections
    await populate(Bike, sampleBikes, 'Bikes');
    await populate(UpcomingBike, upcomingBikesData, 'Upcoming Bikes');
    await populate(Showroom, showroomsData, 'Showrooms');
    await populate(HeroSlide, heroSlidesData, 'Hero Slides');
    await populate(Service, servicesData, 'Services');
    await populate(BlogPost, blogPostsData, 'Blog Posts');
    await populate(SellStep, sellBikeStepsData, 'Sell Steps');
    await populate(FinanceOption, financeOptionsData, 'Finance Options');

    // Create initial User if empty
    if (User && (await User.countDocuments()) === 0) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(testUserData.password, salt);
      await User.create({
        name: testUserData.name,
        email: testUserData.email,
        password: hashedPassword,
      });
      console.log(`✅ Initial user (${testUserData.email}) created.`);
    }

    console.log('Database initialization check complete.');
  } catch (err) {
    console.error('❌ Population error:', err.message);
  }
};

// --- Connect to MongoDB ---
mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    // Once connected, check if database needs to be populated
    populateDatabase();
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
    console.error('---');
    console.error('Common fixes:');
    console.error('1. Did you replace "<db_password>" with your real password?');
    console.error('2. Did you whitelist your IP address in MongoDB Atlas? (Network Access > 0.0.0.0/0)');
    console.error('---');
  });

// --- API ROUTES ---

// Helper function for creating routes
const createApiRoute = (app, path, model) => {
  app.get(path, async (req, res) => {
    try {
      if (!model) {
        return res.status(500).json({ message: `Model for ${path} not loaded.` });
      }
      const data = await model.find({});
      res.json(data);
    } catch (err) {
      console.error(`Error in ${path} route:`, err.message);
      res.status(500).json({ message: `Error fetching data for ${path}.` });
    }
  });
};

// Create all API endpoints
createApiRoute(app, '/api/bikes', Bike);
createApiRoute(app, '/api/upcoming-bikes', UpcomingBike);
createApiRoute(app, '/api/showrooms', Showroom);
createApiRoute(app, '/api/hero-slides', HeroSlide);
createApiRoute(app, '/api/services', Service);
createApiRoute(app, '/api/blog-posts', BlogPost);
createApiRoute(app, '/api/sell-steps', SellStep);
createApiRoute(app, '/api/finance-options', FinanceOption);

// Root endpoint for checking server status
app.get('/', (req, res) => {
    res.send('Vahan Bazar API is running and connected to MongoDB!');
});

// --- Attempt to Import Auth Routes ---
try {
  const AuthRoutes = require('./routes/auth');
  const UserRoutes = require('./routes/user');
  app.use('/api/auth', AuthRoutes);
  app.use('/api/users', UserRoutes);
  console.log('✅ Auth and User routes loaded.');
} catch (err) {
  console.warn('⚠️ Auth/User route files missing or invalid:', err.message);
}

// --- Start Server ---
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});