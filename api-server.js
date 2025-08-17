const express = require('express');
const cors = require('cors');
const app = express();

// Middleware
app.use(cors({
  origin: ['http://localhost:8080', 'http://localhost:3000', 'https://stayhubtest.netlify.app'],
  credentials: true
}));
app.use(express.json());

// Sample data
const listings = [
  {
    id: '1',
    title: 'Luxury Villa with Ocean View',
    location: 'Malibu, California',
    image: 'https://res.cloudinary.com/demo/image/upload/v1613123089/samples/landscapes/beach-boat.jpg',
    price: 350,
    description: 'Stunning luxury villa overlooking the Pacific Ocean. Features 4 bedrooms, infinity pool, and direct beach access.',
    rooms: 4,
    guests: 8,
    bathrooms: 3,
    type: 'villa',
    rating: 4.9,
    reviews: 128,
    amenities: ['Pool', 'Beach Access', 'WiFi', 'Kitchen', 'Parking'],
    host: {
      id: 'host1',
      name: 'Sarah Johnson',
      avatar: 'https://ui-avatars.com/api/?name=Sarah+Johnson&background=FF385C&color=fff'
    }
  },
  {
    id: '2',
    title: 'Cozy Apartment in Downtown',
    location: 'New York, NY',
    image: 'https://res.cloudinary.com/demo/image/upload/v1613123089/samples/food/dessert.jpg',
    price: 120,
    description: 'Modern apartment in the heart of Manhattan. Walking distance to major attractions, restaurants, and public transport.',
    rooms: 1,
    guests: 2,
    bathrooms: 1,
    type: 'apartment',
    rating: 4.7,
    reviews: 89,
    amenities: ['WiFi', 'Kitchen', 'Air Conditioning', 'Elevator'],
    host: {
      id: 'host2',
      name: 'Mike Chen',
      avatar: 'https://ui-avatars.com/api/?name=Mike+Chen&background=FF385C&color=fff'
    }
  },
  {
    id: '3',
    title: 'Mountain Cabin Retreat',
    location: 'Aspen, Colorado',
    image: 'https://res.cloudinary.com/demo/image/upload/v1613123089/samples/landscapes/nature-mountains.jpg',
    price: 180,
    description: 'Rustic cabin with modern amenities in the Rocky Mountains. Perfect for skiing in winter and hiking in summer.',
    rooms: 2,
    guests: 4,
    bathrooms: 1,
    type: 'cabin',
    rating: 4.8,
    reviews: 76,
    amenities: ['Fireplace', 'WiFi', 'Kitchen', 'Hiking Trails', 'Ski Access'],
    host: {
      id: 'host3',
      name: 'Emma Davis',
      avatar: 'https://ui-avatars.com/api/?name=Emma+Davis&background=FF385C&color=fff'
    }
  }
];

const users = [
  {
    id: 'user1',
    email: 'john@example.com',
    name: 'John Doe',
    role: 'guest',
    avatar: 'https://ui-avatars.com/api/?name=John+Doe&background=FF385C&color=fff'
  }
];

const reviews = [
  {
    id: 'review1',
    listingId: '1',
    userId: 'user1',
    rating: 5,
    comment: 'Amazing villa with incredible ocean views! The host was very responsive and the place was exactly as described.',
    date: '2024-01-15',
    user: {
      name: 'John Doe',
      avatar: 'https://ui-avatars.com/api/?name=John+Doe&background=FF385C&color=fff'
    }
  },
  {
    id: 'review2',
    listingId: '1',
    userId: 'user2',
    rating: 5,
    comment: 'Perfect for a family vacation. The kids loved the pool and beach access. Highly recommend!',
    date: '2024-01-10',
    user: {
      name: 'Alice Smith',
      avatar: 'https://ui-avatars.com/api/?name=Alice+Smith&background=FF385C&color=fff'
    }
  }
];

// Auth endpoints
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  const user = users.find(u => u.email === email);
  if (user && password) {
    const token = `fake-jwt-token-${user.id}`;
    res.json({
      status: 'success',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatar: user.avatar
      }
    });
  } else {
    res.status(401).json({
      status: 'error',
      message: 'Invalid email or password'
    });
  }
});

app.post('/api/auth/register', (req, res) => {
  const { email, password, name } = req.body;
  
  const existingUser = users.find(u => u.email === email);
  if (existingUser) {
    return res.status(400).json({
      status: 'error',
      message: 'User already exists'
    });
  }
  
  const newUser = {
    id: `user${users.length + 1}`,
    email,
    name,
    role: 'guest',
    avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=FF385C&color=fff`
  };
  
  users.push(newUser);
  const token = `fake-jwt-token-${newUser.id}`;
  
  res.status(201).json({
    status: 'success',
    token,
    user: newUser
  });
});

// Listings endpoints
app.get('/api/listings', (req, res) => {
  const { location, guests, type, minPrice, maxPrice, sort } = req.query;
  
  let filteredListings = [...listings];
  
  if (location) {
    filteredListings = filteredListings.filter(listing => 
      listing.location.toLowerCase().includes(location.toLowerCase()) ||
      listing.title.toLowerCase().includes(location.toLowerCase())
    );
  }
  
  if (guests) {
    filteredListings = filteredListings.filter(listing => listing.guests >= parseInt(guests));
  }
  
  if (type && type !== 'all') {
    filteredListings = filteredListings.filter(listing => listing.type === type);
  }
  
  if (minPrice) {
    filteredListings = filteredListings.filter(listing => listing.price >= parseInt(minPrice));
  }
  
  if (maxPrice) {
    filteredListings = filteredListings.filter(listing => listing.price <= parseInt(maxPrice));
  }
  
  if (sort) {
    switch (sort) {
      case 'price-low':
        filteredListings.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filteredListings.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        filteredListings.sort((a, b) => b.rating - a.rating);
        break;
    }
  }
  
  res.json({
    status: 'success',
    results: filteredListings.length,
    data: {
      listings: filteredListings
    }
  });
});

app.get('/api/listings/:id', (req, res) => {
  const listing = listings.find(l => l.id === req.params.id);
  
  if (!listing) {
    return res.status(404).json({
      status: 'error',
      message: 'Listing not found'
    });
  }
  
  res.json({
    status: 'success',
    data: {
      listing
    }
  });
});

// Reviews endpoints
app.get('/api/listings/:id/reviews', (req, res) => {
  const listingReviews = reviews.filter(r => r.listingId === req.params.id);
  
  res.json({
    status: 'success',
    results: listingReviews.length,
    data: {
      reviews: listingReviews
    }
  });
});

app.post('/api/listings/:id/reviews', (req, res) => {
  const { rating, comment } = req.body;
  
  const newReview = {
    id: `review${reviews.length + 1}`,
    listingId: req.params.id,
    userId: 'user1',
    rating,
    comment,
    date: new Date().toISOString().split('T')[0],
    user: {
      name: 'John Doe',
      avatar: 'https://ui-avatars.com/api/?name=John+Doe&background=FF385C&color=fff'
    }
  };
  
  reviews.push(newReview);
  
  res.status(201).json({
    status: 'success',
    data: {
      review: newReview
    }
  });
});

// Bookings endpoint (simplified)
app.post('/api/bookings', (req, res) => {
  const { listingId, checkIn, checkOut, guests } = req.body;
  
  const listing = listings.find(l => l.id === listingId);
  if (!listing) {
    return res.status(404).json({
      status: 'error',
      message: 'Listing not found'
    });
  }
  
  const booking = {
    id: `booking${Date.now()}`,
    listingId,
    userId: 'user1',
    checkIn,
    checkOut,
    guests,
    totalPrice: listing.price * 3, // Simplified calculation
    status: 'confirmed',
    createdAt: new Date().toISOString()
  };
  
  res.status(201).json({
    status: 'success',
    data: {
      booking
    }
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'success',
    message: 'API is running',
    timestamp: new Date().toISOString()
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 API Server running on http://0.0.0.0:${PORT}`);
  console.log(`📊 Health check: http://0.0.0.0:${PORT}/api/health`);
});
