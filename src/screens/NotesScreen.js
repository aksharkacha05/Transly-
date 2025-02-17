import React, { useState, useEffect } from 'react';
import { 
  View, 
  FlatList, 
  StyleSheet, 
  TouchableOpacity, 
  Alert 
} from 'react-native';
import { Text, Button } from 'react-native-elements';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

export default function NotesScreen() {
  const [translations, setTranslations] = useState([]);

  useEffect(() => {
    loadTranslations();
  }, []);

  const loadTranslations = async () => {
    try {
      const history = await AsyncStorage.getItem('translations');
      if (history) {
        setTranslations(JSON.parse(history));
      }
    } catch (error) {
      Alert.alert('Error', 'Error loading notes');
    }
  };

  const deleteTranslation = async (id) => {
    try {
      const updatedTranslations = translations.filter(t => t.id !== id);
      await AsyncStorage.setItem(
        'translations', 
        JSON.stringify(updatedTranslations)
      );
      setTranslations(updatedTranslations);
    } catch (error) {
      Alert.alert('Error', 'Error deleting note');
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.timestamp}>
          {new Date(item.timestamp).toLocaleDateString()}
        </Text>
        <TouchableOpacity 
          onPress={() => deleteTranslation(item.id)}
          style={styles.deleteButton}
        >
          <Ionicons name="trash-outline" size={24} color="#FF3B30" />
        </TouchableOpacity>
      </View>

      <View style={styles.cardContent}>
        <Text style={styles.sourceText}>{item.sourceText}</Text>
        <Ionicons 
          name="arrow-down" 
          size={24} 
          color="#666" 
          style={styles.arrow}
        />
        <Text style={styles.translatedText}>{item.translatedText}</Text>
      </View>

      <View style={styles.languageInfo}>
        <Text style={styles.languageText}>
          {item.sourceLang} → {item.targetLang}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {translations.length > 0 ? (
        <FlatList
          data={translations}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            No notes available
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  list: {
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  timestamp: {
    color: '#666',
    fontSize: 14,
  },
  deleteButton: {
    padding: 4,
  },
  cardContent: {
    marginBottom: 12,
  },
  sourceText: {
    fontSize: 16,
    marginBottom: 8,
  },
  arrow: {
    alignSelf: 'center',
    marginVertical: 8,
  },
  translatedText: {
    fontSize: 16,
    color: '#007AFF',
  },
  languageInfo: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 12,
  },
  languageText: {
    color: '#666',
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
});