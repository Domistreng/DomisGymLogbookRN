import React, { useEffect, useContext } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserContext } from '../userContext';

const AUTH_STORAGE_KEY = 'loggedInUser'; // You might want separate keys for solo and duo

const HomePage: React.FC = () => {
  const { soloUser, duoUsers, setSoloUser, setDuoUsers } = useContext(UserContext);
  const [loading, setLoading] = React.useState(true);

  useEffect(() => {
    async function tryRestoreUser() {
      try {
        const stored = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          // Determine if saved data is solo or duo
          if (parsed.duoUsers && Array.isArray(parsed.duoUsers) && parsed.duoUsers.length === 2) {
            setDuoUsers(parsed.duoUsers);
            setSoloUser(null);
          } else if (parsed.soloUser) {
            setSoloUser(parsed.soloUser);
            setDuoUsers(null);
          }
        }
      } catch (err) {
        console.warn('Failed to restore user:', err);
      }
      setLoading(false);
    }
    tryRestoreUser();
  }, [setSoloUser, setDuoUsers]);

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

      {duoUsers ? (
        <Text style={styles.welcome}>
          Welcome back, {duoUsers[0].Username} & {duoUsers[1].Username}!
        </Text>
      ) : soloUser ? (
        <Text style={styles.welcome}>Welcome back, {soloUser.Username}!</Text>
      ) : (
        <Text style={styles.welcome}>Please log in to get started.</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0f0f0', padding: 20 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 32, fontWeight: 'bold', marginBottom: 12 },
  subtitle: { fontSize: 18, color: '#555' },
  welcome: { marginTop: 20, fontSize: 20, fontWeight: 'bold', textAlign: 'center' },
});

export default HomePage;
