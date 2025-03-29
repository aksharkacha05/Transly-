import { PDFDocument, rgb } from 'pdf-lib';
import * as FileSystem from 'expo-file-system';
import { translateText } from './translateAPI';

export const extractTextFromPDF = async (pdfUri) => {
  try {
    const pdfBytes = await FileSystem.readAsStringAsync(pdfUri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    const pdfDoc = await PDFDocument.load(pdfBytes);
    const pages = pdfDoc.getPages();
    let text = '';

    for (const page of pages) {
      // Note: pdf-lib does not support text extraction directly.
      // You might need to use another library like pdfjs-dist for this.
      // This is a placeholder for actual text extraction logic.
      text += 'Extracted text from page'; // Replace with actual extraction logic
    }

    return text;
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    throw error;
  }
};

export const createTranslatedPDF = async (translatedText) => {
  try {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage();
    const { width, height } = page.getSize();
    const fontSize = 12; // Adjust font size as needed

    page.drawText(translatedText, {
      x: 50,
      y: height - 4 * fontSize,
      size: fontSize,
      color: rgb(0, 0, 0),
    });

    const pdfBytes = await pdfDoc.save();
    const pdfUri = FileSystem.documentDirectory + 'translated.pdf';

    await FileSystem.writeAsStringAsync(pdfUri, pdfBytes, {
      encoding: FileSystem.EncodingType.Base64,
    });

    console.log('Translated PDF saved at:', pdfUri);
    return pdfUri;
  } catch (error) {
    console.error('Error creating translated PDF:', error);
    throw error;
  }
};

export const translatePDF = async (pdfUri, sourceLang, targetLang) => {
  try {
    const text = await extractTextFromPDF(pdfUri);
    const translatedText = await translateText(text, sourceLang, targetLang);
    const newPdfUri = await createTranslatedPDF(translatedText);
    return newPdfUri;
  } catch (error) {
    console.error('Error translating PDF:', error);
    throw error;
  }
};