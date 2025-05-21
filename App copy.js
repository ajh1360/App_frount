import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import SplashScreen from './screens/splash_screen';
import MainHomeScreen from './screens/mainHome_screen';
import WrittenDiaryDetailScreen from './screens/writtenDiaryNFeedback_screen';
import DiaryConfirmScreen from './screens/DiaryConfirm_screen';
import LoginScreen from './screens/Login'; // 기존 Login 스크린 경로
import SignUpScreen from './screens/SignUpScreen'; // 새로 추가된 SignUp 스크린 경로
import diaryPostSample from './screens/diaryPostSample';
import DiaryModifyScreen from './screens/DiaryModify_screen';
import RecapScreen from './screens/recap_screen';
import DiaryWriteScreen from './screens/DiaryWriteScreen';
import SettingsScreen from './screens/SettingsScreen';



const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      {/* LoginScreen에서 SignUp으로 이동하므로 initialRouteName은 LoginScreen 또는 Splash가 적절합니다. */}
      {/* 현재 LoginScreen으로 되어 있으니 그대로 유지합니다. */}
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
          name="LoginScreen" // Login.js에서 navigation.navigate('SignUp')으로 호출할 때 사용할 이름
          component={LoginScreen}
          options={{ headerShown: false }}
        />
        {/* SignUpScreen 추가 */}
        <Stack.Screen
          name="SignUp" // Login.js에서 navigation.navigate('SignUp')으로 호출할 때 사용할 이름
          component={SignUpScreen}
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
          name="DiaryWriteScreen"
          component={DiaryWriteScreen}
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

// StyleSheet는 특별히 변경할 내용이 없으므로 그대로 둡니다.
// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#fff',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
// });