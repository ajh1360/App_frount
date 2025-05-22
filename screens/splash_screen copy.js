import React from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';

export default function SplashScreen() {
  return (
    <View style={styles.container}>
      <Image 
      source={require('../assets/echoLog_logo.png')}
      style={{ width: 200, height: 200}}
      resizeMode='contain'
      />
      <Text style={styles.title}>✨ 오늘 하루, 어떻게 지냈나요? ✨</Text>
      <Text style={styles.small_text}>언제든 마음을 털어놓을 수 있는 {"\n"} 당신만의 공간, Echo Log</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',           
  },
  title: {
    fontSize: 25,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '3F3F3F',
  },
  small_text: {
    fontSize: 15,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#3F3F3F',
  }
});