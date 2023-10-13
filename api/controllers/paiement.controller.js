const generatePDFBuffer = require('../helpers/pdfGenerator');
const { sendMessageToNumber, sendMediaToNumber } = require("../helpers/whatsApp/whatsappMessaging")
const { addSubscriptionToUser } = require("../services/subscription.service")
const moment = require('moment');


async function handlePaymentSuccess(req, res, client) {
  try {
    const { user, phone, operator, operator_transaction_id, item_ref, amount, first_name } = req.body
    const dateSubscription = moment().format('YYYY-MM-DD');
    const expirationDate = moment(dateSubscription).add(first_name, 'days');
    const formattedExpirationDate = expirationDate.format('YYYY-MM-DD');
    // Créez un message de succès
    const successMessage = `Congratulations ! your payment for the Bundle ${item_ref} was successfully completed . Take advantage of our premium services ! attached the payment invoice for the subscription.`;
    // Envoyez le message de succès au destinataire
    await sendMessageToNumber(client, req.body.user + "@c\.us", successMessage);

    // Générez le PDF
    const pdfBuffer = await generatePDFBuffer(user, phone, operator_transaction_id, item_ref, operator, amount, first_name);
    const pdfBase64 = pdfBuffer.toString('base64');
    const pdfName = 'invoice.pdf';
    const documentType = 'application/pdf'
    await sendMediaToNumber(client, req.body.user + "@c\.us", documentType, pdfBase64, pdfName);// Envoyez le PDF en tant que document
    await addSubscriptionToUser(req.body.user, req.body.item_ref, dateSubscription, formattedExpirationDate) // ajouter la souscription a l'utilisateur
    res.status(200).send('Success');
  } catch (error) {
    console.error(error);
    res.status(500).send('Erreur lors du traitement.');
  }
}

async function handlePaymentFailure(req, res, client) {
  try {
    if (req.body.message == 'FAILED') {
      const failureMessage = `Désolé,

    Your mobile payment for a bundle has failed ${req.body.item_ref}  due to a transaction issue. Please check your payment details and try again.  If the problem persists, contact us for assistance.

    We apologize for any inconvenience.

  Sincerely,
  The SKIA Team`

      await sendMessageToNumber(client, req.body.user + "@c\.us", failureMessage);
      res.status(200).send('Failure');

    }
    else if (req.body.message == 'INTERNAL_PROCESSING_ERROR') {
      const failureMessage = `Désolé,

  Your mobile payment encountered an error due to a technical issue with the service ${req.body.operator}. We are working on resolving this problem. In the meantime, we recommend trying again later.

 We apologize for the inconvenience

Sincerely,
The SKIA Team`

      await sendMessageToNumber(client, req.body.user + "@c\.us", failureMessage);
      res.status(200).send('Failure');

    }
    else {
      await handlePaymentSuccess(req, res, client);
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Error during processing.');
  }
}

module.exports = {
  handlePaymentSuccess,
  handlePaymentFailure,
};
