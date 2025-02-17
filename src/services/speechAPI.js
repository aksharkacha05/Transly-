import axios from 'axios';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';

// API keys
const WIT_AI_KEY = process.env.WIT_AI_KEY;
const REV_AI_KEY = process.env.REV_AI_KEY;
const VOSK_API_URL = 'http://localhost:2700'; // Local VOSK server

// Audio configuration
const AUDIO_CONFIG = {
  android: {
    extension: '.wav',
    mimeType: 'audio/wav',
    audioQuality: Audio.RECORDING_OPTION_ANDROID_AUDIO_ENCODER_AAC,
    sampleRate: 16000,
    numberOfChannels: 1,
    bitRate: 128000,
  },
  ios: {
    extension: '.wav',
    mimeType: 'audio/wav',
    audioQuality: Audio.RECORDING_OPTION_IOS_AUDIO_QUALITY_HIGH,
    sampleRate: 16000,
    numberOfChannels: 1,
    bitRate: 128000,
    linearPCM: true,
  }
};

// Wit.ai API speech-to-text (free)
const transcribeWithWitAI = async (audioBase64) => {
  try {
    console.log('Sending request to Wit.ai:', {
      audioBase64,
      headers: {
        'Authorization': `Bearer ${process.env.WIT_AI_KEY}`,
        'Content-Type': 'audio/wav',
      }
    });
    const response = await axios.post(
      'https://api.wit.ai/speech',
      audioBase64,
      {
        headers: {
          'Authorization': `Bearer ${process.env.WIT_AI_KEY}`,
          'Content-Type': 'audio/wav',
        },
        params: {
          'v': '20230215',
        }
      }
    );
    console.log('Wit.ai response:', response.data);
    return response.data.text;
  } catch (error) {
    console.error('Wit.ai error:', error.response ? error.response.data : error.message);
    throw error;
  }
};

// Rev.ai API speech-to-text (free trial)
const transcribeWithRevAI = async (audioBase64) => {
  try {
    // Create the first job
    const jobResponse = await axios.post(
      'https://api.rev.ai/speechtotext/v1/jobs',
      {
        media_url: audioBase64,
        language: 'en', // Only English
      },
      {
        headers: {
          'Authorization': `Bearer ${REV_AI_KEY}`,
          'Content-Type': 'application/json',
        }
      }
    );

    const jobId = jobResponse.data.id;

    // Wait for the job to complete
    let transcript;
    while (true) {
      const statusResponse = await axios.get(
        `https://api.rev.ai/speechtotext/v1/jobs/${jobId}`,
        {
          headers: {
            'Authorization': `Bearer ${REV_AI_KEY}`,
          }
        }
      );

      if (statusResponse.data.status === 'completed') {
        const transcriptResponse = await axios.get(
          `https://api.rev.ai/speechtotext/v1/jobs/${jobId}/transcript`,
          {
            headers: {
              'Authorization': `Bearer ${REV_AI_KEY}`,
            }
          }
        );
        transcript = transcriptResponse.data;
        break;
      }

      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    return transcript;
  } catch (error) {
    console.error('Rev.ai error:', error);
    throw error;
  }
};

// VOSK API speech-to-text (free and offline)
const transcribeWithVOSK = async (audioBase64) => {
  try {
    const response = await axios.post(
      `${VOSK_API_URL}/transcribe`,
      {
        audio_data: audioBase64,
        language: 'en', // Only English
      },
      {
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );
    return response.data.text;
  } catch (error) {
    console.error('VOSK error:', error);
    throw error;
  }
};

// Main speech-to-text function
export const convertSpeechToText = async (audioUri) => {
  try {
    const audioBase64 = await processAudioFile(audioUri);
    
    // Try all APIs
    const apis = [
      { name: 'Wit.ai', fn: transcribeWithWitAI },
      { name: 'Rev.ai', fn: transcribeWithRevAI },
      { name: 'VOSK', fn: transcribeWithVOSK }
    ];

    for (const api of apis) {
      try {
        console.log(`Trying ${api.name}...`);
        const result = await api.fn(audioBase64);
        if (result) {
          console.log(`${api.name} successful`);
          return result;
        }
      } catch (error) {
        console.warn(`${api.name} failed:`, error);
        continue;
      }
    }

    throw new Error('All APIs failed');
  } catch (error) {
    console.error('Speech to text conversion failed:', error);
    throw error;
  } finally {
    await cleanupAudioFile(audioUri);
  }
};

// Function to process audio file and return a valid URI
const processAudioFile = async (uri) => {
  try {
    // Ensure the URI is a valid file path
    console.log('Processing audio file at URI:', uri);

    const base64Audio = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // Log the base64 length to ensure it's being read correctly
    console.log('Base64 audio length:', base64Audio.length);

    return uri; // Ensure you return the correct file path
  } catch (error) {
    console.error('Audio processing error:', error);
    throw error;
  }
};

// Audio file processing
export const getAudioConfig = () => {
  return Platform.OS === 'ios' ? AUDIO_CONFIG.ios : AUDIO_CONFIG.android;
};

// Cleanup function
export const cleanupAudioFile = async (uri) => {
  try {
    // Log the file URI for debugging
    console.log(`Attempting to delete file at: ${uri}`);

    // Check if the file exists
    const fileInfo = await FileSystem.getInfoAsync(uri);
    if (!fileInfo.exists) {
      console.warn(`File does not exist at path: ${uri}`);
      return;
    }

    // Attempt to delete the file
    await FileSystem.deleteAsync(uri);
    console.log(`File deleted successfully: ${uri}`);
  } catch (error) {
    console.error('Audio cleanup error:', error.message);
    console.error('Error details:', error);
  }
};