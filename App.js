import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import SplashScreen from './screens/splash_screen';
import MainHomeScreen from './screens/mainHome_screen';
import WrittenDiaryDetailScreen from './screens/writtenDiaryNFeedback_screen';
import DiaryConfirmScreen from './screens/DiaryConfirm_screen';
import LoginScreen from './screens/Login';
import diaryPostSample from './screens/diaryPostSample';
import DiaryModifyScreen from './screens/DiaryModify_screen';
import RecapScreen from './screens/recap_screen';

import DiaryResultScreen from './screens/DiaryResultScreen';
import DiaryWriteScreen from './screens/DiaryWriteScreen';
import SettingsScreen from './screens/SettingsScreen';



const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="LoginScreen">  
        <Stack.Screen
          name="Splash"
          component={SplashScreen}
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
          name="LoginScreen"
          component={LoginScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="diaryPostSample"
          component={diaryPostSample}
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
          name="DiaryWrite"
          component={DiaryWriteScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="DiaryResult"
          component={DiaryResultScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Settings"
          component={SettingsScreen}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
