import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserContext } from '../userContext';

const AUTH_STORAGE_KEY = 'loggedInUser';

const LoginScreen: React.FC = () => {
  const { soloUser, duoUsers, setSoloUser, setDuoUsers } = useContext(UserContext);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loggingInSecondUser, setLoggingInSecondUser] = useState(false);

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert('Please enter username and password');
      return;
    }

    try {
      const res = await fetch('http://5.161.204.169:3000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();

      if (data.error) {
        Alert.alert(data.error);
        return;
      }

      if (!loggingInSecondUser) {
        if (duoUsers) setDuoUsers(null); // Clear duo mode on fresh solo login

        setSoloUser({ UserID: data.UserID, Username: data.Username });

        // Save soloUser to AsyncStorage
        await AsyncStorage.setItem(
          AUTH_STORAGE_KEY,
          JSON.stringify({ soloUser: { UserID: data.UserID, Username: data.Username } })
        );

        Alert.alert(`Logged in as ${data.Username}`);
        setUsername('');
        setPassword('');
      } else {
        if (!soloUser) {
          Alert.alert('You must login first as user 1 to add second user');
          return;
        }

        if (data.UserID === soloUser.UserID) {
          Alert.alert('This user is already logged in as User 1');
          return;
        }

        const newDuoUsers = [soloUser, { UserID: data.UserID, Username: data.Username }];
        setDuoUsers(newDuoUsers);
        setSoloUser(null);
        setLoggingInSecondUser(false);

        // Save duoUsers to AsyncStorage
        await AsyncStorage.setItem(
          AUTH_STORAGE_KEY,
          JSON.stringify({ duoUsers: newDuoUsers })
        );

        Alert.alert(`Duo mode activated with ${soloUser.Username} & ${data.Username}`);
        setUsername('');
        setPassword('');
      }
    } catch {
      Alert.alert('Login failed');
    }
  };

  const handleLogoutUser1 = async () => {
    if (duoUsers) {
      // Logging out user 1 keeps user 2 solo
      setSoloUser(duoUsers[1]);
      setDuoUsers(null);
      await AsyncStorage.setItem(
        AUTH_STORAGE_KEY,
        JSON.stringify({ soloUser: duoUsers[1] })
      );
    } else {
      setSoloUser(null);
      // Clear AsyncStorage on logout
      await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
    }
  };

  const handleLogoutUser2 = async () => {
    if (duoUsers) {
      // Logging out user 2 keeps user 1 solo
      setSoloUser(duoUsers[0]);
      setDuoUsers(null);
      await AsyncStorage.setItem(
        AUTH_STORAGE_KEY,
        JSON.stringify({ soloUser: duoUsers[0] })
      );
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={styles.container}>
        <Text style={styles.title}>Gym Logger Login</Text>

        {soloUser && !duoUsers && (
          <>
            <Text style={styles.loggedInText}>Logged in as {soloUser.Username}</Text>
            {!loggingInSecondUser && (
              <>
                <Button
                  title="Add Second User (Duo Mode)"
                  onPress={() => setLoggingInSecondUser(true)}
                />
                <View style={{ height: 10 }} />
                <Button title={`Logout ${soloUser.Username}`} onPress={handleLogoutUser1} />
              </>
            )}
          </>
        )}

        {duoUsers && (
          <>
            <Text style={styles.loggedInText}>
              Duo logged in as {duoUsers[0].Username} & {duoUsers[1].Username}
            </Text>
            <Button
              title={`Logout ${duoUsers[0].Username}`}
              onPress={handleLogoutUser1}
            />
            <View style={{ height: 10 }} />
            <Button
              title={`Logout ${duoUsers[1].Username}`}
              onPress={handleLogoutUser2}
            />
          </>
        )}

        {(loggingInSecondUser || (!soloUser && !duoUsers)) && (
          <>
            <TextInput
              style={styles.input}
              onChangeText={setUsername}
              placeholder="Username"
              placeholderTextColor="#555"
              value={username}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TextInput
              style={styles.input}
              onChangeText={setPassword}
              placeholder="Password"
              placeholderTextColor="#555"
              value={password}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
            />
            <Button
              title={loggingInSecondUser ? 'Login as User 2' : 'Login'}
              onPress={handleLogin}
            />
            {loggingInSecondUser && (
              <Button
                title="Cancel Duo Login"
                onPress={() => setLoggingInSecondUser(false)}
                color="red"
              />
            )}
          </>
        )}
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#d3d3d3',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#fff',
    marginBottom: 12,
    borderRadius: 6,
    borderColor: '#999',
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
  },
  loggedInText: {
    textAlign: 'center',
    marginVertical: 10,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default LoginScreen;
