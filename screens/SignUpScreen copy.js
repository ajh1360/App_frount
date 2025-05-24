import React, { useState } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import PropTypes from 'prop-types';


SignUpScreen.propTypes = {
    navigation: PropTypes.shape({
        goBack: PropTypes.func.isRequired,
        navigate: PropTypes.func.isRequired,
        reset: PropTypes.func.isRequired,
    }).isRequired,
};

export default function SignUpScreen({ navigation }) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [phone, setPhoneNumber] = useState('');
    const [birthDate, setBirthDate] = useState('');

    const handleSignUp = async () => {
    if (!name.trim()) {
        Alert.alert('오류', '이름을 입력해주세요.');
        return;
    }
    if (!email.trim()) {
        Alert.alert('오류', '이메일을 입력해주세요.');
        return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        Alert.alert('오류', '올바른 이메일 형식이 아닙니다.');
        return;
    }
    if (password.length < 6 || password.length > 10) {
        Alert.alert('오류', '비밀번호는 6~10자리로 입력해주세요.');
        return;
    }
    if (password !== confirmPassword) {
        Alert.alert('오류', '비밀번호가 일치하지 않습니다.');
        return;
    }
    if (!phone.includes('-') || phone.length < 10) {
        Alert.alert('오류', '-를 포함한 정확한 전화번호를 입력해주세요.');
        return;
    }
    if (birthDate.length !== 6 || !/^\d{6}$/.test(birthDate)) {
    Alert.alert('오류', '생년월일은 6자리 숫자로 입력해주세요 (예: 990101).');
    return;
}
    const yearDigits = birthDate.substring(0, 2);      // yearDigits 정의
    const month = birthDate.substring(2, 4);         // month 정의
    const day = birthDate.substring(4, 6);           // day 정의

    const currentYearLastTwoDigits = new Date().getFullYear() % 100;
    // yearPrefix 계산 시 yearDigits 사용 (이미 정의되어 있어야 함)
    const yearPrefix = parseInt(yearDigits, 10) <= (currentYearLastTwoDigits + 5) ? '20' : '19';

    // formattedBirthDate 생성 시 yearDigits, month, day 사용 (이미 정의되어 있어야 함)
    const formattedBirthDate = `${yearPrefix}${yearDigits}-${month}-${day}`;

    const requestBody = {
        name: name,
        email,
        password,
        phone,
        birthDate: formattedBirthDate,
        role: "USER"
    };

    console.log('Request Body to Server:', JSON.stringify(requestBody, null, 2));


    // SignUpScreen.js - handleSignUp 함수 내
// ... (requestBody 로깅 후)

try {
    const response = await fetch('http://ceprj.gachon.ac.kr:60021/api/members', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
    });

    console.log('Server Response Status:', response.status); // 서버 응답 상태 코드
    console.log('Server Response OK?:', response.ok);       // response.ok 값 (true/false)

    if (!response.ok) {
        // 에러 응답 본문 확인
        const errData = await response.json().catch(() => ({ message: "서버 응답 JSON 파싱 실패 또는 내용 없음" })); // JSON 파싱 실패 대비
        console.error('Server Error Data:', errData);
        throw new Error(errData.message || `서버 오류: ${response.status}`);
    }


    console.log('회원가입 성공 - 로그인 페이지로 이동 중');
    navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
    });

    
    } catch (err) {
        console.error('회원가입 전체 오류:', err); // 전체 try-catch 블록에서 잡힌 오류
        Alert.alert('회원가입 실패', err.message || '알 수 없는 오류가 발생했습니다.');
    }
};





    return (
        <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
            <View style={styles.container}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Icon name="chevron-back" size={28} color="#000" />
                </TouchableOpacity>

                <Text style={styles.title}>Sign Up</Text>

                <TextInput
                    style={styles.input}
                    placeholder="이름"
                    placeholderTextColor="#BDBDBD"
                    value={name}
                    onChangeText={setName}
                />

                {/* Modified Email Input Structure */}
                <View style={styles.emailRow}>
                    <View style={styles.emailTextInputWrapper}>
                        <TextInput
                            style={styles.emailInput}
                            placeholder="이메일"
                            placeholderTextColor="#BDBDBD"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                    </View>
                    {/* <View style={styles.emailButtonWrapper}>
                        <TouchableOpacity 
                            style={[styles.checkButton, isCheckingEmail && styles.checkButtonDisabled]} 
                            onPress={handleEmailCheck}
                            disabled={isCheckingEmail}
                        >
                            <Text style={styles.checkButtonText}>
                                {isCheckingEmail ? '확인 중...' : '확인'}
                            </Text>
                        </TouchableOpacity>
                    </View> */}
                </View>

                <TextInput
                    style={styles.input}
                    placeholder="비밀번호 (6-10자리)"
                    placeholderTextColor="#BDBDBD"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                />

                <TextInput
                    style={styles.input}
                    placeholder="비밀번호 확인"
                    placeholderTextColor="#BDBDBD"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry
                />

                <TextInput
                    style={styles.input}
                    placeholder="-를 포함한 전화번호"
                    placeholderTextColor="#BDBDBD"
                    value={phone}
                    onChangeText={setPhoneNumber}
                    keyboardType="phone-pad"
                />

                <TextInput
                    style={styles.input}
                    placeholder="생년월일 6자리 (예: 990101)"
                    placeholderTextColor="#BDBDBD"
                    value={birthDate}
                    onChangeText={setBirthDate}
                    keyboardType="number-pad"
                    maxLength={6}
                />

                <TouchableOpacity style={styles.signUpProcessButton} onPress={handleSignUp}>
                    <Text style={styles.signUpProcessButtonText}>가입완료</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    scrollContainer: {
        flexGrow: 1,
        backgroundColor: '#fff',
    },
    container: {
        flex: 1,
        paddingHorizontal: 25,
        paddingTop: 80,
        paddingBottom: 40,
    },
    backButton: {
        position: 'absolute',
        top: 50,
        left: 15,
        zIndex: 1,
        padding: 10,
    },
    title: {
        fontSize: 34,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 30,
    },
    input: {
        backgroundColor: '#F6F6F6',
        borderRadius: 8,
        paddingVertical: 15,
        paddingHorizontal: 20,
        fontSize: 15,
        marginBottom: 18,
        color: '#000',
        borderWidth: 1,
        borderColor: '#E8E8E8'
    },
    // Styles for the composite email input field
    emailRow: {
    flexDirection: 'row',
    marginBottom: 18,
    },
    emailTextInputWrapper: {
    flex: 1,
    backgroundColor: '#F6F6F6',
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    justifyContent: 'center',
    },
    emailInput: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    fontSize: 15,
    color: '#000',
    },

// emailButtonWrapper: 버튼 영역 스타일
    emailButtonWrapper: {
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 8,
    },

    // checkButton: 독립된 버튼 높이와 패딩
    checkButton: {
        backgroundColor: '#767676',
        borderRadius: 5,
        paddingVertical: 10,
        paddingHorizontal: 15,
        minHeight: 45, // 버튼 높이를 고정
        justifyContent: 'center',
    },
    checkButtonDisabled: {
        backgroundColor: '#BDBDBD',
    },
    checkButtonText: {
        color: '#fff',
        fontSize: 13,
        fontWeight: '500',
    },
    signUpProcessButton: {
        backgroundColor: '#000',
        borderRadius: 8,
        paddingVertical: 18,
        alignItems: 'center',
        marginTop: 25,
    },
    signUpProcessButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});