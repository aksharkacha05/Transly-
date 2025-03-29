import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet, ScrollView } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { MaterialIcons } from '@expo/vector-icons';

const API_BASE_URL = 'https://pdf-backend-0se2.onrender.com';
const MYMEMORY_API_KEY = 'ef27d91587c20d97c97f'; // Replace with your actual key
const MYMEMORY_EMAIL = 'aksharkacha082@gmail.com'; // Replace with your email

export default function PDFTranslator() {
  const [pdfInfo, setPdfInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('Select a PDF to begin');
  const [error, setError] = useState('');
  const [targetLanguage, setTargetLanguage] = useState('es');
  const [extractedText, setExtractedText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [translationLoading, setTranslationLoading] = useState(false);

  const languages = [
    { code: 'gu', name: 'Spanish', flag: '🇪🇸' },
    { code: 'fr', name: 'French', flag: '🇫🇷' },
    { code: 'de', name: 'German', flag: '🇩🇪' },
    { code: 'it', name: 'Italian', flag: '🇮🇹' },
    { code: 'pt', name: 'Portuguese', flag: '🇵🇹' },
    { code: 'ru', name: 'Russian', flag: '🇷🇺' },
    { code: 'zh', name: 'Chinese', flag: '🇨🇳' },
    { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
    { code: 'ar', name: 'Arabic', flag: '🇸🇦' },
  ];

  const handlePDFSelection = async () => {
    setLoading(true);
    setError('');
    setStatus('Opening document picker...');
    setExtractedText('');
    setTranslatedText('');
    
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
        multiple: false,
      });

      if (result.canceled) {
        setStatus('Selection cancelled');
        return;
      }

      const file = result.assets[0];
      if (!file || !file.uri) {
        throw new Error('Invalid PDF selection');
      }

      setStatus('Verifying PDF file...');
      
      const fileInfo = await FileSystem.getInfoAsync(file.uri, { size: true });
      if (!fileInfo.exists) {
        throw new Error('Selected file does not exist');
      }
      if (fileInfo.size > 10 * 1024 * 1024) {
        throw new Error('PDF must be smaller than 10MB');
      }

      setPdfInfo({
        name: file.name,
        uri: file.uri,
        size: fileInfo.size,
      });

      setStatus('Ready to extract text');
    } catch (error) {
      console.error('Selection error:', error);
      setError(error.message);
      setStatus('Error occurred');
    } finally {
      setLoading(false);
    }
  };

  const extractTextFromPDF = async () => {
    if (!pdfInfo) return;

    setLoading(true);
    setStatus('Extracting text...');
    setError('');
    setExtractedText('');
    setTranslatedText('');

    try {
      const formData = new FormData();
      formData.append('pdf', {
        uri: pdfInfo.uri,
        name: pdfInfo.name,
        type: 'application/pdf',
      });

      const response = await fetch(`${API_BASE_URL}/extract-text`, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'multipart/form-data',
        },
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to extract text');
      }

      setExtractedText(result.text);
      setStatus('Text extracted successfully! Ready to translate');
    } catch (error) {
      console.error('Extraction error:', error);
      setError(error.message || 'Failed to extract text');
      setStatus('Error occurred');
    } finally {
      setLoading(false);
    }
  };

  const translateWithMyMemory = async () => {
    if (!extractedText) return;

    setTranslationLoading(true);
    setStatus('Translating text...');
    setError('');
    setTranslatedText('');

    try {
      // Default to English as source language
      const sourceLang = 'en';
      
      // Split text into chunks (MyMemory has 500 char limit for free tier)
      const chunkSize = 500;
      const textChunks = [];
      for (let i = 0; i < extractedText.length; i += chunkSize) {
        textChunks.push(extractedText.substring(i, i + chunkSize));
      }

      // Translate each chunk
      let translatedResult = '';
      for (const chunk of textChunks) {
        const response = await fetch(
          `https://api.mymemory.translated.net/get?q=${encodeURIComponent(chunk)}&langpair=${sourceLang}|${targetLanguage}&key=${MYMEMORY_API_KEY}&de=${MYMEMORY_EMAIL}`
        );
        
        if (!response.ok) {
          throw new Error('Translation service unavailable');
        }

        const data = await response.json();
        
        if (data.responseData?.translatedText) {
          translatedResult += data.responseData.translatedText + ' ';
        } else {
          throw new Error(data.responseDetails || 'Translation failed');
        }
      }

      setTranslatedText(translatedResult.trim());
      setStatus('Translation complete!');
    } catch (error) {
      console.error('Translation error:', error);
      setError(error.message || 'Failed to translate text');
      setStatus('Error occurred');
    } finally {
      setTranslationLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.header}>PDF Translator</Text>
      
      <TouchableOpacity 
        style={styles.selectButton}
        onPress={handlePDFSelection}
        disabled={loading}
      >
        <MaterialIcons name="attach-file" size={24} color="white" />
        <Text style={styles.buttonText}>Select PDF</Text>
      </TouchableOpacity>

      {pdfInfo && (
        <View style={styles.fileInfo}>
          <MaterialIcons name="picture-as-pdf" size={24} color="#e74c3c" />
          <View style={styles.fileDetails}>
            <Text style={styles.fileName} numberOfLines={1}>{pdfInfo.name}</Text>
            <Text style={styles.fileSize}>{Math.round(pdfInfo.size / 1024)} KB</Text>
          </View>
        </View>
      )}

      {pdfInfo && !extractedText && (
        <TouchableOpacity 
          style={styles.extractButton}
          onPress={extractTextFromPDF}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <MaterialIcons name="text-fields" size={24} color="white" />
              <Text style={styles.buttonText}>Extract Text</Text>
            </>
          )}
        </TouchableOpacity>
      )}

      {extractedText && (
        <>
          <Text style={styles.sectionHeader}>Select Target Language</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.languageScroll}
            contentContainerStyle={styles.languageContainer}
          >
            {languages.map((lang) => (
              <TouchableOpacity
                key={lang.code}
                style={[
                  styles.languageButton,
                  targetLanguage === lang.code && styles.selectedLanguage
                ]}
                onPress={() => setTargetLanguage(lang.code)}
              >
                <Text style={styles.flag}>{lang.flag}</Text>
                <Text style={styles.languageName}>{lang.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <TouchableOpacity 
            style={styles.translateButton}
            onPress={translateWithMyMemory}
            disabled={translationLoading}
          >
            {translationLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <MaterialIcons name="translate" size={24} color="white" />
                <Text style={styles.buttonText}>Translate Text</Text>
              </>
            )}
          </TouchableOpacity>
        </>
      )}

      <View style={styles.statusContainer}>
        {loading || translationLoading ? (
          <ActivityIndicator size="small" color="#3498db" />
        ) : null}
        <Text style={styles.statusText}>{status}</Text>
      </View>

      {error ? (
        <View style={styles.errorContainer}>
          <MaterialIcons name="error-outline" size={24} color="#e74c3c" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      {extractedText ? (
        <View style={styles.textSection}>
          <View style={styles.sectionHeaderContainer}>
            <MaterialIcons name="description" size={20} color="#3498db" />
            <Text style={styles.sectionTitle}>Extracted Text</Text>
          </View>
          <ScrollView style={styles.textScrollView}>
            <Text style={styles.textContent}>{extractedText}</Text>
          </ScrollView>
        </View>
      ) : null}

      {translatedText ? (
        <View style={styles.textSection}>
          <View style={styles.sectionHeaderContainer}>
            <MaterialIcons name="translate" size={20} color="#2ecc71" />
            <Text style={styles.sectionTitle}>
              Translated to {languages.find(l => l.code === targetLanguage)?.name}
            </Text>
          </View>
          <ScrollView style={styles.textScrollView}>
            <Text style={styles.textContent}>{translatedText}</Text>
          </ScrollView>
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 30,
    textAlign: 'center',
  },
  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3498db',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    elevation: 3,
  },
  extractButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#9b59b6',
    padding: 15,
    borderRadius: 10,
    marginVertical: 10,
    elevation: 3,
  },
  translateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2ecc71',
    padding: 15,
    borderRadius: 10,
    marginVertical: 10,
    elevation: 3,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  fileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    elevation: 2,
  },
  fileDetails: {
    marginLeft: 10,
    flex: 1,
  },
  fileName: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#2c3e50',
  },
  fileSize: {
    color: '#7f8c8d',
    fontSize: 14,
    marginTop: 5,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 15,
    marginTop: 10,
  },
  languageScroll: {
    marginBottom: 15,
  },
  languageContainer: {
    paddingHorizontal: 5,
  },
  languageButton: {
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    marginRight: 10,
    minWidth: 80,
    elevation: 2,
  },
  selectedLanguage: {
    backgroundColor: '#e3f2fd',
    borderColor: '#3498db',
    borderWidth: 1,
  },
  flag: {
    fontSize: 24,
    marginBottom: 5,
  },
  languageName: {
    fontSize: 14,
    color: '#2c3e50',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 15,
    minHeight: 24,
  },
  statusText: {
    color: '#7f8c8d',
    fontStyle: 'italic',
    marginLeft: 10,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fdecea',
    padding: 15,
    borderRadius: 10,
    marginVertical: 15,
  },
  errorText: {
    color: '#e74c3c',
    marginLeft: 10,
    flex: 1,
  },
  textSection: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    elevation: 2,
  },
  sectionHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginLeft: 8,
  },
  textScrollView: {
    maxHeight: 200,
    borderWidth: 1,
    borderColor: '#ecf0f1',
    borderRadius: 5,
    padding: 10,
  },
  textContent: {
    fontSize: 14,
    lineHeight: 20,
    color: '#34495e',
  },
});