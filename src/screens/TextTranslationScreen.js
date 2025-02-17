import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Keyboard,
  Share,
  ActivityIndicator
} from 'react-native';
import { Text, Button, Icon } from 'react-native-elements';
// import * as Clipboard from 'expo-clipboard';
import * as Speech from 'expo-speech';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LanguageSelector from '../../components/LanguageSelector';
import { translateText } from '../services/translateAPI';
import { saveTranslation } from '../services/storageService';
import Clipboard from '@react-native-clipboard/clipboard';

const CHAR_LIMIT = 5000;

export default function TextTranslationScreen() {
  const [sourceText, setSourceText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [sourceLang, setSourceLang] = useState('en');
  const [targetLang, setTargetLang] = useState('gu');
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [recentTranslations, setRecentTranslations] = useState([]);
  const [charCount, setCharCount] = useState(0);

  useEffect(() => {
    loadRecentTranslations();
  }, []);

  // Load recent translations
  const loadRecentTranslations = async () => {
    try {
      const saved = await AsyncStorage.getItem('recentTranslations');
      if (saved) {
        setRecentTranslations(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Loading translations error:', error);
    }
  };

  // Swap languages
  const swapLanguages = () => {
    if (!sourceText && !translatedText) return;
    
    setSourceLang(targetLang);
    setTargetLang(sourceLang);
    setSourceText(translatedText);
    setTranslatedText(sourceText);
  };

  // Paste from clipboard
  const pasteFromClipboard = async () => {
    try {
      const text = await Clipboard.getString();
      if (text) {
        setSourceText(text);
        setCharCount(text.length);
      }
    } catch (error) {
      Alert.alert('Error', 'Error getting text from clipboard');
    }
  };

  // Copy to clipboard
  const copyToClipboard = async (text) => {
    try {
      await Clipboard.setStringAsync(text);
      Alert.alert('Success', 'Text copied successfully');
    } catch (error) {
      Alert.alert('Error', 'Error copying text');
    }
  };

  // Share text
  const shareText = async () => {
    try {
      await Share.share({
        message: `${sourceText}\n\nTranslation:\n${translatedText}`,
      });
    } catch (error) {
      Alert.alert('Error', 'Error sharing text');
    }
  };

  // Speak text
  const speakText = async (text, lang) => {
    try {
      if (isSpeaking) {
        await Speech.stop();
        setIsSpeaking(false);
        return;
      }

      setIsSpeaking(true);
      await Speech.speak(text, {
        language: lang,
        onDone: () => setIsSpeaking(false),
        onError: () => setIsSpeaking(false),
      });
    } catch (error) {
      Alert.alert('Error', 'Error speaking text');
      setIsSpeaking(false);
    }
  };

  // Translate text
  const handleTranslate = async () => {
    if (!sourceText.trim()) {
      Alert.alert('Error', 'Please enter text');
      return;
    }

    if (sourceText.length > CHAR_LIMIT) {
      Alert.alert('Error', `Text should not exceed ${CHAR_LIMIT} characters`);
      return;
    }

    Keyboard.dismiss();
    setIsLoading(true);

    try {
      const result = await translateText(sourceText, sourceLang, targetLang);
      setTranslatedText(result);

      // Save to recent translations
      const translation = {
        id: Date.now().toString(),
        sourceText,
        translatedText: result,
        sourceLang,
        targetLang,
        timestamp: new Date().toISOString(),
      };

      const updatedTranslations = [translation, ...recentTranslations].slice(0, 10);
      setRecentTranslations(updatedTranslations);
      await AsyncStorage.setItem('recentTranslations', JSON.stringify(updatedTranslations));
      await saveTranslation(translation);

    } catch (error) {
      Alert.alert('Error', 'Error translating text');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      {/* Language Selection */}
      <View style={styles.languageContainer}>
        <View style={styles.languageSelector}>
          <LanguageSelector
            sourceLang={sourceLang}
            targetLang={targetLang}
            onSourceChange={setSourceLang}
            onTargetChange={setTargetLang}
          />
          <TouchableOpacity onPress={swapLanguages} style={styles.swapButton}>
            <Icon name="swap-horiz" size={24} color="#007AFF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Source Text */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          multiline
          placeholder="Enter text to translate..."
          value={sourceText}
          onChangeText={(text) => {
            setSourceText(text);
            setCharCount(text.length);
          }}
          maxLength={CHAR_LIMIT}
        />
        <View style={styles.inputActions}>
          <Text style={styles.charCount}>
            {charCount}/{CHAR_LIMIT}
          </Text>
          <TouchableOpacity onPress={pasteFromClipboard}>
            <Icon name="content-paste" size={24} color="#007AFF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <Button
          title="Translate"
          onPress={handleTranslate}
          loading={isLoading}
          disabled={isLoading || !sourceText.trim()}
          buttonStyle={styles.translateButton}
        />
        <Button
          title="Clear"
          type="outline"
          onPress={() => {
            setSourceText('');
            setTranslatedText('');
            setCharCount(0);
          }}
          buttonStyle={styles.clearButton}
        />
      </View>

      {/* Translated Text */}
      {translatedText && (
        <View style={styles.resultContainer}>
          <View style={styles.resultHeader}>
            <Text style={styles.resultTitle}>Translated Text:</Text>
            <View style={styles.resultActions}>
              <TouchableOpacity 
                onPress={() => speakText(translatedText, targetLang)}
                style={styles.actionButton}
              >
                <Icon
                  name={isSpeaking ? "volume-up" : "volume-up-outline"}
                  type="ionicon"
                  size={24}
                  color="#007AFF"
                />
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={() => copyToClipboard(translatedText)}
                style={styles.actionButton}
              >
                <Icon name="content-copy" size={24} color="#007AFF" />
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={shareText}
                style={styles.actionButton}
              >
                <Icon name="share" size={24} color="#007AFF" />
              </TouchableOpacity>
            </View>
          </View>
          <Text style={styles.resultText}>{translatedText}</Text>
        </View>
      )}

      {/* Recent Translations */}
      {recentTranslations.length > 0 && (
        <View style={styles.recentContainer}>
          <Text style={styles.recentTitle}>Recent Translations:</Text>
          {recentTranslations.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.recentItem}
              onPress={() => {
                setSourceText(item.sourceText);
                setTranslatedText(item.translatedText);
                setSourceLang(item.sourceLang);
                setTargetLang(item.targetLang);
                setCharCount(item.sourceText.length);
              }}
            >
              <Text numberOfLines={1} style={styles.recentSource}>
                {item.sourceText}
              </Text>
              <Text numberOfLines={1} style={styles.recentTranslated}>
                {item.translatedText}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    padding: 16,
  },
  languageContainer: {
    marginBottom: 16,
  },
  languageSelector: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  swapButton: {
    padding: 8,
    marginHorizontal: 8,
  },
  inputContainer: {
    marginBottom: 16,
  },
  input: {
    height: 150,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    textAlignVertical: 'top',
    fontSize: 16,
  },
  inputActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  charCount: {
    color: '#666',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  translateButton: {
    width: 150,
    backgroundColor: '#007AFF',
  },
  clearButton: {
    width: 150,
    borderColor: '#007AFF',
  },
  resultContainer: {
    padding: 16,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  resultActions: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
  },
  resultText: {
    fontSize: 16,
    lineHeight: 24,
  },
  recentContainer: {
    marginTop: 24,
  },
  recentTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  recentItem: {
    padding: 12,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    marginBottom: 8,
  },
  recentSource: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  recentTranslated: {
    fontSize: 14,
    color: '#007AFF',
  },
});