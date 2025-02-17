import axios from 'axios';

const MYMEMORY_API = 'https://api.mymemory.translated.net/get';

export const translateText = async (text, sourceLang, targetLang) => {
  try {
    const response = await axios.get(MYMEMORY_API, {
      params: {
        q: text,
        langpair: `${sourceLang}|${targetLang}`,
        de: 'your@email.com'
      }
    });
    return response.data.responseData.translatedText;
  } catch (error) {
    console.error('Translation error:', error);
    throw error;
  }
};