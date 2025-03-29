import React, { useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import { 
  Button, 
  Text, 
  TextInput, 
  Card, 
  Divider, 
  ActivityIndicator, 
  Chip,
  useTheme,
  Appbar
} from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import axios from 'axios';

export default function SpeechTranslationApp() {
  const { colors } = useTheme();
  const [recognizedText, setRecognizedText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [targetLanguage, setTargetLanguage] = useState('es');
  
  // Supported languages with native names and flags
  const languages = [
    { code: 'en', name: 'English', nativeName: 'English', icon: '🇬🇧' },
    { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', icon: '🇮🇳' },
    { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', icon: '🇮🇳' },
    { code: 'es', name: 'Spanish', nativeName: 'Español', icon: '🇪🇸' },
    { code: 'fr', name: 'French', nativeName: 'Français', icon: '🇫🇷' },
  ];

  // WebView HTML for speech recognition
  const speechRecognitionHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100vh;
          margin: 0;
          padding: 20px;
          font-family: -apple-system, BlinkMacSystemFont, sans-serif;
          background-color: ${colors.surface};
        }
        button {
          padding: 15px 30px;
          font-size: 18px;
          background-color: ${colors.primary};
          color: white;
          border: none;
          border-radius: 50px;
          cursor: pointer;
          box-shadow: 0 2px 5px rgba(0,0,0,0.2);
          transition: all 0.3s;
        }
        button:active {
          transform: scale(0.95);
        }
        #status {
          margin-top: 20px;
          color: ${colors.onSurface};
          font-size: 14px;
          text-align: center;
        }
      </style>
    </head>
    <body>
      <button onclick="startRecognition()">🎤 Tap to Speak</button>
      <div id="status">Press the button and speak clearly</div>
      <script>
        let recognition;
        function startRecognition() {
          recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
          recognition.lang = 'en-US';
          recognition.interimResults = false;
          recognition.continuous = false;
          
          recognition.onstart = function() {
            document.getElementById('status').innerHTML = "Listening... Speak now";
            document.querySelector('button').style.backgroundColor = '#FF3B30';
          };
          
          recognition.onresult = function(event) {
            const transcript = event.results[0][0].transcript;
            window.ReactNativeWebView.postMessage(transcript);
            document.getElementById('status').innerHTML = "Press button to speak again";
            document.querySelector('button').style.backgroundColor = '${colors.primary}';
          };
          
          recognition.onerror = function(event) {
            window.ReactNativeWebView.postMessage('Error: ' + event.error);
            document.getElementById('status').innerHTML = "Error: " + event.error;
            document.querySelector('button').style.backgroundColor = '${colors.primary}';
          };
          
          recognition.onend = function() {
            document.querySelector('button').style.backgroundColor = '${colors.primary}';
          };
          
          recognition.start();
        }
      </script>
    </body>
    </html>
  `;

  // Translation function using MyMemory API
  const translateText = async () => {
    if (!recognizedText.trim()) return;
    
    setIsTranslating(true);
    try {
      const response = await axios.get(
        `https://api.mymemory.translated.net/get?q=${encodeURIComponent(recognizedText)}&langpair=en|${targetLanguage}`
      );
      setTranslatedText(response.data.responseData.translatedText || "No translation found");
    } catch (error) {
      console.error('Translation error:', error);
      setTranslatedText('Translation failed. Please try again.');
    } finally {
      setIsTranslating(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await Clipboard.setStringAsync(translatedText);
      Alert.alert('Success', 'Translation copied to clipboard');
    } catch (error) {
      Alert.alert('Error', 'Failed to copy translation');
    }
  };

  const clearAll = () => {
    setRecognizedText('');
    setTranslatedText('');
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Professional Header */}
      <LinearGradient
        colors={['#4A90E2', '#2B70C9']}
        style={styles.header}
      >
        <Appbar.Header style={{ backgroundColor: 'transparent', elevation: 0 }}>
          <Appbar.Content 
            title="Voice Translator" 
            titleStyle={styles.headerTitle}
          />
        </Appbar.Header>
      </LinearGradient>

      <ScrollView contentContainerStyle={[styles.container, { backgroundColor: colors.background }]}>
        {/* Speech Recognition Card */}
        <Card style={[styles.card, { backgroundColor: colors.surface }]}>
          <Card.Content>
            <Text variant="titleMedium" style={[styles.cardTitle, { color: colors.onSurface }]}>
              Speak Now
            </Text>
            <View style={styles.webviewContainer}>
              <WebView
                originWhitelist={['*']}
                source={{ html: speechRecognitionHTML }}
                style={styles.webview}
                onMessage={(event) => {
                  setRecognizedText(event.nativeEvent.data);
                }}
              />
            </View>
          </Card.Content>
        </Card>

        {/* Recognized Text */}
        <Card style={[styles.card, { backgroundColor: colors.surface }]}>
          <Card.Content>
            <Text variant="titleMedium" style={[styles.cardTitle, { color: colors.onSurface }]}>
              What You Said
            </Text>
            <TextInput
              mode="outlined"
              value={recognizedText}
              onChangeText={setRecognizedText}
              multiline
              style={[styles.textInput, { backgroundColor: colors.surface }]}
              placeholder="Your speech will appear here"
              right={
                recognizedText ? (
                  <TextInput.Icon 
                    icon="close" 
                    onPress={() => setRecognizedText('')} 
                  />
                ) : null
              }
            />
          </Card.Content>
        </Card>

        {/* Language Selection */}
        <Card style={[styles.card, { backgroundColor: colors.surface }]}>
          <Card.Content>
            <Text variant="titleMedium" style={[styles.cardTitle, { color: colors.onSurface }]}>
              Translate To
            </Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.languageScroll}
            >
              {languages.map((lang) => (
                <Chip
                  key={lang.code}
                  mode={targetLanguage === lang.code ? 'flat' : 'outlined'}
                  selected={targetLanguage === lang.code}
                  onPress={() => setTargetLanguage(lang.code)}
                  style={styles.languageChip}
                  textStyle={styles.chipText}
                >
                  {lang.icon} {lang.name}
                </Chip>
              ))}
            </ScrollView>
          </Card.Content>
        </Card>

        {/* Translate Button */}
        <Button
          mode="contained"
          onPress={translateText}
          loading={isTranslating}
          disabled={!recognizedText || isTranslating}
          style={[styles.translateButton, { backgroundColor: colors.primary }]}
          labelStyle={styles.buttonLabel}
          icon="translate"
        >
          {isTranslating ? 'Translating...' : 'Translate'}
        </Button>

        {/* Translation Result */}
        {translatedText ? (
          <Card style={[styles.card, { backgroundColor: colors.surface }]}>
            <Card.Content>
              <View style={styles.resultHeader}>
                <Text variant="titleMedium" style={[styles.cardTitle, { color: colors.onSurface }]}>
                  Translation
                </Text>
                <View style={styles.resultActions}>
                  <Button 
                    icon="content-copy" 
                    onPress={copyToClipboard}
                    textColor={colors.primary}
                  >
                    Copy
                  </Button>
                  <Button 
                    icon="delete" 
                    onPress={clearAll}
                    textColor={colors.error}
                  >
                    Clear
                  </Button>
                </View>
              </View>
              <TextInput
                mode="outlined"
                value={translatedText}
                multiline
                style={[styles.textInput, { backgroundColor: colors.surface }]}
                editable={false}
              />
            </Card.Content>
          </Card>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 16,
  },
  header: {
    paddingBottom: 5,
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
    fontSize: 24,
  },
  card: {
    marginBottom: 16,
    borderRadius: 12,
    elevation: 3,
  },
  cardTitle: {
    marginBottom: 12,
    fontWeight: 'bold',
  },
  webviewContainer: {
    height: 180,
    borderRadius: 8,
    overflow: 'hidden',
  },
  webview: {
    flex: 1,
  },
  textInput: {
    backgroundColor: 'transparent',
  },
  languageScroll: {
    paddingVertical: 4,
  },
  languageChip: {
    marginRight: 8,
    marginBottom: 8,
    height: 40,
  },
  chipText: {
    fontSize: 14,
  },
  translateButton: {
    marginVertical: 16,
    borderRadius: 8,
    paddingVertical: 8,
  },
  buttonLabel: {
    fontSize: 16,
    paddingVertical: 4,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  resultActions: {
    flexDirection: 'row',
  },
});