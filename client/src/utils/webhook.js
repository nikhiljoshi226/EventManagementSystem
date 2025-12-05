const triggerWebhook = {
  sendNotification: async (data) => {
    // Implement your webhook logic here
    console.log('Webhook notification:', data);
    return { success: true };
  }
};

module.exports = triggerWebhook;