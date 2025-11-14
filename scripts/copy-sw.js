const fs = require('fs');
const path = require('path');

// Netlify with Next.js plugin automatically copies public/ to the output
// This script ensures files are accessible from root URL
try {
  const swSource = path.join(__dirname, '../public/sw.js');
  const manifestSource = path.join(__dirname, '../public/manifest.json');
  
  // Verify files exist
  if (fs.existsSync(swSource)) {
    console.log('✓ Service worker found in public/');
  } else {
    console.error('✗ Service worker not found at', swSource);
    process.exit(1);
  }

  if (fs.existsSync(manifestSource)) {
    console.log('✓ Manifest found in public/');
  } else {
    console.error('✗ Manifest not found at', manifestSource);
    process.exit(1);
  }
  
  console.log('✓ All PWA files ready for deployment');
  console.log('  Files in public/ will be served by Netlify at root URL');
} catch (error) {
  console.error('Error verifying files:', error);
  process.exit(1);
}
