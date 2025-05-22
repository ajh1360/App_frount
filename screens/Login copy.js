import React, { useState } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import PropTypes from 'prop-types';


LoginScreen.propTypes = {
    navigation: PropTypes.shape({
        replace: PropTypes.func.isRequired,
        goBack: PropTypes.func.isRequired, // Added for back navigation
        // navigate: PropTypes.func.isRequired, // navigate to SignUp is removed
    }).isRequired,
};


export default function LoginScreen({ navigation }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);

    // const handleLogin = async () => {
    //     try {
    //         const res = await fetch('http://ceprj.gachon.ac.kr:60021/api/auth/login', {
    //             method: 'POST',
    //             headers: { 'Content-Type': 'application/json' },
    //             body: JSON.stringify({ email, password }),
    //         });

    //         if (!res.ok) throw new Error(`Login failed: ${res.status}`);

    //         const data = await res.json();
    //         Alert.alert('로그인 성공');
    //         navigation.replace('MainHome', { accessToken: data.accessToken });
    //     } catch (err) {
    //         Alert.alert('에러', err.message);
    //     }
    // };

    const handleLogin = () => {
        if (email === '1234' && password === '1234') {
            const fakeAccessToken = 'TEST_ACCESS_TOKEN'; // 임시 토큰
            Alert.alert('로그인 성공 (테스트 계정)');
            navigation.replace('MainHome', { accessToken: fakeAccessToken });
        } else {
            Alert.alert('에러', '아이디 또는 비밀번호가 잘못되었습니다.\n테스트 계정: 1234 / 1234');
        }
    };

    // handleGoToSignUp function removed

    return (
        <View style={styles.container}>
            {/* Updated backButton to use navigation.goBack() */}
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
                        color="#555"
                    />
                </TouchableOpacity>
                <Text style={styles.rememberText}>Remember Me</Text>
            </View>

            <Text style={styles.findText}>PW 찾기 | ID 찾기</Text>

            <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
                <Text style={styles.loginButtonText}>로그인</Text>
            </TouchableOpacity>

            {/* 회원가입 버튼 REMOVED */}

            <View style={styles.logoContainer}>
                <Image
                    source={require('../assets/echoLog_logo.png')}
                    style={styles.logoImage}
                />
                <Text style={styles.logoText}>Echo{"\n"}Log</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff', paddingHorizontal: 30, justifyContent: 'center' },
    backButton: { position: 'absolute', top: 60, left: 20, zIndex: 1 /* Ensure it's tappable */ },
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
    },
    loginButton: {
        backgroundColor: '#000',
        borderRadius: 30,
        paddingVertical: 14,
        alignItems: 'center',
        marginBottom: 30, // Increased margin to account for removed SignUp button
    },
    loginButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    // signUpButton and signUpButtonText styles REMOVED
    logoContainer: {
        alignItems: 'center',
        marginTop: 20, // Added some margin top for spacing after login button
    },
    logoImage: {
        width: 32,
        height: 32,
        marginBottom: 6,
    },
    logoText: {
        fontSize: 16,
        color: '#76A488',
        textAlign: 'center',
        fontWeight: '600',
        lineHeight: 20,
    },
});