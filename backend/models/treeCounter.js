const fs = require('fs');
const path = require('path');

/**
 * 🌳 AI Tree Counter — Real Model Client
 *
 * Sends the plantation image to the Python Flask microservice (running on port 5001)
 * which runs YOLOv8 inference to detect and count trees.
 *
 * @param {string} imagePath — Absolute or relative path to the plantation image
 * @returns {Promise<{ treeCount: number, confidenceScore: number }>}
 */
const analyzeImage = async (imagePath) => {
  try {
    const absolutePath = path.isAbsolute(imagePath) 
      ? imagePath 
      : path.resolve(imagePath);

    if (!fs.existsSync(absolutePath)) {
      throw new Error(`Image file not found at path: ${absolutePath}`);
    }

    // Read the file buffer
    const fileBuffer = fs.readFileSync(absolutePath);
    
    // Create FormData with a Blob for the image
    const formData = new FormData();
    const blob = new Blob([fileBuffer], { type: 'image/jpeg' });
    formData.append('image', blob, path.basename(absolutePath));

    const pythonServerUrl = 'http://127.0.0.1:5001/predict';
    console.log(`[AI Verification] Sending image to Python server: ${pythonServerUrl}`);

    const response = await fetch(pythonServerUrl, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Python AI server returned status ${response.status}: ${errorText}`);
    }

    const result = await response.json();
    if (result.error) {
      throw new Error(result.error || 'AI verification failed at Python server');
    }

    const treeCount = result.total_detections;
    let confidenceScore = 0;

    if (result.detections && result.detections.length > 0) {
      const sumConfidence = result.detections.reduce((sum, item) => sum + item.confidence, 0);
      const avgConfidence = sumConfidence / result.detections.length;
      confidenceScore = Math.round(avgConfidence * 10000) / 100; // e.g. 32.1%
    }

    console.log(`[AI Verification] Success! Detected ${treeCount} trees (average confidence: ${confidenceScore}%)`);
    return {
      treeCount,
      confidenceScore
    };
  } catch (error) {
    console.error('[AI Verification Error]:', error.message);
    throw error;
  }
};

module.exports = { analyzeImage };
