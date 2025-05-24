import React, { useState, useEffect, useCallback } from 'react';
import {
  SafeAreaView,View,Text,TextInput,TouchableOpacity,Alert,ScrollView,Image,Platform,StatusBar,Dimensions,KeyboardAvoidingView,StyleSheet, ActivityIndicator
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import dayjs from 'dayjs';
// import * as FileSystem from 'expo-file-system'; // FileSystem은 현재 코드에서 직접 사용하지 않으므로 주석 처리 또는 삭제 가능

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
  const { selectedDate, accessToken, tempDiaryId: initialTempDiaryId } = route.params;

  const [content, setContent] = useState('');
  const [recording, setRecording] = useState();
  const [isRecording, setIsRecording] = useState(false);
  const [recordedURI, setRecordedURI] = useState(null);
  const [_permissionResponse, requestPermission] = Audio.usePermissions();
  const [isLoadingDiary, setIsLoadingDiary] = useState(false);
  const [currentDiaryId, setCurrentDiaryId] = useState(initialTempDiaryId || null);
  const [isConvertingVoice, setIsConvertingVoice] = useState(false);

  // 오디오 재생을 위한 상태 추가
  const [sound, setSound] = useState();
  const [isPlaying, setIsPlaying] = useState(false);

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

  // 컴포넌트 언마운트 또는 recording 객체가 변경될 때 정리
  useEffect(() => {
    return () => {
      if (recording) {
        // recording._finalDurationMillis는 내부 프로퍼티이므로 사용에 주의
        // 좀 더 안전하게는 isRecording 상태와 함께 관리하거나,
        // recording 객체가 유효한지 확인하는 다른 방법을 사용하는 것이 좋습니다.
        // 여기서는 기존 로직을 유지합니다.
        if (recording._finalDurationMillis == null) {
          console.log("Unloading active recording on unmount/change");
          recording.stopAndUnloadAsync().catch(err =>
            console.error("Error stopping/unloading recording:", err)
          );
        }
      }
      // 오디오 모드 리셋은 앱 전체 오디오 정책에 따라 필요할 수 있습니다.
      // Audio.setAudioModeAsync({ allowsRecordingIOS: false }).catch(err =>
      //   console.error("Error resetting audio mode:", err)
      // );
    };
  }, [recording]);

  // 컴포넌트 언마운트 시 sound 객체 정리
  useEffect(() => {
    return sound
      ? () => {
          console.log('Unloading Sound on component unmount');
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);


  const startRecording = async () => {
    // 재생 중인 사운드가 있다면 중지
    if (sound && isPlaying) {
        await sound.stopAsync();
        await sound.unloadAsync();
        setSound(undefined);
        setIsPlaying(false);
    }
    try {
      const { status } = await Audio.getPermissionsAsync();
      if (status !== 'granted') {
        console.log('Requesting microphone permission...');
        const permission = await requestPermission();
        console.log('Permission status:', permission.status);
        if (permission.status !== 'granted') {
          Alert.alert('권한 거부됨', '마이크 권한이 필요합니다.');
          return;
        }
      }
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true, // 녹음 중 다른 오디오 재생 가능 여부 (필요에 따라 true/false)
        // interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX, // 다른 오디오에 의해 중단되는 방식
        // interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
      });
      console.log('Starting recording...');
      const { recording: newRecording } = await Audio.Recording.createAsync(RECORDING_OPTIONS_M4A);
      setRecording(newRecording);
      setIsRecording(true);
      setRecordedURI(null); // 새 녹음 시작 시 이전 URI 제거
      setContent('');
      console.log('Recording started');
    } catch (err) {
      console.error('Error starting recording:', err);
      Alert.alert('녹음 시작 오류', err.message || '알 수 없는 녹음 오류');
    }
  };

  const stopRecording = async () => {
    if (!recording) return;
    console.log('Stopping recording...');
    try {
      await recording.stopAndUnloadAsync(); // 녹음 중지 및 리소스 해제
      const uri = recording.getURI();
      console.log('Recording stopped, URI:', uri);
      setRecordedURI(uri);
      setRecording(undefined); // recording 객체 초기화
      setIsRecording(false);
      // 녹음 완료 후 오디오 모드를 원래대로 돌리거나, 재생을 위해 유지할 수 있음
      // await Audio.setAudioModeAsync({ allowsRecordingIOS: false });
    } catch (err) {
      console.error('Error stopping recording:', err);
      Alert.alert('녹음 중지 오류', err.message || '알 수 없는 녹음 중지 오류');
    }
  };

  const handleRecordToggle = () => {
    if (isRecording) {
      stopRecording();
    } else {
      // 텍스트 내용이 있거나, 이미 녹음된 파일이 있을 때 경고 후 새로 녹음
      if (recordedURI || (content && content.trim())) {
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

  const handleDeleteRecording = async () => { // async로 변경
    if (sound && isPlaying) { // 재생 중인 사운드 중지 및 언로드
      try {
        await sound.stopAsync();
        await sound.unloadAsync();
      } catch (error) {
        console.error("Error stopping/unloading sound on delete:", error);
      }
      setSound(undefined);
      setIsPlaying(false);
    }
    setRecordedURI(null); // 녹음 URI 제거
  };

  // 녹음된 오디오 재생 함수
  async function playSound() {
    if (!recordedURI) {
      console.log("재생할 녹음 파일이 없습니다.");
      return;
    }

    if (isPlaying && sound) { // 이미 재생 중이면 중지
      console.log('Stopping sound');
      try {
        await sound.stopAsync();
      } catch (error) {
        console.error("Error stopping sound:", error);
      }
      setIsPlaying(false); // 명시적으로 재생 상태 변경
      return;
    }

    console.log('Loading Sound from URI:', recordedURI);
    try {
      // 재생 전 오디오 모드 설정 (선택적, iOS에서 필요할 수 있음)
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false, // 재생 중에는 녹음 비활성화
        playsInSilentModeIOS: true,
      });

      const { sound: newSound, status: initialStatus } = await Audio.Sound.createAsync(
         { uri: recordedURI },
         { shouldPlay: true } // 로드 후 바로 재생
      );
      setSound(newSound);
      if (initialStatus.isLoaded && initialStatus.isPlaying) {
        setIsPlaying(true);
      }
      console.log('Playing Sound');

      newSound.setOnPlaybackStatusUpdate(async (status) => {
        if (!status.isLoaded) { // 사운드가 언로드된 경우 (예: 오류 또는 수동 언로드)
          if (status.error) {
            console.error(`Playback Error: ${status.error}`);
            Alert.alert("재생 오류", status.error);
          }
          setIsPlaying(false);
          setSound(undefined); // 사운드 객체 정리
        } else { // 사운드가 로드된 경우
          setIsPlaying(status.isPlaying);
          if (status.didJustFinish) {
            console.log('Playback Finished');
            // 재생 완료 후 자동으로 언로드 (선택적)
            // await newSound.unloadAsync();
            // setSound(undefined);
            // setIsPlaying(false); // isPlaying은 status.isPlaying으로 이미 업데이트됨
          }
        }
      });
    } catch (error) {
      console.error('Error loading or playing sound:', error);
      Alert.alert("재생 오류", "오디오 파일을 재생할 수 없습니다.");
      setIsPlaying(false); // 오류 발생 시 재생 상태 해제
      if (sound) { // 이미 sound 객체가 생성된 상태에서 오류가 났다면 정리
        await sound.unloadAsync().catch(e => console.error("Error unloading sound on play error:", e));
        setSound(undefined);
      }
    }
  }


  const convertVoiceToText = async (voiceUri) => {

    
    // 재생 중인 사운드가 있다면 변환 전 중지
    if (sound && isPlaying) {
        await sound.stopAsync();
        // await sound.unloadAsync(); // 변환 후에도 다시 들을 수 있게 하려면 언로드는 선택적
        // setSound(undefined);
        setIsPlaying(false);
    }
    setIsConvertingVoice(true);
    try {
      const formData = new FormData();
      const fileName = `recording-${Date.now()}.m4a`;
      const fileType = Platform.OS === 'ios' ? 'audio/m4a' : (Platform.OS === 'android' ? 'audio/m4a' : 'audio/m4a');


      if (Platform.OS === 'web' && voiceUri.startsWith('blob:')) {
        const response = await fetch(voiceUri);
        const blob = await response.blob();
        const file = new File([blob], fileName, { type: fileType });
        formData.append('file', file);
        console.log('--- Appending blob as File to FormData (Web) ---', file.name, file.size);
      } else if (Platform.OS !== 'web') {
        const nativeFileName = voiceUri.split('/').pop();
        formData.append('file', {
          uri: voiceUri,
          name: nativeFileName,
          type: fileType,
        });
        console.log('--- Appending native file URI to FormData ---', voiceUri);
      } else {
        Alert.alert("오류", "지원되지 않는 파일 URI 형식입니다.");
        setIsConvertingVoice(false); // 로딩 상태 해제
        return; // Promise<undefined> 반환
      }

      console.log('--- 음성 변환 요청 ---');
      console.log('Voice-to-text URL:', `${BASE_URL}/api/voice-to-text`);

      const apiResponse = await fetch(`${BASE_URL}/api/voice-to-text`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: formData,
      });

      console.log('API Response Status:', apiResponse.status);

      if (!apiResponse.ok) {
        const errorText = await apiResponse.text().catch(() => '오류 메시지 파싱 실패');
        console.error('음성 변환 API 오류 응답:', apiResponse.status, errorText);
        throw new Error(`음성 변환 서버 오류: ${apiResponse.status} - ${errorText || '내용 확인 불가'}`);
      }

      const result = await apiResponse.json();
      console.log('음성 변환 결과:', result);

      if (result && typeof result.text === 'string') {
        return result.text;
      } else {
        console.error('음성 변환 후 유효하지 않은 텍스트:', result);
        throw new Error('음성 변환 후 서버로부터 유효한 텍스트를 받지 못했습니다.');
      }
    } catch (err) {
      console.error('convertVoiceToText 함수 내에서 오류 발생:', err);
      throw err;
    } finally {
      // setIsConvertingVoice(false); // 호출한 쪽(handleConvertVoiceToTextAndSetContent)에서 최종적으로 false로 설정
    }
  };

  const handleConvertVoiceToTextAndSetContent = async () => {
    if (!recordedURI) {
      Alert.alert("오류", "변환할 녹음된 음성이 없습니다.");
      return;
    }

    // 현재 텍스트 내용이 있으면 덮어쓰기 경고
    const performConversion = async () => {
      // isConvertingVoice는 convertVoiceToText 내부 시작 시 true로 설정됨.
      // 여기서 또 true로 설정하면 finally에서 false로 바뀔 때 문제가 될 수 있음.
      // 대신 convertVoiceToText가 호출되기 전에 UI 업데이트가 필요하다면 여기서 설정.
      // 현재 로직에서는 convertVoiceToText 내부에서 처리하는 것이 더 적합해 보임.
      // 만약 convertVoiceToText 호출 전에 로딩을 걸고 싶다면,
      // setIsConvertingVoice(true); // 여기서 설정하고
      // convertVoiceToText의 finally에서 setIsConvertingVoice(false)를 제거해야 함.

      try {
        console.log('[handleConvertVoiceToTextAndSetContent] 음성 변환 시작...');
        const convertedText = await convertVoiceToText(recordedURI);

        if (typeof convertedText === 'string') {
          setContent(convertedText || '');
          setRecordedURI(null); // 변환 성공 시 녹음된 URI는 제거 (텍스트로 대체되었으므로)
           // 재생 중이던 사운드 객체도 정리 (recordedURI가 null이 되므로 더 이상 재생 불가)
          if (sound) {
            await sound.unloadAsync().catch(e => console.warn("Error unloading sound after STT:", e));
            setSound(undefined);
            setIsPlaying(false);
          }
          Alert.alert("변환 완료", "음성이 텍스트로 변환되었습니다.");
          console.log('[handleConvertVoiceToTextAndSetContent] 음성 변환 성공.');
        } else {
          // 이 경우는 convertVoiceToText에서 throw new Error를 하지 않은 경우에만 도달 가능
          // 현재는 convertVoiceToText에서 오류 시 throw 하므로 여기는 거의 도달하지 않음.
          console.error('[handleConvertVoiceToTextAndSetContent] 변환된 텍스트가 유효하지 않음:', convertedText);
          Alert.alert('음성 변환 오류', '변환된 텍스트가 유효하지 않습니다.');
        }
      } catch (error) {
        console.error('[handleConvertVoiceToTextAndSetContent] 음성 변환 실패:', error);
        Alert.alert('음성 변환 실패', error.message || '음성을 텍스트로 변환하는 중 오류가 발생했습니다.');
      } finally {
        setIsConvertingVoice(false); // 모든 작업(성공/실패) 후 로딩 상태 해제
      }
    };

    if (content && content.trim()) {
      Alert.alert(
        "텍스트 변환 확인",
        "음성을 텍스트로 변환하면 현재 작성된 텍스트 내용이 대체됩니다. 계속하시겠습니까?",
        [
          { text: "취소", style: "cancel" },
          { text: "확인", onPress: performConversion }
        ]
      );
    } else {
      performConversion();
    }
  };


  const handleTemporarySave = async (fromSubmit = false) => {
    // 재생 중인 사운드가 있다면 중지
    if (sound && isPlaying) {
        await sound.stopAsync();
        setIsPlaying(false); // 임시저장 시에는 재생 중지
    }

    let diaryContent = (content && typeof content === 'string') ? content.trim() : ''; // 방어 코드
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
      // setIsConvertingVoice(true); // convertVoiceToText 내부에서 처리
      try {
        if (fromSubmit) {
            Alert.alert("음성 변환 중", "음성을 텍스트로 변환하고 있습니다. 잠시만 기다려주세요...");
        }
        const convertedText = await convertVoiceToText(voiceToConvertUri); // 이 함수 내부에서 setIsConvertingVoice(true) 호출
        diaryContent = convertedText || ''; // undefined 방지
        setContent(diaryContent);
        setRecordedURI(null);
        voiceToConvertUri = null;
        if(fromSubmit) sttPerformedAndNavigates = true;
        else Alert.alert("음성 변환 완료", "음성이 텍스트로 변환되었습니다. 내용을 확인 후 다시 임시저장 또는 등록해주세요.");

        if (!fromSubmit) {
            setIsConvertingVoice(false); // convertVoiceToText는 finally에서 false로 안하므로 여기서 처리
            return { success: true, sttJustCompleted: true };
        }

      } catch (error) {
        // convertVoiceToText에서 throw한 에러를 받음
        setIsConvertingVoice(false); // 에러 발생 시 로딩 상태 해제
        Alert.alert('음성 변환 실패', error.message || '음성을 텍스트로 변환하는 중 오류가 발생했습니다. 텍스트로 직접 입력해주세요.');
        return { success: false };
      } finally {
        // fromSubmit일 때는 handleTemporarySave의 다음 로직에서 처리되거나,
        // !fromSubmit일 때는 위에서 이미 setIsConvertingVoice(false) 처리됨.
        // 따라서 여기서 중복으로 false 처리할 필요 없음.
        // if (fromSubmit) setIsConvertingVoice(false); // 이 줄은 필요 없을 수 있음.
      }
    }

    // diaryContent가 여전히 없을 수 있음 (STT 실패 등)
    if (!diaryContent) {
      if (!fromSubmit || (fromSubmit && !sttPerformedAndNavigates)) {
         Alert.alert('내용 없음', '임시 저장할 내용이 없습니다.');
      }
      setIsConvertingVoice(false); // STT를 시도했다면 여기서 확실히 false로.
      return { success: false };
    }

    // 임시 저장 API 호출
    setIsLoadingDiary(true); // 임시 저장 자체에 대한 로딩 (STT 로딩과 별개)
    try {
      const requestBody = {
        writtenDate: dayjs(selectedDate).format('YYYY-MM-DD'),
        content: diaryContent,
      };
      if (currentDiaryId) {
        requestBody.diaryId = currentDiaryId;
      }

      

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
      setIsLoadingDiary(false);
      setIsConvertingVoice(false); // 모든 임시저장 과정 후 STT 로딩 상태도 확실히 해제
    }
  };

  const handleTemporarySaveAndGuide = async () => {
    await handleTemporarySave(true);
  };

  const handleSubmit = async () => {
    if (isConvertingVoice || isLoadingDiary) { // 로딩 중 작업 방지
        Alert.alert("처리 중", "다른 작업이 진행 중입니다. 잠시 후 다시 시도해주세요.");
        return;
    }
    // 재생 중인 사운드가 있다면 중지
    if (sound && isPlaying) {
        await sound.stopAsync();
        setIsPlaying(false);
    }

    const currentContent = (content && typeof content === 'string') ? content.trim() : '';
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
        "음성 일기는 텍스트로 변환된 후 '임시저장' 과정을 거쳐 최종 확인됩니다. 계속하시겠습니까?\n(또는, '텍스트로 변환' 버튼을 먼저 눌러 내용을 확인하세요.)",
        [
          { text: "취소", style: "cancel" },
          { text: "확인 후 진행", onPress: handleTemporarySaveAndGuide }
        ]
      );
      return;
    }

    if (currentContent && !currentRecordedURI) {
      setIsLoadingDiary(true); // 최종 등록 로딩
      try {
        // --- 수정 시작 ---
        const requestBody = {
          writtenDate: selectedDate,
          content: currentContent,
        };

        // currentDiaryId가 존재하고 null이 아닐 경우에만 requestBody에 추가
        if (currentDiaryId) {
          requestBody.diaryId = currentDiaryId;
        }
        // --- 수정 끝 ---

        console.log('--- 일기 등록 요청 (JSON) ---');
        console.log('URL:', `${BASE_URL}/api/diaries?temp=false`);
        console.log('Body:', JSON.stringify(requestBody)); // 수정된 requestBody 확인

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
        const { diaryId: finalDiaryId } = resJson;

        Alert.alert('일기 등록 완료!');
        navigation.navigate('DiaryConfirm', { diaryId: finalDiaryId, accessToken, selectedDate });
      } catch (err) {
        console.error('등록 API 호출 오류:', err);
        Alert.alert('등록 오류', err.message);
      } finally {
        setIsLoadingDiary(false);
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
            <TouchableOpacity onPress={() => navigation.goBack()} disabled={isConvertingVoice || isLoadingDiary}>
              <Text style={styles.backButton}>{'<'}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleSubmit} disabled={isConvertingVoice || isLoadingDiary}>
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
          ) : isConvertingVoice ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#3C5741" />
              <Text style={styles.loadingText}>음성을 텍스트로 변환 중...</Text>
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
                    {/* 재생/중지 버튼 추가 */}
                    <TouchableOpacity onPress={playSound} style={styles.playButton} disabled={isConvertingVoice}>
                      <MaterialIcons name={isPlaying ? "stop-circle" : "play-circle-outline"} size={28} color={isConvertingVoice ? "#B0B0B0" : "#3C5741"} />
                    </TouchableOpacity>
                    <Text style={styles.audioFileName} numberOfLines={1} ellipsizeMode="middle">
                      {recordedURI.split('/').pop()}
                    </Text>
                    <TouchableOpacity onPress={handleDeleteRecording} style={styles.deleteButton} disabled={isConvertingVoice}>
                      <MaterialIcons name="delete" size={24} color={isConvertingVoice ? "#B0B0B0" :"#D32F2F"} />
                    </TouchableOpacity>
                  </View>
                  <TouchableOpacity
                    style={[
                        styles.actionButton,
                        styles.convertToTextButton,
                        isConvertingVoice && styles.disabledButton
                    ]}
                    onPress={handleConvertVoiceToTextAndSetContent}
                    disabled={isConvertingVoice}
                  >
                    <MaterialIcons name="transform" size={20} color="white" style={{ marginRight: 5 }}/>
                    <Text style={styles.actionButtonText}>텍스트로 변환</Text>
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
                  editable={!isRecording && !isConvertingVoice && !isLoadingDiary}
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
            // content.trim() 호출 전 content가 문자열인지, 그리고 null/undefined가 아닌지 확인
            (((content && typeof content === 'string' ? !!content.trim() : false) && !isRecording && !recordedURI) || isLoadingDiary || isConvertingVoice) && styles.disabledButton
          ]}
          onPress={handleRecordToggle}
          disabled={((content && typeof content === 'string' ? !!content.trim() : false) && !isRecording && !recordedURI) || isLoadingDiary || isConvertingVoice}
        >
          <MaterialIcons
            name={isRecording ? 'stop' : (recordedURI ? 'autorenew' : 'mic')}
            size={20}
            color={ ((content && typeof content === 'string' ? !!content.trim() : false) && !isRecording && !recordedURI) || isLoadingDiary || isConvertingVoice ? "#B0B0B0" : ((isRecording || recordedURI) ? "white" : "#3C5741") }
          />
          <Text style={[
              styles.bottomBarButtonText,
              styles.voiceRecordButtonText,
              (isRecording || recordedURI) && { color: "white" },
              (((content && typeof content === 'string' ? !!content.trim() : false)) && !isRecording && !recordedURI || isLoadingDiary || isConvertingVoice) && { color: "#B0B0B0" }
            ]}
          >
            {isRecording ? '녹음 중지' : recordedURI ? '녹음 변경' : '음성으로 작성'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
            style={[
                styles.bottomBarButton,
                styles.tempSaveButton,
                ((!(content && typeof content === 'string' ? content.trim() : false) && !recordedURI) || isLoadingDiary || isRecording || isConvertingVoice) && styles.disabledButton
            ]}
            onPress={async () => {
                if (isConvertingVoice || isLoadingDiary) return;
                const result = await handleTemporarySave(false);
            }}
            disabled={(!(content && typeof content === 'string' ? content.trim() : false) && !recordedURI) || isLoadingDiary || isRecording || isConvertingVoice }
        >
          <Text style={[
              styles.bottomBarButtonText,
              styles.tempSaveButtonText,
              ((!(content && typeof content === 'string' ? content.trim() : false) && !recordedURI) || isLoadingDiary || isRecording || isConvertingVoice) && { color: "#B0B0B0"}
            ]}
          >
            임시저장
          </Text>
          <MaterialIcons name="chevron-right" size={24} color={((!(content && typeof content === 'string' ? content.trim() : false) && !recordedURI) || isLoadingDiary || isRecording || isConvertingVoice) ? "#B0B0B0" : "#8A8A8A"} />
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
    minHeight: screenHeight * 0.7,
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
    padding: 10,
  },
  submitText: {
    fontSize: 20,
    fontWeight: '450',
    color: '#3C5741',
    paddingHorizontal: 10,
    paddingVertical: 10,
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
    minHeight: 250,
  },
  recordingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 250,
    paddingVertical: 20,
  },
  recordingImage: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
  },
  recordingStatusText: {
    color: '#F44336',
    marginTop: 15,
    fontSize: 16,
    fontWeight: '500',
  },
  audioPlaybackContainer: {
    flex: 1,
    minHeight: 250,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  audioInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 8, // 좌우 패딩 약간 줄임
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginVertical: 10,
    width: '95%', // 너비 약간 늘림
  },
  playButton: { // 재생 버튼 스타일
    paddingHorizontal: 8, // 좌우 터치 영역
  },
  audioFileName: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    marginHorizontal: 5, // 아이콘과의 간격
  },
  deleteButton: { // 삭제 버튼 스타일
    paddingHorizontal: 8, // 좌우 터치 영역
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    marginTop: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  convertToTextButton: {
    backgroundColor: '#4CAF50',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 15,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  disabledButton: {
    opacity: 0.6,
    backgroundColor: '#E0E0E0', // 기존 opacity와 함께 사용하거나, 이것만 사용
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
    minHeight: 250,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#3C5741',
  }
});
