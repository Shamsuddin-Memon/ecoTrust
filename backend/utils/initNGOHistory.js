const NGO = require('../models/NGO');
const TrustHistory = require('../models/TrustHistory');

/**
 * Ensures all approved NGOs have an initial TrustHistory entry and their trustScore is set.
 */
const initNGOHistory = async () => {
  try {
    const approvedNGOs = await NGO.find({ status: 'approved' });
    let migratedCount = 0;

    for (const ngo of approvedNGOs) {
      let updated = false;

      // 1. Ensure trustScore is initialized
      if (ngo.trustScore === undefined || ngo.trustScore === null) {
        ngo.trustScore = 70;
        ngo.trustTier = 'Standard (Bronze)';
        updated = true;
      }

      // 2. Check if a TrustHistory log already exists for this NGO
      const historyCount = await TrustHistory.countDocuments({ ngoUserId: ngo.createdBy });
      if (historyCount === 0) {
        await TrustHistory.create({
          ngoUserId: ngo.createdBy,
          oldScore: 70,
          newScore: ngo.trustScore,
          change: ngo.trustScore - 70,
          reason: 'NGO registration approved. Initial trust score set to 70.',
        });
        migratedCount++;
      }

      if (updated) {
        await ngo.save();
      }
    }

    if (migratedCount > 0) {
      console.log(`Initialized trust history logs for ${migratedCount} approved NGOs.`);
    } else {
      console.log('All approved NGOs have trust score history initialized.');
    }
  } catch (error) {
    console.error('Error initializing approved NGOs history:', error.message);
  }
};

module.exports = initNGOHistory;
