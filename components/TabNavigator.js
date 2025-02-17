import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import TextTranslationScreen from '../screens/TextTranslationScreen';
import SpeechTranslationScreen from '../screens/SpeechTranslationScreen';
import PDFTranslationScreen from '../screens/PDFTranslationScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          switch (route.name) {
            case 'Text':
              iconName = focused ? 'text' : 'text-outline';
              break;
            case 'Speech':
              iconName = focused ? 'mic' : 'mic-outline';
              break;
            case 'PDF':
              iconName = focused ? 'document' : 'document-outline';
              break;
            case 'Profile':
              iconName = focused ? 'person' : 'person-outline';
              break;
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen name="Text" component={TextTranslationScreen} />
      <Tab.Screen name="Speech" component={SpeechTranslationScreen} />
      <Tab.Screen name="PDF" component={PDFTranslationScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}