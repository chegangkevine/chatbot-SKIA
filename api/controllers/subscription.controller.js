const subscriptionService = require('../services/subscription.service');

const createSubscription = async (req, res) => {
    const subscriptionData = req.body;
    const response = await subscriptionService.createSubscription(subscriptionData);
    
    if (response.success) {
      res.json({ message: response.message });
    } else {
      res.status(500).json({ message: 'Error during package creation', error: response.error });
    }
  };
  
  const getAllSubscriptions = async (req, res) => {
    const response = await subscriptionService.getAllSubscriptions();
    
    if (response.success) {
      res.json(response.subscriptions);
    } else {
      res.status(500).json({ message: 'Error while retrieving Bundle', error: response.error });
    }
  };
  
  const updateSubscription = async (req, res) => {
    const subscriptionId = req.params.subscriptionId;
    const updatedData = req.body;
    const response = await subscriptionService.updateSubscription(subscriptionId, updatedData);
    
    if (response.success) {
      res.json(response.subscription);
    } else {
      res.status(404).json({ message: response.message });
    }
  };
  
  const deleteSubscription = async (req, res) => {
    const subscriptionId = req.params.subscriptionId;
    const response = await subscriptionService.deleteSubscription(subscriptionId);
    
    if (response.success) {
      res.json({ message: response.message });
    } else {
      res.status(404).json({ message: response.message });
    }
  };

const getActiveSubscribers = async (req, res) => {
    const response = await subscriptionService.findActiveSubscribers();
    if (response.success) {
        res.json(response.data);
    } else {
        res.status(500).json({ message: 'Error while retrieving active subscribers', error: response.error });
    }
};

const checkActiveSubscription = async (req, res) => {
    const phoneNumber = req.params.phoneNumber;
    const response = await subscriptionService.hasActiveSubscription(phoneNumber);

    if (response.success) {
        res.json({ hasActiveSubscription: response.hasActiveSubscription });
    } else {
        res.status(500).json({ message: 'Error while checking active subscription', error: response.error });
    }
};

const getAllSubscriptionsUser = async (req, res) => {
    const phoneNumber = req.params.phoneNumber;
    const response = await subscriptionService.getAllSubscriptionsUser(phoneNumber);

    if (response.success) {
        res.json(response.subscriptions);
    } else {
        res.status(500).json({ message: 'Error while fetching user subscriptions', error: response.error });
    }
};

  const addSubscriptionToUser = async (req, res) => {
    const { phoneNumber, subscriptionName, subscriptionDate, expirationDate } = req.body;
    const response = await subscriptionService.addSubscriptionToUser(phoneNumber, subscriptionName, subscriptionDate, expirationDate);
    
    if (response.success) {
      res.json({ message: response.message, subscription: response.subscription });
    } else {
      res.status(500).json({ message: 'Error when adding the subscription.', error: response.error });
    }
  };

module.exports = { 
    getActiveSubscribers,
    getAllSubscriptionsUser,
    checkActiveSubscription,
    addSubscriptionToUser,
    createSubscription,
    getAllSubscriptions,
    updateSubscription,
    deleteSubscription
};
