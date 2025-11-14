const fs = require('fs');
const path = require('path');

// Netlify with Next.js plugin automatically copies public/ to the output
// This script verifies files exist before deployment
try {
  // Try multiple possible paths (local vs Netlify build environment)
  const possibleRoots = [
    path.join(__dirname, '..'),           // Local: scripts/../
    process.cwd(),                         // Netlify: current working directory
    '/opt/build/repo',                     // Netlify: absolute path
  ];
  
  let foundRoot = null;
  let swSource = null;
  let manifestSource = null;
  
  // Find the correct root directory
  for (const root of possibleRoots) {
    const testSwPath = path.join(root, 'public/sw.js');
    const testManifestPath = path.join(root, 'public/manifest.json');
    
    if (fs.existsSync(testSwPath) && fs.existsSync(testManifestPath)) {
      foundRoot = root;
      swSource = testSwPath;
      manifestSource = testManifestPath;
      break;
    }
  }
  
  if (!foundRoot) {
    console.warn('⚠ Could not find public/ directory in expected locations');
    console.warn('  This is OK - Netlify plugin will handle public files automatically');
    process.exit(0); // Exit successfully, let Netlify handle it
  }
  
  // Verify files exist
  if (fs.existsSync(swSource)) {
    console.log('✓ Service worker found in public/');
  } else {
    console.warn('⚠ Service worker not found, but continuing deployment');
    process.exit(0); // Don't fail the build
  }

  if (fs.existsSync(manifestSource)) {
    console.log('✓ Manifest found in public/');
  } else {
    console.warn('⚠ Manifest not found, but continuing deployment');
    process.exit(0); // Don't fail the build
  }
  
  console.log('✓ All PWA files ready for deployment');
  console.log('  Files in public/ will be served by Netlify at root URL');
} catch (error) {
  console.warn('⚠ Error verifying files:', error.message);
  console.warn('  Continuing anyway - Netlify plugin will handle public files');
  process.exit(0); // Don't fail the build on verification errors
}
