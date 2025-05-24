import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,View,Text,TextInput,TouchableOpacity,Alert,ScrollView,Image,Platform,StatusBar,Dimensions,KeyboardAvoidingView,StyleSheet,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Audio } from 'expo-av';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import dayjs from 'dayjs';

import RecordingImage from '../assets/recode.png';

const RECORDING_OPTIONS_M4A = {
  isMeteringEnabled: true,
  android: {
    extension: '.m4a',
    outputFormat: Audio.AndroidOutputFormat.MPEG_4,
    audioEncoder: Audio.AndroidAudioEncoder.AAC,
    sampleRate: 44100,
    numberOfChannels: 1,
    bitRate: 128000,
  },
  ios: {
    extension: '.m4a',
    outputFormat: Audio.IOSOutputFormat.MPEG4AAC,
    audioQuality: Audio.IOSAudioQuality.HIGH,
    sampleRate: 44100,
    numberOfChannels: 1,
    bitRate: 128000,
  },
};

export default function DiaryWriteScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { selectedDate, accessToken } = route.params;

  const [content, setContent] = useState('');
  const [recording, setRecording] = useState();
  const [isRecording, setIsRecording] = useState(false);
  const [recordedURI, setRecordedURI] = useState(null);
  const [_permissionResponse, requestPermission] = Audio.usePermissions();

  const BASE_URL = 'http://ceprj.gachon.ac.kr:60021';

  useEffect(() => {
    return () => {
      if (recording) {
        recording.stopAndUnloadAsync().catch(err => console.error("Error stopping/unloading recording:", err));
      }
      Audio.setAudioModeAsync({ allowsRecordingIOS: false }).catch(err =>
        console.error("Error resetting audio mode:", err)
      );
    };
  }, [recording]);

  const startRecording = async () => {
    try {
      const { status } = await Audio.getPermissionsAsync();
      if (status !== 'granted') {
        const permission = await requestPermission();
        if (permission.status !== 'granted') {
          Alert.alert('권한 거부됨', '마이크 권한이 필요합니다.');
          return;
        }
      }
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
      const { recording: newRecording } = await Audio.Recording.createAsync(RECORDING_OPTIONS_M4A);
      setRecording(newRecording);
      setIsRecording(true);
      setRecordedURI(null);
      setContent(''); // Clear text content when starting new recording
    } catch (err) {
      Alert.alert('녹음 시작 오류', err.message);
    }
  };

  const stopRecording = async () => {
    if (!recording) return;
    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecordedURI(uri);
      setRecording(undefined);
      setIsRecording(false);
      await Audio.setAudioModeAsync({ allowsRecordingIOS: false });
    } catch (err) {
      Alert.alert('녹음 중지 오류', err.message);
    }
  };

  const handleRecordToggle = () => {
    if (isRecording) {
      stopRecording();
    } else {
      if (recordedURI || content.trim()) { // 기존 녹음 또는 텍스트가 있으면 경고
        Alert.alert(
          recordedURI ? "녹음 변경" : "새로 녹음",
          "기존 녹음 또는 작성된 텍스트 내용이 삭제됩니다. 새로 녹음하시겠습니까?",
          [
            { text: "취소", style: "cancel" },
            { text: "확인", onPress: startRecording } // startRecording에서 content와 recordedURI 초기화
          ]
        );
      } else {
        startRecording();
      }
    }
  };

  const handleDeleteRecording = () => {
    setRecordedURI(null);
    // setContent(''); // 음성 삭제 시 텍스트도 지울지 여부는 정책에 따라 결정
  };

  const convertVoiceToText = async (voiceUri) => {
    const formData = new FormData();
    const fileName = voiceUri.split('/').pop();
    const fileType = Platform.OS === 'ios' ? 'audio/m4a' : 'audio/m4a';

    formData.append('file', {
      uri: voiceUri,
      name: fileName,
      type: fileType,
    });

    try {
      console.log('--- 음성 변환 요청 ---');
      console.log('URL:', `${BASE_URL}/api/voice-to-text`);
      console.log('File Name:', fileName);
      console.log('File Type:', fileType);

      const response = await fetch(`${BASE_URL}/api/voice-to-text`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: formData,
      });

      if (!response.ok) {
        let errorMessage = '음성 변환 중 서버 오류가 발생했습니다.';
        try {
          const errorData = await response.json();
          errorMessage = errorData.text || errorData.message || `서버 응답: ${response.status}`;
        } catch (e) {
            errorMessage = `서버 응답: ${response.status}, 응답 본문 파싱 실패`;
        }
        console.error('음성 변환 서버 오류:', response.status, errorMessage);
        throw new Error(errorMessage);
      }

      const result = await response.json();
      if (result && typeof result.text === 'string') {
        console.log('음성 변환 결과:', result.text);
        return result.text;
      } else {
        console.error('음성 변환 결과 형식 오류:', result);
        throw new Error('음성 변환 후 서버로부터 유효한 텍스트를 받지 못했습니다.');
      }
    } catch (err) {
      console.error('convertVoiceToText 함수 내부 오류:', err);
      throw err;
    }
  };

  const handleTemporarySave = async (fromSubmit = false) => {
    let diaryContent = content.trim();
    let currentRecordedURI = recordedURI;

    if (!diaryContent && !currentRecordedURI) {
      Alert.alert('내용 없음', '텍스트 내용이나 음성 녹음이 필요합니다.');
      return;
    }
    if (currentRecordedURI && diaryContent) {
      Alert.alert('입력 오류', '음성 녹음과 텍스트 입력을 동시에 임시저장할 수 없습니다. 하나만 선택해주세요.');
      return;
    }

    let sttSucceededAndNavigates = false;

    if (currentRecordedURI && !diaryContent) {
      try {
        Alert.alert("음성 변환 중", "음성을 텍스트로 변환하고 있습니다. 잠시만 기다려주세요...");
        const convertedText = await convertVoiceToText(currentRecordedURI);
        diaryContent = convertedText;
        setContent(diaryContent);
        setRecordedURI(null);
        currentRecordedURI = null;
        sttSucceededAndNavigates = true;
      } catch (error) {
        Alert.alert('음성 변환 실패', error.message || '음성을 텍스트로 변환하는 중 오류가 발생했습니다. 텍스트로 직접 입력해주세요.');
        return;
      }
    }

    if (!diaryContent) {
      Alert.alert('내용 없음', '임시 저장할 내용이 없습니다.');
      return;
    }

    try {
      const requestBody = {
        writtenDate: selectedDate,
        content: diaryContent,
      };

      console.log('--- 일기 임시 저장 요청 (JSON) ---');
      console.log('URL:', `${BASE_URL}/api/diaries?temp=true`);
      console.log('Body:', JSON.stringify(requestBody));

      const res = await fetch(`${BASE_URL}/api/diaries?temp=true`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        console.error('임시 저장 서버 오류 응답:', errorData);
        throw new Error(`임시 저장 실패: ${res.status} - ${errorData.message || '내용 확인 불가'}`);
      }
      const resJson = await res.json();
      const { diaryId } = resJson;

      Alert.alert('임시 저장 완료!');
      if (fromSubmit || sttSucceededAndNavigates) {
        navigation.navigate('DiaryConfirm', { diaryId, accessToken, selectedDate });
      }
    } catch (err) {
      console.error('임시 저장 API 호출 오류:', err);
      Alert.alert('임시 저장 오류', err.message);
    }
  };

  const handleTemporarySaveAndGuide = async () => {
    await handleTemporarySave(true);
  };

  const handleSubmit = async () => {
    const currentContent = content.trim();
    const currentRecordedURI = recordedURI;

    if (!currentContent && !currentRecordedURI) {
      Alert.alert('내용 없음', '텍스트 내용을 입력하거나 음성으로 녹음해주세요.');
      return;
    }

    if (currentRecordedURI && currentContent) {
      Alert.alert('입력 오류', '음성 녹음과 텍스트 입력을 동시에 등록할 수 없습니다. 하나만 선택해주세요.');
      return;
    }

    if (currentRecordedURI && !currentContent) {
      Alert.alert(
        "음성 일기 등록 안내",
        "음성 일기는 텍스트로 변환된 후 '임시저장' 과정을 거쳐 최종 확인됩니다. 계속하시겠습니까?",
        [
          { text: "취소", style: "cancel" },
          { text: "확인 후 진행", onPress: handleTemporarySaveAndGuide }
        ]
      );
      return;
    }

    if (currentContent && !currentRecordedURI) {
      try {
        const requestBody = {
          writtenDate: selectedDate,
          content: currentContent,
        };

        console.log('--- 일기 등록 요청 (JSON) ---');
        console.log('URL:', `${BASE_URL}/api/diaries?temp=false`);
        console.log('Body:', JSON.stringify(requestBody));

        const response = await fetch(`${BASE_URL}/api/diaries?temp=false`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error('등록 서버 오류 응답:', errorData);
          throw new Error(`서버 오류: ${response.status} - ${errorData.message || '내용 확인 불가'}`);
        }

        const resJson = await response.json();
        const { diaryId } = resJson;

        Alert.alert('일기 등록 완료!');
        navigation.navigate('DiaryConfirm', { diaryId, accessToken, selectedDate });
      } catch (err) {
        console.error('등록 API 호출 오류:', err);
        Alert.alert('등록 오류', err.message);
      }
    }
  };

 return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle={Platform.OS === 'ios' ? 'dark-content' : 'default'} />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
      >
        <View style={styles.whiteBox}>
          <View style={styles.navRow}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text style={styles.backButton}>{'<'}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleSubmit}>
              <Text style={styles.submitText}>등록</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.metaInfoRow}>
            <View style={styles.metaTextGroup}>
              <Text style={styles.date}>
                {dayjs(selectedDate).format('YY.MM.DD')}
              </Text>
            </View>
          </View>
          <View style={styles.divider} />
          <ScrollView
            contentContainerStyle={{ flexGrow: 1, paddingBottom: 10 }}
            keyboardShouldPersistTaps="handled"
          >
            {isRecording ? (
              <View style={styles.recordingContainer}>
                <Image source={RecordingImage} style={styles.recordingImage} />
                <Text style={styles.recordingStatusText}>AI 음성변환</Text>
              </View>
            ) : recordedURI ? ( // STT 변환 후 recordedURI는 null이 되므로, 이 부분은 변환 전까지만 보임.
              <View style={styles.audioInfoContainer}>
                <View style={styles.audioInfo}>
                  <MaterialIcons name="graphic-eq" size={24} color="#3C5741" style={{ marginRight: 10 }} />
                  <Text style={styles.audioFileName} numberOfLines={1}>
                    {recordedURI.split('/').pop()}
                  </Text>
                  <TouchableOpacity onPress={handleDeleteRecording}>
                    <MaterialIcons name="delete" size={24} color="#D32F2F" />
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <TextInput
                style={[styles.diaryText, { marginBottom: 30 }]}
                multiline
                scrollEnabled={false} 
                placeholder="오늘은 무슨일이 있었어?"
                value={content} // STT 변환 결과가 여기에 반영됨
                onChangeText={setContent}
                editable={!isRecording} // 녹음 중에는 편집 불가
              />
            )}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>

      <View style={styles.bottomBarContainer}>
        <TouchableOpacity
          style={[
            styles.bottomBarButton,
            styles.voiceRecordButton,
            isRecording ? styles.voiceRecordButtonRecording : (recordedURI ? styles.voiceRecordButtonChange : null)
          ]}
          onPress={handleRecordToggle}
          // 텍스트가 있거나, 또는 녹음 중이 아닐 때만 음성녹음 버튼 활성화
          // STT 변환 후에는 recordedURI가 null이 되고 content가 채워지므로, 텍스트 있을 때 disable 조건이 적용됨.
          disabled={!!content.trim() && !isRecording && !recordedURI}
        >
          <MaterialIcons
            name={isRecording ? 'stop' : (recordedURI ? 'autorenew' : 'mic')}
            size={20}
            // 텍스트가 있고, 녹음중도 아니고, 녹음된 URI도 없으면 비활성화 색상
            color={ (content.trim() && !isRecording && !recordedURI) ? "#B0B0B0" : ((isRecording || recordedURI) ? "white" : "#3C5741") }
          />
          <Text style={[
              styles.bottomBarButtonText,
              styles.voiceRecordButtonText,
              (isRecording || recordedURI) && { color: "white" }, // 녹음 중 또는 녹음된 파일 있을 시 흰색 텍스트
              (content.trim() && !isRecording && !recordedURI) && { color: "#B0B0B0" } // 비활성화 시 회색 텍스트
            ]}
          >
            {isRecording ? '녹음 중지' : recordedURI ? '녹음 변경' : '음성으로 작성'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
            style={[styles.bottomBarButton, styles.tempSaveButton]}
            onPress={() => handleTemporarySave(false)}
            disabled={!content.trim() && !recordedURI} 
        >
          <Text style={[
              styles.bottomBarButtonText,
              styles.tempSaveButtonText,
              (!content.trim() && !recordedURI) && { color: "#B0B0B0"}
            ]}
          >
            임시저장
          </Text>
          <MaterialIcons name="chevron-right" size={24} color={(!content.trim() && !recordedURI) ? "#B0B0B0" : "#8A8A8A"} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const screenHeight = Dimensions.get('window').height;

const styles = StyleSheet.create({
  
  container: {
    flex: 1,
    backgroundColor: '#E6F0E7',
  },
  
  whiteBox: {
    flex: 1, // Takes available space within KeyboardAvoidingView
    backgroundColor: '#fff',
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
    marginTop: 70, // Consistent with DiaryModifyScreen
    paddingHorizontal: 20,
    paddingBottom: 40, 
    minHeight: screenHeight,
    paddingTop: 10, 
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 8,
  },

  navRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },

  backButton: {
    fontSize: 24,
    fontWeight: '600', // Changed to string for consistency, RN handles both number and string
    
  },

  submitText: {
    fontSize: 20,
    fontWeight: '450', // Changed to string, kept value. Consider '400' or '500' if 450 is problematic.
    color: '#3C5741',
    paddingHorizontal: 10,
    paddingVertical: 10, // Reduced from 25 for a more balanced look in this context
  },

  metaInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
  },

  metaTextGroup: {
    marginLeft: 12, // Original: 12. Or flex:1 if it should take full width
  },

  date: {
    fontSize: 28,
    fontWeight: '600', // Changed to string
  },

  divider: {
    height: 1,
    backgroundColor: '#C6C6C6',
    marginVertical: 15,
    marginHorizontal: 10,
  },

  diaryText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderWidth: 0,
    textAlignVertical: 'top',
    minHeight: 200, 
  },

  recordingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 200, // Match diaryText minHeight
    paddingVertical: 20,
  },
  recordingImage: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
  },
  recordingStatusText: {
    color: '#F44336', // Red text, consider matching app theme
    marginTop: 15,
    fontSize: 16,
    fontWeight: '500',
  },
  audioInfoContainer: {
    flex: 1,
    minHeight: 200, // Match diaryText minHeight
    justifyContent: 'center',
  },
  audioInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginVertical: 10,
  },
  audioFileName: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    marginHorizontal: 10,
  },

  bottomBarContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Platform.OS === 'ios' ? 15 : 10,
    paddingHorizontal: 20,
    backgroundColor: '#F7F7F7',
    borderTopWidth: 1,
    borderTopColor: '#DCDCDC',
    paddingBottom: Platform.OS === 'ios' ? 30 : 15, // For iOS home indicator
  },
  bottomBarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
  },
  bottomBarButtonText: {
    fontSize: 15,
    fontWeight: '500', // Kept as string
    marginLeft: 8,
  },
  voiceRecordButton: {
    backgroundColor: '#E8F0E9', // Default state
  },
  voiceRecordButtonRecording: {
    backgroundColor: '#D32F2F', // Red when recording
  },
  voiceRecordButtonChange: {
    backgroundColor: '#FFA000', // Amber/Orange when existing recording can be changed
  },
  voiceRecordButtonText: {
    color: '#3C5741', // Default text color
    // Dynamic color change (white for recording/change states) is handled inline or via specific state style
  },
  tempSaveButton: {
    backgroundColor: 'transparent', // No background color
  },
  tempSaveButtonText: {
    color: '#555555',
    marginRight: 2,
  },
});