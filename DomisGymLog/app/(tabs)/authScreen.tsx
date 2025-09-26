import React, { useEffect, useState, useContext } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserContext } from '../userContext';  // Import the context

interface User {
  UserID: number;
  Username: string;
}

const AUTH_STORAGE_KEY = 'loggedInUser';

const AuthScreen: React.FC = () => {
  const { user, setUser } = useContext(UserContext);  // Use context user state
  const [username, setUsername] = useState<string>('Enter Username');
  const [password, setPassword] = useState<string>('Enter Password');
  const [loading, setLoading] = useState<boolean>(true);

  // Load saved credentials on mount and auto-login
  useEffect(() => {
    async function loadStoredUser() {
      try {
        const stored = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
        if (stored) {
          const parsed: User & { password: string } = JSON.parse(stored);
          setUsername(parsed.Username);
          setPassword(parsed.password);
          await login(parsed.Username, parsed.password, true);
        }
      } catch (err) {
        console.warn('Failed to load stored user', err);
      }
      setLoading(false);
    }
    loadStoredUser();
  }, []);

  // Login handler
  async function login(inputUsername: string, inputPassword: string, silent = false) {
    try {
      const response = await fetch('http://5.161.204.169:3000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: inputUsername, password: inputPassword }),
      });
      const data = await response.json();
      if (!response.ok) {
        if (!silent) Alert.alert('Login failed', data.error || 'Unknown error');
        setUser(null);
        return false;
      }
      
      setUser({ UserID: data.UserID, Username: data.Username });
      setUsername(data.Username);
      setPassword(inputPassword);
      // Store login info for auto-login next time
      await AsyncStorage.setItem(
        AUTH_STORAGE_KEY,
        JSON.stringify({ UserID: data.UserID, Username: data.Username, password: inputPassword })
      );
      console.log('Login successful, user set:', data);
      console.log('AuthScreen user:', user);

      return true;
    } catch (error) {
      if (!silent) Alert.alert('Network error', 'Could not reach server');
      setUser(null);
      return false;
    }
  }

  // Logout handler
  async function logout() {
    setUser(null);
    setPassword('');
    await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {!user ? (
        <>
          <Text style={styles.label}>Username:</Text>
          <TextInput
            style={styles.input}
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <Text style={styles.label}>Password:</Text>
          <TextInput style={styles.input} value={password} onChangeText={setPassword} secureTextEntry />
          <Button title="Log In" onPress={() => login(username, password)} />
        </>
      ) : (
        <>
          <Text style={styles.welcome}>Welcome, {user.Username}!</Text>
          <Button title="Log Out" onPress={logout} />
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  label: { fontWeight: 'bold', marginTop: 10 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#908e8eff',
    borderRadius: 4,
    padding: 8,
    marginTop: 5,
  },
  welcome: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
});

export default AuthScreen;
