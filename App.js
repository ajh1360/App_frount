import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import WelcomeScreen from './screens/WelcomeScreen'; 
import MainHomeScreen from './screens/mainHome_screen';
import WrittenDiaryDetailScreen from './screens/writtenDiaryNFeedback_screen';
import DiaryConfirmScreen from './screens/DiaryConfirm_screen';
import StartScreen from './screens/StartScreen';
import LoginScreen from './screens/Login';
import SignUpScreen from './screens/SignUpScreen';
import DiaryModifyScreen from './screens/DiaryModify_screen';
import RecapScreen from './screens/recap_screen';
import DiaryWriteScreen from './screens/DiaryWriteScreen';
import SettingsScreen from './screens/SettingsScreen';
import EmotionAnalysisAlert from './screens/emotionAlert_screen';
import AnnouncementsScreen from './screens/AnnouncementsScreen'; 

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Welcome">
        <Stack.Screen
          name="Welcome" 
          component={WelcomeScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Start"
          component={StartScreen}
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="WrittenDiary"
          component={WrittenDiaryDetailScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="MainHome"
          component={MainHomeScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="DiaryConfirm"
          component={DiaryConfirmScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="SignUp"
          component={SignUpScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="DiaryModify"
          component={DiaryModifyScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="RecapScreen"
          component={RecapScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="DiaryWriteScreen"
          component={DiaryWriteScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Settings"
          component={SettingsScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="EmotionAlert"
          component={EmotionAnalysisAlert}
          options={{ headerShown: false }}
        />
        <Stack.Screen
                  name="Announcements" 
                  component={AnnouncementsScreen}
                  options={{ headerShown: false }} 
                />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

