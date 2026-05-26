import React, { useState, useRef } from 'react';
import { Search, MapPin, Bed, Bath, Star, Heart, Menu, X, Home, Calendar, ChevronLeft, ChevronRight, Check, MessageCircle, Mail, Phone, Quote } from 'lucide-react';
import './App.css';

// --- MOCK DATA GENERATOR ---
const generateListings = (baseArray, startId) => {
  const listings = [];
  for (let i = 0; i < 20; i++) {
    const base = baseArray[i % baseArray.length];
    listings.push({
      ...base,
      id: startId + i,
      title: i < baseArray.length ? base.title : `${base.title} (Unit ${i + 1})`,
      price: base.price + (Math.floor(Math.random() * 4) * 10),
      isPopular: i % 6 === 0, 
    });
  }
  return listings;
};

// --- BASE LISTING DATA ---
const baseSingleRooms = [
  { title: "Modern Self-Contained Room", location: "East Legon, Accra", price: 150, rating: 4.8, beds: 1, baths: 1, image: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80" },
  { title: "Cozy Student Studio", location: "Legon, Accra", price: 80, rating: 4.5, beds: 1, baths: 1, image: "https://images.unsplash.com/photo-1536376072261-38c75010e6c9?auto=format&fit=crop&w=800&q=80" },
  { title: "Executive Single Room", location: "Osu, Accra", price: 120, rating: 4.7, beds: 1, baths: 1, image: "https://images.unsplash.com/photo-1505693314120-0d443867891c?auto=format&fit=crop&w=800&q=80" },
  { title: "Secure Self-Contained", location: "Madina, Accra", price: 70, rating: 4.4, beds: 1, baths: 1, image: "https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=800&q=80" },
  { title: "Neat Single Room", location: "Lapaz, Accra", price: 60, rating: 4.2, beds: 1, baths: 1, image: "https://images.unsplash.com/photo-1630699144339-420f59b4747b?auto=format&fit=crop&w=800&q=80" },
];

const baseChamberAndHall = [
  { title: "Luxury Chamber & Hall", location: "Spintex, Accra", price: 250, rating: 4.9, beds: 1, baths: 1, image: "https://www.lendlease.com/contentassets/302840d3bc9846579cb9f785ed8abb9a/luxury-interior-design_hero.jpg?width=2560&upscale=false&format=webp&mode=crop&anchor=center&quality=50" },
  { title: "Newly Built Chamber & Hall", location: "Dansoman, Accra", price: 180, rating: 4.6, beds: 1, baths: 1, image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80" },
  { title: "Spacious Self-Contained C&H", location: "Tema, Accra", price: 150, rating: 4.5, beds: 1, baths: 1, image: "https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=800&q=80" },
  { title: "Executive Chamber & Hall", location: "Cantonments, Accra", price: 400, rating: 5.0, beds: 1, baths: 1.5, image: "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=800&q=80" },
  { title: "Neat Chamber & Hall", location: "Adenta, Accra", price: 130, rating: 4.3, beds: 1, baths: 1, image: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80" },
];

const baseTwoBedrooms = [
  { title: "Modern 2-Bedroom Apartment", location: "East Legon, Accra", price: 650, rating: 4.9, beds: 2, baths: 2, image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80" },
  { title: "Furnished 2-Bedroom Suite", location: "Airport Residential", price: 900, rating: 4.8, beds: 2, baths: 2.5, image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80" },
  { title: "Family 2-Bedroom House", location: "Kumasi, Ashanti", price: 300, rating: 4.6, beds: 2, baths: 2, image: "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=800&q=80" },
  { title: "Ocean View 2-Bedroom", location: "Cape Coast, Central", price: 280, rating: 4.7, beds: 2, baths: 2, image: "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&w=800&q=80" },
  { title: "Secure Gated 2-Bedroom", location: "Achimota, Accra", price: 400, rating: 4.5, beds: 2, baths: 2, image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80" },
];

const SINGLE_ROOMS = generateListings(baseSingleRooms, 1000);
const CHAMBER_AND_HALL = generateListings(baseChamberAndHall, 2000);
const TWO_BEDROOMS = generateListings(baseTwoBedrooms, 3000);

// --- REVIEWS DATA ---
const REVIEWS = [
  { id: 1, name: "Kwesi Mensah", location: "East Legon, Accra", rating: 5, text: "LuxeRent made finding my perfect apartment so easy! The verification process gave me complete peace of mind.", date: "2 weeks ago", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80" },
  { id: 2, name: "Ama Osei", location: "Osu, Accra", rating: 5, text: "Excellent service! The team was helpful and responsive throughout the entire rental process.", date: "1 month ago", image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80" },
  { id: 3, name: "John Owusu", location: "Tema, Accra", rating: 4, text: "Great selection of properties and transparent pricing. Highly recommend for anyone looking to rent.", date: "3 weeks ago", image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80" },
  { id: 4, name: "Gifty Boateng", location: "Spintex, Accra", rating: 5, text: "Found my dream apartment through LuxeRent! The platform is user-friendly and trustworthy.", date: "1 week ago", image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=400&q=80" },
  { id: 5, name: "Abban Mensah", location: "Cantonments, Accra", rating: 5, text: "Quick response times and professional support. This is the future of property rental in Ghana!", date: "2 days ago", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80" },
  { id: 6, name: "Zainab Ibrahim", location: "Accra Central", rating: 4, text: "Very satisfied with my rental experience. LuxeRent's verification system is top-notch.", date: "5 days ago", image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80" }
];

// --- NAVBAR COMPONENT ---
const Navbar = ({ currentPage, setCurrentPage }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleNavClick = (page) => {
    setCurrentPage(page);
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="nav-brand" onClick={() => handleNavClick('home')} style={{ cursor: 'pointer' }}>
        <Home size={32} color="#60a5fa" />
        <span>Luxe<span className="brand-accent">Rent</span></span>
      </div>
      
      <div className={`nav-links ${isMobileMenuOpen ? 'active' : ''}`}>
        <button className="nav-link-btn" onClick={() => handleNavClick('home')}>Home</button>
        <button className="nav-link-btn" onClick={() => handleNavClick('about')}>About</button>
        <button className="nav-link-btn" onClick={() => handleNavClick('contact')}>Contact</button>
        <button className="nav-link-btn mobile-only-btn">Sign In</button>
      </div>

      <div className="nav-actions">
        <button className="btn-signin desktop-only-btn">Sign In</button>
        <button className="btn-post">Post Property</button>
        
        <button 
          className="menu-toggle" 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
    </nav>
  );
};

const Hero = () => (
  <header className="hero">
    <div className="hero-bg" />
    <div className="hero-overlay" />
    <div className="hero-content">
      <h1 className="hero-title">
        Find Your Perfect <br />
        <span className="hero-gradient-text">Place to Live</span>
      </h1>
      <p className="hero-description">
        Discover premium single rooms, chamber and hall setups, and spacious apartments curated just for you.
      </p>

      <div className="search-container">
        <div className="search-field">
          <MapPin size={20} className="field-icon" />
          <input type="text" placeholder="Where do you want to live?" />
        </div>
        <div className="search-field hidden-mobile">
          <Calendar size={20} className="field-icon" />
          <input type="text" placeholder="Move-in Date" />
        </div>
        <button className="btn-search">
          <Search size={20} />
          <span>Search</span>
        </button>
      </div>
    </div>
  </header>
);

const PropertyCard = ({ property }) => {
  const [isLiked, setIsLiked] = useState(false);

  return (
    <article className="card">
      <div className="card-media">
        <img src={property.image} alt={property.title} className="card-img" />
        <button 
          className="btn-heart" 
          onClick={(e) => { e.stopPropagation(); setIsLiked(!isLiked); }}
          aria-label="Save listing"
        >
          <Heart size={18} color={isLiked ? "#ef4444" : "#475569"} fill={isLiked ? "#ef4444" : "none"} />
        </button>
        {property.isPopular && <span className="badge-popular">POPULAR</span>}
      </div>
      
      <div className="card-body">
        <div className="card-row-top">
          <div style={{ minWidth: 0 }}>
            <h3 className="card-title" title={property.title}>{property.title}</h3>
            <p className="card-location">
              <MapPin size={14} style={{ marginRight: '4px', flexShrink: 0 }} /> {property.location}
            </p>
          </div>
          <div className="card-rating">
            <Star size={14} className="icon-star" />
            <span>{property.rating}</span>
          </div>
        </div>

        <div className="card-specs">
          <div className="spec-item">
            <Bed size={14} className="spec-icon" />
            <span>{property.beds}</span>
          </div>
          <div className="spec-item">
            <Bath size={14} className="spec-icon" />
            <span>{property.baths}</span>
          </div>
        </div>

        <div className="card-footer">
          <div>
            <span className="price-amount">GH₵ {property.price}</span>
            <span className="price-unit"> / mo</span>
          </div>
          <button className="btn-details">View Details</button>
        </div>
      </div>
    </article>
  );
};

const PropertySection = ({ title, subtitle, properties, onViewAll }) => {
  const sliderRef = useRef(null);

  const slide = (direction) => {
    if (sliderRef.current) {
      const scrollAmount = direction === 'left' ? -300 : 300; 
      sliderRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <section className="property-section">
      <div className="section-header">
        <div>
          <h3 className="section-title">{title}</h3>
          <p className="section-subtitle">{subtitle}</p>
        </div>
        <button className="btn-view-all" onClick={onViewAll}>View all {properties.length}</button>
      </div>
      
      <div className="slider-wrapper">
        <button className="slider-btn slider-btn-left" onClick={() => slide('left')}>
          <ChevronLeft size={24} />
        </button>
        
        <div className="slider-track" ref={sliderRef}>
          {properties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>

        <button className="slider-btn slider-btn-right" onClick={() => slide('right')}>
          <ChevronRight size={24} />
        </button>
      </div>
    </section>
  );
};

const AllPropertiesPage = ({ title, properties, onBack }) => {
  const [isLiked, setIsLiked] = useState({});

  const toggleLike = (propertyId) => {
    setIsLiked(prev => ({
      ...prev,
      [propertyId]: !prev[propertyId]
    }));
  };

  return (
    <div className="all-properties-container">
      <div className="all-properties-header">
        <button className="btn-back" onClick={onBack}>
          <ChevronLeft size={24} />
          Back
        </button>
        <h1>{title}</h1>
      </div>

      <div className="all-properties-grid">
        {properties.map((property) => (
          <article key={property.id} className="card all-property-card">
            <div className="card-media">
              <img src={property.image} alt={property.title} className="card-img" />
              <button 
                className="btn-heart" 
                onClick={() => toggleLike(property.id)}
                aria-label="Save listing"
              >
                <Heart size={18} color={isLiked[property.id] ? "#ef4444" : "#475569"} fill={isLiked[property.id] ? "#ef4444" : "none"} />
              </button>
              {property.isPopular && <span className="badge-popular">POPULAR</span>}
            </div>
            
            <div className="card-body">
              <div className="card-row-top">
                <div style={{ minWidth: 0 }}>
                  <h3 className="card-title" title={property.title}>{property.title}</h3>
                  <p className="card-location">
                    <MapPin size={14} style={{ marginRight: '4px', flexShrink: 0 }} /> {property.location}
                  </p>
                </div>
                <div className="card-rating">
                  <Star size={14} className="icon-star" />
                  <span>{property.rating}</span>
                </div>
              </div>

              <div className="card-specs">
                <div className="spec-item">
                  <Bed size={14} className="spec-icon" />
                  <span>{property.beds}</span>
                </div>
                <div className="spec-item">
                  <Bath size={14} className="spec-icon" />
                  <span>{property.baths}</span>
                </div>
              </div>

              <div className="card-footer">
                <div>
                  <span className="price-amount">GH₵ {property.price}</span>
                  <span className="price-unit"> / mo</span>
                </div>
                <button className="btn-details">View Details</button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};

const AboutUs = () => (
  <div className="about-container">
    <section className="about-hero">
      <div className="about-hero-overlay" />
      <div className="about-hero-content">
        <h1 className="about-hero-title">About LuxeRent</h1>
        <p className="about-hero-subtitle">Revolutionizing the way people find their perfect home</p>
      </div>
    </section>

    <section className="mission-vision-section">
      <div className="mission-vision-container">
        <div className="mission-card">
          <div className="card-icon-box"><span className="card-icon">🎯</span></div>
          <h3>Our Mission</h3>
          <p>To simplify the rental process by connecting verified landlords with trustworthy tenants, making housing accessible, transparent, and hassle-free for everyone in Ghana.</p>
        </div>
        <div className="mission-card">
          <div className="card-icon-box"><span className="card-icon">🌟</span></div>
          <h3>Our Vision</h3>
          <p>To become Ghana's leading rental platform, transforming how people discover, evaluate, and secure their ideal living spaces through innovative technology and exceptional service.</p>
        </div>
      </div>
    </section>

    <section className="why-choose-section">
      <div className="why-choose-container">
        <h2 className="section-heading">Why Choose LuxeRent?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">✓</div>
            <h4>Verified Properties</h4>
            <p>Every listing is thoroughly vetted to ensure authenticity and quality standards.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">💬</div>
            <h4>Expert Support</h4>
            <p>Our dedicated team is always ready to assist you throughout your rental journey.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">💰</div>
            <h4>Transparent Pricing</h4>
            <p>No hidden fees or surprises. What you see is what you pay, guaranteed.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">⚡</div>
            <h4>Quick & Easy</h4>
            <p>Find your ideal home in minutes with our intuitive search and booking system.</p>
          </div>
        </div>
      </div>
    </section>

    <section className="story-section">
      <div className="story-container">
        <h2 className="section-heading">Our Story</h2>
        <div className="story-content">
          <p>LuxeRent was founded with a simple but powerful vision: to address the challenges renters and landlords face in Ghana's housing market. We recognized that the rental process was often filled with uncertainty, inefficiency, and trust issues.</p>
          <p>What started as a small initiative to create a safer, more transparent rental platform has grown into a comprehensive solution serving thousands of happy renters across Ghana. Today, we're committed to maintaining the highest standards of quality, security, and customer satisfaction.</p>
          <p>Our journey continues as we work to make housing accessible to everyone, regardless of their background or circumstances.</p>
        </div>
      </div>
    </section>

    <section className="values-section">
      <div className="values-container">
        <h2 className="section-heading">Our Core Values</h2>
        <div className="values-grid">
          <div className="value-card"><h4>Transparency</h4><p>We believe in honest communication and clear information at every step.</p></div>
          <div className="value-card"><h4>Trust</h4><p>Building trust is the foundation of everything we do for our community.</p></div>
          <div className="value-card"><h4>Innovation</h4><p>We continuously improve our platform to serve you better.</p></div>
          <div className="value-card"><h4>Community</h4><p>We're more than a platform; we're a community helping people find home.</p></div>
        </div>
      </div>
    </section>

    <section className="stats-section">
      <div className="stats-container">
        <div className="stat-item"><h3>500+</h3><p>Properties Listed</p></div>
        <div className="stat-item"><h3>2,000+</h3><p>Happy Renters</p></div>
        <div className="stat-item"><h3>50+</h3><p>Locations Covered</p></div>
        <div className="stat-item"><h3>99%</h3><p>Satisfaction Rate</p></div>
      </div>
    </section>
  </div>
);

// --- CONTACT FORM COMPONENT ---
const ContactForm = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [formStatus, setFormStatus] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.fullName || !formData.email || !formData.phone || !formData.subject || !formData.message) {
      setFormStatus('error');
      setTimeout(() => setFormStatus(''), 3000);
      return;
    }

    const whatsappNumber = '+23353 347 7390';
    const messageText = `Hi LuxeRent,\n\nName: ${formData.fullName}\nEmail: ${formData.email}\nPhone: ${formData.phone}\n\nSubject: ${formData.subject}\n\nMessage:\n${formData.message}`;
    const encodedMessage = encodeURIComponent(messageText);
    const whatsappURL = `https://wa.me/${whatsappNumber.replace('+', '')}?text=${encodedMessage}`;

    window.open(whatsappURL, '_blank');

    setFormData({ fullName: '', email: '', phone: '', subject: '', message: '' });
    setFormStatus('success');
    setTimeout(() => setFormStatus(''), 3000);
  };

  return (
    <form className="contact-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <input type="text" name="fullName" placeholder="Full Name" value={formData.fullName} onChange={handleInputChange} className="form-input" required />
      </div>
      <div className="form-group">
        <input type="email" name="email" placeholder="Email Address" value={formData.email} onChange={handleInputChange} className="form-input" required />
      </div>
      <div className="form-group">
        <input type="tel" name="phone" placeholder="Phone Number" value={formData.phone} onChange={handleInputChange} className="form-input" required />
      </div>
      <div className="form-group">
        <input type="text" name="subject" placeholder="Subject" value={formData.subject} onChange={handleInputChange} className="form-input" required />
      </div>
      <div className="form-group">
        <textarea name="message" placeholder="Your Message" value={formData.message} onChange={handleInputChange} className="form-textarea" rows="5" required />
      </div>
      <button type="submit" className="form-submit-btn">Send Message via WhatsApp</button>
      {formStatus === 'success' && <p className="form-success">Message sent successfully! Redirecting to WhatsApp...</p>}
      {formStatus === 'error' && <p className="form-error">Please fill in all fields before submitting.</p>}
    </form>
  );
};

// --- REVIEWS & CONTACT COMPONENT ---
const ReviewsAndContact = () => {
  return (
    <div className="reviews-contact-container">
      <section className="reviews-section">
        <div className="reviews-header">
          <h2>What Our Renters Say</h2>
          <p>Real feedback from our satisfied community members</p>
        </div>

        <div className="reviews-grid">
          {REVIEWS.map(review => (
            <div key={review.id} className="review-card">
              <div className="review-header">
                <img src={review.image} alt={review.name} className="reviewer-avatar" />
                <div className="reviewer-info">
                  <h4>{review.name}</h4>
                  <p className="reviewer-location">{review.location}</p>
                </div>
              </div>
              <div className="review-rating">
                {[...Array(review.rating)].map((_, i) => (
                  <Star key={i} size={16} className="review-star" />
                ))}
              </div>
              <p className="review-text">
                <Quote size={16} className="quote-icon" />
                {review.text}
              </p>
              <p className="review-date">{review.date}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="contact-section">
        <div className="contact-container">
          <h2 className="contact-heading">Get In Touch</h2>
          <div className="contact-content">
            <div className="contact-info">
              <h3>Contact Information</h3>
              <p>Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.</p>
              
              <div className="contact-methods">
                <div className="contact-method">
                  <div className="method-icon"><MessageCircle size={24} /></div>
                  <div>
                    <h5>WhatsApp</h5>
                    <a href="https://wa.me/233533477390" target="_blank" rel="noopener noreferrer">+233533477390 </a>
                  </div>
                </div>
                <div className="contact-method">
                  <div className="method-icon"><Mail size={24} /></div>
                  <div>
                    <h5>Email</h5>
                    <a href="mailto:troyroy124@gmail.com">troyroy124@gmail.com</a>
                  </div>
                </div>
                <div className="contact-method">
                  <div className="method-icon"><Phone size={24} /></div>
                  <div>
                    <h5>Phone</h5>
                    <a href="tel:+233533477390">+233533477390</a>
                  </div>
                </div>
              </div>
            </div>

            <div className="contact-form-wrapper">
              <h3>Send us a Message</h3>
              <ContactForm />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

// --- FOOTER COMPONENT ---
const Footer = () => (
  <footer className="footer">
    <div className="footer-content">
      <div className="footer-main">
        <div className="footer-section">
          <h4>About LuxeRent</h4>
          <p>Your trusted platform for finding premium rental properties across Ghana. We connect verified landlords with trustworthy tenants.</p>
        </div>
        
        <div className="footer-section">
          <h4>Quick Links</h4>
          <ul>
            <li><a href="#home">Home</a></li>
            <li><a href="#about">About Us</a></li>
            <li><a href="#contact">Contact</a></li>
            <li><a href="#faq">FAQ</a></li>
          </ul>
        </div>
        
        <div className="footer-section">
          <h4>Properties</h4>
          <ul>
            <li><a href="#single-rooms">Single Rooms</a></li>
            <li><a href="#chamber-hall">Chamber & Hall</a></li>
            <li><a href="#two-bedrooms">Two Bedrooms</a></li>
            <li><a href="#all-properties">All Properties</a></li>
          </ul>
        </div>
        
        <div className="footer-section">
          <h4>Contact Info</h4>
          <ul>
            <li><a href="https://wa.me/233533477390" target="_blank" rel="noopener noreferrer">WhatsApp: +233533477390</a></li>
            <li><a href="mailto:troyroy124@gmail.com">Email: troyroy124@gmail.com</a></li>
            <li><a href="tel:+233533477390">Phone: +233533477390</a></li>
          </ul>
        </div>
      </div>
      
      <div className="footer-bottom">
        <div className="footer-copyright">
          <p>&copy; 2024 LuxeRent. All rights reserved. | Designed & Developed by Nana Kwadwo Riverson</p>
        </div>
        <div className="footer-socials">
          <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="footer-social-link" aria-label="Facebook">
            <span>f</span>
          </a>
          <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="footer-social-link" aria-label="Twitter">
            <span>𝕏</span>
          </a>
          <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="footer-social-link" aria-label="Instagram">
            <span>📷</span>
          </a>
          <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="footer-social-link" aria-label="LinkedIn">
            <span>in</span>
          </a>
        </div>
      </div>
    </div>
  </footer>
);

// --- MAIN APP (ONLY ONE DEFAULT EXPORT) ---
export default function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [viewAllCategory, setViewAllCategory] = useState(null);

  const handleViewAll = (category) => {
    setViewAllCategory(category);
  };

  const handleBackFromViewAll = () => {
    setViewAllCategory(null);
  };

  return (
    <div>
      <Navbar currentPage={currentPage} setCurrentPage={setCurrentPage} />
      
      {currentPage === 'home' && !viewAllCategory && (
        <>
          <Hero />
          <main className="main-content">
            <div className="available-houses-header">
              <h2 className="main-heading">Available Houses</h2>
              <p className="main-subheading">Browse through our meticulously verified properties tailored to your needs.</p>
            </div>

            <PropertySection 
              title="Single Rooms" 
              subtitle="Affordable and cozy self-contained spaces perfect for individuals." 
              properties={SINGLE_ROOMS}
              onViewAll={() => handleViewAll('single-rooms')}
            />
            <PropertySection 
              title="Chamber and Hall" 
              subtitle="The perfect balance of privacy and living space." 
              properties={CHAMBER_AND_HALL}
              onViewAll={() => handleViewAll('chamber-hall')}
            />
            <PropertySection 
              title="Two Bedrooms" 
              subtitle="Spacious apartments and houses for small families or roommates." 
              properties={TWO_BEDROOMS}
              onViewAll={() => handleViewAll('two-bedrooms')}
            />

            <section className="about-us-section">
              <div className="about-us-content">
                <h2 className="section-heading">Why Choose LuxeRent?</h2>
                <div className="features-grid">
                  <div className="feature-card">
                    <div className="feature-icon">✓</div>
                    <h4>Verified Properties</h4>
                    <p>Every listing is thoroughly vetted to ensure authenticity and quality standards.</p>
                  </div>
                  <div className="feature-card">
                    <div className="feature-icon">💬</div>
                    <h4>Expert Support</h4>
                    <p>Our dedicated team is always ready to assist you throughout your rental journey.</p>
                  </div>
                  <div className="feature-card">
                    <div className="feature-icon">💰</div>
                    <h4>Transparent Pricing</h4>
                    <p>No hidden fees or surprises. What you see is what you pay, guaranteed.</p>
                  </div>
                  <div className="feature-card">
                    <div className="feature-icon">⚡</div>
                    <h4>Quick & Easy</h4>
                    <p>Find your ideal home in minutes with our intuitive search and booking system.</p>
                  </div>
                </div>
              </div>
            </section>

            <section className="reviews-section-home">
              <div className="reviews-header">
                <h2>What Our Renters Say</h2>
                <p>Real feedback from our satisfied community members</p>
              </div>

              <div className="reviews-grid-home">
                {REVIEWS.slice(0, 3).map(review => (
                  <div key={review.id} className="review-card">
                    <div className="review-header">
                      <img src={review.image} alt={review.name} className="reviewer-avatar" />
                      <div className="reviewer-info">
                        <h4>{review.name}</h4>
                        <p className="reviewer-location">{review.location}</p>
                      </div>
                    </div>
                    <div className="review-rating">
                      {[...Array(review.rating)].map((_, i) => (
                        <Star key={i} size={16} className="review-star" />
                      ))}
                    </div>
                    <p className="review-text">
                      <Quote size={16} className="quote-icon" />
                      {review.text}
                    </p>
                    <p className="review-date">{review.date}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="contact-section-home">
              <div className="contact-container-home">
                <h2 className="contact-heading">Get In Touch</h2>
                
                <div className="contact-content-home">
                  <div className="contact-info-home">
                    <h3>Contact Information</h3>
                    <p>Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.</p>
                    
                    <div className="contact-methods-home">
                      <div className="contact-method-home">
                        <div className="method-icon-home"><MessageCircle size={24} /></div>
                        <div>
                          <h5>WhatsApp</h5>
                          <a href="https://wa.me/233533477390" target="_blank" rel="noopener noreferrer">+233533477390</a>
                        </div>
                      </div>
                      <div className="contact-method-home">
                        <div className="method-icon-home"><Mail size={24} /></div>
                        <div>
                          <h5>Email</h5>
                          <a href="mailto:troyroy124@gmail.com">troyroy124@gmail.com</a>
                        </div>
                      </div>
                      <div className="contact-method-home">
                        <div className="method-icon-home"><Phone size={24} /></div>
                        <div>
                          <h5>Phone</h5>
                          <a href="tel:+233533477390">+233533477390</a>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="contact-form-wrapper-home">
                    <h3>Send us a Message</h3>
                    <ContactForm />
                  </div>
                </div>
              </div>
            </section>
          </main>
        </>
      )}

      {currentPage === 'home' && viewAllCategory === 'single-rooms' && (
        <AllPropertiesPage title="All Single Rooms" properties={SINGLE_ROOMS} onBack={handleBackFromViewAll} />
      )}
      {currentPage === 'home' && viewAllCategory === 'chamber-hall' && (
        <AllPropertiesPage title="All Chamber and Hall" properties={CHAMBER_AND_HALL} onBack={handleBackFromViewAll} />
      )}
      {currentPage === 'home' && viewAllCategory === 'two-bedrooms' && (
        <AllPropertiesPage title="All Two Bedroom Apartments" properties={TWO_BEDROOMS} onBack={handleBackFromViewAll} />
      )}

      {currentPage === 'about' && <AboutUs />}
      {currentPage === 'contact' && <ReviewsAndContact />}
      
      <Footer />
    </div>
  );
}