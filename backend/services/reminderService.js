const Plantation = require('../models/Plantation');
const Monitoring = require('../models/Monitoring');
const NGO = require('../models/NGO');
const User = require('../models/User');
const Project = require('../models/Project');
const { sendMonitoringReminderEmail } = require('./emailService');

const checkMonitoringRequirements = async () => {
  try {
    // Find approved plantations that haven't had a reminder sent yet
    const plantations = await Plantation.find({
      verificationStatus: 'approved',
      reminderSent: false
    });

    const tenMinutesAgo = new Date(Date.now() - (10 * 60 * 1050)); // ~10 minutes (using 10.5 mins for buffer check if needed, or exact 10 mins: 10 * 60 * 1000)
    const tenMins = new Date(Date.now() - (10 * 60 * 1000));

    for (const plantation of plantations) {
      // Check if plantation is older than 10 minutes
      if (plantation.createdAt <= tenMins) {
        // Double check if already monitored (in case user uploaded before reminder ran)
        const alreadyMonitored = await Monitoring.findOne({ plantationId: plantation._id });
        if (alreadyMonitored) {
          plantation.reminderSent = true;
          await plantation.save();
          continue;
        }

        // Fetch NGO Profile & User details
        const ngoProfile = await NGO.findOne({ createdBy: plantation.ngoId });
        const user = await User.findById(plantation.ngoId);
        const project = await Project.findById(plantation.projectId);

        if (user && project) {
          const email = user.email;
          const ngoName = ngoProfile ? ngoProfile.name : 'NGO Partner';
          const projectTitle = project.title;

          // Send Email Reminder
          await sendMonitoringReminderEmail(email, ngoName, projectTitle);

          // Mark as sent to prevent multiple alerts
          plantation.reminderSent = true;
          await plantation.save();
        }
      }
    }
  } catch (err) {
    console.error('[Reminder Service Job Error]:', err.message);
  }
};

const initReminderService = () => {
  console.log('[Reminder Service] Initialized background monitoring checker.');
  // Run check on boot, then every 1 minute
  checkMonitoringRequirements();
  setInterval(checkMonitoringRequirements, 60 * 1000);
};

module.exports = { initReminderService };
