// screens/SettingsScreen.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Alert, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// API 서버 주소
const BASEURL = 'http://ceprj.gachon.ac.kr:60021';

export default function SettingsScreen() {
  const navigation = useNavigation();

  const handleWithdrawal = async () => {
    // --- 추가된 로그 ---
    console.log("handleWithdrawal function called"); // ★ 이 로그가 찍히는지 확인!

    Alert.alert(
      "회원 탈퇴",
      "정말로 탈퇴하시겠습니까? 이 작업은 되돌릴 수 없으며, 모든 사용자 데이터가 삭제됩니다.",
      [
        {
          text: "취소",
          onPress: () => console.log("탈퇴 취소"),
          style: "cancel"
        },
        {
          text: "탈퇴하기",
          onPress: async () => {
            console.log("탈퇴 처리 시작..."); // Alert 내부의 "탈퇴하기" 버튼 클릭 시 로그
            try {
              const userToken = await AsyncStorage.getItem('accessToken'); 
              console.log("User Token from AsyncStorage:", userToken);

              if (!userToken) {
                Alert.alert("오류", "인증 토큰을 찾을 수 없습니다. 다시 로그인해주세요.");
                navigation.reset({
                  index: 0,
                  routes: [{ name: 'Start' }],
                });
                return;
              }

              const response = await fetch(`${BASEURL}/api/members`, {
                method: 'DELETE',
                headers: {
                  'Authorization': `Bearer ${userToken}`,
                  'Content-Type': 'application/json',
                },
              });

              console.log("API Response Status:", response.status); // API 응답 상태 코드 로그

              if (response.ok) {
                console.log("백엔드 탈퇴 처리 성공");
                await AsyncStorage.removeItem('userToken');
                console.log("로컬 데이터 삭제 성공");

                Alert.alert("탈퇴 완료", "회원 탈퇴가 성공적으로 처리되었습니다.");
                navigation.reset({
                  index: 0,
                  routes: [{ name: 'Start' }],
                });
              } else {
                let errorMessage = `탈퇴 요청에 실패했습니다. (상태 코드: ${response.status})`;
                let errorDataText = await response.text(); // 서버 응답을 텍스트로 먼저 받아봅니다.
                console.log("Raw error response from server:", errorDataText); // 서버의 원본 에러 메시지 로그
                try {
                  const errorData = JSON.parse(errorDataText); // 이후 JSON 파싱 시도
                  errorMessage = errorData.message || errorData.error || errorMessage;
                } catch (e) {
                  console.warn("Error parsing error response as JSON, using raw text:", e);
                  if (errorDataText) { // 원본 텍스트가 있다면 그걸 에러 메시지로 활용
                    errorMessage = errorDataText;
                  }
                }
                console.error("탈퇴 실패 응답:", response.status, errorMessage);
                Alert.alert("탈퇴 실패", errorMessage);
              }
            } catch (error) {
              console.error("탈퇴 처리 중 네트워크 또는 기타 오류 발생:", error);
              let displayError = "탈퇴 처리 중 문제가 발생했습니다.";
              if (error.message && error.message.includes('Network request failed')) {
                  displayError += " 네트워크 연결을 확인해주세요.";
                  if (Platform.OS === 'android' && API_BASE_URL.startsWith('http://') && !API_BASE_URL.includes('localhost') && !API_BASE_URL.includes('10.0.2.2')) {
                      displayError += "\n(Android에서 http 통신을 위해서는 AndroidManifest.xml에 usesCleartextTraffic=true 설정이 필요할 수 있습니다.)";
                  }
              } else if (error instanceof TypeError && error.message.includes('cannot parse')) {
                  displayError += " 서버 응답 형식에 문제가 있을 수 있습니다.";
              }
              Alert.alert("오류", displayError);
            }
          },
          style: "destructive"
        }
      ],
      { cancelable: false }
    );
  };

  return (
    <View style={styles.container}>
      {/* 상단 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backArrow}>{'<'}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>설정</Text>
        <View style={{ width: 30 }} />{/* for symmetry */}
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
      <TouchableOpacity style={styles.settingItem} onPress={handleWithdrawal}>
        <Text style={[styles.settingText, styles.withdrawalText]}>탈퇴</Text>
      </TouchableOpacity>

      {/* 로고 */}
      <View style={styles.logoContainer}>
        <Image
          source={require('../assets/echoLog_logo.png')}
          style={styles.logoImage}
          resizeMode="contain"
        />
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
  withdrawalText: {
    color: 'red',
  },
  logoContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
  },
  logoImage: {
    width: 100,
    height: 50,
  },
});