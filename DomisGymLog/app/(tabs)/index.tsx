import React, { useEffect, useContext } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserContext } from '../userContext'; // Import using your relative path

const AUTH_STORAGE_KEY = 'loggedInUser';

const HomePage: React.FC = () => {
  const { user, setUser } = useContext(UserContext);
  const [loading, setLoading] = React.useState(true);

  useEffect(() => {
    async function tryRestoreUser() {
      try {
        const stored = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          // If you want, verify credentials with your server here
          // For now, directly set the user context
          setUser({ UserID: parsed.UserID, Username: parsed.Username });
        }
      } catch (err) {
        console.warn('Failed to restore user:', err);
      }
      setLoading(false);
    }
    tryRestoreUser();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Gym Logbook App</Text>
      <Text style={styles.subtitle}>Created by Dominic Sitto</Text>
      {user && <Text style={styles.welcome}>Welcome back, {user.Username}!</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0f0f0', padding: 20 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 32, fontWeight: 'bold', marginBottom: 12 },
  subtitle: { fontSize: 18, color: '#555' },
  welcome: { marginTop: 20, fontSize: 20, fontWeight: 'bold' },
});

export default HomePage;
