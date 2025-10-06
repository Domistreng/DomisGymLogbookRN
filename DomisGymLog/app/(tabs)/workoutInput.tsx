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

interface WeightsReps {
  WeightSet1: string;
  WeightSet2: string;
  WeightSet3: string;
  RepsSet1: string;
  RepsSet2: string;
  RepsSet3: string;
}

const WorkoutInputScreen: React.FC = () => {
  const { soloUser, duoUsers } = useContext(UserContext);

  const [open, setOpen] = useState(false);
  const [value, setValue] = useState<string | null>(null);
  const [items, setItems] = useState<WorkoutOption[]>([]);

  // Initialize reps+weight inputs for each user if duo, or single user if solo
  const [inputs1, setInputs1] = useState<WeightsReps>({
    WeightSet1: '',
    WeightSet2: '',
    WeightSet3: '',
    RepsSet1: '',
    RepsSet2: '',
    RepsSet3: '',
  });
  const [inputs2, setInputs2] = useState<WeightsReps>({
    WeightSet1: '',
    WeightSet2: '',
    WeightSet3: '',
    RepsSet1: '',
    RepsSet2: '',
    RepsSet3: '',
  });

  const activeUser1 = duoUsers ? duoUsers[0] : soloUser;
  const activeUser2 = duoUsers ? duoUsers[1] : null;

  // Fetch workouts for day using either solo UserID or duo User1 UserID for dropdown.
  useEffect(() => {
    const userId = duoUsers ? duoUsers[0].UserID : soloUser?.UserID;
    if (!userId) return;

    fetch(`http://5.161.204.169:3000/workouts_by_day/${userId}`)
      .then((res) => res.json())
      .then((data: { WorkoutName: string }[]) => {
        const converted = data.map((w) => ({
          label: w.WorkoutName,
          value: w.WorkoutName,
        }));
        setItems(converted);
        if (converted.length > 0) {
          setValue(converted[0].value);
        }
      })
      .catch(() => {
        setItems([]);
        setValue(null);
      });
  }, [soloUser, duoUsers]);

  const handleChange = (
    userNumber: 1 | 2,
    field: keyof WeightsReps,
    val: string
  ) => {
    if (userNumber === 1) {
      setInputs1((prev) => ({ ...prev, [field]: val }));
    } else {
      setInputs2((prev) => ({ ...prev, [field]: val }));
    }
  };

  const handleSubmit = () => {
    if (!value) {
      Alert.alert('Please select a workout');
      return;
    }

    if (!activeUser1) {
      Alert.alert('User not logged in');
      return;
    }

    // Helper to check if all inputs are blank for a user
    const allInputsBlank = (inputs: WeightsReps) => {
      return (
        !inputs.WeightSet1 &&
        !inputs.WeightSet2 &&
        !inputs.WeightSet3 &&
        !inputs.RepsSet1 &&
        !inputs.RepsSet2 &&
        !inputs.RepsSet3
      );
    };

    const payloads = [];

    // Only add user1's payload if they entered any data
    if (!allInputsBlank(inputs1)) {
      payloads.push({
        UserID: activeUser1.UserID,
        WorkoutName: value,
        WeightSet1: inputs1.WeightSet1 ? Number(inputs1.WeightSet1) : null,
        RepsSet1: inputs1.RepsSet1 ? Number(inputs1.RepsSet1) : null,
        WeightSet2: inputs1.WeightSet2 ? Number(inputs1.WeightSet2) : null,
        RepsSet2: inputs1.RepsSet2 ? Number(inputs1.RepsSet2) : null,
        WeightSet3: inputs1.WeightSet3 ? Number(inputs1.WeightSet3) : null,
        RepsSet3: inputs1.RepsSet3 ? Number(inputs1.RepsSet3) : null,
      });
    }

    // Only add user2's payload if present and they entered any data
    if (activeUser2 && !allInputsBlank(inputs2)) {
      payloads.push({
        UserID: activeUser2.UserID,
        WorkoutName: value,
        WeightSet1: inputs2.WeightSet1 ? Number(inputs2.WeightSet1) : null,
        RepsSet1: inputs2.RepsSet1 ? Number(inputs2.RepsSet1) : null,
        WeightSet2: inputs2.WeightSet2 ? Number(inputs2.WeightSet2) : null,
        RepsSet2: inputs2.RepsSet2 ? Number(inputs2.RepsSet2) : null,
        WeightSet3: inputs2.WeightSet3 ? Number(inputs2.WeightSet3) : null,
        RepsSet3: inputs2.RepsSet3 ? Number(inputs2.RepsSet3) : null,
      });
    }

    if (payloads.length === 0) {
      Alert.alert('Please enter at least one field of data for a user before submitting.');
      return;
    }

    Promise.all(
      payloads.map((payload) =>
        fetch(`http://5.161.204.169:3000/individual_workouts/${payload.UserID}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      )
    )
      .then(() => {
        Alert.alert('Workout log(s) added!');
        setInputs1({
          WeightSet1: '',
          WeightSet2: '',
          WeightSet3: '',
          RepsSet1: '',
          RepsSet2: '',
          RepsSet3: '',
        });
        setInputs2({
          WeightSet1: '',
          WeightSet2: '',
          WeightSet3: '',
          RepsSet1: '',
          RepsSet2: '',
          RepsSet3: '',
        });
      })
      .catch(() => Alert.alert('Failed to add workout log(s)'));
  };


  const renderInputRow = (
    userNumber: 1 | 2,
    label: string,
    keys: (keyof WeightsReps)[]
  ) => {
    const inputs = userNumber === 1 ? inputs1 : inputs2;
    return (
      <>
        <Text style={styles.rowLabel}>{label}</Text>
        <View style={styles.row}>
          {keys.map((key) => (
            <TextInput
              key={key}
              style={styles.inputSmall}
              keyboardType="numeric"
              placeholder="0"
              value={inputs[key]}
              onChangeText={(text) => handleChange(userNumber, key, text)}
            />
          ))}
        </View>
      </>
    );
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
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

            {activeUser1 && (
              <>
                <Text style={styles.duoLabel}>{activeUser1.Username}</Text>
                {renderInputRow(1, 'Reps', ['RepsSet1', 'RepsSet2', 'RepsSet3'])}
                {renderInputRow(1, 'Weight (kg)', [
                  'WeightSet1',
                  'WeightSet2',
                  'WeightSet3',
                ])}
              </>
            )}

            {activeUser2 && (
              <>
                <Text style={styles.duoLabel}>{activeUser2.Username}</Text>
                {renderInputRow(2, 'Reps', ['RepsSet1', 'RepsSet2', 'RepsSet3'])}
                {renderInputRow(2, 'Weight (kg)', [
                  'WeightSet1',
                  'WeightSet2',
                  'WeightSet3',
                ])}
              </>
            )}

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
  duoLabel: {
    fontWeight: '700',
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 8,
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
