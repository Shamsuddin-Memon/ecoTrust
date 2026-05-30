const Plantation = require('../models/Plantation');
const NGO = require('../models/NGO');
const TrustHistory = require('../models/TrustHistory');
const Monitoring = require('../models/Monitoring');

/**
 * Calculate trust score for an NGO user.
 *
 * Weighted formula (0-100):
 *   40% — Approval ratio (approved / total submissions)
 *   40% — AI match accuracy (avg closeness of AI count to user count across all reviewed submissions)
 *   20% — Volume factor (logarithmic scale based on total verified trees)
 *
 * Penalties:
 *   -10 points — Per rejected submission
 *   -15 points — Per critical discrepancy (reported count differs by >30% from AI count)
 *   -15 points — Per low survival rate event (survival rate < 70% in monitoring)
 *
 * @param {string} ngoUserId — The User _id of the NGO partner
 * @returns {{ trustScore, approvedCount, totalSubmissions, totalVerifiedTrees, aiAccuracy, criticalDiscrepancies, rejectionCount, lowSurvivalAlerts, trustTier }}
 */
const calculateTrustScore = async (ngoUserId) => {
  const allPlantations = await Plantation.find({ ngoId: ngoUserId });

  const totalSubmissions = allPlantations.length;
  if (totalSubmissions === 0) {
    return {
      trustScore: 70, // Default start score
      approvedCount: 0,
      totalSubmissions: 0,
      totalVerifiedTrees: 0,
      aiAccuracy: 100,
      criticalDiscrepancies: 0,
      rejectionCount: 0,
      lowSurvivalAlerts: 0,
      trustTier: 'Standard (Bronze)',
    };
  }

  const approved = allPlantations.filter((p) => p.verificationStatus === 'approved');
  const approvedCount = approved.length;
  const rejected = allPlantations.filter((p) => p.verificationStatus === 'rejected');
  const rejectionCount = rejected.length;

  // 1) Approval ratio (0-1)
  const approvalRatio = approvedCount / totalSubmissions;

  // 2) AI match accuracy across all reviewed submissions (0-1)
  const reviewed = allPlantations.filter((p) => ['approved', 'rejected'].includes(p.verificationStatus));
  let aiAccuracy = 1.0;
  if (reviewed.length > 0) {
    const accuracies = reviewed.map((p) => {
      if (!p.aiTreeCount || !p.treeCount) return 1.0;
      const diff = Math.abs(p.aiTreeCount - p.treeCount) / p.treeCount;
      return Math.max(0, 1 - diff);
    });
    aiAccuracy = accuracies.reduce((sum, a) => sum + a, 0) / reviewed.length;
  }

  // 3) Total verified trees & volume factor (logarithmic 0-1)
  const totalVerifiedTrees = approved.reduce((sum, p) => sum + (p.treeCount || 0), 0);
  const volumeFactor = Math.min(1, Math.log10(totalVerifiedTrees + 1) / Math.log10(10001));

  // Weighted base score (0-100)
  const baseScore = (approvalRatio * 40) + (aiAccuracy * 40) + (volumeFactor * 20);

  // 4) Penalties calculation
  // A. Rejection penalty (-10 points per rejection)
  const rejectionPenalty = rejectionCount * 10;

  // B. Critical Discrepancy penalty (-15 points per >30% mismatch)
  let criticalDiscrepancies = 0;
  allPlantations.forEach((p) => {
    if (p.treeCount && p.aiTreeCount) {
      const diff = Math.abs(p.aiTreeCount - p.treeCount) / p.treeCount;
      if (diff > 0.30) {
        criticalDiscrepancies++;
      }
    }
  });
  const criticalPenalty = criticalDiscrepancies * 15;

  // C. Low Survival Rate penalty (-15 points per <70% survival)
  const monitorings = await Monitoring.find({ ngoId: ngoUserId });
  const lowSurvivalAlerts = monitorings.filter((m) => m.survivalRate < 70).length;
  const survivalPenalty = lowSurvivalAlerts * 15;

  // D. Over-reporting penalty (-15 points per event where user treeCount > AI detected treeCount)
  let overReportedCount = 0;
  allPlantations.forEach((p) => {
    if (p.treeCount && p.aiTreeCount && p.treeCount > p.aiTreeCount) {
      overReportedCount++;
    }
  });
  const overReportingPenalty = overReportedCount * 15;

  // Final Score (0-100)
  const finalScore = Math.round(
    Math.min(100, Math.max(0, baseScore - rejectionPenalty - criticalPenalty - survivalPenalty - overReportingPenalty))
  );

  // 5) Calculate Trust Tier
  let trustTier = 'Unverified / High Risk';
  if (finalScore >= 90) {
    trustTier = 'Expert (Gold)';
  } else if (finalScore >= 75) {
    trustTier = 'Trusted (Silver)';
  } else if (finalScore >= 50) {
    trustTier = 'Standard (Bronze)';
  }

  return {
    trustScore: finalScore,
    approvedCount,
    totalSubmissions,
    totalVerifiedTrees,
    aiAccuracy: Math.round(aiAccuracy * 100),
    criticalDiscrepancies,
    rejectionCount,
    lowSurvivalAlerts,
    overReportedCount,
    trustTier,
  };
};

/**
 * Recalculate and persist trust score for an NGO, and log it to TrustHistory.
 * @param {string} ngoUserId — The User _id of the NGO partner
 * @param {object} context — { projectId, plantationId, reason } (optional context)
 */
const recalculateTrustScore = async (ngoUserId, context = {}) => {
  // Fetch current score before update
  const ngo = await NGO.findOne({ createdBy: ngoUserId });
  const oldScore = ngo ? ngo.trustScore : 70;

  // Calculate new score
  const result = await calculateTrustScore(ngoUserId);
  const newScore = result.trustScore;

  // Persist new score on the NGO profile
  await NGO.findOneAndUpdate(
    { createdBy: ngoUserId },
    {
      trustScore: newScore,
      totalVerifiedTrees: result.totalVerifiedTrees,
      trustTier: result.trustTier,
      criticalDiscrepancies: result.criticalDiscrepancies,
      rejectionCount: result.rejectionCount,
    }
  );

  // Determine change
  const change = newScore - oldScore;

  // Create a trust score history entry (even if no change, keeping the log of the event)
  await TrustHistory.create({
    ngoUserId,
    projectId: context.projectId || null,
    plantationId: context.plantationId || null,
    oldScore,
    newScore,
    change,
    reason: context.reason || (change > 0 ? 'Trust score improved' : change < 0 ? 'Trust score decreased' : 'Recalculation'),
  });

  return result;
};

module.exports = { calculateTrustScore, recalculateTrustScore };
