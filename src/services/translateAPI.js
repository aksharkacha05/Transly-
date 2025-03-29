import axios from 'axios';

const MYMEMORY_API = 'https://api.mymemory.translated.net/get';

export const translateText = async (text, sourceLang, targetLang) => {
  try {
    // Log the text and language parameters for debugging
    console.log(`Translating text: "${text}" from ${sourceLang} to ${targetLang}`);

    const response = await axios.get(MYMEMORY_API, {
      params: {
        q: text,
        langpair: `${sourceLang}|${targetLang}`,
        de: 'your@email.com' // Replace with your email for better API usage tracking
      }
    });

    // Check if the response contains the translated text
    if (response.data && response.data.responseData) {
      console.log('Translation successful:', response.data.responseData.translatedText);
      return response.data.responseData.translatedText;
    } else {
      console.error('Translation API response is missing expected data:', response.data);
      throw new Error('Translation API response is missing expected data');
    }
  } catch (error) {
    console.error('Translation error:', error);
    throw error;
  }
};