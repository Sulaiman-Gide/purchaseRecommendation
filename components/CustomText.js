import React from 'react';
import { Text, StyleSheet } from 'react-native';

const CustomText = ({ style, children, ...props }) => {
  return (
    <Text style={[styles.text, style]} {...props}>
      {children}
    </Text>
  );
};

const styles = StyleSheet.create({
  text: {
    fontFamily: 'interMedium',
    fontSize: 16,
    color: '#242424',
    lineHeight: 24
  },
});

export default CustomText;
