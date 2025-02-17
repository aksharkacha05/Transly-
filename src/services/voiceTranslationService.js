import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import axios from 'axios';

// Function to request permissions
const requestPermissions = async () => {
  const { status: audioStatus } = await Audio.requestPermissionsAsync();
  const { status: fileStatus } = await FileSystem.requestPermissionsAsync();

  if (audioStatus !== 'granted' || fileStatus !== 'granted') {
    throw new Error('Permission to access microphone and file system is required!');
  }
};

// Function to record audio
export const recordAudio = async () => {
  try {
    await requestPermissions();

    const recording = new Audio.Recording();
    await recording.prepareToRecordAsync(Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY);
    await recording.startAsync();

    return recording;
  } catch (error) {
    console.error('Audio recording error:', error);
    throw error;
  }
};

// Function to stop recording and get the URI
export const stopRecording = async (recording) => {
  try {
    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();
    console.log('Recording stopped, file URI:', uri);
    return uri;
  } catch (error) {
    console.error('Stop recording error:', error);
    throw error;
  }
};

// Function to transcribe audio using AssemblyAI
export const transcribeAudio = async (audioUri) => {
  try {
    console.log('Reading audio file from URI:', audioUri);
    const audioBase64 = await FileSystem.readAsStringAsync(audioUri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    const response = await axios.post('https://api.assemblyai.com/v2/transcript', {
      audio_data: audioBase64,
    }, {
      headers: {
        'Authorization': `Bearer  cbd6c9a219e44f78b8cff164adb903a9`,
        'Content-Type': 'application/json',
      }
    });

    const transcriptId = response.data.id;

    // Poll for the transcription result
    let transcript;
    while (true) {
      const statusResponse = await axios.get(`https://api.assemblyai.com/v2/transcript/${transcriptId}`, {
        headers: {
          'Authorization': `Bearer cbd6c9a219e44f78b8cff164adb903a9`,
        }
      });

      if (statusResponse.data.status === 'completed') {
        transcript = statusResponse.data.text;
        break;
      } else if (statusResponse.data.status === 'failed') {
        throw new Error('Transcription failed');
      }

      await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds before polling again
    }

    return transcript;
  } catch (error) {
    console.error('Transcription error:', error);
    throw error;
  }
};

// Function to translate text using a translation API
export const translateText = async (text, targetLanguage) => {
  try {
    const response = await axios.post('https://api.mymemory.translated.net/get', {
      q: text,
      target: targetLanguage,
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
