// compress-images.js
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  inputDir: './images',           // Folder with your original images
  outputDir: './compressed',      // Where compressed images go
  maxWidth: 1920,                // Max width in pixels
  quality: 85,                    // JPEG quality (1-100)
  maxFileSizeKB: 4000,           // Target max file size in KB (under 4.5MB limit)
  formats: ['.jpg', '.jpeg', '.png', '.webp'] // Supported formats
};

// Create output directory if it doesn't exist
if (!fs.existsSync(CONFIG.outputDir)) {
  fs.mkdirSync(CONFIG.outputDir, { recursive: true });
}

// Get all image files from input directory
function getImageFiles(dir) {
  const files = fs.readdirSync(dir);
  return files.filter(file => {
    const ext = path.extname(file).toLowerCase();
    return CONFIG.formats.includes(ext);
  });
}

// Compress a single image
async function compressImage(inputPath, outputPath) {
  try {
    const stats = fs.statSync(inputPath);
    const originalSizeKB = Math.round(stats.size / 1024);
    
    console.log(`Processing: ${path.basename(inputPath)} (${originalSizeKB}KB)`);
    
    // If already small enough, just copy
    if (originalSizeKB <= CONFIG.maxFileSizeKB) {
      fs.copyFileSync(inputPath, outputPath);
      console.log(`✓ Copied (already small): ${path.basename(outputPath)}`);
      return;
    }
    
    let sharpInstance = sharp(inputPath);
    
    // Get image metadata
    const metadata = await sharpInstance.metadata();
    
    // Resize if too wide
    if (metadata.width > CONFIG.maxWidth) {
      sharpInstance = sharpInstance.resize(CONFIG.maxWidth, null, {
        withoutEnlargement: true
      });
    }
    
    // Convert PNG to JPEG for better compression (optional)
    const ext = path.extname(inputPath).toLowerCase();
    const outputExt = ext === '.png' ? '.jpg' : ext;
    const finalOutputPath = outputPath.replace(path.extname(outputPath), outputExt);
    
    // Apply compression based on format
    if (outputExt === '.jpg' || outputExt === '.jpeg') {
      sharpInstance = sharpInstance.jpeg({ quality: CONFIG.quality });
    } else if (outputExt === '.png') {
      sharpInstance = sharpInstance.png({ quality: CONFIG.quality });
    } else if (outputExt === '.webp') {
      sharpInstance = sharpInstance.webp({ quality: CONFIG.quality });
    }
    
    // Save compressed image
    await sharpInstance.toFile(finalOutputPath);
    
    // Check final file size
    const finalStats = fs.statSync(finalOutputPath);
    const finalSizeKB = Math.round(finalStats.size / 1024);
    const savings = Math.round(((originalSizeKB - finalSizeKB) / originalSizeKB) * 100);
    
    console.log(`✓ ${path.basename(finalOutputPath)}: ${originalSizeKB}KB → ${finalSizeKB}KB (${savings}% smaller)`);
    
    // If still too large, try more aggressive compression
    if (finalSizeKB > CONFIG.maxFileSizeKB) {
      console.log(`  ⚠ Still large (${finalSizeKB}KB), trying quality 70...`);
      
      let aggressiveInstance = sharp(inputPath);
      if (metadata.width > CONFIG.maxWidth) {
        aggressiveInstance = aggressiveInstance.resize(CONFIG.maxWidth, null, {
          withoutEnlargement: true
        });
      }
      
      aggressiveInstance = aggressiveInstance.jpeg({ quality: 70 });
      await aggressiveInstance.toFile(finalOutputPath);
      
      const newStats = fs.statSync(finalOutputPath);
      const newSizeKB = Math.round(newStats.size / 1024);
      console.log(`  → Final: ${newSizeKB}KB`);
    }
    
  } catch (error) {
    console.error(`✗ Error processing ${inputPath}:`, error.message);
  }
}

// Main function
async function compressAllImages() {
  console.log('🖼️  Bulk Image Compression Tool');
  console.log(`Input: ${CONFIG.inputDir}`);
  console.log(`Output: ${CONFIG.outputDir}`);
  console.log(`Max width: ${CONFIG.maxWidth}px`);
  console.log(`Quality: ${CONFIG.quality}%`);
  console.log(`Target max size: ${CONFIG.maxFileSizeKB}KB\n`);
  
  const imageFiles = getImageFiles(CONFIG.inputDir);
  
  if (imageFiles.length === 0) {
    console.log('No images found in input directory.');
    return;
  }
  
  console.log(`Found ${imageFiles.length} images to process...\n`);
  
  const startTime = Date.now();
  let processed = 0;
  
  for (const file of imageFiles) {
    const inputPath = path.join(CONFIG.inputDir, file);
    const outputPath = path.join(CONFIG.outputDir, file);
    
    await compressImage(inputPath, outputPath);
    processed++;
    
    // Progress indicator
    const progress = Math.round((processed / imageFiles.length) * 100);
    console.log(`Progress: ${processed}/${imageFiles.length} (${progress}%)\n`);
  }
  
  const endTime = Date.now();
  const duration = Math.round((endTime - startTime) / 1000);
  
  console.log(`🎉 Compression complete!`);
  console.log(`Processed ${processed} images in ${duration}s`);
  console.log(`Check the '${CONFIG.outputDir}' folder for compressed images.`);
}

// Run the compression
compressAllImages().catch(console.error);