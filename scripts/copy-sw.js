const fs = require('fs');
const path = require('path');

// Copy service worker to .next/static for Netlify deployment
const swSource = path.join(__dirname, '../public/sw.js');
const swDest = path.join(__dirname, '../.next/static/sw.js');
const manifestSource = path.join(__dirname, '../public/manifest.json');
const manifestDest = path.join(__dirname, '../.next/static/manifest.json');

try {
  // Ensure .next/static directory exists
  const staticDir = path.join(__dirname, '../.next/static');
  if (!fs.existsSync(staticDir)) {
    fs.mkdirSync(staticDir, { recursive: true });
  }

  // Copy service worker
  if (fs.existsSync(swSource)) {
    fs.copyFileSync(swSource, swDest);
    console.log('✓ Service worker copied to .next/static/');
  } else {
    console.error('✗ Service worker not found at', swSource);
  }

  // Copy manifest
  if (fs.existsSync(manifestSource)) {
    fs.copyFileSync(manifestSource, manifestDest);
    console.log('✓ Manifest copied to .next/static/');
  } else {
    console.error('✗ Manifest not found at', manifestSource);
  }
} catch (error) {
  console.error('Error copying files:', error);
  process.exit(1);
}
