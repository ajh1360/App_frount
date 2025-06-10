import React, { useState } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Modal, Pressable, ActivityIndicator 
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


    const [isCheckingEmail, setIsCheckingEmail] = useState(false);
    const [isEmailVerified, setIsEmailVerified] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [modalMessage, setModalMessage] = useState('');
    const [modalTitle, setModalTitle] = useState('');

    const showCustomModal = (title, message) => {
        setModalTitle(title);
        setModalMessage(message);
        setModalVisible(true);
    };

    const hideCustomModal = () => {
        setModalVisible(false);
        setModalTitle('');
        setModalMessage('');
    };

    const handleEmailChange = (text) => {
        setEmail(text);
        setIsEmailVerified(false);
    };

     const handleEmailCheck = async () => {
        if (!email.trim()) {
            showCustomModal('알림', '이메일을 입력해주세요.');
            return;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            showCustomModal('오류', '올바른 이메일 형식이 아닙니다.');
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
                let emailExists = false;
                let parsedData = null;

                try {
                    parsedData = JSON.parse(responseText);
                    console.log('Email Check - Parsed JSON Data:', parsedData);

                    if (parsedData && typeof parsedData.exist === 'boolean') {
                        emailExists = parsedData.exist;
                    } else if (parsedData && typeof parsedData.exist !== 'undefined') {
                        if (String(parsedData.exist).toLowerCase() === 'true') {
                            emailExists = true;
                        } else if (String(parsedData.exist).toLowerCase() === 'false') {
                            emailExists = false;
                        } else {
                            showCustomModal('알림', '이메일 확인 응답이 예상치 못한 형식입니다. (exist 값 오류)');
                            setIsEmailVerified(false);
                            return;
                        }
                    } else {
                         if (responseText.toLowerCase() === 'true') {
                            emailExists = true;
                         } else if (responseText.toLowerCase() === 'false') {
                            emailExists = false;
                         } else {
                            showCustomModal('알림', '이메일 확인 응답 형식을 분석할 수 없습니다. ("exist" 키 부재)');
                            setIsEmailVerified(false);
                            return;
                         }
                    }
                } catch (jsonError) {
                    if (responseText.toLowerCase() === 'true') {
                        emailExists = true;
                    } else if (responseText.toLowerCase() === 'false') {
                        emailExists = false;
                    } else {
                        showCustomModal('오류', '이메일 확인 중 응답 형식이 올바르지 않습니다 (텍스트도 true/false가 아님).');
                        setIsEmailVerified(false);
                        return;
                    }
                }

                if (emailExists === true) {
                    showCustomModal('알림', '이미 사용 중인 이메일입니다.');
                    setIsEmailVerified(false);
                } else if (emailExists === false) {
                    showCustomModal('알림', '사용 가능한 이메일입니다.');
                    setIsEmailVerified(true);
                } else {
                    showCustomModal('오류', '이메일 확인 로직에 문제가 발생했습니다. 관리자에게 문의하세요.');
                    setIsEmailVerified(false);
                }

            } else {
                let errorMessage = `이메일 중복 확인 실패 (상태 코드: ${response.status})`;
                try {
                    const errData = JSON.parse(responseText);
                    errorMessage = errData.message || errData.error || (responseText || errorMessage);
                } catch (e) {
                    if (responseText) errorMessage = responseText;
                }
                showCustomModal('오류', errorMessage);
                setIsEmailVerified(false);
            }
        } catch (error) {
            console.error('Email check - Outer catch error:', error.message, error.stack);
            showCustomModal('오류', '이메일 중복 확인 중 오류가 발생했습니다. 네트워크 연결을 확인해주세요.');
            setIsEmailVerified(false);
        } finally {
            console.log('handleEmailCheck: Finally block. Setting isCheckingEmail to false.');
            setIsCheckingEmail(false);
        }
    };

    const handleSignUp = async () => {
        if (!name.trim()) {
            showCustomModal('오류', '이름을 입력해주세요.');
            return;
        }
        if (!email.trim()) {
            showCustomModal('오류', '이메일을 입력해주세요.');
            return;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            showCustomModal('오류', '올바른 이메일 형식이 아닙니다.');
            return;
        }
        if (!isEmailVerified) {
            showCustomModal('알림', '이메일 중복 확인을 완료해주세요.');
            return;
        }
        if (password.length < 6 || password.length > 10) {
            showCustomModal('오류', '비밀번호는 6~10자리로 입력해주세요.');
            return;
        }
        if (password !== confirmPassword) {
            showCustomModal('오류', '비밀번호가 일치하지 않습니다.');
            return;
        }
        if (!phone.includes('-') || phone.length < 10) {
            showCustomModal('오류', '-를 포함한 정확한 전화번호를 입력해주세요.');
            return;
        }
        if (birthDate.length !== 6 || !/^\d{6}$/.test(birthDate)) {
            showCustomModal('오류', '생년월일은 6자리 숫자로 입력해주세요 (예: 990101).');
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

        try {
            const response = await fetch('http://ceprj.gachon.ac.kr:60021/api/members', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody),
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => ({ message: "서버 응답 JSON 파싱 실패 또는 내용 없음" }));
                showCustomModal('회원가입 실패', errData.message || `서버 오류: ${response.status}`);
                return; 
            }

            
            setModalTitle('성공');
            setModalMessage('회원가입이 완료되었습니다. 로그인 페이지로 이동합니다.');
            setModalVisible(true);
        
        } catch (err) {
            console.error('회원가입 전체 오류:', err);
            showCustomModal('회원가입 실패', err.message || '알 수 없는 오류가 발생했습니다.');
        }
    };

    // 모달 확인 버튼 클릭 시 처리 (회원가입 성공 후)
    const handleModalConfirm = () => {
        hideCustomModal();
        if (modalTitle === '성공' && modalMessage.includes('회원가입이 완료되었습니다')) {
            navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }],
            });
        }
    };


    return (
        <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
            <View style={styles.container}>
           
                <Modal
                    animationType="fade"
                    transparent={true}
                    visible={modalVisible}
                    onRequestClose={hideCustomModal}
                >
                    <Pressable style={styles.modalOverlay} onPress={hideCustomModal}>
                        <Pressable style={styles.modalView} onPress={() => {}}>  
                            <Text style={styles.modalTitle}>{modalTitle}</Text>
                            <Text style={styles.modalMessage}>{modalMessage}</Text>
                            <TouchableOpacity
                                style={styles.modalButton}
                                onPress={handleModalConfirm} 
                            >
                                <Text style={styles.modalButtonText}>확인</Text>
                            </TouchableOpacity>
                        </Pressable>
                    </Pressable>
                </Modal>


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
                            onChangeText={handleEmailChange}
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
                            disabled={isCheckingEmail || !email.trim() || email.length === 0}
                        >
                            {isCheckingEmail ? (
                                <ActivityIndicator size="small" color="#fff" />
                            ) : (
                                <Text style={styles.checkButtonText}>확인</Text>
                            )}
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
        alignItems: 'center',
    },
    emailTextInputWrapper: {
        flex: 1, 
    },
    emailInput: {
        backgroundColor: '#F6F6F6',
        borderRadius: 25, 
        paddingVertical: 15,
        paddingHorizontal: 20,
        fontSize: 15,
        color: '#000',
        borderWidth: 1,
        borderColor: '#E8E8E8', 
    },
    emailButtonWrapper: {
        marginLeft: 8, 
    },
    checkButton: {
        backgroundColor: '#8A8A8A',
        width: 50,                 
        height: 50,                
        borderRadius: 13,          
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkButtonDisabled: {
        backgroundColor: '#BDBDBD', 
    },
    checkButtonText: {
        color: '#fff',
        fontSize: 14, 
        fontWeight: 'bold', 
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
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)', 
    },
    modalView: {
        margin: 20,
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 35,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        minWidth: 300, 
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 15,
        textAlign: 'center',
    },
    modalMessage: {
        marginBottom: 20,
        textAlign: 'center',
        fontSize: 16,
        lineHeight: 24,
    },
    modalButton: {
        backgroundColor: '#000',
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 30,
        elevation: 2,
    },
    modalButtonText: {
        color: 'white',
        fontWeight: 'bold',
        textAlign: 'center',
        fontSize: 16,
    },
});