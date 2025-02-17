import React, { useState } from 'react';
import { View, StyleSheet, Alert, ScrollView } from 'react-native';
import { Button, Text } from 'react-native-elements';
import * as DocumentPicker from 'expo-document-picker';
import LanguageSelector from '../../components/LanguageSelector';
import LoadingSpinner from '../../components/LoadingSpinner';
import { translatePDF } from '../services/pdfAPI';

export default function PdfTranslationScreen() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [sourceLang, setSourceLang] = useState('en');
  const [targetLang, setTargetLang] = useState('gu');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true
      });

      if (result.type === 'success') {
        setSelectedFile(result);
        setResult(null); // Reset previous result
      }
    } catch (err) {
      Alert.alert('Error', 'Error picking PDF file');
    }
  };

  const handleTranslate = async () => {
    if (!selectedFile) {
      Alert.alert('Error', 'Please select a PDF file first');
      return;
    }

    setIsLoading(true);
    try {
      const translatedText = await translatePDF(
        selectedFile.uri,
        sourceLang,
        targetLang
      );
      setResult(translatedText);
    } catch (error) {
      Alert.alert('Error', 'Error translating PDF');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <LanguageSelector
        sourceLang={sourceLang}
        targetLang={targetLang}
        onSourceChange={setSourceLang}
        onTargetChange={setTargetLang}
      />

      <Button
        title="Pick PDF file"
        onPress={pickDocument}
        buttonStyle={styles.pickButton}
      />

      {selectedFile && (
        <Text style={styles.fileName}>
          Selected file: {selectedFile.name}
        </Text>
      )}

      <Button
        title="Translate"
        onPress={handleTranslate}
        disabled={!selectedFile}
        buttonStyle={styles.translateButton}
      />

      {result && (
        <View style={styles.resultContainer}>
          <Text style={styles.resultTitle}>Translated Text:</Text>
          <Text style={styles.resultText}>{result}</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  pickButton: {
    marginBottom: 16,
    backgroundColor: '#007AFF',
  },
  fileName: {
    marginBottom: 16,
    color: '#666',
  },
  translateButton: {
    backgroundColor: '#34C759',
  },
  resultContainer: {
    flex: 1,
    marginTop: 20,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  resultText: {
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    backgroundColor: '#f9f9f9',
  },
});