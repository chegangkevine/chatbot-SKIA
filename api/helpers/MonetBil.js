require('dotenv').config();
const axios = require('axios');

async function processPayment(msg, phoneNumber, selectedForfait, transactionSteps) {
  const paymentData = {
    service: process.env.PAYMENT_SERVICE_ID,
    phonenumber: phoneNumber.replace(/^\+/, '').replace(/\s/g, ''),
    amount: "1",
    // selectedForfait?.price,
    user: msg.from.replace(/@c\.us$/, ""),
    first_name: selectedForfait?.durationInDays,
    item_ref: selectedForfait?.name,
    last_name:process.env.LOGO_APP,
    email:process.env.BACKGROUND_LOGO,
  };

  const apiEndpoint = process.env.PAYMENT_API_ENDPOINT;

  try {
    const response = await axios.post(apiEndpoint, paymentData);

    if (response.data.status == "REQUEST_ACCEPTED") {
      const confirmationMessage = `Transaction ${response.data.channel_name} During treatment please enter ${response.data.channel_ussd}`;
      msg.reply(confirmationMessage);
    } else {
      const errorMessage = 'The transaction was not completed \ please try it later';
      msg.reply(errorMessage);
    }
  } catch (error) {
    console.error(error);
    const errorMessage = 'An error occurred during the processing of the transaction. please try again later.';
    msg.reply(errorMessage);
  } finally {
    delete transactionSteps[msg.from];
  }
}

module.exports = {
  processPayment
};
