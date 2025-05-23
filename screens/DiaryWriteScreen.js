import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  Image,
  Platform,
  StatusBar,
  Dimensions,
  KeyboardAvoidingView,
  StyleSheet,
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
      setContent('');
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
      if (recordedURI) {
        Alert.alert(
          "녹음 변경",
          "기존 녹음 내용이 삭제됩니다. 새로 녹음하시겠습니까?",
          [
            { text: "취소", style: "cancel" },
            { text: "확인", onPress: startRecording }
          ]
        );
      } else {
        startRecording();
      }
    }
  };

  const handleDeleteRecording = () => {
    setRecordedURI(null);
  };

  const BASE_URL = 'http://ceprj.gachon.ac.kr:60021';

  const handleSubmit = async () => {
  if (!content.trim()) {
    Alert.alert('내용 없음', '텍스트 내용을 입력해주세요.');
    return;
  }

  try {
    const response = await fetch(`${BASE_URL}/api/diaries?temp=false`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        writtenDate: selectedDate,
        content: content.trim(),
      }),
    });

    if (!response.ok) {
      throw new Error(`서버 오류: ${response.status}`);
    }

    const resJson = await response.json();
    const { diaryId } = resJson;

    Alert.alert('일기 등록 완료!');
    navigation.navigate('DiaryConfirm', { diaryId, accessToken });
  } catch (err) {
    Alert.alert('등록 오류', err.message);
  }
};


  const handleTemporarySave = async () => {
    if (!recordedURI && !content.trim()) {
      Alert.alert('내용 없음', '텍스트 내용이나 음성 녹음이 필요합니다.');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('writtenDate', selectedDate);
      if (content.trim()) {
        formData.append('content', content.trim());
      }
      if (recordedURI) {
        const fileName = recordedURI.split('/').pop();
        formData.append('voiceFile', {
          uri: recordedURI,
          name: fileName,
          type: Platform.OS === 'ios' ? 'audio/m4a' : 'audio/mp4',
        });
      }

      const res = await fetch(`${BASE_URL}/api/diaries?temp=true`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      });

      if (!res.ok) throw new Error(`임시 저장 실패: ${res.status}`);
      Alert.alert('임시 저장 완료!');
    } catch (err) {
      Alert.alert('임시 저장 오류', err.message);
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
          <View style={styles.navHeaderRow}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.navButton}>
              <Ionicons name="chevron-back" size={28} color="#333" />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleSubmit}>
              <Text style={styles.submitText}>등록</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.dateDisplay}>
            {dayjs(selectedDate).format('YY.MM.DD')}
          </Text>
          <View style={styles.divider} />

          <ScrollView
            contentContainerStyle={{ flexGrow: 1, paddingBottom: 10 }}
            keyboardShouldPersistTaps="handled"
          >
            {isRecording ? (
              <View style={styles.recordingContainer}>
                <Image source={RecordingImage} style={styles.recordingImage} />
                <Text style={styles.recordingStatusText}>편하게 음성작성</Text>
              </View>
            ) : recordedURI ? (
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
                style={styles.diaryTextInput}
                multiline
                placeholder="오늘은 무슨일이 있었어?"
                value={content}
                onChangeText={setContent}
                editable={!isRecording && !recordedURI}
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
        >
          <MaterialIcons
            name={isRecording ? 'stop' : (recordedURI ? 'autorenew' : 'mic')}
            size={20}
            color={isRecording || recordedURI ? "white" : "#3C5741"}
          />
          <Text style={[styles.bottomBarButtonText, styles.voiceRecordButtonText, (isRecording || recordedURI) && { color: "white" }]}>
            {isRecording ? '녹음 중지' : recordedURI ? '녹음 변경' : '음성으로 작성'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.bottomBarButton, styles.tempSaveButton]} onPress={handleTemporarySave}>
          <Text style={[styles.bottomBarButtonText, styles.tempSaveButtonText]}>임시저장</Text>
          <MaterialIcons name="chevron-right" size={24} color="#8A8A8A" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E6F0E7',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  navHeaderRow: {
    flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 10,
  },
  navButton: {
    padding: 5, // Increase touchable area
  },
  submitText: {
    fontSize: 17,
    fontWeight: '500',
    color: '#3C5741',
    padding: 5,
  },
  whiteBox: {
    flex: 1,
    backgroundColor: '#fff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: 70, // 상단 연초록 배경 보이z게
    marginHorizontal: 5,
    paddingHorizontal: 25,
    paddingTop: 20,
    paddingBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 8,
  },
  dateDisplay: {
    fontSize: 26, // Slightly larger for emphasis
    fontWeight: '600',
    color: '#333',
    marginBottom: 15, // Space before divider
    marginTop: 10,   // Space after top of whiteBox
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 15,
  },
  diaryTextInput: {
    flex: 1,
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
    textAlignVertical: 'top',
    minHeight: 200,
    marginTop: 10,
  },
  recordingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 200,
    paddingVertical: 20,
  },
  recordingImage: {
    width: 100, // Adjusted size
    height: 100,
    resizeMode: 'contain',
  },
  recordingStatusText: {
    color: '#F44336',
    marginTop: 15,
    fontSize: 16,
    fontWeight: '500',
  },
  audioInfoContainer: {
    flex: 1,
    minHeight: 200,
    justifyContent: 'center',
    marginTop: 10,
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
  },
  audioFileName: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    marginHorizontal: 10,
  },
  // --- Bottom Bar Styles ---
  bottomBarContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Platform.OS === 'ios' ? 20 : 15, // More padding for iOS home indicator
    paddingHorizontal: 20,
    backgroundColor: '#F7F7F7', // Light grey background for the bar
    borderTopWidth: 1,
    borderTopColor: '#DCDCDC',
    paddingBottom: Platform.OS === 'ios' ? 30 : 15, // Extra padding for iOS home indicator
  },
  bottomBarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20, // Pill shape
  },
  bottomBarButtonText: {
    fontSize: 15,
    fontWeight: '500',
    marginLeft: 8,
  },
  voiceRecordButton: {
    backgroundColor: '#E8F0E9', // Light greenish-grey, similar to 일기작성.png
  },
  voiceRecordButtonRecording: { // When "Stop" button
    backgroundColor: '#D32F2F', // Red for stop
  },
  voiceRecordButtonChange: { // When "녹음 변경" button
    backgroundColor: '#FFA000', // Amber for change
  },
  voiceRecordButtonText: {
    color: '#3C5741', // Dark green text
  },
  tempSaveButton: {
    backgroundColor: 'transparent', // No background for this button style
  },
  tempSaveButtonText: {
    color: '#555555', // Greyish text
    marginRight: 2,
  },
});