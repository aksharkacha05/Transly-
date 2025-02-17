import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

// Screen imports
import LoginScreen from './src/screens/Auth/LoginScreen';
import SignupScreen from './src/screens/Auth/SignupScreen';
import TextTranslationScreen from './src/screens/TextTranslationScreen';
import SpeechToTextScreen from './src/screens/SpeechToTextScreen';
import PdfTranslationScreen from './src/screens/PdfTranslationScreen';
import NotesScreen from './src/screens/NotesScreen';
import ProfileScreen from './src/screens/ProfileScreen'; // Import ProfileScreen

const Stack = createStackNavigator();   
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          switch (route.name) {
            case 'Text':
              iconName = focused ? 'document-text' : 'document-text-outline';
              break;
            case 'Speech':
              iconName = focused ? 'mic' : 'mic-outline';
              break;
            case 'PDF':
              iconName = focused ? 'document' : 'document-outline';
              break;
            case 'Notes':
              iconName = focused ? 'book' : 'book-outline';
              break;
            case 'Profile':
              iconName = focused ? 'person' : 'person-outline';
              break;
            default:
              iconName = 'alert';
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen 
        name="Text" 
        component={TextTranslationScreen}
        options={{ title: 'Text Translation' }}
      />
      <Tab.Screen 
        name="Speech" 
        component={SpeechToTextScreen}
        options={{ title: 'Speech to Text' }}
      />
      <Tab.Screen 
        name="PDF" 
        component={PdfTranslationScreen}
        options={{ title: 'PDF Translation' }}
      />
      <Tab.Screen 
        name="Notes" 
        component={NotesScreen}
        options={{ title: 'Notes' }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{ title: 'Profile' }}
      />
    </Tab.Navigator>
  );
}

function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen 
          name="Login" 
          component={LoginScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="Signup" 
          component={SignupScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="MainTabs" 
          component={MainTabs}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;