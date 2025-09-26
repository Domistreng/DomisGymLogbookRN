import React, { useEffect, useState, useContext } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TextInput,
  Button,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import { UserContext } from '../userContext';

interface WorkoutOption {
  label: string;
  value: string;
}

const WorkoutInputScreen: React.FC = () => {
  const { user } = useContext(UserContext);

  // Dropdown picker state
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState<string | null>(null);
  const [items, setItems] = useState<WorkoutOption[]>([]);

  // Input state
  const [weightsReps, setWeightsReps] = useState({
    WeightSet1: '',
    WeightSet2: '',
    WeightSet3: '',
    RepsSet1: '',
    RepsSet2: '',
    RepsSet3: '',
  });

  useEffect(() => {
    if (!user) return;
    // Fetch workouts for today's muscle group for dropdown
    fetch(`http://5.161.204.169:3000/workouts_by_day/${user.UserID}`)
      .then((res) => res.json())
      .then((data: { WorkoutName: string }[]) => {
        const converted = data.map((w) => ({ label: w.WorkoutName, value: w.WorkoutName }));
        setItems(converted);
        if (converted.length > 0) {
          setValue(converted[0].value);
        }
      })
      .catch(() => {
        setItems([]);
        setValue(null);
      });
  }, [user]);

  const handleChange = (field: string, val: string) => {
    setWeightsReps((prev) => ({ ...prev, [field]: val }));
  };

  const handleSubmit = () => {
    if (!value) {
      Alert.alert('Please select a workout');
      return;
    }

    if (!user) {
      Alert.alert('User not logged in');
      return;
    }

    const payload = {
      UserID: user.UserID, // Include for backend identification
      WorkoutName: value,
      WeightSet1: weightsReps.WeightSet1 ? Number(weightsReps.WeightSet1) : null,
      RepsSet1: weightsReps.RepsSet1 ? Number(weightsReps.RepsSet1) : null,
      WeightSet2: weightsReps.WeightSet2 ? Number(weightsReps.WeightSet2) : null,
      RepsSet2: weightsReps.RepsSet2 ? Number(weightsReps.RepsSet2) : null,
      WeightSet3: weightsReps.WeightSet3 ? Number(weightsReps.WeightSet3) : null,
      RepsSet3: weightsReps.RepsSet3 ? Number(weightsReps.RepsSet3) : null,
    };

    fetch(`http://5.161.204.169:3000/individual_workouts/${user.UserID}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
      .then(() => {
        Alert.alert('Workout log added!');
        setWeightsReps({
          WeightSet1: '',
          WeightSet2: '',
          WeightSet3: '',
          RepsSet1: '',
          RepsSet2: '',
          RepsSet3: '',
        });
      })
      .catch(() => Alert.alert('Failed to add workout log'));
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ flex: 1 }}
        >
          <View style={{ flexGrow: 1, padding: 10 }}>
            <Text style={styles.sectionTitle}>Select Workout</Text>
            <DropDownPicker
              open={open}
              value={value}
              items={items}
              setOpen={setOpen}
              setValue={setValue}
              setItems={setItems}
              containerStyle={{ marginBottom: 15 }}
              style={{ backgroundColor: '#fff' }}
              dropDownContainerStyle={{ backgroundColor: '#fff' }}
              textStyle={{ color: '#000', fontWeight: '500' }}
            />

            <Text style={styles.rowLabel}>Reps</Text>
            <View style={styles.row}>
              {['RepsSet1', 'RepsSet2', 'RepsSet3'].map((key) => (
                <TextInput
                  key={key}
                  style={styles.inputSmall}
                  keyboardType="numeric"
                  placeholder="0"
                  value={(weightsReps as any)[key]}
                  onChangeText={(text) => handleChange(key, text)}
                />
              ))}
            </View>

            <Text style={styles.rowLabel}>Weight (kg)</Text>
            <View style={styles.row}>
              {['WeightSet1', 'WeightSet2', 'WeightSet3'].map((key) => (
                <TextInput
                  key={key}
                  style={styles.inputSmall}
                  keyboardType="numeric"
                  placeholder="0"
                  value={(weightsReps as any)[key]}
                  onChangeText={(text) => handleChange(key, text)}
                />
              ))}
            </View>

            <Button title="Add Workout Log" onPress={handleSubmit} />
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#d3d3d3',
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  sectionTitle: {
    fontWeight: 'bold',
    fontSize: 20,
    marginBottom: 12,
  },
  rowLabel: {
    fontWeight: '600',
    fontSize: 16,
    marginBottom: 4,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  inputSmall: {
    flex: 1,
    marginHorizontal: 4,
    backgroundColor: '#fff',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#999',
    padding: 8,
    fontSize: 16,
    textAlign: 'center',
    maxWidth: 80,
  },
});

export default WorkoutInputScreen;
