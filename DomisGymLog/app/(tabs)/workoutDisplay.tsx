import React, { useState, useContext, useCallback } from 'react';
import {
  SafeAreaView,
  Text,
  View,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { UserContext } from '../userContext';
import { useFocusEffect } from '@react-navigation/native';

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
  UserID: number;
  WorkoutName: string;
  WeightSet1: number;
  RepsSet1: number;
  WeightSet2: number;
  RepsSet2: number;
  WeightSet3: number;
  RepsSet3: number;
}

const WorkoutsScreen: React.FC = () => {
  const { soloUser, duoUsers } = useContext(UserContext);
  const [previousWorkouts, setPreviousWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);

  const currentDayName = daysOfWeek[new Date().getDay()];

  const fetchPreviousWorkouts = () => {
    setLoading(true);
    let userIds: number[] = [];
    if (duoUsers) {
      userIds = [duoUsers[0].UserID, duoUsers[1].UserID];
    } else if (soloUser) {
      userIds = [soloUser.UserID];
    } else {
      setPreviousWorkouts([]);
      setLoading(false);
      return;
    }

    // Fetch workouts for each user and combine results
    Promise.all(
      userIds.map((userId) =>
        fetch(`http://5.161.204.169:3000/individual_workouts/${userId}`).then(
          (res) => res.json()
        )
      )
    )
      .then((results) => {
        // Combine arrays, add userID to items
        const combined = results.flat();
        setPreviousWorkouts(combined);
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
    }, [soloUser, duoUsers])
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" />
      </SafeAreaView>
    );
  }

  if (previousWorkouts.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.dayText}>{currentDayName}</Text>
        <Text style={styles.noWorkouts}>No workouts for today</Text>
      </SafeAreaView>
    );
  }

  // Group workouts by UserID
  const grouped = previousWorkouts.reduce((acc, workout) => {
    if (!acc[workout.UserID]) {
      acc[workout.UserID] = [];
    }
    acc[workout.UserID].push(workout);
    return acc;
  }, {} as Record<number, Workout[]>);

  const userIdToName = new Map<number, string>();
  if (soloUser) userIdToName.set(soloUser.UserID, soloUser.Username);
  if (duoUsers) {
    userIdToName.set(duoUsers[0].UserID, duoUsers[0].Username);
    userIdToName.set(duoUsers[1].UserID, duoUsers[1].Username);
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.dayText}>{currentDayName}</Text>
      <ScrollView>
        {Object.entries(grouped).map(([userId, workouts]) => (
          <View key={userId} style={styles.userGroup}>
            <Text style={styles.userLabel}>{userIdToName.get(Number(userId))}</Text>
            {workouts.map((item) => (
              <View key={item.LogID} style={styles.workoutItem}>
                <Text style={styles.workoutName}>{item.WorkoutName}</Text>
                <Text>
                  Reps: {item.RepsSet1}, {item.RepsSet2}, {item.RepsSet3}
                </Text>
                <Text>
                  Weight: {item.WeightSet1} kg, {item.WeightSet2} kg, {item.WeightSet3} kg
                </Text>
              </View>
            ))}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#d3d3d3' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  dayText: { fontSize: 24, fontWeight: 'bold', marginBottom: 12, textAlign: 'center' },
  userGroup: { marginBottom: 20 },
  userLabel: {
    fontWeight: '700',
    fontSize: 20,
    textAlign: 'center',
    marginBottom: 6,
  },
  noWorkouts: { fontStyle: 'italic', color: '#555', textAlign: 'center' },
  workoutItem: {
    backgroundColor: '#fafafa',
    padding: 12,
    marginBottom: 10,
    borderRadius: 6,
  },
  workoutName: { fontWeight: 'bold', fontSize: 18 },
});

export default WorkoutsScreen;
