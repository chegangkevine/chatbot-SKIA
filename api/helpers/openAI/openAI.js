
const { OpenAI } = require("openai");
const logger = require("./logger");

const openai = new OpenAI({
  apiKey: process.env.API_KEY,
});

// Generate image from prompt
const getImage = async (text) => {
  try {
    const response = await openai.images.generate({
      prompt: text,
      n: 1,
      size: "512x512",
    });
console.log(':::',response)
    return response.data[0].url;
  } catch (error) {
    logger.error("Error while generating image");
  }
};
// Generate answer from prompt
const getChat = async (text) => {
  try {
    const response = await openai.chat.completions.create({
      messages: [
        { role: "system", content: "You are SKIA, a large language model trained by OpenAI. Answer as concisely as possible." },
        { role: "user", content: text },
        { role: "assistant", content: "I am doing well" },
        { role: "user", content: text },
      ],
      model: "gpt-3.5-turbo",
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.log(error);
    logger.error("Error while generating Answer"); 
  }
};

// Convert to standard english
const correctEngish = async (text) => {
  try {
    const response = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: `Correct this to standard English: /n${text}`,
      temperature: 0,
      max_tokens: 1000,
    });

    return response.data.choices[0].message.content;
  } catch (error) {
    logger.error("Error while generating English ");
  }
};

module.exports = { openai, getImage, getChat, correctEngish };