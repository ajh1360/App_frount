// import React, { useState, useEffect } from 'react';
// import {
//   View,
//   Text,
//   SafeAreaView,
//   StyleSheet,
//   TouchableOpacity,
//   TextInput,
//   KeyboardAvoidingView,
//   StatusBar,
//   Alert,
//   Dimensions,
//   Platform,
// } from 'react-native';
// import { Ionicons, MaterialIcons } from '@expo/vector-icons';
// import { Audio } from 'expo-av';
// import dayjs from 'dayjs';
// import { useNavigation, useRoute } from '@react-navigation/native'; // Added useRoute

// const { width } = Dimensions.get('window');

// // Styles from diaryPostSample.js are merged or adapted below
// const styles = StyleSheet.create({
//   safeArea: {
//     flex: 1,
//     backgroundColor: '#F5F9F6', // Original background
//   },
//   contentWrapper: { // New wrapper to mimic diaryPostSample's padding approach within DiaryWriteScreen's structure
//     flex: 1,
//     backgroundColor: '#FFFFFF', // Changed from F5F9F6 to white like diaryPostSample container
//     borderTopLeftRadius: 30, // Kept from original DiaryWriteScreen
//     borderTopRightRadius: 30, // Kept from original DiaryWriteScreen
//     paddingTop: 30, // Moved padding here from header for content alignment
//     paddingHorizontal: 20, // Added from diaryPostSample.js container style
//   },
//   keyboardAvoiding: {
//     flex: 1,
//     // paddingHorizontal: 20, // Moved to contentWrapper
//   },
//   header: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     // paddingTop: 30, // Moved to contentWrapper
//     paddingBottom: 10, // Kept from original DiaryWriteScreen header
//     marginBottom: 12, // Added from diaryPostSample.js header style
//   },
//   headerButton: {
//     padding: 8,
//   },
//   headerTitlePlaceholder: { // To balance the back button
//     width: 28 + 8*2, // approx size of icon + padding
//   },
//   // Using submitTextHeader from original DiaryWriteScreen as it's very similar to diaryPostSample's submitText
//   submitTextHeader: {
//     fontSize: 16,
//     color: '#4CAF50', // 'green' in diaryPostSample
//     fontWeight: '600', // 'bold' in original, '600' in diaryPostSample
//   },
//   date: { // Adapted from diaryPostSample.js dateText
//     fontSize: 20,
//     fontWeight: 'bold',
//     color: '#222', // Kept from original DiaryWriteScreen
//     marginBottom: 8, // Kept from original DiaryWriteScreen
//     textAlign: 'left', // Ensure it aligns with back button if placeholder removed
//   },
//   separator: {
//     height: 1,
//     backgroundColor: '#D0D0D0',
//     marginBottom: 20,
//   },
//   mainScrollableContent: {
//     flex: 1,
//     justifyContent: 'flex-start',
//   },
//   input: { // Merged from diaryPostSample.js styles.input
//     flex: 1,
//     fontSize: 16, // From diaryPostSample
//     lineHeight: 24,
//     borderColor: '#ccc', // From diaryPostSample
//     borderWidth: 1, // From diaryPostSample
//     borderRadius: 8, // From diaryPostSample
//     padding: 16, // From diaryPostSample
//     backgroundColor: '#f9f9f9', // From diaryPostSample
//     color: '#333', // Kept from original DiaryWriteScreen
//     textAlignVertical: 'top', // From diaryPostSample
//   },
//   recordingIndicatorContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   recordingIconBackground: {
//     backgroundColor: '#A0A0A0',
//     width: width * 0.45,
//     height: width * 0.45,
//     borderRadius: 20,
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginBottom: 15,
//   },
//   recordingText: {
//     fontSize: 16,
//     color: '#555555',
//     marginTop: 5,
//   },
//   playbackContainer: {
//     paddingVertical: 10,
//     alignItems: 'center',
//     backgroundColor: '#f9f9f9',
//     borderRadius: 5,
//     marginTop: 10,
//     marginBottom: 5,
//   },
//   playbackText: {
//     fontSize: 13,
//     color: '#333',
//   },
//   bottomBar: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingHorizontal: 20,
//     paddingTop: 15,
//     paddingBottom: Platform.OS === 'ios' ? 35 : 15,
//     borderTopWidth: 1,
//     borderTopColor: '#E0E0E0',
//     backgroundColor: '#F9F9F9',
//   },
//   voiceButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#E8F5E9',
//     paddingVertical: 10,
//     paddingHorizontal: 15,
//     borderRadius: 25,
//   },
//   voiceButtonRecording: {
//     backgroundColor: '#F44336',
//   },
//   voiceButtonText: {
//     marginLeft: 8,
//     fontSize: 15,
//     fontWeight: 'bold',
//     color: '#4CAF50',
//   },
//   voiceButtonTextRecording: {
//     color: '#FFFFFF',
//   },
//   tempSaveButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingVertical: 10,
//     paddingHorizontal: 10,
//   },
//   tempSaveButtonText: {
//     marginRight: 5,
//     fontSize: 15,
//     color: '#757575',
//   },
// });


// export default function DiaryWriteScreen() {
//   const navigation = useNavigation();
//   const route = useRoute(); // Added

//   // defaultDate ensures selectedDate is always a valid date string for dayjs
//   const defaultDate = dayjs().format('YYYY-MM-DD');
//   const { selectedDate = defaultDate, accessToken } = route.params || {};

//   const [content, setContent] = useState('');

//   // Audio recording states from original DiaryWriteScreen
//   const [recording, setRecording] = useState(undefined);
//   const [isRecording, setIsRecording] = useState(false);
//   const [recordedURI, setRecordedURI] = useState(null);
//   const [_permissionResponse, requestPermission] = Audio.usePermissions();

//   const BASE_URL = 'http://ceprj.gachon.ac.kr:60021'; // Added from diaryPostSample.js

//   useEffect(() => {
//     // Cleanup for audio recording
//     return () => {
//       if (recording) {
//         recording.stopAndUnloadAsync().catch(() => {});
//         Audio.setAudioModeAsync({ allowsRecordingIOS: false }).catch(() => {});
//       }
//     };
//   }, [recording]);

//   // handleSubmit function from diaryPostSample.js
//   const handleSubmit = async () => {
//     if (!accessToken) {
//         Alert.alert('오류', '접근 토큰이 없습니다. 다시 로그인해주세요.');
//         // Potentially navigate to login screen
//         return;
//     }
//     if (!content.trim()) {
//         Alert.alert('내용을 입력해주세요.');
//         return;
//     }

//     try {
//         const res = await fetch(`${BASE_URL}/api/diaries?temp=false`, {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json',
//                 Authorization: `Bearer ${accessToken}`,
//             },
//             body: JSON.stringify({
//                 writtenDate: selectedDate, // Use selectedDate from route params
//                 content: content,
//             }),
//         });

//         if (!res.ok) throw new Error(`등록 실패: ${res.status}`);

//         const resJson = await res.json();
//         const { diaryId } = resJson;

//         Alert.alert('일기 등록 완료!');
//         navigation.navigate('DiaryConfirm', { diaryId, accessToken });
//     } catch (err) {
//         Alert.alert('등록 오류', err.message);
//     }
//   };

//   // Audio recording functions (startRecording, stopRecording, handleRecordButtonPress) from original DiaryWriteScreen
//   async function startRecording() {
//     try {
//       let currentPermissions = await Audio.getPermissionsAsync();
//       if (currentPermissions.status !== 'granted') {
//         const permission = await requestPermission();
//         if (permission.status !== 'granted') {
//           Alert.alert("Permission Denied", "Microphone permission is required to record audio.");
//           return;
//         }
//       }

//       await Audio.setAudioModeAsync({
//         allowsRecordingIOS: true,
//         playsInSilentModeIOS: true,
//       });

//       // Reset content if starting new recording, or decide if audio appends/replaces text
//       // setContent(''); // Optional: clear text when starting recording

//       const { recording: newRecording } = await Audio.Recording.createAsync({
//         isMeteringEnabled: true,
//         // Consider adding audio quality options if needed
//         // android: { extension: '.m4a', outputFormat: Audio.RECORDING_OPTION_ANDROID_OUTPUT_FORMAT_MPEG_4, audioEncoder: Audio.RECORDING_OPTION_ANDROID_AUDIO_ENCODER_AAC, sampleRate: 44100, numberOfChannels: 2, bitRate: 128000, },
//         // ios: { extension: '.m4a', outputFormat: Audio.RECORDING_OPTION_IOS_OUTPUT_FORMAT_MPEG4AAC, audioQuality: Audio.RECORDING_OPTION_IOS_AUDIO_QUALITY_MAX, sampleRate: 44100, numberOfChannels: 2, bitRate: 128000, linearPCMBitDepth: 16, linearPCMIsBigEndian: false, linearPCMIsFloat: false, },
//       });

//       setRecording(newRecording);
//       setIsRecording(true);
//       setRecordedURI(null);
//        if (content.length === 0 && recordedURI === null) { // Clear placeholder text only if no content and no prior recording
//            setContent(''); // Clear text input when recording starts if it's empty.
//        }
//     } catch (err) {
//       Alert.alert("Recording Error", `Could not start recording: ${err.message || err}`);
//     }
//   }

//   async function stopRecording() {
//     setIsRecording(false);
//     if (!recording) return;

//     try {
//       await recording.stopAndUnloadAsync();
//       const uri = recording.getURI();
//       setRecordedURI(uri);
//       await Audio.setAudioModeAsync({ allowsRecordingIOS: false });
//       // Here you might want to do something with the URI, e.g., Speech-to-Text
//       // For now, it's just stored. The handleSubmit will only send `content`.
//     } catch (error) {
//       Alert.alert("Recording Error", `Could not stop recording: ${error.message || error}`);
//     }
//     setRecording(undefined);
//   }

//   const handleRecordButtonPress = () => {
//     if (isRecording) stopRecording();
//     else startRecording();
//   };
  
//   // Temp save button action (placeholder for now)
//   const handleTempSave = () => {
//     Alert.alert("임시저장", "임시저장 기능은 준비 중입니다.");
//     // Potentially call API with ?temp=true
//     // Example:
//     // if (!content.trim()) {
//     //     Alert.alert('내용을 입력해주세요.');
//     //     return;
//     // }
//     // const res = await fetch(`${BASE_URL}/api/diaries?temp=true`, { /* ... similar to handleSubmit ... */ });
//   };


//   return (
//     <SafeAreaView style={styles.safeArea}>
//       <StatusBar barStyle="dark-content" />
//       <View style={styles.contentWrapper}>
//         <KeyboardAvoidingView
//           style={styles.keyboardAvoiding}
//           behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
//           keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0} // Adjusted, as padding is now in contentWrapper
//         >
//           <View style={styles.header}>
//             <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
//               <Ionicons name="chevron-back" size={28} color="#333" />
//             </TouchableOpacity>
//             {/* <View style={styles.headerTitlePlaceholder} /> Removed to allow date to take space */}
//             <Text style={styles.date}>
//                 {dayjs(selectedDate).format('YY.MM.DD')}
//             </Text>
//             <TouchableOpacity onPress={handleSubmit} style={styles.headerButton}>
//               <Text style={styles.submitTextHeader}>등록</Text>
//             </TouchableOpacity>
//           </View>

//           {/* Removed separator, date is now part of header layout implicitly */}
//           {/* <View style={styles.separator} /> */}

//           <View style={styles.mainScrollableContent}>
//             {isRecording ? (
//               <View style={styles.recordingIndicatorContainer}>
//                 <View style={styles.recordingIconBackground}>
//                   <MaterialIcons name="mic" size={width * 0.25} color="#FFFFFF" />
//                 </View>
//                 <Text style={styles.recordingText}>녹음중...</Text>
//               </View>
//             ) : (
//               <TextInput
//                 style={styles.input}
//                 multiline
//                 placeholder="오늘의 일기를 작성해보세요..." // Changed placeholder
//                 placeholderTextColor="#B0B0B0"
//                 value={content}
//                 onChangeText={setContent}
//                 editable={!isRecording} // Keep editable state based on recording
//                 textAlignVertical="top" // From diaryPostSample
//                 autoFocus // Kept from original DiaryWriteScreen
//               />
//             )}
//           </View>

//           {recordedURI && !isRecording && (
//             <View style={styles.playbackContainer}>
//               <Text style={styles.playbackText}>녹음 완료: {recordedURI.split('/').pop()}</Text>
//               {/* Add playback controls here if needed */}
//             </View>
//           )}
//         </KeyboardAvoidingView>
//       </View>

//       <View style={styles.bottomBar}>
//         <TouchableOpacity
//           style={[styles.voiceButton, isRecording && styles.voiceButtonRecording]}
//           onPress={handleRecordButtonPress}
//         >
//           <MaterialIcons name={isRecording ? "stop-circle" : "mic"} size={20} color={isRecording ? "#FFFFFF" : "#4CAF50"} />
//           <Text style={[styles.voiceButtonText, isRecording && styles.voiceButtonTextRecording]}>
//             {isRecording ? '녹음 중지' : '편하게 음성작성'}
//           </Text>
//         </TouchableOpacity>
//         <TouchableOpacity style={styles.tempSaveButton} onPress={handleTempSave}>
//           <Text style={styles.tempSaveButtonText}>임시저장</Text>
//           <MaterialIcons name="folder-open" size={20} color="#757575" />
//         </TouchableOpacity>
//       </View>
//     </SafeAreaView>
//   );
// }

// --- END OF MODIFIED FILE DiaryWriteScreen.js ---

import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Alert,
    StyleSheet,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import dayjs from 'dayjs';

export default function DiaryPostSample() {
    const route = useRoute();
    const navigation = useNavigation();

    const { selectedDate, accessToken } = route.params;
    const [content, setContent] = useState('');

    const BASE_URL = 'http://ceprj.gachon.ac.kr:60021';

    const handleSubmit = async () => {
        if (!content.trim()) {
            Alert.alert('내용을 입력해주세요.');
            return;
        }

        try {
            const res = await fetch(`${BASE_URL}/api/diaries?temp=false`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify({
                    writtenDate: selectedDate,
                    content: content,
                }),
            });

            if (!res.ok) throw new Error(`등록 실패: ${res.status}`);

            const resJson = await res.json();
            const { diaryId } = resJson;

            Alert.alert('일기 등록 완료!');
            navigation.navigate('DiaryConfirm', { diaryId, accessToken }); // ✅ 화면 이동
        } catch (err) {
            Alert.alert('등록 오류', err.message);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.dateText}>
                    {dayjs(selectedDate).format('YY.MM.DD')}
                </Text>
                <TouchableOpacity onPress={handleSubmit}>
                    <Text style={styles.submitText}>등록</Text>
                </TouchableOpacity>
            </View>

            <TextInput
                style={styles.input}
                multiline
                placeholder="오늘의 일기를 작성해보세요..."
                value={content}
                onChangeText={setContent}
                textAlignVertical="top"
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        paddingTop: 60,
        paddingHorizontal: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    dateText: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    submitText: {
        fontSize: 16,
        color: 'green',
        fontWeight: '600',
    },
    input: {
        flex: 1,
        fontSize: 16,
        lineHeight: 24,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 8,
        padding: 16,
        backgroundColor: '#f9f9f9',
    },
});
