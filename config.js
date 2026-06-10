// src/config.js

// Detect if the app is running on localhost or a production server like Netlify
const isLocalhost = Boolean(
  window.location.hostname === 'localhost' ||
  window.location.hostname === '[::1]' ||
  window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/)
);

// Set your backend URL accordingly
// When live on Netlify, it will point directly to your live InfinityFree site
const API_BASE_URL = isLocalhost 
  ? 'http://localhost/CareDentalAPI' 
  : 'https://caredentalclinic.site.je';

export default API_BASE_URL;