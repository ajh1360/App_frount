import React, { useState, useEffect, useCallback } from 'react';
import {
  SafeAreaView,View,Text,TextInput,TouchableOpacity,Alert,ScrollView,Image,Platform,StatusBar,Dimensions,KeyboardAvoidingView,StyleSheet, ActivityIndicator,
  Modal 
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import dayjs from 'dayjs';

import RecordingImage from '../assets/recode.png';
import HamsterLoadingCharImage from '../assets/hamster_loading_char.png'; 

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
  const { selectedDate, accessToken, tempDiaryId: initialTempDiaryId } = route.params;

  const [content, setContent] = useState('');
  const [recording, setRecording] = useState();
  const [isRecording, setIsRecording] = useState(false);
  const [recordedURI, setRecordedURI] = useState(null);
  const [isLoadingDiary, setIsLoadingDiary] = useState(false);
  const [currentDiaryId, setCurrentDiaryId] = useState(initialTempDiaryId || null);
  const [isConvertingVoice, setIsConvertingVoice] = useState(false); 
  const [displayFileName, setDisplayFileName] = useState('');


  const [registrationCompleteModalVisible, setRegistrationCompleteModalVisible] = useState(false);
  const [confirmNavParams, setConfirmNavParams] = useState(null); 

  const BASE_URL = 'http://ceprj.gachon.ac.kr:60021';

  const loadTemporaryDiary = useCallback(async (diaryId) => {
    if (!diaryId) return;
    setIsLoadingDiary(true);
    try {
      console.log(`--- 임시 저장된 일기 불러오기 요청 (ID: ${diaryId}) ---`);
      const response = await fetch(`${BASE_URL}/api/diaries/${diaryId}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`임시 저장된 일기 불러오기 실패: ${response.status} - ${errorData.message || '내용 확인 불가'}`);
      }
      const diary = await response.json();
      if (diary && typeof diary.content === 'string') {
        setContent(diary.content);
        setRecordedURI(null); 
      } else {
        const fallbackContent = diary?.transformContent || diary?.summary || '';
        setContent(fallbackContent);
        if (fallbackContent) {
             Alert.alert("알림", "임시 저장된 원본 내용을 찾을 수 없어 요약/변환된 내용으로 대체합니다.");
        } else {
            Alert.alert('오류', '임시 저장된 일기 내용을 불러올 수 없습니다.');
        }
      }
    } catch (err) {
      console.error('임시 저장된 일기 로드 오류:', err);
      Alert.alert('로드 오류', err.message);
    } finally {
      setIsLoadingDiary(false);
    }
  }, [accessToken]);

  useEffect(() => {
    if (initialTempDiaryId) {
      loadTemporaryDiary(initialTempDiaryId);
    }
  }, [initialTempDiaryId, loadTemporaryDiary]);

  useEffect(() => {
    return () => {
      if (recording) {
        if (recording._finalDurationMillis == null) {
          recording.stopAndUnloadAsync().catch(err =>
            console.error("Error stopping/unloading recording:", err)
          );
        }
      }
      Audio.setAudioModeAsync({ allowsRecordingIOS: false }).catch(err =>
        console.error("Error resetting audio mode:", err)
      );
    };
  }, [recording]);

  const startRecording = async () => {
    if (isConvertingVoice) {
      Alert.alert("알림", "음성 변환 중에는 녹음을 시작할 수 없습니다.");
      return;
    }
    try {
      const permission = await Audio.requestPermissionsAsync(); 
      if (permission.status !== 'granted') {
        Alert.alert('권한 거부됨', '마이크 권한이 필요합니다.');
        return;
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
      setDisplayFileName("내 소중한 기록.m4a");
      setRecording(undefined);
      setIsRecording(false);
      await Audio.setAudioModeAsync({ allowsRecordingIOS: false });
    } catch (err) {
      Alert.alert('녹음 중지 오류', err.message);
    }
  };

  const handleRecordToggle = () => {
    if (isConvertingVoice) {
        Alert.alert("알림", "음성 변환 중입니다. 잠시 후 시도해주세요.");
        return;
    }
    if (isRecording) {
      stopRecording();
    } else {
      if (recordedURI || content.trim()) { 
        Alert.alert(
          recordedURI ? "녹음 변경" : "새로 녹음",
          "기존 녹음 또는 작성된 텍스트 내용이 삭제됩니다. 새로 녹음하시겠습니까?",
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
    if (isConvertingVoice) {
        Alert.alert("알림", "음성 변환 중에는 삭제할 수 없습니다.");
        return;
    }
    setRecordedURI(null);
    setDisplayFileName('');
  };

  const convertVoiceToText = async (voiceUri) => {
    const formData = new FormData();
    const fileName = `recording-${Date.now()}.m4a`;
    const fileType = 'audio/m4a'; 
    
    if (!voiceUri || typeof voiceUri !== 'string' || !voiceUri.startsWith('file://')) {
      console.error('Invalid or unexpected voiceUri format!');
      Alert.alert('오류', '음성 파일 경로가 올바르지 않습니다.');
      throw new Error('Invalid voice URI');
    }

    formData.append('file', {
      uri: voiceUri,
      name: fileName,
      type: fileType,
    });

    try {
      console.log('--- 음성 변환 요청 ---');
      const response = await fetch(`${BASE_URL}/api/voice-to-text`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => '오류 메시지 파싱 실패');
        console.error('음성 변환 API 오류 응답:', response.status, errorText);
        throw new Error(`음성 변환 서버 오류: ${response.status} - ${errorText || '내용 확인 불가'}`);
      }

      const result = await response.json();
      if (result && typeof result.text === 'string') {
        return result.text;
      } else {
        console.error('음성 변환 후 유효하지 않은 텍스트:', result);
        throw new Error('음성 변환 후 서버로부터 유효한 텍스트를 받지 못했습니다.');
      }
    } catch (err) {
      console.error('convertVoiceToText 함수 내에서 오류 발생:', err);
      throw err; 
    }
  };
  
  const handleConvertAndSetText = async () => {
    if (!recordedURI) {
      Alert.alert("오류", "변환할 음성 파일이 없습니다.");
      return;
    }
    if (isConvertingVoice) return;

    setIsConvertingVoice(true);
    try {
      const convertedText = await convertVoiceToText(recordedURI);
      setContent(convertedText);
      setRecordedURI(null); 
      setDisplayFileName('');
    
    } catch (error) {
      console.error('handleConvertAndSetText 오류:', error);
      Alert.alert('변환 실패', error.message || '음성을 텍스트로 변환하는 중 오류가 발생했습니다.');
    } finally {
      setIsConvertingVoice(false);
    }
  };

  const handleTemporarySave = async (fromSubmit = false) => {
    if (isConvertingVoice) {
      return { success: false };
    }
    
    let diaryContent = content.trim();
    let voiceToConvertUri = recordedURI; 

    if (!diaryContent && !voiceToConvertUri) {
      Alert.alert('내용 없음', '텍스트 내용이나 음성 녹음이 필요합니다.');
      return { success: false };
    }
    if (voiceToConvertUri && diaryContent) {
      Alert.alert('입력 오류', '음성 녹음과 텍스트 입력을 동시에 임시저장할 수 없습니다. 하나만 선택해주세요.');
      return { success: false };
    }
    
    let sttPerformedAndNavigates = false;

    if (voiceToConvertUri && !diaryContent) {
      setIsConvertingVoice(true);
      try {
        const convertedText = await convertVoiceToText(voiceToConvertUri);
        diaryContent = convertedText;
        setContent(diaryContent); 
        setRecordedURI(null);    
        setDisplayFileName('');
        voiceToConvertUri = null; 
        if(fromSubmit) sttPerformedAndNavigates = true;
        else Alert.alert("음성 변환 완료", "음성이 텍스트로 변환되었습니다. 내용을 확인 후 다시 임시저장 또는 등록해주세요.");
        
        if (!fromSubmit) {
            return { success: true, sttJustCompleted: true };
        }
      } catch (error) {
        Alert.alert('음성 변환 실패', error.message || '음성을 텍스트로 변환하는 중 오류가 발생했습니다. 텍스트로 직접 입력해주세요.');
        if (fromSubmit) setIsConvertingVoice(false);
        return { success: false };
      } 
    }

    if (!diaryContent) {
      Alert.alert('내용 없음', '임시 저장할 내용이 없습니다.');
      if(isConvertingVoice) setIsConvertingVoice(false);
      return { success: false };
    }
    
    try {
      const requestBody = {
        writtenDate: selectedDate,
        content: diaryContent,
      };
      const res = await fetch(`${BASE_URL}/api/diaries?temp=true`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(`임시 저장 실패: ${res.status} - ${errorData.message || '내용 확인 불가'}`);
      }
      const resJson = await res.json();
      const { diaryId } = resJson;
      setCurrentDiaryId(diaryId); 

      if (fromSubmit || sttPerformedAndNavigates) {
        navigation.navigate('DiaryConfirm', { diaryId, accessToken, selectedDate });
      } else {
        Alert.alert('임시 저장 완료!', '작성 중인 내용이 임시 저장되었습니다.');
      }
      navigation.setParams({ diaryUpdated: true, updatedDate: selectedDate });
      return { success: true, diaryId };

    } catch (err) {
      console.error('임시 저장 API 호출 오류:', err);
      Alert.alert('임시 저장 오류', err.message);
      return { success: false };
    } finally {
        if(isConvertingVoice) setIsConvertingVoice(false);
    }
  };

  const handleTemporarySaveAndGuide = async () => {
    await handleTemporarySave(true);
  };

  const handleSubmit = async () => {
    if (isConvertingVoice) {
      return;
    }

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
          { 
            text: "확인 후 진행", 
            onPress: () => {
              handleTemporarySaveAndGuide(); 
            }
          }
        ]
      );
      return;
    }

    if (currentContent && !currentRecordedURI) {
      try {
        const requestBody = {
          writtenDate: dayjs(selectedDate).format('YYYY-MM-DD'),
          content: currentContent,
        };

        if (!currentContent || currentContent.length < 5) {
          Alert.alert("내용 부족", "일기 내용이 너무 짧거나 비어있습니다.");
          return;
        }
        console.log('--- 일기 등록 요청 (JSON) ---');
        console.log('요청 바디:', JSON.stringify(requestBody));
        const response = await fetch(`${BASE_URL}/api/diaries?temp=false`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(`서버 오류: ${response.status} - ${errorData.message || '내용 확인 불가'}`);
        }
        const resJson = await response.json();
        const { diaryId } = resJson;
        
    
        setConfirmNavParams({ diaryId, accessToken, selectedDate });
        setRegistrationCompleteModalVisible(true);


      } catch (err) {
        console.error('등록 API 호출 오류:', err);
        Alert.alert('등록 오류', err.message);
      }
    }
  };

 return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle={Platform.OS === 'ios' ? 'dark-content' : 'default'} />

      {/* --- 음성 변환 중 모달 --- */}
      <Modal
        transparent={true}
        animationType="fade"
        visible={isConvertingVoice}
        onRequestClose={() => {
          Alert.alert("알림", "음성 변환이 진행 중입니다. 잠시만 기다려주세요.");
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContentView}>
            <View style={styles.modalHeader}>
              <Image source={HamsterLoadingCharImage} style={styles.modalHamsterImage} />
              <Text style={styles.modalTitleText}>잠시만요!</Text>
            </View>
            <Text style={styles.modalMessageText}>햄식이가 음성을 글로 바꾸고 있어요.</Text>
            <ActivityIndicator size="large" color="#3C5741" style={styles.modalActivityIndicator} />
          </View>
        </View>
      </Modal>

      {/* --- 일기 등록 완료 모달 --- */}
      <Modal
        transparent={true}
        animationType="fade"
        visible={registrationCompleteModalVisible}
        onRequestClose={() => {
          setRegistrationCompleteModalVisible(false);
          if (confirmNavParams) {
            navigation.navigate('DiaryConfirm', confirmNavParams);
            setConfirmNavParams(null); 
          }
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContentView}>
            <View style={styles.modalHeader}>
              <Image source={HamsterLoadingCharImage} style={styles.modalHamsterImage} />
              <Text style={styles.modalTitleText}>등록 완료!</Text>
            </View>
            <Text style={styles.modalMessageText}>
              {"햄식이가 오늘의 일기를\n안전하게 보관했어요. 슝!"}
            </Text>
            <TouchableOpacity
              style={styles.modalConfirmButton}
              onPress={() => {
                setRegistrationCompleteModalVisible(false);
                if (confirmNavParams) {
                  navigation.navigate('DiaryConfirm', confirmNavParams);
                  setConfirmNavParams(null); 
                }
              }}
            >
              <Text style={styles.modalConfirmButtonText}>확인</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
      >
        <View style={styles.whiteBox}>
          <View style={styles.navRow}>
            <TouchableOpacity onPress={() => navigation.goBack()} disabled={isConvertingVoice || registrationCompleteModalVisible}>
              <Text style={styles.backButton}>{'<'}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleSubmit} disabled={isConvertingVoice || isLoadingDiary || registrationCompleteModalVisible}>
              <Text style={[styles.submitText, (isConvertingVoice || isLoadingDiary || registrationCompleteModalVisible) && styles.disabledText]}>등록</Text>
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
          {isLoadingDiary ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#3C5741" />
              <Text style={styles.loadingText}>일기를 불러오는 중...</Text>
            </View>
          ) : (
            <ScrollView
              contentContainerStyle={{ flexGrow: 1, paddingBottom: 10 }}
              keyboardShouldPersistTaps="handled"
            >
              {isRecording ? (
                <View style={styles.recordingContainer}>
                  <Image source={RecordingImage} style={styles.recordingImage} />
                  <Text style={styles.recordingStatusText}>AI 음성변환</Text>
                </View>
              ) : recordedURI ? ( 
                <View style={styles.audioPlaybackContainer}>
                  <View style={styles.audioInfo}>
                    <MaterialIcons name="graphic-eq" size={24} color="#3C5741" style={{ marginRight: 10 }} />
                    <Text style={styles.audioFileName} numberOfLines={1}>
                      {displayFileName || "녹음된 파일"}
                    </Text>
                    <TouchableOpacity onPress={handleDeleteRecording} disabled={isConvertingVoice || registrationCompleteModalVisible}>
                      <MaterialIcons name="delete" size={24} color={(isConvertingVoice || registrationCompleteModalVisible) ? "#B0B0B0" : "#D32F2F"} />
                    </TouchableOpacity>
                  </View>
                  <TouchableOpacity
                    onPress={handleConvertAndSetText}
                    style={[
                        styles.convertToTextButton, 
                        (isConvertingVoice || registrationCompleteModalVisible) && styles.disabledButtonBackground
                    ]}
                    disabled={isConvertingVoice || registrationCompleteModalVisible}
                  >
                    <MaterialIcons name="transform" size={20} color="white" style={{ marginRight: 8 }} />
                    <Text style={styles.convertToTextButtonText}>
                      {'햄식이가 바꿔줘요'}
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TextInput
                  style={[styles.diaryText, { marginBottom: 30 }]}
                  multiline
                  scrollEnabled={false} 
                  placeholder="오늘은 무슨일이 있었어?"
                  value={content} 
                  onChangeText={setContent}
                  editable={!isRecording && !isConvertingVoice && !isLoadingDiary && !registrationCompleteModalVisible}
                />
              )}
            </ScrollView>
          )}
        </View>
      </KeyboardAvoidingView>

      <View style={styles.bottomBarContainer}>
        <TouchableOpacity
          style={[
            styles.bottomBarButton,
            styles.voiceRecordButton,
            isRecording ? styles.voiceRecordButtonRecording : (recordedURI ? styles.voiceRecordButtonChange : null),
            (isConvertingVoice || (!!content.trim() && !isRecording && !recordedURI) || isLoadingDiary || registrationCompleteModalVisible) && styles.disabledButtonBackground
          ]}
          onPress={handleRecordToggle}
          disabled={(!!content.trim() && !isRecording && !recordedURI) || isLoadingDiary || isConvertingVoice || registrationCompleteModalVisible}
        >
          <MaterialIcons
            name={isRecording ? 'stop' : (recordedURI ? 'autorenew' : 'mic')}
            size={20}
            color={
                (isConvertingVoice || (!!content.trim() && !isRecording && !recordedURI) || isLoadingDiary || registrationCompleteModalVisible)
                  ? "#FFFFFF" 
                  : ((isRecording || recordedURI)
                    ? "white"
                    : "#3C5741")
              }
          />
          <Text style={[
              styles.bottomBarButtonText,
              styles.voiceRecordButtonText,
              (isRecording || recordedURI) && { color: "white" }, 
              (isConvertingVoice || (!!content.trim() && !isRecording && !recordedURI) || isLoadingDiary || registrationCompleteModalVisible) && { color: "#FFFFFF" } 
            ]}
          >
            {isRecording ? '녹음 중지' : recordedURI ? '녹음 변경' : '햄식이가 들어줘요'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
            style={[
                styles.bottomBarButton, 
                styles.tempSaveButton,
                ((!content.trim() && !recordedURI) || isLoadingDiary || isRecording || isConvertingVoice || registrationCompleteModalVisible) && styles.disabledButtonLook
            ]}
            onPress={async () => {
                await handleTemporarySave(false);
            }}
            disabled={(!content.trim() && !recordedURI) || isLoadingDiary || isRecording || isConvertingVoice || registrationCompleteModalVisible } 
        >
          <Text style={[
              styles.bottomBarButtonText,
              styles.tempSaveButtonText,
              ((!content.trim() && !recordedURI) || isLoadingDiary || isRecording || isConvertingVoice || registrationCompleteModalVisible) && { color: "#B0B0B0"}
            ]}
          >
            임시저장
          </Text>
          <MaterialIcons name="chevron-right" size={24} color={((!content.trim() && !recordedURI) || isLoadingDiary || isRecording || isConvertingVoice || registrationCompleteModalVisible) ? "#B0B0B0" : "#8A8A8A"} />
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
    flex: 1, 
    backgroundColor: '#fff',
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
    marginTop: 70, 
    paddingHorizontal: 20,
    paddingBottom: 40, 
    minHeight: screenHeight * 0.8, 
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
    paddingTop: 10,
  },
  backButton: { 
    fontSize: 24,
    fontWeight: '600', 
    padding: 10,
  },
  submitText: { 
    fontSize: 20,
    fontWeight: 'bold',
    color: '#3C5741',
    paddingHorizontal: 10,
    paddingVertical: 10, 
  },
  disabledText: {
    color: '#B0B0B0',
  },
  metaInfoRow: { 
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
    paddingLeft: 10,
  },
  metaTextGroup: { 
  },
  date: { 
    fontSize: 28,
    fontWeight: '600', 
  },
  divider: { 
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 20,
    marginHorizontal: 10,
  },
  diaryText: { 
    fontSize: 16,
    lineHeight: 26,
    color: '#333',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderWidth: 0,
    textAlignVertical: 'top',
    minHeight: Dimensions.get('window').height * 0.3,
  },
  recordingContainer: { 
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: Dimensions.get('window').height * 0.3, 
    paddingVertical: 20,
  },
  recordingImage: { 
    width: 120,
    height: 120,
    resizeMode: 'contain',
  },
  recordingStatusText: { 
    color: '#3C5741',
    marginTop: 20,
    fontSize: 18,
    fontWeight: '500',
  },
  audioPlaybackContainer: {
    flex: 1,
    minHeight: Dimensions.get('window').height * 0.3, 
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  audioInfo: { 
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    paddingHorizontal: 15,
    backgroundColor: '#F7F7F7',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginVertical: 15,
    width: '95%',
    alignSelf: 'center',
  },
  audioFileName: { 
    flex: 1,
    fontSize: 15,
    color: '#333',
    marginHorizontal: 12,
  },
  convertToTextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3C5741', 
    paddingVertical: 14,
    paddingHorizontal: 25,
    borderRadius: 30,
    marginTop: 20,
    minWidth: '70%',
    alignSelf: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.22,
    shadowRadius: 3,
  },
  convertToTextButtonText: {
    color: 'white',
    fontSize: 17,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  disabledButtonBackground: {
    backgroundColor: '#B0B0B0',
  },
  disabledButtonLook: { 
  },
  bottomBarContainer: { 
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: Platform.OS === 'ios' ? 18 : 12,
    paddingHorizontal: 15,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingBottom: Platform.OS === 'ios' ? 34 : 18,
  },
  bottomBarButton: { 
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 25,
  },
  bottomBarButtonText: { 
    fontSize: 16,
    fontWeight: '500', 
    marginLeft: 10,
  },
  voiceRecordButton: { 
    backgroundColor: '#E8F0E9', 
  },
  voiceRecordButtonRecording: { 
    backgroundColor: '#D32F2F', 
  },
  voiceRecordButtonChange: { 
    backgroundColor: '#FFA000', 
  },
  voiceRecordButtonText: { 
    color: '#3C5741', 
  },
  tempSaveButton: { 
    backgroundColor: 'transparent', 
  },
  tempSaveButtonText: { 
    color: '#555555',
    marginRight: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: Dimensions.get('window').height * 0.3, 
  },
  loadingText: {
    marginTop: 15,
    fontSize: 17,
    color: '#3C5741',
  },


  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContentView: {
    width: '90%',
    maxWidth: 340,
    backgroundColor: 'white',
    borderRadius: 25,
    paddingVertical: 30,
    paddingHorizontal: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    alignSelf: 'flex-start', 
  },
  modalHamsterImage: {
    width: 55, 
    height: 55, 
    resizeMode: 'contain',
    marginRight: 12, 
  },
  modalTitleText: {
    fontSize: 22, 
    fontWeight: 'bold',
    color: '#333333',
  },
  modalMessageText: {
    fontSize: 17, 
    color: '#4F4F4F', 
    textAlign: 'center',
    lineHeight: 25, 
    marginBottom: 25, 
    paddingHorizontal: 5, 
  },
  modalActivityIndicator: { 
    marginTop: 10, 
  },

  modalConfirmButton: {
    backgroundColor: '#3C5741', 
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 20,
    marginTop: 10, 
    minWidth: 120, 
    alignItems: 'center',
  },
  modalConfirmButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  }
});
