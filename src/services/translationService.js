import i18next from 'i18next';

i18next.init({
  resources: {
    en: {
      translation: {
        "Hello": "Hello",
        // Add more translations here
      }
    },
    es: {
      translation: {
        "Hello": "Hola",
        // Add more translations here
      }
    }
  },
  lng: "en", // Default language
  fallbackLng: "en",
  interpolation: {
    escapeValue: false
  }
});

export const translateText = (text, targetLang) => {
  i18next.changeLanguage(targetLang);
  return i18next.t(text);
};