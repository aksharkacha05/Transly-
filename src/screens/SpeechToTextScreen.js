import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  Platform,
  ActivityIndicator
} from 'react-native';
import { Text, Button, Icon } from 'react-native-elements';
import * as Speech from 'expo-speech';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import { Ionicons } from '@expo/vector-icons';
import { convertSpeechToText } from '../services/speechAPI';
import { translateText } from '../services/translateAPI';
import LanguageSelector from '../../components/LanguageSelector';
import { recordAudio, stopRecording, transcribeAudio } from '../services/voiceTranslationService';

export default function SpeechToTextScreen() {
  const [isRecording, setIsRecording] = useState(false);
  const [recording, setRecording] = useState(null);
  const [transcript, setTranscript] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [audioPermission, setAudioPermission] = useState(false);
  const [sourceLang, setSourceLang] = useState('en');
  const [targetLang, setTargetLang] = useState('gu');
  const [volume, setVolume] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Check microphone permission
  useEffect(() => {
    checkPermissions();
    return () => {
      if (recording) {
        stopRecording();
      }
    };
  }, []);

  const checkPermissions = async () => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      setAudioPermission(status === 'granted');
      if (status !== 'granted') {
        Alert.alert('Error', 'Microphone access is required');
      }
    } catch (error) {
      console.error('Permission error:', error);
    }
  };

  // Start recording
  const startRecording = async () => {
    try {
      if (!audioPermission) {
        await checkPermissions();
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
      });

      const newRecording = new Audio.Recording();
      await newRecording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      
      // Volume monitoring
      newRecording.setOnRecordingStatusUpdate(status => {
        setVolume(status.metering || 0);
      });
      
      await newRecording.startAsync();
      setRecording(newRecording);
      setIsRecording(true);
      setTranscript('');
      setTranslatedText('');
    } catch (error) {
      Alert.alert('Error', 'Error starting recording');
    }
  };

  // Stop recording
  const stopRecording = async () => {
    try {
      if (!recording) return;

      setIsRecording(false);
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecording(null);
      
      if (uri) {
        processAudio(uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Error stopping recording');
    }
  };

  // Process audio
  const processAudio = async (uri) => {
    setIsProcessing(true);
    try {
      // Convert audio file to base64
      const audioBase64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Call speech-to-text API
      const text = await convertSpeechToText(audioBase64, sourceLang);
      setTranscript(text);

      // Translate the text
      if (text && targetLang !== sourceLang) {
        const translated = await translateText(text, sourceLang, targetLang);
        setTranslatedText(translated);
      }
    } catch (error) {
      Alert.alert('Error', 'Error processing audio');
    } finally {
      setIsProcessing(false);
    }
  };

  // Read text
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
      Alert.alert('Error', 'Error reading text');
      setIsSpeaking(false);
    }
  };

  const handleRecord = async () => {
    try {
      const newRecording = await recordAudio();
      setRecording(newRecording);
      setIsRecording(true);
    } catch (error) {
      Alert.alert('Error', 'Failed to start recording');
      console.error('Recording error:', error);
    }
  };

  const handleStop = async () => {
    try {
      const audioUri = await stopRecording(recording);
      setIsRecording(false);
      const text = await transcribeAudio(audioUri);
      setTranscript(text);

      const translatedText = await translateText(text, targetLang);
      setTranslatedText(translatedText);
    } catch (error) {
      Alert.alert('Error', 'Failed to process audio');
      console.error('Error during stop or processing:', error);
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Language selection */}
      <LanguageSelector
        sourceLang={sourceLang}
        targetLang={targetLang}
        onSourceChange={setSourceLang}
        onTargetChange={setTargetLang}
      />

      {/* Recording button */}
      <View style={styles.recordContainer}>
        <TouchableOpacity
          style={[
            styles.recordButton,
            isRecording && styles.recordingActive,
          ]}
          onPress={isRecording ? handleStop : handleRecord}
        >
          <Ionicons
            name={isRecording ? "stop" : "mic"}
            size={40}
            color="#fff"
          />
        </TouchableOpacity>

        {/* Volume indicator */}
        {isRecording && (
          <View style={styles.volumeContainer}>
            {[...Array(10)].map((_, i) => (
              <View
                key={i}
                style={[
                  styles.volumeBar,
                  { height: (i + 1) * 3 },
                  volume > i * 10 && styles.volumeActive
                ]}
              />
            ))}
          </View>
        )}
      </View>

      {/* Status text */}
      <Text style={styles.statusText}>
        {isRecording ? 'Recording...' : 'Press the button to start recording'}
      </Text>

      {/* Loading indicator */}
      {isProcessing && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Processing...</Text>
        </View>
      )}

      {/* Transcript */}
      {transcript && (
        <View style={styles.resultContainer}>
          <View style={styles.resultHeader}>
            <Text style={styles.resultTitle}>Original Text:</Text>
            <TouchableOpacity 
              onPress={() => speakText(transcript, sourceLang)}
              style={styles.speakButton}
            >
              <Ionicons
                name={isSpeaking ? "volume-high" : "volume-medium"}
                size={24}
                color="#007AFF"
              />
            </TouchableOpacity>
          </View>
          <Text style={styles.resultText}>{transcript}</Text>
        </View>
      )}

      {/* Translated text */}
      {translatedText && (
        <View style={styles.resultContainer}>
          <View style={styles.resultHeader}>
            <Text style={styles.resultTitle}>Translated Text:</Text>
            <TouchableOpacity 
              onPress={() => speakText(translatedText, targetLang)}
              style={styles.speakButton}
            >
              <Ionicons
                name={isSpeaking ? "volume-high" : "volume-medium"}
                size={24}
                color="#007AFF"
              />
            </TouchableOpacity>
          </View>
          <Text style={styles.resultText}>{translatedText}</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  recordContainer: {
    alignItems: 'center',
    marginVertical: 30,
  },
  recordButton: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  recordingActive: {
    backgroundColor: '#FF3B30',
  },
  volumeContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 30,
    marginTop: 20,
  },
  volumeBar: {
    width: 3,
    backgroundColor: '#ddd',
    marginHorizontal: 1,
    borderRadius: 1,
  },
  volumeActive: {
    backgroundColor: '#007AFF',
  },
  statusText: {
    textAlign: 'center',
    color: '#666',
    marginBottom: 20,
  },
  loadingContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
  },
  resultContainer: {
    marginBottom: 20,
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
    color: '#333',
  },
  speakButton: {
    padding: 8,
  },
  resultText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
});