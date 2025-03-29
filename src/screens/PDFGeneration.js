import React from 'react';
import { View, Button, Alert } from 'react-native';
import RNHTMLtoPDF from 'react-native-html-to-pdf';

const PDFGeneration = ({ extractedText, translatedText }) => {
  const createPDF = async (textToConvert) => {
    if (!textToConvert) {
      Alert.alert('Error', 'No text to convert to PDF');
      return;
    }

    const options = {
      html: `
        <h1>${textToConvert === extractedText ? 'Extracted Text' : 'Translated Text'}</h1>
        <p>${textToConvert}</p>
      `,
      fileName: textToConvert === extractedText ? 'extracted_text' : 'translated_text',
      directory: 'Documents',
    };

    try {
      const file = await RNHTMLtoPDF.convert(options);
      Alert.alert('Success', `PDF created at: ${file.filePath}`);
    } catch (error) {
      console.error('PDF creation error:', error);
      Alert.alert('Error', 'Failed to create PDF');
    }
  };

  return (
    <View>
      <Button title="Download Extracted Text PDF" onPress={() => createPDF(extractedText)} />
      <Button title="Download Translated Text PDF" onPress={() => createPDF(translatedText)} />
    </View>
  );
};

export default PDFGeneration;
