import React from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View } from 'react-native';

const GradientBackground = ({ children }) => {
  return (
    <LinearGradient
      colors={['red', 'black']} // Customize your gradient colors here
      style={styles.gradient}
    >
      <View style={styles.container}>
        {children}
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
  },
});

export default GradientBackground;