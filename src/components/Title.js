import React from 'react';
import {View, Text, StatusBar} from 'react-native';

export default function Title() {
  return (
    <View
      style={{
        height: 60,
        marginLeft: 10,
        marginRight: 10,
        borderRadius: 10,
        backgroundColor: '#af9a7d',
      }}>
      <Text
        style={{
          textAlign: 'center',
          color: 'white',
          margin: 15,
          fontSize: 25,
          fontWeight: 'bold',
        }}>
        ☀︎ Hosgeldiniz ☀︎
      </Text>
    </View>
  );
}
