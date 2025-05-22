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