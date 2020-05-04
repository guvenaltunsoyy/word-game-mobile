import 'react-native-gesture-handler';
import React, {useState, useEffect} from 'react';
import {
  StatusBar,
  StyleSheet,
  Text,
  View,
  Alert,
  Button,
  Dimensions,
  TextInput,
} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';

export default function HighScores({navigation}) {
  const [highScores, setHighScores] = useState<any[]>([]);
  const [getScores, setGetScores] = useState(false);

  useEffect(() => {
    if (!getScores) {
      GetAllScores();
      setGetScores(true);
    }
  });
  async function GetAsyncLocalStorage(key: string): Promise<any> {
    try {
      const value = await AsyncStorage.getItem(key);
      if (value !== null) {
        return value;
      }
    } catch (e) {
      console.error(e);
      return null;
    }
  }

  async function GetAllScores() {
    const rs = await GetAsyncLocalStorage(`highScores`);
    const result = JSON.parse(rs);

    setHighScores(result);
  }
  return (
    <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
      <View style={{margin: 20}}>
        <Text style={styles.text}>Yuksek Skorlar</Text>
        <Text style={styles.text} onPress={() => GetAllScores()}>
          Yenile
        </Text>
        {highScores.map((hs, index) => {
          return (
            <>
              <View key={index} style={styles.row}>
                <Text key="name" style={styles.levelText}>
                  {hs.username}
                </Text>
                <Text key="score" style={styles.levelText}>
                  - Score :{hs.highScore}
                </Text>
                <Text key="level" style={styles.levelText}>
                  - Level :{hs.subLevel}
                </Text>
              </View>
            </>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  puzzleContainer: {
    flexDirection: 'row',
    alignSelf: 'baseline',
    flexWrap: 'wrap',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  shadow: {
    borderColor: 'orange', // if you need
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: 'gray',
    shadowRadius: 10,
    shadowOpacity: 1,
  },
  column: {
    flexDirection: 'column',
  },
  text: {
    textAlign: 'center',
    color: '#af9a7d',
    fontSize: 25,
    fontWeight: 'bold',
  },
  levelText: {
    textAlign: 'center',
    color: 'gray',
    fontSize: 18,
    marginTop: 10,
    fontWeight: 'bold',
  },
});
