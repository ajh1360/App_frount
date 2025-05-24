// --- START OF FILE DiaryWriteScreen.js ---

import React, { useState, useEffect, useCallback } from 'react';
import {
  SafeAreaView,View,Text,TextInput,TouchableOpacity,Alert,ScrollView,Image,Platform,StatusBar,Dimensions,KeyboardAvoidingView,StyleSheet, ActivityIndicator
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import dayjs from 'dayjs';

import RecordingImage from '../assets/recode.png';

const RECORDING_OPTIONS_M4A = {
  // ... (기존 옵션 유지)
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
  const [isConvertingVoice, setIsConvertingVoice] = useState(false); // 음성 변환 로딩 상태 추가

  const BASE_URL = 'http://ceprj.gachon.ac.kr:60021';

  const loadTemporaryDiary = useCallback(async (diaryId) => {
    // ... (기존 로직 유지)
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
      // Expo AV 권한 요청 방식 수정
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
  };

  const convertVoiceToText = async (voiceUri) => {
    const formData = new FormData();
    const fileName = `recording-${Date.now()}.m4a`;
    // Platform.OS === 'android' ? 'audio/m4a' : 'audio/x-m4a' 등 MIME 타입 확인 필요할 수 있음
    // 일반적으로 'audio/m4a'가 잘 동작하지만, 서버 요구사항에 따라 다를 수 있음.
    const fileType = 'audio/m4a'; 
    
    console.log('Preparing FormData for voice-to-text:');
    console.log('Original voiceUri:', voiceUri);
    if (!voiceUri || typeof voiceUri !== 'string' || !voiceUri.startsWith('file://')) {
      console.error('Invalid or unexpected voiceUri format!');
      Alert.alert('오류', '음성 파일 경로가 올바르지 않습니다.');
      throw new Error('Invalid voice URI');
    }
    console.log('fileName:', fileName);
    console.log('fileType:', fileType);

    formData.append('file', {
      uri: voiceUri,
      name: fileName,
      type: fileType, // 서버가 어떤 타입을 기대하는지 확인 (예: audio/mpeg, audio/aac 등도 가능)
    });

    try {
      console.log('--- 음성 변환 요청 ---');
      const response = await fetch(`${BASE_URL}/api/voice-to-text`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            // 'Content-Type': 'application/json' // 이 줄을 제거하거나 주석 처리합니다.
            // FormData를 사용할 때는 Content-Type을 fetch가 자동으로 설정하도록 둡니다.
            // 명시적으로 설정해야 한다면, 'multipart/form-data' 여야 하지만,
            // fetch가 body가 FormData일 때 자동으로 boundary와 함께 설정해줍니다.
          },
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => '오류 메시지 파싱 실패');
        console.error('음성 변환 API 오류 응답:', response.status, errorText);
        throw new Error(`음성 변환 서버 오류: ${response.status} - ${errorText || '내용 확인 불가'}`);
      }

      const result = await response.json();
      console.log('음성 변환 결과:', result);

      if (result && typeof result.text === 'string') {
        return result.text;
      } else {
        console.error('음성 변환 후 유효하지 않은 텍스트:', result);
        throw new Error('음성 변환 후 서버로부터 유효한 텍스트를 받지 못했습니다.');
      }
    } catch (err) {
      console.error('convertVoiceToText 함수 내에서 오류 발생:', err);
      // err.message에 이미 상세 내용이 있을 수 있으므로 그대로 throw
      throw err; 
    }
  };


  
  // "텍스트로 변환" 버튼 핸들러 함수 추가
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
      setRecordedURI(null); // 변환 성공 시 녹음된 URI는 비움
      Alert.alert('변환 완료', '햄식이가 변환해준 내용이 마음에 드시나요?');
    } catch (error) {
      console.error('handleConvertAndSetText 오류:', error);
      Alert.alert('변환 실패', error.message || '음성을 텍스트로 변환하는 중 오류가 발생했습니다.');
    } finally {
      setIsConvertingVoice(false);
    }
  };


  const handleTemporarySave = async (fromSubmit = false) => {
    if (isConvertingVoice) {
      Alert.alert("알림", "음성 변환 중입니다. 잠시 후 다시 시도해주세요.");
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
      setIsConvertingVoice(true); // STT 시작 시 변환 중 상태로 설정
      try {
        if (fromSubmit) {
            // Alert.alert("음성 변환 중", "음성을 텍스트로 변환하고 있습니다. 잠시만 기다려주세요..."); // handleSubmit에서 이미 안내
        }
        const convertedText = await convertVoiceToText(voiceToConvertUri);
        diaryContent = convertedText;
        setContent(diaryContent); 
        setRecordedURI(null);    
        voiceToConvertUri = null; 
        if(fromSubmit) sttPerformedAndNavigates = true;
        else Alert.alert("음성 변환 완료", "음성이 텍스트로 변환되었습니다. 내용을 확인 후 다시 임시저장 또는 등록해주세요.");
        
        if (!fromSubmit) {
            setIsConvertingVoice(false); // STT 완료 시 변환 중 상태 해제
            return { success: true, sttJustCompleted: true };
        }

      } catch (error) {
        setIsConvertingVoice(false); // 오류 발생 시에도 변환 중 상태 해제
        Alert.alert('음성 변환 실패', error.message || '음성을 텍스트로 변환하는 중 오류가 발생했습니다. 텍스트로 직접 입력해주세요.');
        return { success: false };
      } finally {
          if (fromSubmit || sttPerformedAndNavigates) { // fromSubmit으로 STT를 한 경우엔 여기서 false로 만들면 안됨. 최종 저장후에.
              // 단, fromSubmit이 아니고 sttJustCompleted된 경우는 위에서 false처리.
          } else if (!sttPerformedAndNavigates) { // 순수 임시저장에서 STT만 한 경우
            setIsConvertingVoice(false);
          }
      }
    }

    if (!diaryContent) {
      Alert.alert('내용 없음', '임시 저장할 내용이 없습니다.');
      if(isConvertingVoice && fromSubmit) setIsConvertingVoice(false); // STT 후 내용이 없는 경우도 해제
      return { success: false };
    }
    
    try {
      const requestBody = {
        
        writtenDate: selectedDate,
        content: diaryContent,
      };
      console.log('등록 요청 바디:', requestBody);
      console.log('--- 일기 임시 저장 요청 (JSON) ---');
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
        Alert.alert('임시 저장 완료!'); 
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
        if(isConvertingVoice) setIsConvertingVoice(false); // 모든 작업 완료 후 변환 중 상태 최종 해제
    }
  };

  const handleTemporarySaveAndGuide = async () => {
    await handleTemporarySave(true);
  };

  const handleSubmit = async () => {
    if (isConvertingVoice) {
      Alert.alert("알림", "음성 변환이 진행 중입니다. 잠시 후 다시 시도해주세요.");
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
              // Alert.alert("음성 변환 중", "음성을 텍스트로 변환하고 있습니다. 잠시만 기다려주세요..."); // handleTemporarySave에서 처리
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
        console.log('요청 바디:', JSON.stringify(requestBody)); // 전송 전 실제 값 확인
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
            <TouchableOpacity onPress={handleSubmit} disabled={isConvertingVoice || isLoadingDiary}>
              <Text style={[styles.submitText, (isConvertingVoice || isLoadingDiary) && styles.disabledText]}>등록</Text>
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
                // --- 수정된 오디오 정보 및 "텍스트로 변환" 버튼 영역 ---
                <View style={styles.audioPlaybackContainer}>
                  <View style={styles.audioInfo}>
                    <MaterialIcons name="graphic-eq" size={24} color="#3C5741" style={{ marginRight: 10 }} />
                    <Text style={styles.audioFileName} numberOfLines={1}>
                      {recordedURI.split('/').pop()}
                    </Text>
                    <TouchableOpacity onPress={handleDeleteRecording} disabled={isConvertingVoice}>
                      <MaterialIcons name="delete" size={24} color={isConvertingVoice ? "#B0B0B0" : "#D32F2F"} />
                    </TouchableOpacity>
                  </View>
                  <TouchableOpacity
                    onPress={handleConvertAndSetText}
                    style={[styles.convertToTextButton, isConvertingVoice && styles.disabledButtonBackground]}
                    disabled={isConvertingVoice}
                  >
                    {isConvertingVoice ? (
                      <ActivityIndicator size="small" color="#FFFFFF" style={{ marginRight: 8 }}/>
                    ) : (
                      <MaterialIcons name="transform" size={20} color="white" style={{ marginRight: 8 }} />
                    )}
                    <Text style={styles.convertToTextButtonText}>
                      {isConvertingVoice ? '변환 중...' : '햄식이가 바꿔줘요'}
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
                  editable={!isRecording && !isConvertingVoice} // 변환 중에는 편집 불가
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
            (isConvertingVoice || (!!content.trim() && !isRecording && !recordedURI)) && styles.disabledButtonBackground // 조건부 비활성화 스타일
          ]}
          onPress={handleRecordToggle}
          disabled={(!!content.trim() && !isRecording && !recordedURI) || isLoadingDiary || isConvertingVoice}
        >
          <MaterialIcons
            name={isRecording ? 'stop' : (recordedURI ? 'autorenew' : 'mic')}
            size={20}
            color={
                (isConvertingVoice || (!!content.trim() && !isRecording && !recordedURI))
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
              (isConvertingVoice || (!!content.trim() && !isRecording && !recordedURI)) && { color: "#FFFFFF" } 
            ]}
          >
            {isRecording ? '녹음 중지' : recordedURI ? '녹음 변경' : '햄식이가 들어줘요'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
            style={[
                styles.bottomBarButton, 
                styles.tempSaveButton,
                ((!content.trim() && !recordedURI) || isLoadingDiary || isRecording || isConvertingVoice) && styles.disabledButtonLook // 텍스트 색상만 변경
            ]}
            onPress={async () => {
                const result = await handleTemporarySave(false);
            }}
            disabled={(!content.trim() && !recordedURI) || isLoadingDiary || isRecording || isConvertingVoice } 
        >
          <Text style={[
              styles.bottomBarButtonText,
              styles.tempSaveButtonText,
              ((!content.trim() && !recordedURI) || isLoadingDiary || isRecording || isConvertingVoice) && { color: "#B0B0B0"}
            ]}
          >
            임시저장
          </Text>
          <MaterialIcons name="chevron-right" size={24} color={((!content.trim() && !recordedURI) || isLoadingDiary || isRecording || isConvertingVoice) ? "#B0B0B0" : "#8A8A8A"} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const screenHeight = Dimensions.get('window').height;

const styles = StyleSheet.create({
  // ... (기존 스타일 대부분 유지) ...
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
    fontWeight: '600', 
  },
  submitText: { 
    fontSize: 20,
    fontWeight: '450', 
    color: '#3C5741',
    paddingHorizontal: 10,
    paddingVertical: 10, 
  },
  disabledText: { // 등록 버튼 비활성화 시 텍스트 색상
    color: '#B0B0B0',
  },
  metaInfoRow: { 
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
  },
  metaTextGroup: { 
    marginLeft: 12, 
  },
  date: { 
    fontSize: 28,
    fontWeight: '600', 
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
    minHeight: 200, 
    paddingVertical: 20,
  },
  recordingImage: { 
    width: 100,
    height: 100,
    resizeMode: 'contain',
  },
  recordingStatusText: { 
    color: '#3C5741', // 색상 통일성 있게 변경
    marginTop: 15,
    fontSize: 16,
    fontWeight: '500',
  },
  // --- 오디오 정보 및 변환 버튼 관련 스타일 ---
  audioPlaybackContainer: { // 오디오 정보와 변환 버튼을 감싸는 컨테이너
    flex: 1,
    minHeight: 200, 
    justifyContent: 'center', // 내부 요소들을 수직 중앙 정렬
    alignItems: 'center', // 내부 요소들을 수평 중앙 정렬
    paddingVertical: 20,
  },
  audioInfoContainer: { 
    width: '100%', // 너비를 꽉 채우도록
    // 기존 audioInfoContainer는 flex:1, minHeight:200, justifyContent: 'center' 였음
    // 이제는 audioPlaybackContainer가 그 역할을 하고, 여기서는 audioInfo만 감쌈
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
    marginVertical: 10, // 위아래 마진
    width: '90%', // 화면 폭의 90%
    alignSelf: 'center', // 스스로 중앙 정렬
  },
  audioFileName: { 
    flex: 1,
    fontSize: 14,
    color: '#333',
    marginHorizontal: 10,
  },
  convertToTextButton: { // "텍스트로 변환" 버튼 스타일
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3C5741', 
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25, 
    marginTop: 15, 
    minWidth: '60%', 
    alignSelf: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  convertToTextButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  disabledButtonBackground: { // 비활성화 시 배경색 변경 (텍스트로 변환 버튼 등)
    backgroundColor: '#B0B0B0',
  },
  disabledButtonLook: { // 비활성화 시 모양만 (텍스트 색상 변경, 배경은 투명 유지 - 임시저장 버튼용)
    // 이 스타일은 TouchableOpacity의 style prop에 직접 적용하기 보다, 내부 Text 컴포넌트의 색상을 바꾸는 용도로 사용
  },
  // --- 하단 바 스타일 ---
  bottomBarContainer: { 
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Platform.OS === 'ios' ? 15 : 10,
    paddingHorizontal: 20,
    backgroundColor: '#F7F7F7',
    borderTopWidth: 1,
    borderTopColor: '#DCDCDC',
    paddingBottom: Platform.OS === 'ios' ? 30 : 15, 
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
    fontWeight: '500', 
    marginLeft: 8,
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
    marginRight: 2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 200, 
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#3C5741',
  }
});
// --- END OF FILE DiaryWriteScreen.js ---