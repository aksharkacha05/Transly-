import axios from 'axios';
import * as FileSystem from 'expo-file-system';

// Function to extract text from PDF using OCR.Space
const extractTextFromPDF = async (pdfUri) => {
  try {
    console.log('Reading PDF file from URI:', pdfUri);
    const pdfBase64 = await FileSystem.readAsStringAsync(pdfUri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    console.log('Sending request to OCR.Space');
    const response = await axios.post('https://api.ocr.space/parse/image', {
      base64Image: `data:application/pdf;base64,${pdfBase64}`,
      language: 'eng', // Specify the language code if needed
    }, {
      headers: {
        'apikey': process.env.OCR_SPACE_KEY,
        'Content-Type': 'application/json',
      }
    });

    if (response.data.IsErroredOnProcessing) {
      console.error('OCR.Space error:', response.data.ErrorMessage[0]);
      throw new Error(response.data.ErrorMessage[0]);
    }

    const extractedText = response.data.ParsedResults.map(result => result.ParsedText).join('\n');
    console.log('Extracted text:', extractedText);
    return extractedText;
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    throw error;
  }
};

// Function to translate text using a translation API
const translateText = async (text, sourceLang, targetLang) => {
  try {
    const response = await axios.post('https://api.mymemory.translated.net/get', {
      q: text,
      source: sourceLang,
      target: targetLang,
    }, {
      headers: {
        'Authorization': `Bearer cbd6c9a219e44f78b8cff164adb903a9`,
        'Content-Type': 'application/json',
      }
    });

    return response.data.translatedText;
  } catch (error) {
    console.error('Translation error:', error);
    throw error;
  }
};

// Main function to translate PDF
export const translatePDF = async (pdfUri, sourceLang, targetLang) => {
  try {
    const text = await extractTextFromPDF(pdfUri);
    const translatedText = await translateText(text, sourceLang, targetLang);
    return translatedText;
  } catch (error) {
    console.error('Error translating PDF:', error);
    throw error;
  }
};
