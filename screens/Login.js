import React, { useState, useEffect } from 'react'; // useEffect 추가
import {
    View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import PropTypes from 'prop-types';


LoginScreen.propTypes = {
    navigation: PropTypes.shape({
        replace: PropTypes.func.isRequired,
        goBack: PropTypes.func.isRequired,
    }).isRequired,
};


export default function LoginScreen({ navigation }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);

    // 컴포넌트 마운트 시 저장된 자격 증명 불러오기
    useEffect(() => {
        const loadCredentials = async () => {
            try {
                const storedRememberMe = await AsyncStorage.getItem('rememberMe');
                if (storedRememberMe === 'true') {
                    const storedEmail = await AsyncStorage.getItem('storedEmail');
                    const storedPassword = await AsyncStorage.getItem('storedPassword');

                    if (storedEmail && storedPassword) {
                        setEmail(storedEmail);
                        setPassword(storedPassword);
                        setRememberMe(true); // UI의 체크박스 상태도 업데이트
                    } else {
                        // rememberMe는 true인데 이메일/비번이 없는 비정상 상황. 정리.
                        await AsyncStorage.removeItem('rememberMe');
                        await AsyncStorage.removeItem('storedEmail');
                        await AsyncStorage.removeItem('storedPassword');
                        setRememberMe(false);
                    }
                } else {
                    // rememberMe가 false이거나 설정되지 않은 경우, 필드를 채우지 않고 rememberMe 상태를 false로 유지.
                    // 혹시 모를 잔여 데이터 정리 (선택적)
                    // await AsyncStorage.removeItem('storedEmail');
                    // await AsyncStorage.removeItem('storedPassword');
                    setRememberMe(false);
                }
            } catch (e) {
                console.error('Failed to load credentials.', e);
                Alert.alert('Error', 'Failed to load stored credentials.');
                setRememberMe(false); // 에러 발생 시 기본값으로 설정
            }
        };
        loadCredentials();
    }, []); // 빈 배열: 컴포넌트 마운트 시 한 번만 실행

    const handleLogin = async () => {
        try {
            const res = await fetch('http://ceprj.gachon.ac.kr:60021/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            if (!res.ok) throw new Error(`Login failed: ${res.status}`); // 템플릿 리터럴 수정

            const data = await res.json();

            // ✅ 토큰 저장
            await AsyncStorage.setItem('accessToken', data.accessToken);

            // ✅ "Remember Me" 상태에 따라 이메일/비밀번호 저장 또는 삭제
            if (rememberMe) {
                await AsyncStorage.setItem('storedEmail', email);
                await AsyncStorage.setItem('storedPassword', password);
                await AsyncStorage.setItem('rememberMe', 'true'); // 문자열로 저장
            } else {
                await AsyncStorage.removeItem('storedEmail');
                await AsyncStorage.removeItem('storedPassword');
                await AsyncStorage.removeItem('rememberMe');
            }

            // ✅ 홈 화면으로 이동
            navigation.replace('MainHome', { accessToken: data.accessToken });
        } catch (err) {
            Alert.alert('에러', err.message);
        }
    };


    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                <Icon name="chevron-back" size={24} color="#000" />
            </TouchableOpacity>

            <Text style={styles.title}>Log In</Text>

            <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor="#aaa"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address" // 이메일 키보드 타입 추가
                autoCapitalize="none" // 자동 대문자 비활성화
            />

            <View style={styles.passwordContainer}>
                <TextInput
                    style={styles.passwordInput}
                    placeholder="Password"
                    placeholderTextColor="#aaa"
                    value={password}
                    secureTextEntry={!showPassword}
                    onChangeText={setPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                    <Text style={styles.showText}>{showPassword ? 'Hide' : 'Show'}</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.rememberContainer}>
                <TouchableOpacity onPress={() => setRememberMe(!rememberMe)}>
                    <Icon
                        name={rememberMe ? "checkmark-circle" : "ellipse-outline"}
                        size={18}
                        color={rememberMe ? "#007AFF" : "#555"} // 체크 시 색상 변경 (선택적)
                    />
                </TouchableOpacity>
                <Text style={styles.rememberText}>Remember Me</Text>
            </View>

           
            <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
                <Text style={styles.loginButtonText}>로그인</Text>
            </TouchableOpacity>

            <View style={styles.logoContainer}>
                <Image
                    source={require('../assets/echoLog_logo.png')}
                    style={styles.logoImage}
                    resizeMode="contain" // Image 컴포넌트의 속성으로 resizeMode 적용
                />
            </View>
        </View>
    );
}


const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff', paddingHorizontal: 30, justifyContent: 'center' },
    backButton: { position: 'absolute', top: 60, left: 20, zIndex: 1 },
    title: { fontSize: 38, fontWeight: '600', alignSelf: 'center', marginBottom: 30 },
    input: {
        backgroundColor: '#F2F2F2',
        borderRadius: 12,
        paddingVertical: 14,
        paddingHorizontal: 18,
        fontSize: 16,
        marginBottom: 12,
        color: '#000',
    },
    passwordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F2F2F2',
        borderRadius: 12,
        paddingHorizontal: 18,
        marginBottom: 10,
    },
    passwordInput: {
        flex: 1,
        paddingVertical: 14,
        fontSize: 16,
        color: '#000',
    },
    showText: {
        color: '#555',
        fontWeight: '500',
    },
    rememberContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
        alignSelf: 'flex-start', // 왼쪽 정렬을 위해 추가
        paddingLeft: 5, // 약간의 왼쪽 패딩
    },
    rememberText: {
        marginLeft: 8,
        fontSize: 14,
        color: '#555',
    },
    findText: {
        fontSize: 13,
        color: '#888',
        alignSelf: 'center',
        marginBottom: 20,
        marginTop: 10, // rememberMe 컨테이너와의 간격 조정
    },
    loginButton: {
        backgroundColor: '#000',
        borderRadius: 30,
        paddingVertical: 14,
        alignItems: 'center',
        marginBottom: 30,
    },
    loginButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    logoContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
    },
    logoImage: {
        width: 240,
        height: 100,
        // resizeMode="contain"은 Image 컴포넌트 속성으로 이동했습니다.
    },
});
