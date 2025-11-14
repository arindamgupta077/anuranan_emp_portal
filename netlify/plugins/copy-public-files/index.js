module.exports = {
  onPostBuild: async ({ utils, constants }) => {
    const fs = require('fs');
    const path = require('path');
    
    console.log('📦 Copying public files to publish directory...');
    
    const publicDir = path.join(constants.BUILD_DIR, 'public');
    const publishDir = constants.PUBLISH_DIR;
    
    // Files that need to be at root
    const filesToCopy = ['sw.js', 'manifest.json', 'icon-192.png', 'icon-512.png'];
    
    for (const file of filesToCopy) {
      const src = path.join(publicDir, file);
      const dest = path.join(publishDir, file);
      
      try {
        if (fs.existsSync(src)) {
          fs.copyFileSync(src, dest);
          console.log(`✅ Copied ${file} to publish directory`);
        } else {
          console.warn(`⚠️  ${file} not found in public directory`);
        }
      } catch (error) {
        console.error(`❌ Failed to copy ${file}:`, error.message);
      }
    }
    
    console.log('✅ Public files copied successfully');
  },
};
