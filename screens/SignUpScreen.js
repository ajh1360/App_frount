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

    // 이메일 중복 확인 관련 상태
    const [isCheckingEmail, setIsCheckingEmail] = useState(false);
    const [isEmailVerified, setIsEmailVerified] = useState(false); // 이메일 중복 확인 통과 여부

    const handleEmailChange = (text) => {
        setEmail(text);
        setIsEmailVerified(false); // 이메일이 변경되면 확인 상태 초기화
    };

     const handleEmailCheck = async () => {
        if (!email.trim()) {
            Alert.alert('알림', '이메일을 입력해주세요.');
            return;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            Alert.alert('오류', '올바른 이메일 형식이 아닙니다.');
            return;
        }

        console.log('handleEmailCheck: Started. Setting isCheckingEmail to true.');
        setIsCheckingEmail(true);
        setIsEmailVerified(false);
        try {
            const encodedEmail = encodeURIComponent(email);
            const apiUrl = `http://ceprj.gachon.ac.kr:60021/api/auth/exist/${encodedEmail}`;
            console.log('Email Check - API URL:', apiUrl);
            const response = await fetch(apiUrl);
            
            console.log('Email Check - Response Status:', response.status);
            console.log('Email Check - Response OK?:', response.ok);

            const responseText = await response.text();
            console.log('Email Check - Response Text:', responseText);

            if (response.ok) {
                let emailExists = false; // 기본값을 false로 설정
                let parsedData = null;

                try {
                    parsedData = JSON.parse(responseText);
                    console.log('Email Check - Parsed JSON Data:', parsedData);

                    if (parsedData && typeof parsedData.exist === 'boolean') { // 'exist' 키가 있고, 그 값이 boolean인지 확인
                        emailExists = parsedData.exist;
                        console.log(`Email Check - 'parsedData.exist' is boolean: ${parsedData.exist}. emailExists set to: ${emailExists}`);
                    } else if (parsedData && typeof parsedData.exist !== 'undefined') {
                        // 'exist' 키는 있지만 boolean이 아닌 경우 (예: 문자열 "true")
                        console.warn(`Email Check - 'parsedData.exist' is not a boolean, it's: ${typeof parsedData.exist}, value: ${parsedData.exist}. Attempting conversion.`);
                        if (String(parsedData.exist).toLowerCase() === 'true') {
                            emailExists = true;
                        } else if (String(parsedData.exist).toLowerCase() === 'false') {
                            emailExists = false;
                        } else {
                            console.error('Email Check - parsedData.exist is neither boolean nor "true"/"false" string.');
                            Alert.alert('알림', '이메일 확인 응답이 예상치 못한 형식입니다. (exist 값 오류)');
                            setIsEmailVerified(false);
                            return; // finally로 이동
                        }
                        console.log(`Email Check - after string conversion, emailExists set to: ${emailExists}`);
                    } else {
                         console.warn('Email Check - JSON parsed but "exist" key not found or undefined.', parsedData);
                         // "exist" 키가 없는 경우, 혹시 responseText 자체가 "true" / "false"인지 확인 (가능성 낮음)
                         if (responseText.toLowerCase() === 'true') {
                            emailExists = true;
                         } else if (responseText.toLowerCase() === 'false') {
                            emailExists = false;
                         } else {
                            Alert.alert('알림', '이메일 확인 응답 형식을 분석할 수 없습니다. ("exist" 키 부재)');
                            setIsEmailVerified(false);
                            return; // finally로 이동
                         }
                         console.log(`Email Check - after direct responseText check, emailExists set to: ${emailExists}`);
                    }
                } catch (jsonError) {
                    console.error('Email Check - JSON.parse error:', jsonError.message, 'Treating responseText as plain text.');
                    if (responseText.toLowerCase() === 'true') {
                        emailExists = true;
                    } else if (responseText.toLowerCase() === 'false') {
                        emailExists = false;
                    } else {
                        Alert.alert('오류', '이메일 확인 중 응답 형식이 올바르지 않습니다 (텍스트도 true/false가 아님).');
                        setIsEmailVerified(false);
                        return; // finally로 이동
                    }
                    console.log(`Email Check - after JSON.parse error and plain text check, emailExists set to: ${emailExists}`);
                }

                // emailExists 값과 타입 최종 확인
                console.log('Email Check - Final value of emailExists before alert:', emailExists);
                console.log('Email Check - Final type of emailExists before alert:', typeof emailExists);

                if (emailExists === true) { // 명시적으로 true와 비교
                    try {
                        console.log("Attempting to show '이미 사용 중인 이메일입니다.' alert.");
                        Alert.alert('알림', '이미 사용 중인 이메일입니다.');
                        console.log("'이미 사용 중인 이메일입니다.' alert should have been shown.");
                    } catch (alertError) {
                        console.error("Error showing '이미 사용 중인 이메일입니다.' alert:", alertError);
                    }
                    setIsEmailVerified(false);
                    console.log("setIsEmailVerified(false) called.");
                } else if (emailExists === false) { // 명시적으로 false와 비교
                    try {
                        console.log("Attempting to show '사용 가능한 이메일입니다.' alert.");
                        Alert.alert('알림', '사용 가능한 이메일입니다.');
                        console.log("'사용 가능한 이메일입니다.' alert should have been shown.");
                    } catch (alertError) {
                        console.error("Error showing '사용 가능한 이메일입니다.' alert:", alertError);
                    }
                    setIsEmailVerified(true);
                    console.log("setIsEmailVerified(true) called.");
                } else {
                    // emailExists가 true도 false도 아닌 경우 (로직 오류 가능성)
                    console.error('Email Check - emailExists is neither true nor false. Value:', emailExists);
                    Alert.alert('오류', '이메일 확인 로직에 문제가 발생했습니다. 관리자에게 문의하세요.');
                    setIsEmailVerified(false);
                }

            } else { // response.ok 가 false 인 경우 (서버 에러)
                let errorMessage = `이메일 중복 확인 실패 (상태 코드: ${response.status})`;
                try {
                    const errData = JSON.parse(responseText);
                    errorMessage = errData.message || errData.error || (responseText || errorMessage);
                } catch (e) {
                    if (responseText) errorMessage = responseText;
                }
                console.error('Email Check - Server error. Message:', errorMessage);
                Alert.alert('오류', errorMessage);
                setIsEmailVerified(false);
            }
        } catch (error) { // fetch 자체의 오류 또는 네트워크 오류
            console.error('Email check - Outer catch error:', error.message, error.stack);
            Alert.alert('오류', '이메일 중복 확인 중 오류가 발생했습니다. 네트워크 연결을 확인해주세요.');
            setIsEmailVerified(false);
        } finally {
            console.log('handleEmailCheck: Finally block. Setting isCheckingEmail to false.');
            setIsCheckingEmail(false);
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
        // 이메일 중복 확인 여부 체크
        if (!isEmailVerified) {
            Alert.alert('알림', '이메일 중복 확인을 완료해주세요.');
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
        const yearDigits = birthDate.substring(0, 2);
        const month = birthDate.substring(2, 4);
        const day = birthDate.substring(4, 6);

        const currentYearLastTwoDigits = new Date().getFullYear() % 100;
        const yearPrefix = parseInt(yearDigits, 10) <= (currentYearLastTwoDigits + 5) ? '20' : '19';
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

        try {
            const response = await fetch('http://ceprj.gachon.ac.kr:60021/api/members', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody),
            });

            console.log('Server Response Status:', response.status);
            console.log('Server Response OK?:', response.ok);

            if (!response.ok) {
                const errData = await response.json().catch(() => ({ message: "서버 응답 JSON 파싱 실패 또는 내용 없음" }));
                console.error('Server Error Data:', errData);
                throw new Error(errData.message || `서버 오류: ${response.status}`);
            }

            console.log('회원가입 성공 - 로그인 페이지로 이동 중');
            Alert.alert('성공', '회원가입이 완료되었습니다. 로그인 페이지로 이동합니다.'); // 사용자에게 성공 알림 추가
            navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }],
            });
        
        } catch (err) {
            console.error('회원가입 전체 오류:', err);
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

                <View style={styles.emailRow}>
                    <View style={styles.emailTextInputWrapper}>
                        <TextInput
                            style={styles.emailInput}
                            placeholder="이메일"
                            placeholderTextColor="#BDBDBD"
                            value={email}
                            onChangeText={handleEmailChange} // 수정된 핸들러 사용
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                    </View>
                    <View style={styles.emailButtonWrapper}>
                        <TouchableOpacity 
                            style={[
                                styles.checkButton, 
                                (isCheckingEmail || !email.trim() || email.length === 0) && styles.checkButtonDisabled
                            ]} 
                            onPress={handleEmailCheck}
                            disabled={isCheckingEmail || !email.trim() || email.length === 0} // 이메일이 비어있거나 확인 중일 때 비활성화
                        >
                            <Text style={styles.checkButtonText}>
                                {isCheckingEmail ? '확인 중...' : '중복 확인'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
                {/* 이메일 확인 결과 메시지 (선택적 UI 요소) */}
                {/* {email.length > 0 && isEmailVerified === true && <Text style={styles.successText}>사용 가능한 이메일입니다.</Text>} */}
                {/* {email.length > 0 && isEmailVerified === false && emailCheckAttempted && <Text style={styles.errorText}>이미 사용 중이거나 확인할 수 없는 이메일입니다.</Text>} */}


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
    emailRow: {
        flexDirection: 'row',
        marginBottom: 18,
        alignItems: 'center', // 버튼과 인풋 높이 정렬을 위해 추가
    },
    emailTextInputWrapper: {
        flex: 1, // TextInput이 남은 공간을 모두 차지하도록
        // 높이를 버튼과 유사하게 맞추기 위해 emailInput 스타일에서 paddingVertical 조정 가능
    },
    emailInput: {
        backgroundColor: '#F6F6F6', // Wrapper에서 배경색을 관리할 수도 있음
        borderTopLeftRadius: 8,
        borderBottomLeftRadius: 8,
        paddingVertical: 15,
        paddingHorizontal: 20,
        fontSize: 15,
        color: '#000',
        borderWidth: 1,
        borderColor: '#E8E8E8',
        borderRightWidth: 0, // 버튼과 이어지는 느낌을 위해 오른쪽 테두리 제거
    },
    emailButtonWrapper: {
        // marginLeft: 0, // emailInput에서 borderRightWidth를 0으로 했으므로 간격 없음
    },
    checkButton: {
        backgroundColor: '#767676',
        borderTopRightRadius: 8, // TextInput과 자연스럽게 이어지도록
        borderBottomRightRadius: 8, // TextInput과 자연스럽게 이어지도록
        paddingVertical: 15, // emailInput과 높이를 맞추기 위해 paddingVertical 통일
        paddingHorizontal: 15,
        justifyContent: 'center',
        alignItems: 'center',
        height: 50, // emailInput의 예상 높이와 유사하게 (paddingVertical*2 + fontSize 고려)
                     // 또는 emailInput과 동일한 paddingVertical을 주고 height 대신 minHeight 사용
        borderWidth: 1,
        borderColor: '#E8E8E8',
        borderLeftWidth: 0, // 버튼과 이어지는 느낌을 위해 왼쪽 테두리 제거
    },
    checkButtonDisabled: {
        backgroundColor: '#BDBDBD',
    },
    checkButtonText: {
        color: '#fff',
        fontSize: 13, // 버튼 텍스트 크기
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
    // (선택적) 이메일 확인 결과 텍스트 스타일
    // successText: {
    //     color: 'green',
    //     fontSize: 12,
    //     marginBottom: 10,
    //     marginLeft: 5,
    // },
    // errorText: {
    //     color: 'red',
    //     fontSize: 12,
    //     marginBottom: 10,
    //     marginLeft: 5,
    // },
});