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
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import dayjs from 'dayjs';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { Audio } from 'expo-av';

import RecordingImage from '../assets/recode.png'; // 이미지 import

const { width } = Dimensions.get('window');

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
  const [content, setContent] = useState('');
  const today = dayjs().format('YY.MM.DD');

  const [recording, setRecording] = useState(undefined);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedURI, setRecordedURI] = useState(null);
  const [_permissionResponse, requestPermission] = Audio.usePermissions();

  useEffect(() => {
    return () => {
      if (recording) {
        recording.stopAndUnloadAsync().catch(err => console.error('Error on unmount:', err));
      }
      Audio.setAudioModeAsync({ allowsRecordingIOS: false }).catch(err => console.error(err));
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

      const { recording: newRecording } = await Audio.Recording.createAsync(RECORDING_OPTIONS_M4A);
      setRecording(newRecording);
      setIsRecording(true);
      setRecordedURI(null);
    } catch (err) {
      console.error('Failed to start recording', err);
      Alert.alert("Recording Error", err.message || err);
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
      console.error('Failed to stop recording', error);
      Alert.alert("Recording Error", error.message || error);
    }

    setRecording(undefined);
  }

  const handleRecordButtonPress = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const handleSubmit = async () => {
    if (!recordedURI && !content.trim()) {
      Alert.alert("내용 없음", "작성된 내용이나 음성이 없습니다.");
      return;
    }

    try {
      const accessToken = "your_actual_token_here";
      const selectedDate = dayjs().format("YYYY-MM-DD");

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
          type: 'audio/m4a',
        });
      }

      const res = await fetch('http://ceprj.gachon.ac.kr:60021/api/diaries', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: formData,
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`일기 등록 실패 (Status: ${res.status})`);
      }

      const data = await res.json();
      const { diaryId } = data;

      Alert.alert('등록 완료', '일기가 성공적으로 등록되었습니다.');
      navigation.navigate('DiaryConfirm', { diaryId, accessToken });
    } catch (err) {
      console.error('등록 실패:', err.message || err);
      Alert.alert('등록 실패', err.message || '알 수 없는 오류');
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
                  <Image source={RecordingImage} style={styles.recordingImage} resizeMode="contain" />
                </View>
              ) : (
                <TextInput
                  style={styles.input}
                  multiline
                  placeholder="오늘은 무슨 일이 있었어?"
                  placeholderTextColor="#B0B0B0"
                  value={content}
                  onChangeText={setContent}
                  editable={!isRecording && !recordedURI}
                  textAlignVertical="top"
                  autoFocus
                />
              )}
            </ScrollView>

            {recordedURI && !isRecording && (
              <View style={styles.playbackContainer}>
                <Text style={styles.playbackText}>녹음 완료: {recordedURI.split('/').pop()}</Text>
                <TouchableOpacity onPress={() => setRecordedURI(null)}>
                  <MaterialIcons name="delete" size={24} color="#F44336" style={{ marginLeft: 10 }} />
                </TouchableOpacity>
              </View>
            )}
          </View>
        </KeyboardAvoidingView>
      </View>

      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.voiceButton, isRecording && styles.voiceButtonRecording]}
          onPress={handleRecordButtonPress}
          disabled={!!recordedURI && !isRecording}
        >
          <MaterialIcons name={isRecording ? "stop-circle" : "mic"} size={20} color={isRecording ? "#FFFFFF" : "#4CAF50"} />
          <Text style={[styles.voiceButtonText, isRecording && styles.voiceButtonTextRecording]}>
            {isRecording ? '녹음 중지' : (recordedURI ? '녹음 변경' : '편하게 음성작성')}
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
  safeArea: { flex: 1, backgroundColor: '#EEF5EF' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 10 : 30,
    paddingBottom: 15,
    paddingHorizontal: 20,
    backgroundColor: '#EEF5EF',
  },
  headerButton: { padding: 8 },
  date: { fontSize: 24, fontWeight: 'bold', color: '#222' },
  submitTextHeader: { fontSize: 16, color: '#4CAF50', fontWeight: 'bold' },
  contentWrapper: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    overflow: 'hidden',
  },
  keyboardAvoiding: { flex: 1 },
  mainScrollableContent: { flex: 1 },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 30,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  input: {
    fontSize: 17,
    color: '#333',
    lineHeight: 24,
    backgroundColor: '#FFFFFF',
    textAlignVertical: 'top',
    flexGrow: 1,
    minHeight: Dimensions.get('window').height * 0.5,
  },
  recordingIndicatorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    minHeight: Dimensions.get('window').height * 0.5,
  },
  recordingImage: {
    width: width * 0.6,
    height: width * 0.6,
  },
  playbackContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    marginHorizontal: 20,
    marginTop: 10,
    marginBottom: 10,
  },
  playbackText: {
    fontSize: 14,
    color: '#333',
    flex: 1,
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
