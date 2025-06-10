import React, { useState, useEffect } from 'react'; 
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
                        setRememberMe(true); 
                    } else {
           
                        await AsyncStorage.removeItem('rememberMe');
                        await AsyncStorage.removeItem('storedEmail');
                        await AsyncStorage.removeItem('storedPassword');
                        setRememberMe(false);
                    }
                } else {

                    setRememberMe(false);
                }
            } catch (e) {
                console.error('Failed to load credentials.', e);
                Alert.alert('Error', 'Failed to load stored credentials.');
                setRememberMe(false); 
            }
        };
        loadCredentials();
    }, []); 

    const handleLogin = async () => {
        try {
            const res = await fetch('http://ceprj.gachon.ac.kr:60021/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            if (!res.ok) throw new Error(`Login failed: ${res.status}`); 

            const data = await res.json();

     
            await AsyncStorage.setItem('accessToken', data.accessToken);

            if (rememberMe) {
                await AsyncStorage.setItem('storedEmail', email);
                await AsyncStorage.setItem('storedPassword', password);
                await AsyncStorage.setItem('rememberMe', 'true'); 
            } else {
                await AsyncStorage.removeItem('storedEmail');
                await AsyncStorage.removeItem('storedPassword');
                await AsyncStorage.removeItem('rememberMe');
            }

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
                keyboardType="email-address" 
                autoCapitalize="none" 
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
                        color={rememberMe ? "#007AFF" : "#555"} 
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
                    resizeMode="contain" 
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
        alignSelf: 'flex-start', 
        paddingLeft: 5, 
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
        marginTop: 10, 
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
        width: 120,
        height: 100,
    },
});
