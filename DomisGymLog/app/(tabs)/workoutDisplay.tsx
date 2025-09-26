import React, { useState, useContext } from 'react';
import {
  SafeAreaView,
  Text,
  View,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { UserContext } from '../userContext';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';

const daysOfWeek = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

interface Workout {
  LogID: number;
  WorkoutName: string;
  WeightSet1: number;
  RepsSet1: number;
  WeightSet2: number;
  RepsSet2: number;
  WeightSet3: number;
  RepsSet3: number;
}

const WorkoutsScreen: React.FC = () => {
  const { user } = useContext(UserContext);
  const [previousWorkouts, setPreviousWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);

  const currentDayName = daysOfWeek[new Date().getDay()];

  const fetchPreviousWorkouts = () => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    fetch(`http://5.161.204.169:3000/individual_workouts/${user.UserID}`)
      .then((res) => res.json())
      .then((data) => {
        setPreviousWorkouts(data);
        setLoading(false);
      })
      .catch(() => {
        setPreviousWorkouts([]);
        setLoading(false);
      });
  };

  useFocusEffect(
    useCallback(() => {
      fetchPreviousWorkouts();
    }, [user])
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.dayText}>{currentDayName}</Text>
      {previousWorkouts.length === 0 ? (
        <Text style={styles.noWorkouts}>No workouts for today</Text>
      ) : (
        previousWorkouts.map((item) => (
          <View key={item.LogID} style={styles.workoutItem}>
            <Text style={styles.workoutName}>{item.WorkoutName}</Text>
            <Text>
              Reps: {item.RepsSet1}, {item.RepsSet2}, {item.RepsSet3}
            </Text>
            <Text>
              Weight: {item.WeightSet1} kg, {item.WeightSet2} kg, {item.WeightSet3} kg
            </Text>
          </View>
        ))
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#d3d3d3' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  dayText: { fontSize: 24, fontWeight: 'bold', marginBottom: 12 },
  noWorkouts: { fontStyle: 'italic', color: '#555' },
  workoutItem: {
    backgroundColor: '#fafafa',
    padding: 12,
    marginBottom: 10,
    borderRadius: 6,
  },
  workoutName: { fontWeight: 'bold', fontSize: 18 },
});

export default WorkoutsScreen;
