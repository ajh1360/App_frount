import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  SafeAreaView,
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  StatusBar,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import dayjs from 'dayjs';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { Audio } from 'expo-av';

const { width } = Dimensions.get('window');

export default function DiaryWriteScreen() {
  const navigation = useNavigation();
  const [content, setContent] = useState('');
  const today = dayjs().format('YY.MM.DD');

  const [recording, setRecording] = useState(undefined);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedURI, setRecordedURI] = useState(null);
  const [_permissionResponse, requestPermission] = Audio.usePermissions();

  useEffect(() => {
    return () => {
      if (recording) {
        recording.stopAndUnloadAsync().catch(() => {});
        Audio.setAudioModeAsync({ allowsRecordingIOS: false }).catch(() => {});
      }
    };
  }, [recording]);

  async function startRecording() {
    try {
      let currentPermissions = await Audio.getPermissionsAsync();
      if (currentPermissions.status !== 'granted') {
        const permission = await requestPermission();
        if (permission.status !== 'granted') {
          Alert.alert("Permission Denied", "Microphone permission is required to record audio.");
          return;
        }
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording: newRecording } = await Audio.Recording.createAsync({
        isMeteringEnabled: true,
      });

      setRecording(newRecording);
      setIsRecording(true);
      setRecordedURI(null);
      setContent('');
    } catch (err) {
      Alert.alert("Recording Error", `Could not start recording: ${err.message || err}`);
    }
  }

  async function stopRecording() {
    setIsRecording(false);
    if (!recording) return;

    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecordedURI(uri);
      await Audio.setAudioModeAsync({ allowsRecordingIOS: false });
    } catch (error) {
      Alert.alert("Recording Error", `Could not stop recording: ${error.message || error}`);
    }

    setRecording(undefined);
  }

  const handleRecordButtonPress = () => {
    if (isRecording) stopRecording();
    else startRecording();
  };

  const handleSubmit = async () => {
    if (!recordedURI && !content) {
      Alert.alert("내용 없음", "작성된 내용이나 음성이 없습니다.");
      return;
    }

    try {
      const accessToken = "your_actual_token_here"; // 실제 로그인 후 받은 토큰
      const selectedDate = dayjs().format("YYYY-MM-DD"); // 오늘 날짜 형식으로

      const formData = new FormData();
      formData.append('writtenDate', selectedDate);
      if (content) formData.append('content', content);
      if (recordedURI) {
        const uriParts = recordedURI.split('/');
        const fileName = uriParts[uriParts.length - 1];
        formData.append('voiceFile', {
          uri: recordedURI,
          name: fileName,
          type: 'audio/x-wav',
        });
      }

      const res = await fetch('http://ceprj.gachon.ac.kr:60021/api/diaries', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      });

      if (!res.ok) throw new Error('일기 등록 실패');

      const data = await res.json();
      const { diaryId } = data;

      navigation.navigate('DiaryConfirm', {
        diaryId,
        accessToken,
      });
    } catch (err) {
      console.error('❌ 등록 실패:', err.message);
      Alert.alert('등록 실패', '일기 등록 중 오류가 발생했습니다.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
          <Ionicons name="chevron-back" size={28} color="#333" />
        </TouchableOpacity>
        <Text style={styles.date}>{today}</Text>
        <TouchableOpacity onPress={handleSubmit} style={styles.headerButton}>
          <Text style={styles.submitTextHeader}>등록</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.contentWrapper}>
        <KeyboardAvoidingView
          style={styles.keyboardAvoiding}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
        >
          <View style={styles.mainScrollableContent}>
            <ScrollView
              contentContainerStyle={styles.scrollContainer}
              keyboardShouldPersistTaps="handled"
            >
              {isRecording ? (
                <View style={styles.recordingIndicatorContainer}>
                  <View style={styles.recordingIconBackground}>
                    <MaterialIcons name="mic" size={width * 0.25} color="#FFFFFF" />
                  </View>
                  <Text style={styles.recordingText}>녹음중...</Text>
                </View>
              ) : (
                <TextInput
                  style={styles.input}
                  multiline
                  placeholder="오늘은 무슨 일이 있었어?"
                  placeholderTextColor="#B0B0B0"
                  value={content}
                  onChangeText={setContent}
                  editable={!isRecording}
                  textAlignVertical="top"
                  autoFocus
                />
              )}
            </ScrollView>

            {recordedURI && !isRecording && (
              <View style={styles.playbackContainer}>
                <Text style={styles.playbackText}>녹음 완료: {recordedURI.split('/').pop()}</Text>
              </View>
            )}
          </View>
        </KeyboardAvoidingView>
      </View>

      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.voiceButton, isRecording && styles.voiceButtonRecording]}
          onPress={handleRecordButtonPress}
        >
          <MaterialIcons name={isRecording ? "stop-circle" : "mic"} size={20} color={isRecording ? "#FFFFFF" : "#4CAF50"} />
          <Text style={[styles.voiceButtonText, isRecording && styles.voiceButtonTextRecording]}>
            {isRecording ? '녹음 중지' : '편하게 음성작성'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tempSaveButton}>
          <Text style={styles.tempSaveButtonText}>임시저장</Text>
          <MaterialIcons name="folder-open" size={20} color="#757575" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F0F7F3',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 30,
    paddingBottom: 15,
    paddingHorizontal: 20,
    backgroundColor: '#F0F7F3',
  },
  headerButton: {
    padding: 8,
  },
  date: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#222',
  },
  submitTextHeader: {
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  contentWrapper: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 45,
    borderTopRightRadius: 45,
    overflow: 'hidden',
    paddingTop: 20,
  },
  keyboardAvoiding: {
    flex: 1,
    paddingHorizontal: 20,
  },
  mainScrollableContent: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 30,
  },
  input: {
    fontSize: 17,
    color: '#333',
    lineHeight: 24,
    padding: 20,
    backgroundColor: '#FFFFFF',
    textAlignVertical: 'top',
    flexGrow: 1,
  },
  recordingIndicatorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordingIconBackground: {
    backgroundColor: '#A0A0A0',
    width: 200,
    height: 200,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  recordingText: {
    fontSize: 16,
    color: '#555555',
    marginTop: 5,
  },
  playbackContainer: {
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    borderRadius: 5,
    marginTop: 10,
    marginBottom: 5,
  },
  playbackText: {
    fontSize: 13,
    color: '#333',
  },
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: Platform.OS === 'ios' ? 35 : 15,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    backgroundColor: '#F9F9F9',
  },
  voiceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 25,
  },
  voiceButtonRecording: {
    backgroundColor: '#F44336',
  },
  voiceButtonText: {
    marginLeft: 8,
    fontSize: 15,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  voiceButtonTextRecording: {
    color: '#FFFFFF',
  },
  tempSaveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  tempSaveButtonText: {
    marginRight: 5,
    fontSize: 15,
    color: '#757575',
  },
});
