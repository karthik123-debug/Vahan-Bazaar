import React, { useState, useEffect, useRef } from 'react'; 

// --- GLOBAL HELPER FUNCTION ---
const formatPrice = (n) => {
  if (typeof n !== 'number' || isNaN(n)) {
    return '₹ --'; 
  }
  return n.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });
};

// --- CALCULATOR FUNCTIONS ---
const calculateEMI = (principal, annualInterestRate, tenureYears) => {
  if (principal <= 0 || annualInterestRate < 0 || tenureYears <= 0) {
    return 0;
  }
  const monthlyInterestRate = annualInterestRate / 12 / 100;
  const numberOfPayments = tenureYears * 12;

  if (monthlyInterestRate === 0) { 
    return principal / numberOfPayments;
  }

  const emi = principal * monthlyInterestRate * Math.pow(1 + monthlyInterestRate, numberOfPayments) / (Math.pow(1 + monthlyInterestRate, numberOfPayments) - 1);
  return emi;
};

const calculateFuelCost = (mileage, dailyCommuteKm, petrolPricePerLiter) => {
    const validMileage = typeof mileage === 'number' && mileage > 0 ? mileage : (typeof mileage === 'string' && parseFloat(mileage) > 0 ? parseFloat(mileage) : 0);

    if (validMileage <= 0 || dailyCommuteKm < 0 || petrolPricePerLiter < 0) {
        return 0;
    }
    const monthlyCommuteKm = dailyCommuteKm * 30; 
    const litersNeeded = monthlyCommuteKm / validMileage;
    const monthlyCost = litersNeeded * petrolPricePerLiter;
    return monthlyCost;
};


// --- DATA ARRAYS ---
const sampleBikes = [
  { id: 1, title: 'TVS Rider 125cc', brand: 'TVS', price: 80800, km: 56, fuel: 'Petrol', img: 'https://cdn.bikedekho.com/processedimages/tvs/raider/source/raider68b7fd149e32c.jpg?imwidth=412&impolicy=resize', location: 'Bengaluru, KA', condition: 'New', year: 2025, specs: { engine: '124.8 cc', power: '11.38 PS', mileage: '57', brakes: 'Disc' } },
  { id: 2, title: 'Kawasaki Ninja ZX 10R', brand: 'Kawasaki', price: 2079000, km: 12, fuel: 'Petrol', img: 'https://5.imimg.com/data5/HQ/VH/GLADMIN-49131536/kawasaki-ninja-zx-10r-500x500.png', location: 'Hyderabad, TS', condition: 'Used', year: 2023, specs: { engine: '998 cc', power: '203 PS', mileage: '12', brakes: 'Double Disc' } },
  { id: 3, title: 'Yamaha MT 15 V2', brand: 'Yamaha', price: 168400, km: 45, fuel: 'Petrol', img: 'https://images.91wheels.com/assets/b_images/main/models/profile/profile1754040349.jpg?w=840&q=50', location: 'Chennai, TN', condition: 'New', year: 2025, specs: { engine: '155 cc', power: '18.4 PS', mileage: '48', brakes: 'Disc' } },
  { id: 4, title: 'Honda Unicorn 160', brand: 'Honda', price: 110000, km: 60, fuel: 'Petrol', img: 'https://tse1.mm.bing.net/th/id/OIP.ydmPvg8KjPTYccBevFKgggAAAA?rs=1&pid=ImgDetMain&o=7&rm=3', location: 'Mumbai, MH', condition: 'New', year: 2024, specs: { engine: '162.7 cc', power: '12.91 PS', mileage: '60', brakes: 'Disc' } },
  { id: 5, title: 'Yamaha FZ-X', brand: 'Yamaha', price: 115000, km: 48, fuel: 'Petrol', img: 'https://images.91wheels.com/assets/b_images/main/models/profile/profile1750156925.jpg?w=840&q=50', location: 'Delhi, DL', condition: 'Used', year: 2022, specs: { engine: '149 cc', power: '12.4 PS', mileage: '45', brakes: 'Disc' } },
  { id: 6, title: 'Royal Enfield Classic 350', brand: 'Royal Enfield', price: 225000, km: 35, fuel: 'Petrol', img: 'https://imgd.aeplcdn.com/664x374/n/cw/ec/183389/classic-350-right-front-three-quarter-2.jpeg?isig=0&q=80', location: 'Pune, MH', condition: 'New', year: 2025, specs: { engine: '349 cc', power: '20.2 PS', mileage: '35', brakes: 'Double Disc' } },
  { id: 7, title: 'Bajaj Pulsar 150', brand: 'Bajaj', price: 125000, km: 48, fuel: 'Petrol', img: 'https://images.91wheels.com/assets/b_images/main/models/profile/profile1749637440.jpg?w=530&q=50', location: 'Kolkata, WB', condition: 'Used', year: 2023, specs: { engine: '149.5 cc', power: '14 PS', mileage: '47', brakes: 'Disc' } },
  { id: 8, title: 'Apache RTR 160', brand: 'TVS', price: 135900, km: 45, fuel: 'Petrol', img: 'https://www.tvsmotor.com/tvs-apache/-/media/Brand-Pages/Apache/Apache-RTR/Apache-RTR-180/08-09-22/webp-images/New-race.webp', location: 'Chennai, TN', condition: 'New', year: 2025, specs: { engine: '159.7 cc', power: '16.04 PS', mileage: '45', brakes: 'Disc' } },
  { id: 9, title: 'Hero Glamour X', brand: 'Hero', price: 90000, km: 65, fuel: 'Petrol', img: 'https://cdn.bikedekho.com/processedimages/hero/glamour-xtec-2-0/source/glamour-xtec-2-068a5658fc6c3b.jpg?imwidth=408&impolicy=resize', location: 'Bengaluru, KA', condition: 'Used', year: 2022, specs: { engine: '124.7 cc', power: '10.87 PS', mileage: '55', brakes: 'Drum' } },
  { id: 10, title: 'KTM Duke 200', brand: 'KTM', price: 210000, km: 30, fuel: 'Petrol', img: 'https://imgd.aeplcdn.com/1280x720/n/cw/ec/1/versions/ktm-duke-200-standard1732631072395.jpg', location: 'Mumbai, MH', condition: 'New', year: 2025, specs: { engine: '199.5 cc', power: '25 PS', mileage: '33', brakes: 'Disc' } }
];

const upcomingBikes = [
  { id: 101, title: 'Vida V2', brand: 'Hero Vida', img: 'https://cdn.bikedekho.com/processedimages/vida/vx2/source/vx268d1139c16533.jpg?imwidth=400&impolicy=resize', launchStatus: 'Coming Soon...' },
  { id: 102, title: 'Honda CB350', brand: 'Honda', img: 'https://cdn.bikedekho.com/processedimages/honda/cb350-babt/source/cb350-babt68ce3cbd40d96.jpg?imwidth=400&impolicy=resize', launchStatus: 'Coming Soon...' },
  { id: 103, title: 'KTM 390 SMC R', brand: 'KTM', img: 'https://cdn.bikedekho.com/processedimages/ktm/390-smc-r/source/390-smc-r6788e6e2096b0.jpg?imwidth=400&impolicy=resize', launchStatus: 'Coming Soon...' },
  { id: 104, title: 'Continental GT 650', brand: 'Royal Enfield', img: 'https://cdn.bikedekho.com/processedimages/royal-enfield/continental-gt-650/source/continental-gt-65068d29dc6b36fa.jpg?imwidth=400&impolicy=resize', launchStatus: 'Coming Soon...' },
  { id: 105, title: 'Kawasaki Vulcan S', brand: 'Kawasaki', img: 'https://cdn.bikedekho.com/processedimages/kawasaki/kawasaki-vulcan-s/source/kawasaki-vulcan-s674063fadb112.jpg?imwidth=400&impolicy=resize', launchStatus: 'Coming Soon...' },
  { id: 106, title: 'Benelli 752 S', brand: 'Benelli', img: 'https://cdn.bikedekho.com/processedimages/benelli/752-s/640X309/v_752-s-std1533712755.jpg', launchStatus: 'Coming Soon...' },
  { id: 107, title: 'Yamaha R15 V4', brand: 'Yamaha', img: 'https://cdn.bikedekho.com/processedimages/yamaha/r15-v4/source/r15-v468bbb605ad77f.jpg?imwidth=400&impolicy=resize', launchStatus: 'Coming Soon...' },
];

const showroomsData = [
  { id: 201, name: 'Guntur Bajaj Auto', city: 'Guntur', address: '4/1, Arundelpet, Guntur, Andhra Pradesh 522002', phone: '0863-222-1111', brands: ['Bajaj'], mapUrl: 'https://www.google.com/maps/search/?api=1&query=Guntur+Bajaj+Auto', imageUrl: 'https://content.jdmagicbox.com/comp/krishna/c6/9999p8676.8676.171224121801.w9c6/catalogue/varun-bajaj-tiruvuru-krishna-car-dealers-fojpfw1uzm.jpg', rating: 4.2, openingHours: 'Mon-Sat: 9 AM - 7 PM' },
  { id: 202, name: 'Silicon Valley Royal Enfield', city: 'Bengaluru', address: '100, MG Road, Ashok Nagar, Bengaluru, Karnataka 560001', phone: '080-4123-4567', brands: ['Royal Enfield'], mapUrl: 'https://www.google.com/maps/search/?api=1&query=Silicon+Valley+Royal+Enfield+Bengaluru', imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQNKf7gvWrWL6cJkqG3rmRTNmQ61teyaFiCNg&s', rating: 4.8, openingHours: 'Mon-Sun: 10 AM - 8 PM' },
  { id: 203, name: 'Marine Drive Multi-Brand', city: 'Mumbai', address: 'Shop No. 5, Sea View, Chowpatty, Mumbai, Maharashtra 400007', phone: '022-2369-8888', brands: ['Yamaha', 'TVS', 'Hero'], mapUrl: 'https://www.google.com/maps/search/?api=1&query=Marine+Drive+Bike+Showroom+Mumbai', imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSwUQnhoOGttWOkOg2Jw-LDdYWpKXXt2iyB1w&s', rating: 4.0, openingHours: 'Mon-Sat: 10 AM - 7 PM' },
  { id: 204, name: 'Hi-Tech EV World', city: 'Hyderabad', address: 'Plot 25, Kavuri Hills, Madhapura, Hyderabad, Telangana 500081', phone: '040-6655-4433', brands: ['Ola', 'Ather', 'Vida'], mapUrl: 'https://www.google.com/maps/search/?api=1&query=Hi-Tech+EV+World+Hyderabad', imageUrl: 'https://www.shaadidukaan.com/user_images/innerSlider_images/default/m/46-m.jpg', rating: 4.5, openingHours: 'Tue-Sun: 11 AM - 8 PM' }
];

const heroSlides = [
  { imageUrl: 'https://content.jdmagicbox.com/comp/krishna/c6/9999p8676.8676.171224121801.w9c6/catalogue/varun-bajaj-tiruvuru-krishna-car-dealers-fojpfw1uzm.jpg', title: 'Authorised Dealers You Can Trust', subtitle: 'Find certified showrooms for all major brands near you.' },
  { imageUrl: 'https://img.indianautosblog.com/2015/10/Royal-Enfield-Madrid-Exclusive-Store-official.jpg', title: 'Explore Premium Showrooms', subtitle: 'Experience the best bikes in a world-class environment.' },
  { imageUrl: 'https://www.shutterstock.com/image-photo/helsinki-finlandcirca-apr-2018-new-600nw-1664157934.jpg', title: 'The Future is Electric', subtitle: 'Browse the latest range of electric scooters and motorcycles.' },
  { imageUrl: 'https://content.jdmagicbox.com/v2/comp/delhi/a7/011pxx11.xx11.101125200718.c2a7/catalogue/dwarka-suzuki-mahavir-enclave-delhi-scooter-dealers-honda-activa-qqxcxprb6u.jpg', title: 'Service, Spares, and More', subtitle: 'Your one-stop shop for maintenance and accessories.' }
];

const servicesData = [
  { id: 's1', title: 'Bike Servicing', description: 'Get your bike serviced by certified mechanics.', icon: '<svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>' },
  { id: 's2', title: 'Two-Wheeler Insurance', description: 'Compare and buy insurance plans instantly.', icon: '<svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>' },
  { id: 's3', title: 'Roadside Assistance', description: 'Get 24/7 help for breakdowns and flat tires.', icon: '<svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10l2-2h8zM18 8h2l-3 5h-3l3-5z" /></svg>' },
  { id: 's4', title: 'Used Bike Inspection', description: 'Verify the condition of any used bike.', icon: '<svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>' }
];

const blogPostsData = [
  { id: 'b1', title: 'Top 5 Commuter Bikes for 2025', excerpt: 'Reliable and fuel-efficient choices for your daily ride.', imageUrl: 'https://cdn.bikedekho.com/processedimages/hero/glamour-xtec-2-0/source/glamour-xtec-2-068a5658fc6c3b.jpg?imwidth=408&impolicy=resize', category: 'Reviews', date: 'Oct 25, 2025' },
  { id: 'b2', title: 'Motorcycle Maintenance Basics', excerpt: 'Keep your bike in top condition with these simple checks.', imageUrl: 'https://images.unsplash.com/photo-1568981440156-c73b0a9f6ad0?w=500&q=80', category: 'Tips', date: 'Oct 22, 2025' },
  { id: 'b3', title: 'Yamaha MT 15 V2: Street King?', excerpt: 'A deep dive into the performance and features.', imageUrl: 'https://images.91wheels.com/assets/b_images/main/models/profile/profile1754040349.jpg?w=840&q=50', category: 'Reviews', date: 'Oct 20, 2025' }
];

const sellBikeStepsData = [
  { id: 'sb1', title: '1. Submit Details', description: 'Fill a simple form with bike details.', icon: '<svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>' },
  { id: 'sb2', title: '2. Get Instant Quote', description: 'Fair market price in seconds.', icon: '<svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 7h6m0 10v-3m-3 3h3m-3-10h3m-3 4h3m-6.002 6a2.002 2.002 0 11-.004-4.004A2.002 2.002 0 018.998 17zM15 17a2 2 0 100-4 2 2 0 000 4z" /></svg>' },
  { id: 'sb3', title: '3. Free Inspection', description: 'Schedule a free doorstep check.', icon: '<svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 16l-4-4m0 0l4-4m-4 4h18" /></svg>' },
  { id: 'sb4', title: '4. Get Paid Instantly', description: 'Accept offer, get paid instantly.', icon: '<svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>' }
];

const financeOptionsData = [
  { id: 'f1', title: 'Zero Down Payment', description: 'Ride home your dream bike with no upfront cost.', icon: '<svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01M12 16v-1m0-4v-1m0-4V7m0 1v.01" /></svg>' },
  { id: 'f2', title: 'Low Interest Rates', description: 'Competitive EMI plans from 6.99%.', icon: '<svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 10a1 1 0 11-2 0 1 1 0 012 0zM15 10a1 1 0 11-2 0 1 1 0 012 0zM11 14v-4h2v4h-2z" /></svg>' },
  { id: 'f3', title: 'Quick Loan Approval', description: 'Online approval in under 30 minutes.', icon: '<svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>' }
];

const aboutUsText = `Welcome to Two Wheeler Bike Website, your ultimate destination for buying, selling, and exploring the world of two-wheelers in India. Founded in 2025 in Hyderabad, our mission is to simplify the process of finding the perfect bike, whether it's brand new or pre-loved. We partner with trusted dealers and provide comprehensive tools like EMI calculators, fuel cost estimators, and detailed comparisons to empower your decisions. Our platform also offers essential services like insurance, financing, and maintenance tips through our blog. We're passionate about bikes and dedicated to providing a seamless, transparent, and enjoyable experience for every rider.`;

const contactInfo = {
  phone: '+91 98765 43210',
  email: 'support@twowheelerwebsite.in',
  address: 'Level 5, Tech Tower, Hitec City, Hyderabad, Telangana 500081',
  hours: 'Mon-Sat: 9:00 AM - 6:00 PM'
};

const faqsData = [
  { id: 'faq1', q: 'How do I list my used bike for sale?', a: 'Click on the "Sell Bike" section, fill in your bike\'s details, get an instant quote, schedule a free inspection, and get paid if you accept the offer.' },
  { id: 'faq2', q: 'How is the price for my used bike determined?', a: 'Our pricing algorithm considers the make, model, year, condition, kilometers driven, and current market demand to provide a fair and competitive quote.' },
  { id: 'faq3', q: 'Can I book a test ride through the website?', a: 'Yes! Find the showroom you\'re interested in under the "Showrooms" section and click the "Book Test Ride" button. The showroom will contact you to schedule.' },
  { id: 'faq4', q: 'What finance options are available?', a: 'We partner with various lenders to offer options like zero down payment, low-interest EMIs, and quick approvals. Check the "Finance" section for details.' },
  { id: 'faq5', q: 'Do you offer bike servicing?', a: 'While we don\'t directly service bikes, our "Services" section connects you with certified mechanics, and you can book appointments with dealerships via the "Showrooms" section.' }
];

// --- HELPER COMPONENTS ---
function EmiCalculatorModal({ bike, onClose }) {
  const [loanAmount, setLoanAmount] = useState(bike.price);
  const [interestRate, setInterestRate] = useState(9.5);
  const [loanTenure, setLoanTenure] = useState(3);
  const emi = calculateEMI(loanAmount, interestRate, loanTenure);
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl" onClick={e => e.stopPropagation()}>
        <h3 className="text-xl font-bold mb-6 text-gray-900">EMI Calculator for {bike.title}</h3>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Loan Amount (₹)</label>
          <input type="number" value={loanAmount} onChange={(e) => setLoanAmount(parseFloat(e.target.value) || 0)} className="w-full border rounded-md px-3 py-2 text-gray-900 focus:ring-indigo-500 focus:border-indigo-500" min="0"/>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Interest Rate (%)</label>
          <input type="number" value={interestRate} onChange={(e) => setInterestRate(parseFloat(e.target.value) || 0)} className="w-full border rounded-md px-3 py-2 text-gray-900 focus:ring-indigo-500 focus:border-indigo-500" min="0" step="0.1"/>
        </div>
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">Loan Tenure (Years)</label>
          <input type="number" value={loanTenure} onChange={(e) => setLoanTenure(parseInt(e.target.value) || 1)} className="w-full border rounded-md px-3 py-2 text-gray-900 focus:ring-indigo-500 focus:border-indigo-500" min="1" max="10"/>
        </div>
        <div className="bg-indigo-50 p-4 rounded-md text-center mb-6">
          <p className="text-lg font-semibold text-gray-800">Your Monthly EMI</p>
          <p className="text-3xl font-bold text-indigo-700 mt-1">{formatPrice(emi)}</p>
        </div>
        <button onClick={onClose} className="w-full py-2 border rounded-md text-gray-700 bg-gray-50 hover:bg-gray-100 transition-colors shadow-sm">Close</button>
      </div>
    </div>
  );
}

function FuelCostCalculatorModal({ bike, onClose }) {
  const [dailyCommuteKm, setDailyCommuteKm] = useState(30);
  const [petrolPricePerLiter, setPetrolPricePerLiter] = useState(105);
  const monthlyFuelCost = calculateFuelCost(bike.specs?.mileage, dailyCommuteKm, petrolPricePerLiter);
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl" onClick={e => e.stopPropagation()}>
        <h3 className="text-xl font-bold mb-4 text-gray-900">Fuel Cost Calculator for {bike.title}</h3>
        <p className="text-sm text-gray-600 mb-5">Mileage: <span className="font-medium text-gray-800">{bike.specs?.mileage || 'N/A'} kmpl</span></p>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Your Daily Commute (km)</label>
          <input type="number" value={dailyCommuteKm} onChange={(e) => setDailyCommuteKm(parseFloat(e.target.value) || 0)} className="w-full border rounded-md px-3 py-2 text-gray-900 focus:ring-green-500 focus:border-green-500" min="0"/>
        </div>
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">Petrol Price (₹ per litre)</label>
          <input type="number" value={petrolPricePerLiter} onChange={(e) => setPetrolPricePerLiter(parseFloat(e.target.value) || 0)} className="w-full border rounded-md px-3 py-2 text-gray-900 focus:ring-green-500 focus:border-green-500" min="0" step="0.5"/>
        </div>
        <div className="bg-green-50 p-4 rounded-md text-center mb-6">
          <p className="text-lg font-semibold text-gray-800">Estimated Monthly Fuel Cost</p>
          <p className="text-3xl font-bold text-green-700 mt-1">{formatPrice(monthlyFuelCost)}</p>
        </div>
        <button onClick={onClose} className="w-full py-2 border rounded-md text-gray-700 bg-gray-50 hover:bg-gray-100 transition-colors shadow-sm">Close</button>
      </div>
    </div>
  );
}

function ComparisonModal({ bikes, onRemove, onClose }) {
  if (!bikes || bikes.length === 0) return null;
  const allSpecsKeys = [...new Set(bikes.flatMap(b => b.specs ? Object.keys(b.specs) : []))];
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-lg p-6 w-full max-w-5xl shadow-xl" onClick={e => e.stopPropagation()}>
        <h3 className="text-2xl font-bold mb-4 text-gray-900">Compare Models</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-3 border border-gray-300 font-semibold text-gray-700 sticky left-0 bg-gray-100">Feature</th>
                {bikes.map(bike => (
                  <th key={bike.id} className="p-3 border border-gray-300 text-center font-semibold text-gray-700">
                    {bike.title}
                    <button onClick={() => onRemove(bike.id)} className="ml-2 text-red-500 font-normal text-xs hover:text-red-700">(Remove)</button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="p-3 border border-gray-300 font-semibold text-gray-700 sticky left-0 bg-white">Price</td>
                {bikes.map(bike => <td key={bike.id} className="p-3 border border-gray-300 text-center font-bold text-indigo-600">{formatPrice(bike.price)}</td>)}
              </tr>
              {allSpecsKeys.map(key => (
                <tr key={key}>
                  <td className="p-3 border border-gray-300 font-semibold text-gray-700 capitalize sticky left-0 bg-white">{key.replace(/_/g, ' ')}</td>
                  {bikes.map(bike => (
                    <td key={bike.id} className="p-3 border border-gray-300 text-center text-gray-800">
                      {bike.specs?.[key] || 'N/A'}
                      {key === 'mileage' ? ' kmpl' : ''}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
         <button onClick={onClose} className="mt-6 w-full py-2 border rounded-md text-gray-700 bg-gray-50 hover:bg-gray-100 transition-colors shadow-sm">Close</button>
      </div>
    </div>
  );
}

function AuthModal({ mode, onClose, onLogin }) {
  const [isLogin, setIsLogin] = useState(mode === 'login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const handleSubmit = (e) => {
    e.preventDefault(); const userData = { name: isLogin ? (name || 'Demo User') : name, email: email }; onLogin(userData);
  };
  return ( <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}><div className="bg-white rounded-lg p-8 w-full max-w-sm shadow-xl" onClick={e => e.stopPropagation()}><h2 className="text-2xl font-bold text-center mb-6 text-gray-900">{isLogin ? 'Login' : 'Sign Up'}</h2><form onSubmit={handleSubmit} className="space-y-4">{!isLogin && (<input type="text" placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} className="w-full border rounded-md p-3 text-gray-900 focus:ring-indigo-500 focus:border-indigo-500" required />)}<input type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border rounded-md p-3 text-gray-900 focus:ring-indigo-500 focus:border-indigo-500" required /><input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full border rounded-md p-3 text-gray-900 focus:ring-indigo-500 focus:border-indigo-500" required /><button type="submit" className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-md hover:from-indigo-700 hover:to-purple-700 transition duration-300 font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5">{isLogin ? 'Login' : 'Create Account'}</button></form><p className="text-center text-sm text-gray-600 mt-6">{isLogin ? "Don't have an account?" : 'Already have an account?'}<button onClick={() => setIsLogin(!isLogin)} className="text-indigo-600 font-semibold ml-1 hover:underline">{isLogin ? 'Sign Up' : 'Login'}</button></p></div></div> );
}

function ShowroomImageModal({ imageUrl, onClose }) {
  return ( <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4" onClick={onClose}><div className="relative bg-white p-2 rounded-lg shadow-xl" onClick={e => e.stopPropagation()}><button onClick={onClose} className="absolute -top-3 -right-3 bg-white rounded-full p-1.5 shadow-md text-gray-700 hover:text-gray-900 z-10"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button><img src={imageUrl} alt="Showroom" className="max-w-full max-h-[90vh] object-contain rounded" /></div></div> );
}

function FilterModal({ 
  brands, fuelTypes, filterBrand, setFilterBrand, filterFuel, setFilterFuel, filterCondition, setFilterCondition, onClose, onReset
}) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-lg p-6 w-full max-w-sm shadow-xl" onClick={e => e.stopPropagation()}>
        <h4 className="text-xl font-semibold text-gray-800 border-b pb-3 mb-6">Filters</h4>
        <div className="space-y-6">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Brand</label>
            <select value={filterBrand} onChange={e => setFilterBrand(e.target.value)} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white focus:ring-indigo-500 focus:border-indigo-500 outline-none">
              {brands.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Fuel Type</label>
            <div className="flex flex-wrap gap-2">
              {fuelTypes.map(f => (
                <button key={f} onClick={() => setFilterFuel(f)} className={`px-3 py-1 rounded-full border text-xs font-medium transition-colors ${filterFuel === f ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'}`}>{f}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Condition</label>
            <div className="flex flex-wrap gap-2">
              {['All', 'New', 'Used'].map(c => (
                <button key={c} onClick={() => setFilterCondition(c)} className={`px-3 py-1 rounded-full border text-xs font-medium transition-colors ${filterCondition === c ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'}`}>{c}</button>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-8 flex gap-3">
            <button onClick={onReset} className="flex-1 text-sm text-center border border-gray-300 text-gray-700 rounded-md py-2 hover:bg-gray-100 transition-colors shadow-sm">Reset</button>
            <button onClick={onClose} className="flex-1 text-sm text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-md py-2 hover:from-indigo-700 hover:to-purple-700 transition duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5">Apply Filters</button>
        </div>
      </div>
    </div>
  );
}

// --- MAIN APP COMPONENT ---
export default function TwoWheelerMarketplaceUI() {
  const [bikes] = useState(sampleBikes);
  const [showrooms] = useState(showroomsData);
  const [query, setQuery] = useState('');
  const [filterBrand, setFilterBrand] = useState('All');
  const [filterFuel, setFilterFuel] = useState('All');
  const [filterCondition, setFilterCondition] = useState('All'); 
  const [selected, setSelected] = useState(null); 
  const [compareList, setCompareList] = useState([]);
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [showEmiModal, setShowEmiModal] = useState(null); 
  const [showFuelCostModal, setShowFuelCostModal] = useState(null); 
  const [currentUser, setCurrentUser] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(null);
  const [showShowroomImageModal, setShowShowroomImageModal] = useState(null);
  const [showroomQuery, setShowroomQuery] = useState('');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [cart, setCart] = useState([]); 
  const [showFilterModal, setShowFilterModal] = useState(false); 
  const [filterShowroomBrand, setFilterShowroomBrand] = useState('All');
  const [openFaq, setOpenFaq] = useState(null); 
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false); 
  const moreMenuRef = useRef(null); 

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide(prevSlide => (prevSlide === heroSlides.length - 1 ? 0 : prevSlide + 1));
    }, 5000);
    const handleClickOutside = (event) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(event.target)) {
        setIsMoreMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      clearInterval(timer);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []); 

  const brands = ['All', ...Array.from(new Set(bikes.map(b => b.brand)))];
  const fuelTypes = ['All', ...Array.from(new Set(bikes.map(b => b.fuel)))]; 
  const showroomBrands = ['All', ...Array.from(new Set(showrooms.flatMap(s => s.brands)))];

  const filteredBikes = bikes.filter(b => {
    const matchesQuery = `${b.title} ${b.brand} ${b.location}`.toLowerCase().includes(query.toLowerCase());
    const matchesBrand = filterBrand === 'All' || b.brand === filterBrand;
    const matchesFuel = filterFuel === 'All' || b.fuel === filterFuel;
    const matchesCondition = filterCondition === 'All' || b.condition === filterCondition;
    return matchesQuery && matchesBrand && matchesFuel && matchesCondition;
  });

  const filteredShowrooms = showrooms.filter(s => {
      const matchesQuery = s.city.toLowerCase().includes(showroomQuery.toLowerCase()) ||
                           s.name.toLowerCase().includes(showroomQuery.toLowerCase());
      const matchesBrand = filterShowroomBrand === 'All' || s.brands.includes(filterShowroomBrand);
      return matchesQuery && matchesBrand;
    }
  );

  const handleCompareToggle = (bike) => {
    setCompareList(prev =>
      prev.some(item => item.id === bike.id)
        ? prev.filter(item => item.id !== bike.id)
        : prev.length < 3 ? [...prev, bike] : prev
    );
  };

  const handleLogin = (userData) => { setCurrentUser(userData); setShowAuthModal(null); };
  const handleLogout = () => { setCurrentUser(null); };
  const addToCart = (bike) => { if (!cart.some(c => c.id === bike.id)) setCart([...cart, bike]); };
  const removeFromCart = (id) => setCart(cart.filter(c => c.id !== id));
  
  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  
  const handleScrollClick = (e, id) => {
    e.preventDefault();
    scrollTo(id);
    setIsMoreMenuOpen(false); 
  };

  const resetFilters = () => {
    setQuery('');
    setFilterBrand('All');
    setFilterFuel('All');
    setFilterCondition('All');
  };
  const handleBookTestRide = (showroomName) => {
    alert(`Test ride request sent to ${showroomName}! They will contact you shortly.`);
  };
  const handleBookService = (showroomName) => {
    alert(`Service appointment request sent to ${showroomName}! They will contact you to confirm.`);
  };

  const backgroundAnimationStyles = `
    @keyframes gradient-animation {
      0% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }
    .animated-gradient {
      background-size: 400% 400%;
      animation: gradient-animation 15s ease infinite;
    }
    .dropdown-enter { max-height: 0; opacity: 0; }
    .dropdown-enter-active { max-height: 500px; opacity: 1; transition: max-height 300ms ease-out, opacity 300ms ease-out; }
    .dropdown-exit { max-height: 500px; opacity: 1; }
    .dropdown-exit-active { max-height: 0; opacity: 0; transition: max-height 300ms ease-in, opacity 200ms ease-in; }
  `;

  return (
    <> 
      <style>{backgroundAnimationStyles}</style>
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-sky-50 animated-gradient">
        {/* --- HEADER (Expanded Max Width) --- */}
        <header className="bg-white shadow-md sticky top-0 z-40" id="home">
          <div className="max-w-[1600px] w-full mx-auto px-6 md:px-12 py-3 flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="text-2xl font-extrabold text-indigo-700">Two Wheeler Bike Website</div>
              
              <nav className="hidden lg:flex items-center gap-x-4 text-sm font-medium text-gray-600"> 
                <a href="#hero-slideshow" onClick={(e) => handleScrollClick(e, 'hero-slideshow')} className="hover:text-indigo-700 transition-colors py-1">Home</a>
                <a href="#listings" onClick={(e) => handleScrollClick(e, 'listings')} className="hover:text-indigo-700 transition-colors py-1">Buy Bike</a>
                <a href="#upcoming" onClick={(e) => handleScrollClick(e, 'upcoming')} className="hover:text-indigo-700 transition-colors py-1">Upcoming</a>
                <a href="#showrooms" onClick={(e) => handleScrollClick(e, 'showrooms')} className="hover:text-indigo-700 transition-colors py-1">Showrooms</a>
                <a href="#sell-bike" onClick={(e) => handleScrollClick(e, 'sell-bike')} className="hover:text-indigo-700 transition-colors py-1">Sell Bike</a>
                <a href="#finance" onClick={(e) => handleScrollClick(e, 'finance')} className="hover:text-indigo-700 transition-colors py-1">Finance</a>
                <a href="#services" onClick={(e) => handleScrollClick(e, 'services')} className="hover:text-indigo-700 transition-colors py-1">Services</a>
                <a href="#blog" onClick={(e) => handleScrollClick(e, 'blog')} className="hover:text-indigo-700 transition-colors py-1">Blog</a>
                
                <div className="relative" ref={moreMenuRef}>
                   <button 
                     onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)} 
                     className="flex items-center hover:text-indigo-700 transition-colors py-1"
                    >
                     More
                     <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ml-1 transition-transform duration-200 ${isMoreMenuOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                       <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                     </svg>
                   </button>
                   <div className={`absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-50 overflow-hidden dropdown-enter${isMoreMenuOpen ? '-active' : ''} dropdown-exit${!isMoreMenuOpen ? '-active' : ''}`}>
                      <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700">Accessories</a>
                      <a href="#about-us" onClick={(e) => handleScrollClick(e, 'about-us')} className="block px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700">About Us</a>
                      <a href="#contact-us" onClick={(e) => handleScrollClick(e, 'contact-us')} className="block px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700">Contact Us</a>
                      <a href="#faqs" onClick={(e) => handleScrollClick(e, 'faqs')} className="block px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700">FAQs</a>
                   </div>
                </div>
              </nav>
            </div>
            
            <div className="flex items-center gap-4">
              <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search..." className="hidden xl:block w-40 rounded-full border border-gray-300 px-4 py-1.5 text-sm focus:ring-indigo-500 focus:border-indigo-500 outline-none" />
              {currentUser ? (
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-700 hidden sm:inline">Welcome, {currentUser.name}!</span>
                  <button onClick={handleLogout} className="text-sm text-indigo-600 hover:underline font-medium">Logout</button>
                </div>
              ) : (
                <button onClick={() => setShowAuthModal('login')} className="hidden sm:block text-sm font-medium text-indigo-600 hover:text-indigo-800">Login / Sign Up</button>
              )}
               <button className="relative p-2 rounded-full hover:bg-gray-100" onClick={() => document.getElementById('cart-drawer')?.classList.toggle('translate-x-0')} aria-label="Open cart">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M11 15a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" /></svg>
                 {cart.length > 0 && <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 transform translate-x-1/2 -translate-y-1/2">{cart.length}</span>}
               </button>
            </div>
          </div>
        </header>

        {/* --- HERO SLIDESHOW (Edge-to-Edge) --- */}
        <section id="hero-slideshow" className="w-full relative h-[60vh] md:h-[70vh]">
           <div className="w-full h-full flex transition-transform duration-700 ease-in-out" style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
              {heroSlides.map((slide, index) => (
                  <img key={index} src={slide.imageUrl} alt={slide.title} className="w-full h-full object-cover flex-shrink-0" />
              ))}
           </div>
           <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent pointer-events-none"></div>
           
           <div className="absolute inset-0 max-w-[1600px] w-full mx-auto px-6 md:px-12 flex flex-col justify-end pb-12 md:pb-16 pointer-events-none">
             <div className="pointer-events-auto">
               <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold drop-shadow-lg text-white">{heroSlides[currentSlide].title}</h1>
               <p className="mt-4 text-lg md:text-2xl max-w-2xl drop-shadow-md text-gray-200">{heroSlides[currentSlide].subtitle}</p>
             </div>
           </div>

           <div className="absolute bottom-6 right-6 md:right-12 flex gap-2 z-10">
              {heroSlides.map((_, index) => (
                  <button key={index} onClick={() => setCurrentSlide(index)} className={`w-3 h-3 rounded-full transition-all duration-300 ${currentSlide === index ? 'bg-white scale-125' : 'bg-white/50 hover:bg-white/80'}`}></button>
              ))}
           </div>
        </section>

        {/* --- MAIN CONTENT (Expanded Container) --- */}
        <main className="max-w-[1600px] w-full mx-auto px-6 md:px-12 py-12 space-y-20">
          
          <section id="listings" className="flex flex-col lg:flex-row gap-8">
             {/* --- SIDEBAR FILTERS --- */}
             <aside className="w-full lg:w-1/4 xl:w-1/5 hidden lg:block">
              <div className="sticky top-24 bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
                <h4 className="text-xl font-semibold text-gray-800 border-b border-gray-100 pb-3">Filters</h4>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Brand</label>
                  <select value={filterBrand} onChange={e => setFilterBrand(e.target.value)} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white focus:ring-indigo-500 focus:border-indigo-500 outline-none">
                    {brands.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Fuel Type</label>
                  <div className="flex flex-wrap gap-2">
                    {fuelTypes.map(f => (
                      <button key={f} onClick={() => setFilterFuel(f)} className={`px-3 py-1 rounded-full border text-xs font-medium transition-colors ${filterFuel === f ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'}`}>{f}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Condition</label>
                  <div className="flex flex-wrap gap-2">
                    {['All', 'New', 'Used'].map(c => (
                      <button key={c} onClick={() => setFilterCondition(c)} className={`px-3 py-1 rounded-full border text-xs font-medium transition-colors ${filterCondition === c ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'}`}>{c}</button>
                    ))}
                  </div>
                </div>
                <button onClick={resetFilters} className="w-full text-sm text-center border border-indigo-300 text-indigo-700 rounded-md py-2.5 hover:bg-indigo-50 transition-colors shadow-sm font-medium mt-4">Reset Filters</button>
              </div>
            </aside>

            {/* --- PRODUCT GRID --- */}
            <div className="w-full lg:w-3/4 xl:w-4/5">
              <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
                <h2 className="text-2xl font-bold text-gray-900">Explore Two-Wheelers</h2>
                <button 
                  onClick={() => setShowFilterModal(true)} 
                  className="lg:hidden flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors transform hover:scale-105"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                  Filters
                </button>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
                {filteredBikes.length === 0 && <div className="col-span-full text-center text-gray-500 py-16">No bikes match your filters. Try adjusting them!</div>}
                {filteredBikes.map(b => (
                  <article key={b.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden group flex flex-col cursor-pointer transition hover:shadow-md" onClick={() => setSelected(b)}>
                    <div className="h-56 overflow-hidden relative bg-gray-50">
                        <img src={b.img} alt={b.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        <span className={`absolute top-3 right-3 text-xs font-semibold px-2.5 py-1 rounded-full ${b.condition === 'New' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{b.condition}</span>
                    </div>
                    <div className="p-5 flex flex-col flex-grow">
                        <h3 className="font-semibold text-lg text-gray-900 truncate group-hover:text-indigo-700 transition-colors">{b.title}</h3>
                        <p className="text-sm text-gray-500 mb-2">{b.brand} • {b.year}</p>
                        <div className="font-bold text-indigo-700 text-2xl mb-3">{formatPrice(b.price)}</div>
                        <p className="text-xs text-gray-500 mt-1">{b.specs?.mileage} kmpl • {b.location}</p>
                        <div className="mt-auto pt-5 flex gap-3">
                            <button onClick={(e) => { e.stopPropagation(); setSelected(b); }} className="flex-1 px-4 py-2.5 text-sm bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-md hover:from-indigo-700 hover:to-purple-700 transition duration-300 font-medium shadow-sm transform hover:-translate-y-0.5">View Details</button>
                            <button onClick={(e) => { e.stopPropagation(); handleCompareToggle(b); }} title="Compare" className={`px-3 py-2.5 border rounded-md text-sm font-medium transition-colors shadow-sm ${compareList.some(item => item.id === b.id) ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'text-gray-600 bg-white hover:bg-gray-50 border-gray-200'}`}>
                                {compareList.some(item => item.id === b.id) ? '✓ Added' : '+ Compare'}
                            </button>
                        </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>

          <section id="upcoming">
               <div className="text-center mb-10"><h2 className="text-3xl font-extrabold text-gray-900">Upcoming Launches</h2><p className="text-gray-600 mt-2">The most anticipated models coming soon to India.</p></div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                  {upcomingBikes.map(bike => (
                      <article key={bike.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden group flex flex-col transition hover:shadow-md">
                          <div className="h-48 overflow-hidden bg-gray-50"><img src={bike.img} alt={bike.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" /></div>
                          <div className="p-5 flex flex-col flex-grow"><h3 className="font-semibold text-lg text-gray-900 truncate">{bike.title}</h3><p className="text-sm text-gray-500 mb-2">{bike.brand}</p><p className="mt-auto pt-2 text-sm font-medium text-indigo-600">{bike.launchStatus}</p></div>
                      </article>
                  ))}
              </div>
          </section>

          <section id="showrooms">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-extrabold text-gray-900">Find a Showroom</h2>
              <p className="text-gray-600 mt-2">Locate your nearest dealer for a test ride or service.</p>
              <div className="mt-6 max-w-2xl mx-auto flex flex-col sm:flex-row gap-4">
                <input 
                  type="text" 
                  placeholder="Search by city or showroom name..." 
                  value={showroomQuery} 
                  onChange={e => setShowroomQuery(e.target.value)} 
                  className="flex-grow border border-gray-300 rounded-full px-6 py-3 text-base focus:ring-indigo-500 focus:border-indigo-500 outline-none shadow-sm bg-white" 
                />
                <select 
                  value={filterShowroomBrand} 
                  onChange={e => setFilterShowroomBrand(e.target.value)} 
                  className="sm:w-56 border border-gray-300 rounded-full px-6 py-3 text-base focus:ring-indigo-500 focus:border-indigo-500 outline-none shadow-sm bg-white text-gray-600"
                >
                  {showroomBrands.map(brand => <option key={brand} value={brand}>{brand === 'All' ? 'All Brands' : brand}</option>)}
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredShowrooms.length > 0 ? filteredShowrooms.map(showroom => (
                <div key={showroom.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col transition hover:shadow-md">
                  <div className="h-56 w-full overflow-hidden rounded-lg mb-5 cursor-pointer group bg-gray-50" onClick={() => setShowShowroomImageModal(showroom.imageUrl)}>
                    <img src={showroom.imageUrl} alt={`${showroom.name} Showroom`} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                  </div>
                  <div className="flex justify-between items-start mb-2">
                      <h3 className="text-xl font-bold text-indigo-700">{showroom.name}</h3>
                      <div className="flex items-center gap-1 bg-yellow-400 text-white text-xs font-bold px-2 py-1 rounded">
                          <span>★</span>
                          <span>{showroom.rating.toFixed(1)}</span>
                      </div>
                  </div>
                  <p className="text-gray-600 mt-1 text-sm">{showroom.address}</p>
                  <p className="text-gray-800 font-semibold mt-3">📞 {showroom.phone}</p>
                  <p className="text-gray-600 mt-1 text-sm">🕒 {showroom.openingHours}</p>
                  
                  <div className="mt-5">
                    <h4 className="font-semibold text-sm text-gray-800 mb-2">Brands Available:</h4>
                    <div className="flex flex-wrap gap-2">
                      {showroom.brands.map(brand => (<span key={brand} className="bg-gray-100 text-gray-700 text-xs font-semibold px-3 py-1 rounded-full">{brand}</span>))}
                    </div>
                  </div>
                  
                  <div className="mt-auto pt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
                     <a href={showroom.mapUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-1 text-center bg-blue-600 text-white font-medium py-2.5 rounded-md hover:bg-blue-700 transition-colors text-sm shadow-sm transform hover:-translate-y-0.5">
                       <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                       Map
                     </a>
                     <button onClick={() => handleBookTestRide(showroom.name)} className="flex items-center justify-center gap-1 text-center bg-green-600 text-white font-medium py-2.5 rounded-md hover:bg-green-700 transition-colors text-sm shadow-sm transform hover:-translate-y-0.5">
                       <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-4.566-4.566a1.25 1.25 0 10-1.768 1.768L12.232 12l-3.79 3.79a1.25 1.25 0 101.768 1.768l4.566-4.566a1.25 1.25 0 000-1.768z" /></svg>
                       Test Ride
                      </button>
                     <button onClick={() => handleBookService(showroom.name)} className="flex items-center justify-center gap-1 text-center bg-orange-500 text-white font-medium py-2.5 rounded-md hover:bg-orange-600 transition-colors text-sm shadow-sm transform hover:-translate-y-0.5">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        Service
                     </button>
                  </div>
                </div>
              )) : (
                <p className="text-center text-gray-500 md:col-span-full py-16">No showrooms found matching your criteria.</p>
              )}
            </div>
          </section>
          
          <section id="sell-bike" className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 md:p-12">
             <div className="text-center mb-10">
              <h2 className="text-3xl font-extrabold text-gray-900">Sell Your Bike in 4 Easy Steps</h2>
              <p className="text-gray-600 mt-2">Get the best price for your bike, hassle-free.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {sellBikeStepsData.map(step => (
                <div key={step.id} className="flex flex-col items-center text-center p-4">
                  <div className="bg-indigo-50 text-indigo-700 rounded-full p-5 mb-5" dangerouslySetInnerHTML={{ __html: step.icon }} />
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{step.title}</h3>
                  <p className="text-sm text-gray-600">{step.description}</p>
                </div>
              ))}
            </div>
            <div className="text-center mt-10">
              <button className="px-10 py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-md hover:from-indigo-700 hover:to-purple-700 transition duration-300 shadow-md transform hover:-translate-y-0.5">Get Started Now</button>
            </div>
          </section>

          <section id="finance">
             <div className="text-center mb-10">
              <h2 className="text-3xl font-extrabold text-gray-900">Easy Finance Options</h2>
              <p className="text-gray-600 mt-2">Get your dream bike with our flexible loan partners.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {financeOptionsData.map(option => (
                <div key={option.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 flex items-start gap-5 transition hover:shadow-md">
                  <div className="bg-green-50 text-green-700 rounded-full p-4 flex-shrink-0 mt-1" dangerouslySetInnerHTML={{ __html: option.icon }} />
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{option.title}</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">{option.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
          
          <section id="services">
             <div className="text-center mb-10">
              <h2 className="text-3xl font-extrabold text-gray-900">Our Services</h2>
              <p className="text-gray-600 mt-2">Everything you need for your two-wheeler journey.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {servicesData.map(service => (
                <div key={service.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 flex flex-col items-center text-center transition hover:shadow-md">
                  <div className="bg-indigo-50 text-indigo-700 rounded-full p-5 mb-5" dangerouslySetInnerHTML={{ __html: service.icon }} />
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{service.title}</h3>
                  <p className="text-sm text-gray-600 flex-grow leading-relaxed">{service.description}</p>
                  <a href="#" className="mt-5 text-sm font-semibold text-indigo-600 hover:text-indigo-800">Learn More →</a>
                </div>
              ))}
            </div>
          </section>

          <section id="blog">
             <div className="text-center mb-10">
              <h2 className="text-3xl font-extrabold text-gray-900">From the Blog</h2>
              <p className="text-gray-600 mt-2">Latest news, reviews, and maintenance tips.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {blogPostsData.map(post => (
                <article key={post.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden group flex flex-col transition hover:shadow-md">
                  <div className="h-52 overflow-hidden bg-gray-50">
                    <img src={post.imageUrl} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  </div>
                  <div className="p-5 flex flex-col flex-grow">
                    <p className="text-xs font-bold text-indigo-600 uppercase mb-2">{post.category}</p>
                    <h3 className="font-semibold text-lg text-gray-900 truncate group-hover:text-indigo-700 transition-colors">{post.title}</h3>
                    <p className="text-sm text-gray-600 mt-2 flex-grow leading-relaxed">{post.excerpt}</p>
                    <div className="mt-5 pt-4 border-t border-gray-100">
                      <p className="text-xs text-gray-400 font-medium">Posted on {post.date}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section id="about-us" className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 md:p-16">
             <div className="text-center mb-8">
                <h2 className="text-3xl font-extrabold text-gray-900">About Us</h2>
             </div>
             <p className="text-gray-700 text-lg leading-relaxed text-center max-w-4xl mx-auto">
                {aboutUsText}
             </p>
          </section>

          <section id="contact-us" className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 md:p-16">
             <div className="text-center mb-8">
                <h2 className="text-3xl font-extrabold text-gray-900">Contact Us</h2>
                <p className="text-gray-600 mt-2">Get in touch with us for any queries or support.</p>
             </div>
             <div className="max-w-xl mx-auto text-center space-y-4 text-gray-700 text-lg">
                <p><strong>Phone:</strong> <a href={`tel:${contactInfo.phone}`} className="text-indigo-600 hover:underline">{contactInfo.phone}</a></p>
                <p><strong>Email:</strong> <a href={`mailto:${contactInfo.email}`} className="text-indigo-600 hover:underline">{contactInfo.email}</a></p>
                <p><strong>Address:</strong> {contactInfo.address}</p>
                <p><strong>Hours:</strong> {contactInfo.hours}</p>
             </div>
          </section>

          <section id="faqs">
             <div className="text-center mb-10">
                <h2 className="text-3xl font-extrabold text-gray-900">Frequently Asked Questions</h2>
             </div>
             <div className="max-w-4xl mx-auto space-y-4">
                {faqsData.map(faq => (
                    <div key={faq.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <button 
                            onClick={() => setOpenFaq(openFaq === faq.id ? null : faq.id)}
                            className="w-full flex justify-between items-center text-left p-5 font-semibold text-gray-900 hover:bg-gray-50 transition-colors"
                        >
                            <span className="text-lg">{faq.q}</span>
                            <span className={`text-2xl font-light transform transition-transform duration-200 ${openFaq === faq.id ? 'rotate-45' : 'rotate-0'}`}>+</span>
                        </button>
                        <div 
                          className={`overflow-hidden transition-all duration-300 ease-in-out ${openFaq === faq.id ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'}`}
                        >
                          <div className="p-5 pt-0 text-gray-600 text-base leading-relaxed">
                              {faq.a}
                          </div>
                        </div>
                    </div>
                ))}
             </div>
          </section>

        </main>

        {/* --- Modals and Overlays --- */}
        {showAuthModal && <AuthModal mode={showAuthModal} onLogin={handleLogin} onClose={() => setShowAuthModal(null)} />}
        
        {showFilterModal && (
          <FilterModal 
            brands={brands} fuelTypes={fuelTypes} filterBrand={filterBrand} setFilterBrand={setFilterBrand} filterFuel={filterFuel} setFilterFuel={setFilterFuel} filterCondition={filterCondition} setFilterCondition={setFilterCondition} onClose={() => setShowFilterModal(false)} onReset={() => { resetFilters(); setShowFilterModal(false); }}
          />
        )}
        
        {selected && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => setSelected(null)}>
            <div className="bg-white rounded-xl max-w-5xl w-full p-8 shadow-2xl" onClick={e => e.stopPropagation()}>
              <div className="flex flex-col lg:flex-row gap-8">
                <div className="lg:w-1/2 w-full rounded-xl overflow-hidden h-72 lg:h-auto bg-gray-50">
                  <img src={selected.img} alt={selected.title} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1">
                  <h3 className="text-3xl font-extrabold text-gray-900">{selected.title}</h3>
                  <p className="text-lg text-gray-500 mb-4">{selected.brand} • {selected.year} • {selected.condition}</p>
                  <div className="font-extrabold text-indigo-700 text-4xl mb-6">{formatPrice(selected.price)}</div>
                  <div className="mb-8">
                    <h4 className="font-bold text-gray-900 mb-3 text-xl">Specifications</h4>
                    <ul className="grid grid-cols-2 gap-y-3 gap-x-6 text-gray-700 text-base">
                      {selected.specs && Object.entries(selected.specs).map(([key, value]) => (<li key={key}><span className="font-semibold text-gray-900 capitalize block">{key.replace(/_/g, ' ')}</span> {value}{key === 'mileage' ? ' kmpl' : ''}</li>))}
                      {!selected.specs && <li>No specifications available.</li>}
                    </ul>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <button onClick={() => { setShowEmiModal(selected); setSelected(null); }} className="w-full px-4 py-3 rounded-md bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold hover:from-indigo-700 hover:to-purple-700 transition duration-300 shadow-md transform hover:-translate-y-0.5">Calculate EMI</button>
                    <button onClick={() => { setShowFuelCostModal(selected); setSelected(null); }} className="w-full px-4 py-3 rounded-md bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold hover:from-green-600 hover:to-emerald-700 transition duration-300 shadow-md transform hover:-translate-y-0.5">Fuel Cost</button>
                    <button onClick={() => setSelected(null)} className="w-full px-4 py-3 rounded-md border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 transition-colors font-semibold shadow-sm">Close</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        {showEmiModal && <EmiCalculatorModal bike={showEmiModal} onClose={() => setShowEmiModal(null)} />}
        {showFuelCostModal && <FuelCostCalculatorModal bike={showFuelCostModal} onClose={() => setShowFuelCostModal(null)} />}
        {showCompareModal && <ComparisonModal bikes={compareList} onRemove={(id) => setCompareList(prev => prev.filter(b => b.id !== id))} onClose={() => setShowCompareModal(false)} />}
        {showShowroomImageModal && <ShowroomImageModal imageUrl={showShowroomImageModal} onClose={() => setShowShowroomImageModal(null)} />}
        
        {compareList.length > 0 && (
          <div className="fixed bottom-0 left-0 right-0 bg-white shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] p-4 z-40 border-t">
            <div className="max-w-[1600px] mx-auto px-6 md:px-12 flex items-center justify-between flex-wrap gap-4">
              <div>
                <h4 className="font-bold text-gray-900">Comparing Models ({compareList.length}/3)</h4>
                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
                  {compareList.map(bike => <div key={bike.id} className="text-sm text-gray-700 font-medium">{bike.title}</div>)}
                </div>
              </div>
              <div className="flex gap-3 flex-shrink-0">
                <button onClick={() => setShowCompareModal(true)} className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-md hover:from-indigo-700 hover:to-purple-700 transition duration-300 font-semibold shadow-md transform hover:-translate-y-0.5">Compare Now</button>
                <button onClick={() => setCompareList([])} className="px-6 py-2.5 border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-50 transition-colors font-semibold shadow-sm">Clear</button>
              </div>
            </div>
          </div>
        )}

          <div id="cart-drawer" className="fixed right-0 top-0 h-full w-full max-w-sm bg-white shadow-2xl transform translate-x-full transition-transform duration-300 z-50 flex flex-col">
            <div className="p-5 flex items-center justify-between border-b bg-gray-50 flex-shrink-0">
              <h4 className="font-bold text-xl text-gray-900">Shopping Cart</h4>
              <button onClick={() => document.getElementById('cart-drawer')?.classList.toggle('translate-x-full')} className="text-gray-500 hover:text-indigo-600 p-2 rounded-full hover:bg-gray-200 transition">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-5 space-y-4 overflow-y-auto flex-grow">
              {cart.length === 0 && <div className="text-base text-center text-gray-500 py-16">Your cart is empty. Start adding some bikes!</div>}
              {cart.map(item => (
                <div key={item.id} className="flex items-center gap-4 border-b pb-4 last:border-b-0">
                  <img src={item.img} alt="thumb" className="w-24 h-20 object-cover rounded-md flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-base font-semibold text-gray-900 truncate">{item.title}</div>
                    <div className="text-sm font-medium text-indigo-700 mt-1">{formatPrice(item.price)}</div>
                  </div>
                  <button onClick={() => removeFromCart(item.id)} title="Remove item" className="text-red-500 hover:text-red-700 font-medium ml-2 p-1.5 rounded-full hover:bg-red-50 transition">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
              ))}
            </div>
            {cart.length > 0 && (
              <div className="p-5 border-t bg-gray-50 flex-shrink-0">
                <div className="flex justify-between items-center mb-4">
                  <span className="font-bold text-gray-900 text-lg">Total:</span>
                  <span className="font-extrabold text-indigo-700 text-2xl">{formatPrice(cart.reduce((s, a) => s + (a.price || 0), 0))}</span>
                </div>
                <button className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-3.5 rounded-md text-base font-bold hover:from-indigo-700 hover:to-purple-700 transition duration-300 shadow-md transform hover:-translate-y-0.5">Proceed to Checkout</button>
              </div>
            )}
        </div>

          <footer className="mt-20 bg-gray-900 text-gray-300 py-12">
            <div className="max-w-[1600px] mx-auto px-6 md:px-12 text-center">
              <p className="text-base font-medium">© {new Date().getFullYear()} Two Wheeler Bike Website. All Rights Reserved.</p>
              <p className="text-sm mt-2 text-gray-500">Marketplace UI Demo built with React & Tailwind CSS.</p>
            </div>
          </footer>
      </div>
    </>
  );
}