const { Event } = require("../models/eventModel");

/**
 * Clean up expired events
 * Removes events that have passed their date
 */
const cleanupExpiredEvents = async () => {
  try {
    const now = new Date();
    
    // Find events where the date has passed
    const expiredEvents = await Event.find({
      date: { $lt: now }
    });

    if (expiredEvents.length > 0) {
      // Delete expired events
      const result = await Event.deleteMany({
        date: { $lt: now }
      });

      console.log(`🧹 Event cleanup completed: ${result.deletedCount} expired events removed`);
      
      // Log details of removed events for audit purposes
      expiredEvents.forEach(event => {
        console.log(`   - Removed: "${event.title}" (Date: ${event.date.toDateString()})`);
      });
    } else {
      console.log("✅ Event cleanup: No expired events found");
    }
  } catch (error) {
    console.error("❌ Error during event cleanup:", error);
  }
};

/**
 * Check if an event is expired
 * @param {Date} eventDate - The event date
 * @returns {boolean} - True if event is expired
 */
const isEventExpired = (eventDate) => {
  const now = new Date();
  return new Date(eventDate) < now;
};

/**
 * Get time until event expires
 * @param {Date} eventDate - The event date
 * @returns {string} - Human readable time until expiration
 */
const getTimeUntilExpiration = (eventDate) => {
  const now = new Date();
  const eventTime = new Date(eventDate);
  const timeDiff = eventTime - now;
  
  if (timeDiff <= 0) {
    return "Expired";
  }
  
  const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  
  if (days > 0) {
    return `${days} day${days > 1 ? 's' : ''} remaining`;
  } else if (hours > 0) {
    return `${hours} hour${hours > 1 ? 's' : ''} remaining`;
  } else {
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
    return `${minutes} minute${minutes > 1 ? 's' : ''} remaining`;
  }
};

module.exports = {
  cleanupExpiredEvents,
  isEventExpired,
  getTimeUntilExpiration
};