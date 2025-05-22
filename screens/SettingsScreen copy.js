// screens/SettingsScreen.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function SettingsScreen() {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      {/* 상단 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backArrow}>{'<'}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>설정</Text>
        <View style={{ width: 30 }} /> {/* for symmetry */}
      </View>

      {/* 설정 항목들 */}
      <TouchableOpacity style={styles.settingItem}>
        <Text style={styles.settingText}>알림 설정</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.settingItem}>
        <Text style={styles.settingText}>계정 관리</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.settingItem}>
        <Text style={styles.settingText}>공지사항</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.settingItem}>
        <Text style={styles.settingText}>탈퇴</Text>
      </TouchableOpacity>

      {/* 로고 */}
      <View style={styles.logoContainer}>
        <Image
          source={require('../assets/echoLog_logo.png')}
          style={styles.logo}
        />
        <Text style={styles.logoText}>Echo Log</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white', paddingHorizontal: 20 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 60,
    borderBottomWidth: 0.5,
    borderBottomColor: '#ccc',
  },
  backArrow: { fontSize: 24, color: '#333' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  settingItem: {
    paddingVertical: 20,
    borderBottomWidth: 0.5,
    borderBottomColor: '#ccc',
  },
  settingText: { fontSize: 16, color: '#333' },
  logoContainer: {
    alignItems: 'center',
    marginTop: 'auto',
    marginBottom: 30,
  },
  logo: { width: 50, height: 50, marginBottom: 5 },
  logoText: { fontSize: 18, fontWeight: 'bold', color: '#7A986A' },
});
