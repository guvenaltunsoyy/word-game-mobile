import React, {useState, useEffect} from 'react';
import {View, Text, StatusBar} from 'react-native';
import {Svg, Rect} from 'react-native-svg';

const SquareLetter = (props) => {
  const [letter, setLetter] = useState('');
  const [bgColor, setBgColor] = useState('gray');
  const [showLetter, setShowLetter] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setShowLetter(props.showLetter);
    setVisible(props.visible);
    setLetter(props.letter ?? letter);
    setBgColor(props.showLetter ? 'gray' : '#cfcfcf');
  }, [props]);
  return visible ? (
    <Svg key={letter} height="25" width="25" style={{margin: 1}}>
      <Text
        style={{
          color: 'white',
          fontSize: 15,
          marginLeft: 7,
          marginTop: 8,
          fontWeight: 'bold',
        }}>
        {showLetter ? letter : ''}
      </Text>
      <Rect width="100" height="100" fill={bgColor} strokeWidth="0" />
    </Svg>
  ) : (
    <Svg height="25" width="25" style={{margin: 1}} />
  );
};

export default SquareLetter;
