import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';

export default function LanguageSelector({ 
  sourceLang, 
  targetLang, 
  onSourceChange, 
  onTargetChange 
}) {
  return (
    <View style={styles.container}>
      <Picker
        selectedValue={sourceLang}
        onValueChange={onSourceChange}
        style={styles.picker}
      >
        <Picker.Item label="English" value="en" />
        <Picker.Item label="ગુજરાતી" value="gu" />
        <Picker.Item label="हिंदी" value="hi" />
      </Picker>

      <Picker
        selectedValue={targetLang}
        onValueChange={onTargetChange}
        style={styles.picker}
      >
        <Picker.Item label="ગુજરાતી" value="gu" />
        <Picker.Item label="English" value="en" />
        <Picker.Item label="हिंदी" value="hi" />
      </Picker>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  picker: {
    width: '45%',
  },
});