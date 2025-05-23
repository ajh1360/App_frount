import React, { useState } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import PropTypes from 'prop-types';

import axios from 'axios';

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
    const [phoneNumber, setPhoneNumber] = useState('');
    const [birthDate, setBirthDate] = useState('');

    const [isCheckingEmail, setIsCheckingEmail] = useState(false);

    // const handleSignUp = () => {
    //     if (!name.trim()) {
    //         Alert.alert('오류', '이름을 입력해주세요.');
    //         return;
    //     }
    //     if (!email.trim()) {
    //         Alert.alert('오류', '이메일을 입력해주세요.');
    //         return;
    //     }
    //     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    //     if (!emailRegex.test(email)) {
    //         Alert.alert('오류', '올바른 이메일 형식이 아닙니다.');
    //         return;
    //     }
    //     if (password.length < 6 || password.length > 10) {
    //         Alert.alert('오류', '비밀번호는 6~10자리로 입력해주세요.');
    //         return;
    //     }
    //     if (password !== confirmPassword) {
    //         Alert.alert('오류', '비밀번호가 일치하지 않습니다.');
    //         return;
    //     }
    //     if (!phoneNumber.includes('-') || phoneNumber.length < 10) {
    //         Alert.alert('오류', '-를 포함한 정확한 전화번호를 입력해주세요.');
    //         return;
    //     }
    //     if (birthDate.length !== 6 || !/^\d{6}$/.test(birthDate)) {
    //         Alert.alert('오류', '생년월일은 6자리 숫자로 입력해주세요 (예: 990101).');
    //         return;
    //     }

    //     console.log('Simulating successful signup:', { name, email, phoneNumber, birthDate });
    //     const dummyAccessToken = 'simulated_token_after_signup';
    //     Alert.alert(
    //         '회원가입 완료',
    //         '성공적으로 가입되었습니다! 메인 화면으로 이동합니다.',
    //         [
    //             {
    //                 text: '확인',
    //                 onPress: () => {
    //                     navigation.reset({
    //                         index: 0,
    //                         routes: [{ 
    //                             name: 'MainHome', 
    //                             params: { accessToken: dummyAccessToken } 
    //                         }],
    //                     });
    //                 }
    //             }
    //         ],
    //         { cancelable: false }
    //     );
    // };


    const handleEmailCheck = async () => {
  try {
    const res = await axios.get(`http://서버주소/api/check-email?email=${email}`);
    if (res.data.available) {
      Alert.alert("사용 가능한 이메일입니다.");
    } else {
      Alert.alert("이미 사용 중인 이메일입니다.");
    }
  } catch (error) {
    console.error(error);
    Alert.alert("오류", "이메일 확인 중 오류 발생");
  }
};



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
        if (!phoneNumber.includes('-') || phoneNumber.length < 10) {
            Alert.alert('오류', '-를 포함한 정확한 전화번호를 입력해주세요.');
            return;
        }
        if (birthDate.length !== 6 || !/^\d{6}$/.test(birthDate)) {
            Alert.alert('오류', '생년월일은 6자리 숫자로 입력해주세요 (예: 990101).');
            return;
        }

        try {
            const res = await axios.post('http://ceprj.gachon.ac.kr:60021/api/members', {
                nickname: name,
                email,
                password,
                phoneNumber,
                birthDate,
            });

            const accessToken = res.data.accessToken;

            Alert.alert('회원가입 성공', '환영합니다!', [
                {
                    text: '확인',
                    onPress: () => {
                        navigation.reset({
                            index: 0,
                            routes: [{ name: 'MainHome', params: { accessToken } }],
                        });
                    }
                }
            ]);
        } catch (err) {
            console.error('회원가입 오류:', err);
            if (err.response) {
                // 서버에서 에러 응답이 있을 경우
                Alert.alert('회원가입 실패', err.response.data.message || '이미 등록된 이메일일 수 있습니다.');
            } else {
                Alert.alert('에러', err.message);
            }
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
                    <View style={styles.emailButtonWrapper}>
                        <TouchableOpacity 
                            style={[styles.checkButton, isCheckingEmail && styles.checkButtonDisabled]} 
                            onPress={handleEmailCheck}
                            disabled={isCheckingEmail}
                        >
                            <Text style={styles.checkButtonText}>
                                {isCheckingEmail ? '확인 중...' : '확인'}
                            </Text>
                        </TouchableOpacity>
                    </View>
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