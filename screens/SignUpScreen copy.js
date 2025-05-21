import React, { useState } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import PropTypes from 'prop-types';

SignUpScreen.propTypes = {
    navigation: PropTypes.shape({
        goBack: PropTypes.func.isRequired,
    }).isRequired,
};

export default function SignUpScreen({ navigation }) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [birthDate, setBirthDate] = useState('');

    const handleSignUp = () => {
        // 유효성 검사
        if (!name.trim()) {
            Alert.alert('오류', '이름을 입력해주세요.');
            return;
        }
        if (!email.trim()) {
            Alert.alert('오류', '이메일을 입력해주세요.');
            return;
        }
        // 간단한 이메일 형식 검사
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
        if (!phoneNumber.includes('-') || phoneNumber.length < 10) { // 간단한 형식 검사
            Alert.alert('오류', '-를 포함한 정확한 전화번호를 입력해주세요.');
            return;
        }
        if (birthDate.length !== 6 || !/^\d{6}$/.test(birthDate)) {
            Alert.alert('오류', '생년월일은 6자리 숫자로 입력해주세요 (예: 990101).');
            return;
        }

        // TODO: 실제 회원가입 API 호출 로직 구현
        Alert.alert('회원가입 시도', `이름: ${name}\n이메일: ${email}\n전화번호: ${phoneNumber}\n생년월일: ${birthDate}`);
        // 성공 시 navigation.navigate('Login') 또는 다른 화면으로 이동
    };

    const handleEmailCheck = () => {
        // TODO: 이메일 중복 확인 API 호출 로직 구현
        if (!email.trim()) {
            Alert.alert('이메일 확인', '이메일을 입력해주세요.');
            return;
        }
        Alert.alert('이메일 확인', `${email} 중복 확인 기능 구현 필요`);
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

                <View style={styles.emailContainer}>
                    <TextInput
                        style={styles.emailInput}
                        placeholder="이메일"
                        placeholderTextColor="#BDBDBD"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />
                    <TouchableOpacity style={styles.checkButton} onPress={handleEmailCheck}>
                        <Text style={styles.checkButtonText}>확인</Text>
                    </TouchableOpacity>
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
                    value={phoneNumber}
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
        paddingHorizontal: 25, // 이미지와 유사하게 조정
        paddingTop: 80, // 뒤로가기 버튼 및 타이틀 공간 확보
        paddingBottom: 40,
    },
    backButton: {
        position: 'absolute',
        top: 50, // 상태바 높이 고려
        left: 15,
        zIndex: 1,
        padding: 10, // 터치 영역 확보
    },
    title: {
        fontSize: 34, // 이미지와 유사하게 조정
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 30, // 입력 필드와의 간격
        // marginLeft: 10, // 이미지에서는 약간 왼쪽 정렬
    },
    input: {
        backgroundColor: '#F6F6F6', // 이미지와 유사한 배경색
        borderRadius: 8, // 이미지와 유사한 radius
        paddingVertical: 15,
        paddingHorizontal: 20,
        fontSize: 15,
        marginBottom: 18, // 입력 필드 간 간격
        color: '#000', // 입력 텍스트 색상
        borderWidth: 1,
        borderColor: '#E8E8E8' // 약간의 테두리
    },
    emailContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F6F6F6',
        borderRadius: 8,
        marginBottom: 18,
        borderWidth: 1,
        borderColor: '#E8E8E8'
        // paddingRight: 10, // 버튼을 위한 내부 오른쪽 여백은 버튼 스타일에서 처리
    },
    emailInput: {
        flex: 1,
        paddingVertical: 15,
        paddingHorizontal: 20,
        fontSize: 15,
        color: '#000',
    },
    checkButton: {
        backgroundColor: '#A0A0A0', // 이미지의 회색 버튼
        borderRadius: 5,
        paddingVertical: 10,
        paddingHorizontal: 15,
        marginRight: 10, // 입력 필드 테두리 안쪽에 위치하도록
    },
    checkButtonText: {
        color: '#fff',
        fontSize: 13,
        fontWeight: '500',
    },
    signUpProcessButton: {
        backgroundColor: '#000',
        borderRadius: 8, // 이미지와 유사한 radius
        paddingVertical: 18,
        alignItems: 'center',
        marginTop: 25, // 입력 필드 그룹과의 간격
    },
    signUpProcessButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});