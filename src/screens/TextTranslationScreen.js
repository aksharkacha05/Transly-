import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Keyboard,
  ActivityIndicator,
  Share
} from 'react-native';
import { Text, Icon } from 'react-native-elements';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Clipboard from 'expo-clipboard';
import { LinearGradient } from 'expo-linear-gradient';
import axios from 'axios';

const CHAR_LIMIT = 5000;

export default function ProfessionalTranslationScreen() {
  const [sourceText, setSourceText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [sourceLang, setSourceLang] = useState('en');
  const [targetLang, setTargetLang] = useState('gu');
  const [isLoading, setIsLoading] = useState(false);
  const [recentTranslations, setRecentTranslations] = useState([]);
  const [charCount, setCharCount] = useState(0);
  const [showSourceDropdown, setShowSourceDropdown] = useState(false);
  const [showTargetDropdown, setShowTargetDropdown] = useState(false);

  // Language options with native names
  const languageOptions = [
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
    { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી' },
    { code: 'es', name: 'Spanish', nativeName: 'Español' },
    { code: 'fr', name: 'French', nativeName: 'Français' },
  ];

  useEffect(() => {
    loadRecentTranslations();
  }, []);

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

  const swapLanguages = () => {
    setSourceLang(targetLang);
    setTargetLang(sourceLang);
    if (translatedText) {
      setSourceText(translatedText);
      setTranslatedText('');
    }
  };

  const translateWithMyMemory = async (text, source, target) => {
    try {
      const response = await axios.get(
        `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${source}|${target}`
      );
      
      if (response.data && response.data.responseData) {
        return response.data.responseData.translatedText;
      } else {
        throw new Error('No translation found in response');
      }
    } catch (error) {
      console.error('MyMemory API error:', error);
      throw error;
    }
  };

  const handleTranslate = async () => {
    if (!sourceText.trim()) {
      Alert.alert('Error', 'Please enter text to translate');
      return;
    }

    if (sourceText.length > CHAR_LIMIT) {
      Alert.alert('Error', `Text should not exceed ${CHAR_LIMIT} characters`);
      return;
    }

    Keyboard.dismiss();
    setIsLoading(true);

    try {
      const result = await translateWithMyMemory(sourceText, sourceLang, targetLang);
      
      if (!result) {
        throw new Error('Translation failed');
      }

      setTranslatedText(result);

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

    } catch (error) {
      Alert.alert('Translation Error', 'Could not translate text. Please try again later.');
      console.error('Translation error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const pasteFromClipboard = async () => {
    try {
      const text = await Clipboard.getStringAsync();
      if (text) {
        setSourceText(text);
        setCharCount(text.length);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to paste from clipboard');
    }
  };

  const copyToClipboard = async () => {
    try {
      await Clipboard.setStringAsync(translatedText);
      Alert.alert('Copied', 'Translation copied to clipboard');
    } catch (error) {
      Alert.alert('Error', 'Failed to copy translation');
    }
  };

  const shareTranslation = async () => {
    try {
      await Share.share({
        message: `Original (${languageOptions.find(l => l.code === sourceLang)?.name}):\n${sourceText}\n\nTranslation (${languageOptions.find(l => l.code === targetLang)?.name}):\n${translatedText}`,
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to share translation');
    }
  };

  const clearAll = () => {
    setSourceText('');
    setTranslatedText('');
    setCharCount(0);
  };

  const selectLanguage = (type, code) => {
    if (type === 'source') {
      setSourceLang(code);
      setShowSourceDropdown(false);
    } else {
      setTargetLang(code);
      setShowTargetDropdown(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#4A90E2', '#2B70C9']}
        style={styles.header}
      >
        <Text h4 style={styles.headerTitle}>Professional Translator</Text>
      </LinearGradient>

      <ScrollView 
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
      >
        {/* Language Selection */}
        <View style={styles.languageContainer}>
          <View style={styles.languageSelector}>
            <View style={styles.languageInput}>
              <Text style={styles.languageLabel}>From:</Text>
              <TouchableOpacity 
                style={styles.languageDropdown}
                onPress={() => setShowSourceDropdown(!showSourceDropdown)}
              >
                <Text style={styles.languageText}>
                  {languageOptions.find(lang => lang.code === sourceLang)?.nativeName}
                </Text>
                <Icon 
                  name={showSourceDropdown ? "expand-less" : "expand-more"} 
                  size={20} 
                  color="#555" 
                />
              </TouchableOpacity>
              {showSourceDropdown && (
                <View style={styles.dropdownMenu}>
                  {languageOptions.map(lang => (
                    <TouchableOpacity
                      key={`source-${lang.code}`}
                      style={[
                        styles.dropdownItem,
                        sourceLang === lang.code && styles.selectedDropdownItem
                      ]}
                      onPress={() => selectLanguage('source', lang.code)}
                    >
                      <Text style={styles.dropdownItemText}>{lang.nativeName}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            <TouchableOpacity onPress={swapLanguages} style={styles.swapButton}>
              <Icon name="swap-horiz" size={24} color="#4A90E2" />
            </TouchableOpacity>

            <View style={styles.languageInput}>
              <Text style={styles.languageLabel}>To:</Text>
              <TouchableOpacity 
                style={styles.languageDropdown}
                onPress={() => setShowTargetDropdown(!showTargetDropdown)}
              >
                <Text style={styles.languageText}>
                  {languageOptions.find(lang => lang.code === targetLang)?.nativeName}
                </Text>
                <Icon 
                  name={showTargetDropdown ? "expand-less" : "expand-more"} 
                  size={20} 
                  color="#555" 
                />
              </TouchableOpacity>
              {showTargetDropdown && (
                <View style={styles.dropdownMenu}>
                  {languageOptions.map(lang => (
                    <TouchableOpacity
                      key={`target-${lang.code}`}
                      style={[
                        styles.dropdownItem,
                        targetLang === lang.code && styles.selectedDropdownItem
                      ]}
                      onPress={() => selectLanguage('target', lang.code)}
                    >
                      <Text style={styles.dropdownItemText}>{lang.nativeName}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Input Area */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            multiline
            placeholder="Enter text to translate..."
            placeholderTextColor="#999"
            value={sourceText}
            onChangeText={(text) => {
              setSourceText(text);
              setCharCount(text.length);
            }}
            maxLength={CHAR_LIMIT}
          />
          <View style={styles.inputFooter}>
            <Text style={styles.charCount}>
              {charCount}/{CHAR_LIMIT}
            </Text>
            <View style={styles.inputActions}>
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={pasteFromClipboard}
              >
                <Icon name="content-paste" size={20} color="#4A90E2" />
              </TouchableOpacity>
              {sourceText ? (
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={clearAll}
                >
                  <Icon name="close" size={20} color="#FF3B30" />
                </TouchableOpacity>
              ) : null}
            </View>
          </View>
        </View>

        {/* Translate Button */}
        <TouchableOpacity
          style={[
            styles.translateButton,
            (isLoading || !sourceText.trim()) && styles.disabledButton
          ]}
          onPress={handleTranslate}
          disabled={isLoading || !sourceText.trim()}
        >
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.translateButtonText}>Translate</Text>
          )}
        </TouchableOpacity>

        {/* Translation Result */}
        {translatedText && (
          <View style={styles.resultContainer}>
            <View style={styles.resultHeader}>
              <Text style={styles.resultTitle}>Translation</Text>
              <View style={styles.resultActions}>
                <TouchableOpacity 
                  style={styles.resultActionButton}
                  onPress={copyToClipboard}
                >
                  <Icon name="content-copy" size={20} color="#4A90E2" />
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.resultActionButton}
                  onPress={shareTranslation}
                >
                  <Icon name="share" size={20} color="#4A90E2" />
                </TouchableOpacity>
              </View>
            </View>
            <Text style={styles.resultText}>{translatedText}</Text>
          </View>
        )}

        {/* Recent Translations */}
        {recentTranslations.length > 0 && (
          <View style={styles.recentContainer}>
            <Text style={styles.sectionTitle}>Recent Translations</Text>
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
                <View style={styles.recentItemFooter}>
                  <Text style={styles.recentLanguage}>
                    {languageOptions.find(lang => lang.code === item.sourceLang)?.name} → 
                    {languageOptions.find(lang => lang.code === item.targetLang)?.name}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    padding: 20,
    paddingTop: 50,
    paddingBottom: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  headerTitle: {
    color: 'white',
    fontWeight: '600',
    textAlign: 'center',
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  languageContainer: {
    marginBottom: 20,
    zIndex: 10,
  },
  languageSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  languageInput: {
    flex: 1,
    position: 'relative',
  },
  languageLabel: {
    color: '#555',
    fontSize: 14,
    marginBottom: 5,
    fontWeight: '500',
  },
  languageDropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E1E5EB',
  },
  languageText: {
    fontSize: 16,
    color: '#333',
  },
  dropdownMenu: {
    position: 'absolute',
    top: 70,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E1E5EB',
    zIndex: 100,
    elevation: 5,
  },
  dropdownItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F2F5',
  },
  selectedDropdownItem: {
    backgroundColor: '#F0F7FF',
  },
  dropdownItemText: {
    fontSize: 16,
    color: '#333',
  },
  swapButton: {
    marginHorizontal: 10,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  inputContainer: {
    marginBottom: 20,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  input: {
    minHeight: 120,
    fontSize: 16,
    color: '#333',
    textAlignVertical: 'top',
  },
  inputFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F0F2F5',
  },
  charCount: {
    color: '#999',
    fontSize: 12,
  },
  inputActions: {
    flexDirection: 'row',
  },
  actionButton: {
    marginLeft: 15,
  },
  translateButton: {
    backgroundColor: '#4A90E2',
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: '#4A90E2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  disabledButton: {
    opacity: 0.6,
  },
  translateButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  resultContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  resultActions: {
    flexDirection: 'row',
  },
  resultActionButton: {
    marginLeft: 15,
  },
  resultText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#555',
  },
  recentContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  recentItem: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  recentSource: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  recentTranslated: {
    fontSize: 14,
    color: '#4A90E2',
    marginBottom: 5,
    fontWeight: '500',
  },
  recentItemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 5,
  },
  recentLanguage: {
    fontSize: 12,
    color: '#999',
  },
});