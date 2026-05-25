/**
 * 🌳 AI Tree Counter — Mock Model
 *
 * This is a placeholder that returns a random tree count and confidence score.
 * Replace the body of `analyzeImage` with your real AI model later.
 * The function signature will stay the same so no other code needs to change.
 *
 * @param {string} imagePath — Absolute or relative path to the plantation image
 * @returns {Promise<{ treeCount: number, confidenceScore: number }>}
 */
const analyzeImage = async (imagePath) => {
  // Simulate processing delay (200-600ms)
  await new Promise((resolve) => setTimeout(resolve, 200 + Math.random() * 400));

  // Generate a random tree count between 5 and 200
  const treeCount = Math.floor(Math.random() * 196) + 5;

  // Generate a confidence score between 70 and 99
  const confidenceScore = Math.floor(Math.random() * 30) + 70;

  return { treeCount, confidenceScore };
};

module.exports = { analyzeImage };
