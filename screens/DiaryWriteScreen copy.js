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

import { Image } from 'react-native';
import RecordingImage from '../assets/recode.PNG';

const { width } = Dimensions.get('window');

// Define M4A recording options
const RECORDING_OPTIONS_M4A = {
  isMeteringEnabled: true,
  android: {
    extension: '.m4a',
    outputFormat: Audio.AndroidOutputFormat.MPEG_4,
    audioEncoder: Audio.AndroidAudioEncoder.AAC,
    sampleRate: 44100,
    numberOfChannels: 1, // Mono for voice
    bitRate: 128000,
  },
  ios: {
    extension: '.m4a',
    outputFormat: Audio.IOSOutputFormat.MPEG4AAC, // kAudioFormatMPEG4AAC
    audioQuality: Audio.IOSAudioQuality.HIGH,
    sampleRate: 44100,
    numberOfChannels: 1, // Mono for voice
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
        console.log('Unloading recording on component unmount...');
        recording.stopAndUnloadAsync()
          .then(() => console.log('Recording unloaded successfully on unmount.'))
          .catch(err => console.error('Error unloading recording on unmount:', err));
      }
      // Reset audio mode when component unmounts
      Audio.setAudioModeAsync({ allowsRecordingIOS: false })
        .catch(err => console.error('Error setting audio mode on unmount:', err));
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
        playsInSilentModeIOS: true, // Optional: allows playback even in silent mode
      });

      console.log('Starting recording with M4A options...');
      const { recording: newRecording } = await Audio.Recording.createAsync(
        RECORDING_OPTIONS_M4A // Use M4A options here
      );

      setRecording(newRecording);
      setIsRecording(true);
      setRecordedURI(null); // Clear previous URI
      // setContent(''); // This line clears text input when recording starts. Keep if intentional.
      console.log('Recording started');
    } catch (err) {
      console.error('Failed to start recording', err);
      Alert.alert("Recording Error", `Could not start recording: ${err.message || err}`);
    }
  }

  async function stopRecording() {
    setIsRecording(false);
    if (!recording) {
      console.log('No recording to stop.');
      return;
    }

    console.log('Stopping recording...');
    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      console.log('Recording stopped and stored at', uri);
      setRecordedURI(uri);
      await Audio.setAudioModeAsync({ allowsRecordingIOS: false });
    } catch (error) {
      console.error('Failed to stop recording', error);
      Alert.alert("Recording Error", `Could not stop recording: ${error.message || error}`);
    }

    setRecording(undefined); // Clear the recording object
  }

  const handleRecordButtonPress = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };
  

  const handleSubmit = async () => {
    if (!recordedURI && !content.trim()) { // Added trim() for content check
      Alert.alert("내용 없음", "작성된 내용이나 음성이 없습니다.");
      return;
    }

    try {
      // Replace with your actual token retrieval logic
      const accessToken = "your_actual_token_here"; 
      const selectedDate = dayjs().format("YYYY-MM-DD");

      const formData = new FormData();
      formData.append('writtenDate', selectedDate);
      if (content.trim()) {
        formData.append('content', content.trim());
      }
      if (recordedURI) {
        const uriParts = recordedURI.split('/');
        const fileName = uriParts[uriParts.length - 1];
        formData.append('voiceFile', {
          uri: recordedURI,
          name: fileName, // Should now have .m4a extension
          type: 'audio/m4a', // Correct MIME type for M4A
        });
        console.log('Appending voice file to FormData:', fileName, recordedURI);
      }

      console.log('Submitting diary with formData:', formData);

      const res = await fetch('http://ceprj.gachon.ac.kr:60021/api/diaries', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          // 'Content-Type': 'multipart/form-data' // This header is set automatically by fetch for FormData
        },
        body: formData,
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error('Server error response:', errorText);
        throw new Error(`일기 등록 실패 (Status: ${res.status})`);
      }

      const data = await res.json();
      const { diaryId } = data;
      console.log('Diary registered successfully, ID:', diaryId);

      Alert.alert('등록 완료', '일기가 성공적으로 등록되었습니다.'); // Added success alert
      navigation.navigate('DiaryConfirm', {
        diaryId,
        accessToken,
      });
    } catch (err) {
      console.error('❌ 등록 실패:', err.message || err);
      Alert.alert('등록 실패', `일기 등록 중 오류가 발생했습니다: ${err.message || '알 수 없는 오류'}`);
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
          keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0} // Adjust if header height changes
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
                  editable={!isRecording && !recordedURI} // Disable editing if recording or if audio is recorded (optional UX choice)
                  textAlignVertical="top"
                  autoFocus
                />
              )}
            </ScrollView>

            {recordedURI && !isRecording && (
              <View style={styles.playbackContainer}>
                <Text style={styles.playbackText}>녹음 완료: {recordedURI.split('/').pop()}</Text>
                {/* You might want to add a button to clear the recording here */}
                <TouchableOpacity onPress={() => {
                  setRecordedURI(null);
                  // Optionally re-enable text input if it was disabled
                  // setContent(''); // Optionally clear text too
                }}>
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
          disabled={!!recordedURI && !isRecording} // Disable new recording if one exists and not currently recording
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

// Styles remain the same, ensure they match your requirements.
// Only significant change was 'audio/x-wav' to 'audio/m4a' for FormData type.
// And the recording options constant.

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#EEF5EF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 10 : 30, // Adjusted for Android StatusBar
    paddingBottom: 15,
    paddingHorizontal: 20,
    backgroundColor: '#EEF5EF',
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
    backgroundColor: '#FFFFFF', // Changed for better contrast with input/recording area
    borderTopLeftRadius: 30, // Softened radius
    borderTopRightRadius: 30,
    overflow: 'hidden', // Important for border radius
    // paddingTop: 20, // Removed, padding is in keyboardAvoiding
  },
  keyboardAvoiding: {
    flex: 1,
    // paddingHorizontal: 20, // Moved to scrollContainer or input for more control
  },
  mainScrollableContent: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 30, // Space for content if it scrolls
    paddingHorizontal: 20, // Added padding here
    paddingTop: 20, // Added padding here
  },
  input: {
    fontSize: 17,
    color: '#333',
    lineHeight: 24,
    // padding: 20, // Padding now on scrollContainer or specific to input if needed
    backgroundColor: '#FFFFFF',
    textAlignVertical: 'top',
    flexGrow: 1, // Make input take available space
    minHeight: Dimensions.get('window').height * 0.5, // Ensure a minimum height
  },
  recordingIndicatorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20, // Add padding
    minHeight: Dimensions.get('window').height * 0.5, // Ensure a minimum height
  },
  recordingIconBackground: {
    backgroundColor: '#A0A0A0', // Or a theme color like '#4CAF50' with opacity
    width: Math.min(width * 0.5, 200), // Responsive size
    height: Math.min(width * 0.5, 200),
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  recordingText: {
    fontSize: 16,
    color: '#555555',
    marginTop: 5,
    fontWeight: 'bold',
  },
  playbackContainer: {
    flexDirection: 'row', // Align text and delete icon
    justifyContent: 'space-between', // Space them out
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
    backgroundColor: '#f0f0f0', // Lighter grey
    borderRadius: 8,
    marginHorizontal: 20, // Consistent with other padding
    marginTop: 10,
    marginBottom: 10, // Added margin bottom
  },
  playbackText: {
    fontSize: 14, // Slightly larger
    color: '#333',
    flex: 1, // Allow text to take space and wrap if needed
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