import React, {useState, useEffect} from 'react';
import {View, Text, StatusBar} from 'react-native';
import {Svg, Line, Circle} from 'react-native-svg';

const CircleLetter = (props) => {
  const [letter, setLetter] = useState('A');
  useEffect(() => {
    setLetter(props.letter ?? letter);
  }, [props, letter]);
  return (
    <Svg height="40" width="40" style={{margin: 1}}>
      <Text
        style={{
          color: 'white',
          fontSize: 20,
          marginLeft: 12,
          marginTop: 8,
          fontWeight: 'bold',
        }}>
        {letter}
      </Text>
      <Circle cx="20" cy="20" r="20" fill="#af9a7d" />
    </Svg>
  );
};

export default CircleLetter;
