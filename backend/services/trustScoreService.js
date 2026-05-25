const Plantation = require('../models/Plantation');
const NGO = require('../models/NGO');

/**
 * Calculate trust score for an NGO user.
 *
 * Weighted formula (0-100):
 *   40% — Approval ratio (approved / total submissions)
 *   35% — AI match accuracy (avg closeness of AI count to user count)
 *   25% — Volume factor (logarithmic scale based on total verified trees)
 *
 * @param {string} ngoUserId — The User _id of the NGO partner
 * @returns {{ trustScore, approvedCount, totalSubmissions, totalVerifiedTrees, aiAccuracy }}
 */
const calculateTrustScore = async (ngoUserId) => {
  const allPlantations = await Plantation.find({ ngoId: ngoUserId });

  const totalSubmissions = allPlantations.length;
  if (totalSubmissions === 0) {
    return {
      trustScore: 0,
      approvedCount: 0,
      totalSubmissions: 0,
      totalVerifiedTrees: 0,
      aiAccuracy: 0,
    };
  }

  const approved = allPlantations.filter((p) => p.verificationStatus === 'approved');
  const approvedCount = approved.length;

  // 1) Approval ratio (0-1)
  const approvalRatio = approvedCount / totalSubmissions;

  // 2) AI match accuracy across approved plantations (0-1)
  let aiAccuracy = 0;
  if (approvedCount > 0) {
    const accuracies = approved.map((p) => {
      if (!p.aiTreeCount || !p.treeCount) return 0;
      const diff = Math.abs(p.aiTreeCount - p.treeCount) / p.treeCount;
      return Math.max(0, 1 - diff);
    });
    aiAccuracy = accuracies.reduce((sum, a) => sum + a, 0) / approvedCount;
  }

  // 3) Total verified trees & volume factor (logarithmic 0-1)
  const totalVerifiedTrees = approved.reduce((sum, p) => sum + (p.treeCount || 0), 0);
  // log10(trees+1) / log10(10001) scales so 10,000 trees = 1.0
  const volumeFactor = Math.min(1, Math.log10(totalVerifiedTrees + 1) / Math.log10(10001));

  // Weighted score
  const rawScore = approvalRatio * 40 + aiAccuracy * 35 + volumeFactor * 25;
  const trustScore = Math.round(Math.min(100, Math.max(0, rawScore)));

  return {
    trustScore,
    approvedCount,
    totalSubmissions,
    totalVerifiedTrees,
    aiAccuracy: Math.round(aiAccuracy * 100),
  };
};

/**
 * Recalculate and persist trust score for an NGO.
 * @param {string} ngoUserId — The User _id of the NGO partner
 */
const recalculateTrustScore = async (ngoUserId) => {
  const result = await calculateTrustScore(ngoUserId);

  await NGO.findOneAndUpdate(
    { createdBy: ngoUserId },
    {
      trustScore: result.trustScore,
      totalVerifiedTrees: result.totalVerifiedTrees,
    }
  );

  return result;
};

module.exports = { calculateTrustScore, recalculateTrustScore };
