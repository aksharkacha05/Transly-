import AsyncStorage from '@react-native-async-storage/async-storage';

export const saveTranslation = async (translation) => {
  try {
    const history = await AsyncStorage.getItem('translations');
    const translations = history ? JSON.parse(history) : [];
    translations.unshift(translation);
    await AsyncStorage.setItem(
      'translations', 
      JSON.stringify(translations.slice(0, 50))
    );
    return true;
  } catch (error) {
    console.error('Storage error:', error);
    return false;
  }
};

export const getTranslations = async () => {
  try {
    const history = await AsyncStorage.getItem('translations');
    return history ? JSON.parse(history) : [];
  } catch (error) {
    console.error('Storage error:', error);
    return [];
  }
};

export const deleteTranslation = async (id) => {
  try {
    const history = await AsyncStorage.getItem('translations');
    if (history) {
      const translations = JSON.parse(history);
      const updated = translations.filter(t => t.id !== id);
      await AsyncStorage.setItem('translations', JSON.stringify(updated));
      return true;
    }
    return false;
  } catch (error) {
    console.error('Storage error:', error);
    return false;
  }
};