const moment = require('moment');
const {sendMessageToNumber,sendMediaToNumber} = require('../helpers/whatsApp/whatsappMessaging');
const { addSubscriptionToUser } = require('../services/subscription.service');
const generatePDFBuffer = require('../helpers/pdfGenerator');

async function handlePaymentSuccess(req, res, client) {
  try {
    const {user,phone,operator_transaction_id,item_ref,amount,first_name,last_name,email,operator} = req.body;
    const dateSubscription = moment().format('YYYY-MM-DD');
    const expirationDate = moment(dateSubscription).add(first_name, 'days');
    const formattedExpirationDate = expirationDate.format('YYYY-MM-DD');
    const successMessage = `Congratulations ! your payment for the Bundle ${item_ref} was successfully completed . Take advantage of our premium services ! attached the payment invoice for the subscription.`;
    const pdfBuffer = await generatePDFBuffer(user,phone,operator_transaction_id,item_ref,operator,amount,first_name,last_name,email);
    const pdfBase64 = pdfBuffer.toString('base64');
    const pdfName = 'invoice.pdf';
    const documentType = 'application/pdf';
    await Promise.all([
      sendMediaToNumber(client, `${user}@c\.us`, documentType, pdfBase64, pdfName),
      addSubscriptionToUser(user, item_ref, dateSubscription, formattedExpirationDate),
      sendMessageToNumber(client, `${user}@c\.us`, successMessage),
    ]);
    res.status(200).send('Success');
  } catch (error) {
    console.error(error);
    res.status(500).send('Erreur lors du traitement.');
  }
}

async function handlePaymentFailure(req, res, client, operatorMessage) {
  try {
    const failureMessage = operatorMessage || `Sorry,

    Your mobile payment for a bundle has failed ${req.body.item_ref}  due to a transaction issue. Please check your payment details and try again.  If the problem persists, contact us for assistance.

    We apologize for any inconvenience.`;
    await sendMessageToNumber(client, `${req.body.user}@c\.us`, failureMessage);
    res.status(200).send('Failure');
  } catch (error) {
    console.error(error);
    res.status(500).send('Erreur lors du traitement.');
  }
}

async function handlePaymentNotification(req, res, client) {
  try {
    if (req.body.message === 'FAILED') {
      await handlePaymentFailure(req, res, client);
    } else if (req.body.message === 'INTERNAL_PROCESSING_ERROR') {
      const operatorMessage = `Sorry,

      Your mobile payment for a bundle has failed ${req.body.item_ref}  due to a transaction issue. Please check your payment details and try again.  If the problem persists, contact us for assistance.
  
      We apologize for any inconvenience.`;
      await handlePaymentFailure(req, res, client, operatorMessage);
    } else {
      await handlePaymentSuccess(req, res, client);
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Erreur lors du traitement.');
  }
}

module.exports = {
  handlePaymentNotification,
};
