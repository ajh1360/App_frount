import React, { useState, useEffect, useCallback } from 'react'; // useCallback 추가
import {
  SafeAreaView,View,Text,TextInput,TouchableOpacity,Alert,ScrollView,Image,Platform,StatusBar,Dimensions,KeyboardAvoidingView,StyleSheet, ActivityIndicator
} from 'react-native'; // ActivityIndicator 추가
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
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
  // route.params에서 tempDiaryId를 받을 수 있도록 추가
  const { selectedDate, accessToken, tempDiaryId: initialTempDiaryId } = route.params;

  const [content, setContent] = useState('');
  const [recording, setRecording] = useState();
  const [isRecording, setIsRecording] = useState(false);
  const [recordedURI, setRecordedURI] = useState(null);
  // const [_permissionResponse, requestPermission] = Audio.usePermissions();
  const [isLoadingDiary, setIsLoadingDiary] = useState(false); // 임시 저장 일기 로딩 상태
  const [currentDiaryId, setCurrentDiaryId] = useState(initialTempDiaryId || null); // 현재 작업중인 일기 ID (임시저장된 ID일 수 있음)


  const BASE_URL = 'http://ceprj.gachon.ac.kr:60021';

  const loadTemporaryDiary = useCallback(async (diaryId) => {
    if (!diaryId) return;
    setIsLoadingDiary(true);
    try {
      console.log(`--- 임시 저장된 일기 불러오기 요청 (ID: ${diaryId}) ---`);
      const response = await fetch(`${BASE_URL}/api/diaries/${diaryId}`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`임시 저장된 일기 불러오기 실패: ${response.status} - ${errorData.message || '내용 확인 불가'}`);
      }
      const diary = await response.json();
      // API 응답에서 content 필드를 사용한다고 가정
      if (diary && typeof diary.content === 'string') {
        setContent(diary.content);
        setRecordedURI(null); // 불러온 내용은 텍스트이므로 녹음 URI는 초기화
      } else {
        // transformContent 또는 summary가 있는 경우 fallback (API 명세에 따라 조정 필요)
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
      // recording이 아직 active 상태일 경우에만 중지 시도
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
    setRecordedURI(null);
  };

  const convertVoiceToText = async (voiceUri) => {
  const formData = new FormData();
  const fileName = voiceUri.split('/').pop();
  // 서버에서 m4a를 처리할 수 있는지, 또는 어떤 mime type을 기대하는지 확인 (예: 'audio/m4a', 'audio/mp4', 'audio/aac')
  const fileType = Platform.OS === 'ios' ? 'audio/x-m4a' : 'audio/m4a'; 

  formData.append('file', {
    uri: voiceUri,
    name: fileName,
    type: fileType,
  });

  try {
    console.log('--- 음성 변환 요청 ---');
    console.log('Voice-to-text URL:', `${BASE_URL}/api/voice-to-text`);
    // 개발 중 FormData 내용 확인을 위해 console.log 추가 가능 (실제 파일 내용은 안 보임)
    // console.log('FormData entries:');
    // for (let pair of formData.entries()) {
    //   console.log(pair[0]+ ', ' + pair[1]);
    // }

    const response = await fetch(`${BASE_URL}/api/voice-to-text`, { // API 경로가 맞는지 확인
      method: 'POST', // POST 메서드 명시
      headers: {
        // 'Content-Type': 'multipart/form-data', // FormData 사용 시 보통 자동으로 설정됨
        Authorization: `Bearer ${accessToken}`, // API가 인증을 요구한다면 추가
      },
      body: formData, // FormData를 body에 전달
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => '오류 메시지 파싱 실패'); // 오류 응답이 JSON이 아닐 수 있음
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
    // 에러를 다시 던져서 호출한 쪽(handleTemporarySave)의 catch 블록에서 처리하도록 함
    throw err;
  }
};

  const handleTemporarySave = async (fromSubmit = false) => {
    
    let diaryContent = content.trim();
    let voiceToConvertUri = recordedURI; // STT 변환 대기중인 URI

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
      try {
        // fromSubmit 이 true (즉, 등록 과정의 일부)일 때만 즉시 STT 후 화면 전환 시도
        // 그냥 "임시저장" 버튼일때는 STT 결과를 content에 채우고 URI를 null로 만들어 텍스트로 임시저장되게 유도.
        if (fromSubmit) {
            Alert.alert("음성 변환 중", "음성을 텍스트로 변환하고 있습니다. 잠시만 기다려주세요...");
        }
        const convertedText = await convertVoiceToText(voiceToConvertUri);
        diaryContent = convertedText;
        setContent(diaryContent); // STT 결과를 content에 반영
        setRecordedURI(null);    // STT 완료 후 recordedURI는 비움
        voiceToConvertUri = null; // 변환 완료
        if(fromSubmit) sttPerformedAndNavigates = true;
        else Alert.alert("음성 변환 완료", "음성이 텍스트로 변환되었습니다. 내용을 확인 후 다시 임시저장 또는 등록해주세요.");
        
        // fromSubmit이 false (순수 임시저장)이고, STT만 한 경우, 여기서 함수를 종료하고 사용자에게 텍스트 확인 후 다시 임시저장 유도
        if (!fromSubmit) return { success: true, sttJustCompleted: true };

      } catch (error) {
        Alert.alert('음성 변환 실패', error.message || '음성을 텍스트로 변환하는 중 오류가 발생했습니다. 텍스트로 직접 입력해주세요.');
        return { success: false };
      }
    }

    if (!diaryContent) {
      Alert.alert('내용 없음', '임시 저장할 내용이 없습니다.');
      return { success: false };
    }

    try {
      const requestBody = {
        writtenDate: selectedDate,
        content: diaryContent,
        // 만약 이어쓰기 중인 임시저장 건을 다시 임시저장하는 경우, 기존 ID를 포함할 수 있음 (백엔드 정책에 따라)
        // diaryId: currentDiaryId, // 이 부분은 백엔드에서 기존 ID로 덮어쓰기를 지원하는지에 따라 결정
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
      setCurrentDiaryId(diaryId); // 새로 생성되거나 업데이트된 diaryId로 상태 업데이트

      // fromSubmit이 true일 때만 화면 전환 (주로 등록 과정에서 호출될 때)
      if (fromSubmit || sttPerformedAndNavigates) {
        Alert.alert('임시 저장 완료!'); // DiaryConfirm으로 이동하기 전 알림
        navigation.navigate('DiaryConfirm', { diaryId, accessToken, selectedDate });
      } else {
        // fromSubmit이 false이면 (순수 "임시저장" 버튼 클릭 시) 화면 전환 없이 알림만
        Alert.alert('임시 저장 완료!', '작성 중인 내용이 임시 저장되었습니다.');
      }
      // MainHome으로 돌아갈 때 업데이트를 알리기 위한 파라미터 설정 (선택적)
      navigation.setParams({ diaryUpdated: true, updatedDate: selectedDate });
      return { success: true, diaryId };

    } catch (err) {
      console.error('임시 저장 API 호출 오류:', err);
      Alert.alert('임시 저장 오류', err.message);
      return { success: false };
    }
  };

  const handleTemporarySaveAndGuide = async () => {
    // 이 함수는 음성일기 "등록" 시 호출됨. STT -> 임시저장 -> DiaryConfirm 이동
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

    // 음성 일기 등록 시: STT -> 임시 저장 -> DiaryConfirm 화면으로 안내 (handleTemporarySaveAndGuide 사용)
    if (currentRecordedURI && !currentContent) {
      Alert.alert(
        "음성 일기 등록 안내",
        "음성 일기는 텍스트로 변환된 후 '임시저장' 과정을 거쳐 최종 확인됩니다. 계속하시겠습니까?",
        [
          { text: "취소", style: "cancel" },
          { text: "확인 후 진행", onPress: handleTemporarySaveAndGuide } // 여기서 true를 넘겨 STT 후 화면 이동
        ]
      );
      return;
    }

    // 텍스트 일기 등록 시: 바로 temp=false로 등록
    if (currentContent && !currentRecordedURI) {
      try {
        const requestBody = {
          writtenDate: selectedDate,
          content: currentContent,
          // 이어쓰던 임시 일기를 최종 등록하는 경우, 해당 ID를 함께 보낼 수 있음 (백엔드 정책에 따라)
          // diaryId: currentDiaryId, 
        };

        console.log('--- 일기 등록 요청 (JSON) ---');
        console.log('URL:', `${BASE_URL}/api/diaries?temp=false`); // 최종 등록
        console.log('Body:', JSON.stringify(requestBody));

        const response = await fetch(`${BASE_URL}/api/diaries?temp=false`, { // temp=false
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
        // MainHome으로 돌아갈 때 업데이트를 알리기 위한 파라미터 설정
        // navigation.navigate('MainHome', { diaryUpdated: true, selectedDateForUpdate: selectedDate });
        // 위 대신 DiaryConfirm으로 이동
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
                  value={content} 
                  onChangeText={setContent}
                  editable={!isRecording} 
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
            isRecording ? styles.voiceRecordButtonRecording : (recordedURI ? styles.voiceRecordButtonChange : null)
          ]}
          onPress={handleRecordToggle}
          disabled={(!!content.trim() && !isRecording && !recordedURI) || isLoadingDiary}
        >
          <MaterialIcons
            name={isRecording ? 'stop' : (recordedURI ? 'autorenew' : 'mic')}
            size={20}
            color={ (content.trim() && !isRecording && !recordedURI) ? "#B0B0B0" : ((isRecording || recordedURI) ? "white" : "#3C5741") }
          />
          <Text style={[
              styles.bottomBarButtonText,
              styles.voiceRecordButtonText,
              (isRecording || recordedURI) && { color: "white" }, 
              (content.trim() && !isRecording && !recordedURI) && { color: "#B0B0B0" } 
            ]}
          >
            {isRecording ? '녹음 중지' : recordedURI ? '녹음 변경' : '음성으로 작성'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
            style={[styles.bottomBarButton, styles.tempSaveButton]}
            // "임시저장" 버튼은 항상 fromSubmit=false로 호출
            onPress={async () => {
                const result = await handleTemporarySave(false);
                if (result.success && result.sttJustCompleted) {
                    // STT만 완료된 경우, 사용자에게 추가 액션 유도 (이미 Alert 있음)
                }
            }}
            disabled={(!content.trim() && !recordedURI) || isLoadingDiary || isRecording } 
        >
          <Text style={[
              styles.bottomBarButtonText,
              styles.tempSaveButtonText,
              ((!content.trim() && !recordedURI) || isLoadingDiary || isRecording) && { color: "#B0B0B0"}
            ]}
          >
            임시저장
          </Text>
          <MaterialIcons name="chevron-right" size={24} color={((!content.trim() && !recordedURI) || isLoadingDiary || isRecording) ? "#B0B0B0" : "#8A8A8A"} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const screenHeight = Dimensions.get('window').height;

const styles = StyleSheet.create({
  // ... (기존 스타일 유지) ...
  container: { // 기존 스타일과 동일
    flex: 1,
    backgroundColor: '#E6F0E7',
  },
  whiteBox: { // 기존 스타일과 동일
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
  navRow: { // 기존 스타일과 동일
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  backButton: { // 기존 스타일과 동일
    fontSize: 24,
    fontWeight: '600', 
  },
  submitText: { // 기존 스타일과 동일
    fontSize: 20,
    fontWeight: '450', 
    color: '#3C5741',
    paddingHorizontal: 10,
    paddingVertical: 10, 
  },
  metaInfoRow: { // 기존 스타일과 동일
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
  },
  metaTextGroup: { // 기존 스타일과 동일
    marginLeft: 12, 
  },
  date: { // 기존 스타일과 동일
    fontSize: 28,
    fontWeight: '600', 
  },
  divider: { // 기존 스타일과 동일
    height: 1,
    backgroundColor: '#C6C6C6',
    marginVertical: 15,
    marginHorizontal: 10,
  },
  diaryText: { // 기존 스타일과 동일
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderWidth: 0,
    textAlignVertical: 'top',
    minHeight: 200, 
  },
  recordingContainer: { // 기존 스타일과 동일
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 200, 
    paddingVertical: 20,
  },
  recordingImage: { // 기존 스타일과 동일
    width: 100,
    height: 100,
    resizeMode: 'contain',
  },
  recordingStatusText: { // 기존 스타일과 동일
    color: '#F44336', 
    marginTop: 15,
    fontSize: 16,
    fontWeight: '500',
  },
  audioInfoContainer: { // 기존 스타일과 동일
    flex: 1,
    minHeight: 200, 
    justifyContent: 'center',
  },
  audioInfo: { // 기존 스타일과 동일
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
  audioFileName: { // 기존 스타일과 동일
    flex: 1,
    fontSize: 14,
    color: '#333',
    marginHorizontal: 10,
  },
  bottomBarContainer: { // 기존 스타일과 동일
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
  bottomBarButton: { // 기존 스타일과 동일
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
  },
  bottomBarButtonText: { // 기존 스타일과 동일
    fontSize: 15,
    fontWeight: '500', 
    marginLeft: 8,
  },
  voiceRecordButton: { // 기존 스타일과 동일
    backgroundColor: '#E8F0E9', 
  },
  voiceRecordButtonRecording: { // 기존 스타일과 동일
    backgroundColor: '#D32F2F', 
  },
  voiceRecordButtonChange: { // 기존 스타일과 동일
    backgroundColor: '#FFA000', 
  },
  voiceRecordButtonText: { // 기존 스타일과 동일
    color: '#3C5741', 
  },
  tempSaveButton: { // 기존 스타일과 동일
    backgroundColor: 'transparent', 
  },
  tempSaveButtonText: { // 기존 스타일과 동일
    color: '#555555',
    marginRight: 2,
  },
  // 로딩 인디케이터를 위한 스타일 추가
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 200, // diaryText와 유사한 높이
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#3C5741',
  }
});