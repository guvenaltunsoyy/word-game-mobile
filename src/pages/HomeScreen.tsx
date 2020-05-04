import 'react-native-gesture-handler';
import React, {useEffect, useState} from 'react';
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
import Modal from 'react-native-modal';
import AsyncStorage from '@react-native-community/async-storage';

import CircleLetter from '../components/CircleLetter';
import SquareLetter from '../components/SquareLetter';
import Title from '../components/Title';

export default function HomeScreen({navigation}) {
  const [words, setWords] = useState<Word[]>([]);
  const [letters, setLetters] = useState<Array<string>>([]);
  const [word, setWord] = useState<string>('');
  const [groupId, setGroupId] = useState(4);
  const [level, setLevel] = useState(1);
  const [subLevel, setSubLevel] = useState(1);
  const [settings, setSettings] = useState(true);
  const [subSettings, setSubSettings] = useState(false);
  const [shuffling, setShuffling] = useState(false);
  const [showModal, setShowModal] = useState(true);
  const [firstTime, setFirstTime] = useState(true);
  const [lastMatrix, setLastMatrix] = useState<mModel[]>();
  const [username, setUsername] = useState('');
  const [score, setScore] = useState(0);
  const [ratio, setRatio] = useState(3);
  const [time, setTime] = useState(0);
  const [timerCom, setTimerCom] = useState<any>();
  const [scores, setScores] = useState<any[]>([]);
  var allScores = [
    {
      username: '',
      level: 0,
      subLevel: 1,
      highScore: 0,
    },
    {
      username: '',
      level: 0,
      subLevel: 2,
      highScore: 0,
    },
    {
      username: '',
      level: 0,
      subLevel: 3,
      highScore: 0,
    },
    {
      username: '',
      level: 0,
      subLevel: 4,
      highScore: 0,
    },
    {
      username: '',
      level: 0,
      subLevel: 5,
      highScore: 0,
    },
    {
      username: '',
      level: 0,
      subLevel: 6,
      highScore: 0,
    },
  ];
  interface Word {
    WordModel: WordModel;
    Coordinates: Coordinate[];
    IsFound: boolean;
  }
  interface WordModel {
    Id: number;
    Word: string;
    GroupId: number;
    Level: number;
  }
  interface Coordinate {
    x: number;
    y: number;
  }
  interface mModel {
    Letter: string;
    Visibility: boolean;
    ShowLetter: boolean;
    X: number;
    Y: number;
  }

  useEffect(() => {
    if (shuffling) {
      shuffle(letters);
      setShuffling(false);
    }
    if (firstTime) {
      GetAsyncLocalStorage('userInfo')
        .then((res) => {
          if (res === undefined) return;
          let item = JSON.parse(res);
          if (item !== null && item !== undefined) {
            setUsername(item.username ?? '');
            setScore(item.score ?? 0);
            setTime(item.time ?? 0);
            setLevel(item.level ?? 1);
            setSubLevel(item.subLevel ?? 1);
          }
        })
        .catch((e) => console.error(e));
      GetAsyncLocalStorage(`highScores`).then((rs) => {
        if (rs !== undefined) {
          const result = JSON.parse(rs);
          let i = 0;
          result.map((m) => {
            allScores[i].username = m.username;
            allScores[i].level = m.level;
            allScores[i].subLevel = m.subLevel;
            allScores[i].highScore = m.s;
            i++;
          });
        }
      });
      setScores(allScores);
      setFirstTime(false);
    }
  }, [letters, shuffling, firstTime]);
  function shuffle(a: string[]) {
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  async function GetWords(wordCount: number) {
    setLastMatrix([]);
    setScore(0);
    setTime(0);
    console.info('Game Started');
    let res = await http<string[][]>(
      `http://da57dc27.ngrok.io/api/words/${groupId}/${wordCount}`,
    );
    http<Word[]>('http://da57dc27.ngrok.io/api/words').then((response) => {
      setWords(response);
      let _letters = response[0];
      let press = response.find((l) => {
        return l.WordModel.Word.length > _letters.WordModel.Word.length;
      });
      setLetters(
        press?.WordModel.Word.split('') ?? _letters.WordModel.Word.split(''),
      );
      shuffle(letters);
    });
    let tempModelArray: mModel[] = [];
    res?.map((row, i) => {
      let temp = row.slice();
      temp.map((l, j) => {
        tempModelArray.push({
          Letter: l,
          Visibility: l !== '0',
          ShowLetter: false,
          X: i,
          Y: j,
        });
      });
      return;
    });
    setLastMatrix(tempModelArray);
    startTimer();
  }
  function startTimer() {
    const timer = setInterval(() => {
      setTime((t) => t + 1);
    }, 1000);
    setTimerCom(timer);
  }
  async function SaveGame(s: number) {
    await SetAsyncLocalStorage(
      'userInfo',
      JSON.stringify({
        username: username,
        score: s,
        time: time,
        level: level,
        subLevel: subLevel,
      }).toString(),
    );
  }
  async function SaveHighScoreGame(s: number) {
    //console.log(`saveHighScore ${s} subLevel ${level} ${subLevel}`);
    let currentHighScore = await GetAsyncLocalStorage(`highScores`);
    if (
      currentHighScore !== undefined &&
      JSON.parse(currentHighScore).highScore > s
    ) {
      console.info(
        `current score high ${JSON.parse(currentHighScore).highScore}`,
      );
    } else {
      //console.info(`high${subLevel}Score changed`);
      scores[subLevel - 1].username = username;
      scores[subLevel - 1].level = level;
      scores[subLevel - 1].subLevel = subLevel;
      scores[subLevel - 1].highScore = s;
      setScores(scores);
      await SetAsyncLocalStorage(`highScores`, JSON.stringify(scores));
      console.log(JSON.stringify(scores));
    }
  }
  async function CheckWords(s: number) {
    let res: boolean = true;
    words.map((w) => {
      if (!w.IsFound) {
        res = false;
      }
    });
    if (res) {
      clearInterval(timerCom);
      await SaveGame(s);
      await SaveHighScoreGame(s);
      Alert.alert(
        'Oyun Tamamlandı',
        `Skorunuz ${s}, gecen sure ${time} saniye.`,
        [{text: 'OK', onPress: () => console.log('OK Pressed')}],
        {cancelable: false},
      );
    }
  }
  async function http<T>(request: RequestInfo): Promise<T> {
    const response = await fetch(request);
    return await response.json();
  }
  async function CheckWord(l: string) {
    setWord(word + l);
    words.map(async (w) => {
      if (w.WordModel.Word === word + l && !w.IsFound) {
        // WORD FOUND
        setScore(score + w.Coordinates.length * ratio);
        await SaveGame(score + w.Coordinates.length * ratio);
        //console.debug(word + l);
        w.Coordinates.map((loc) => {
          lastMatrix?.map((m) => {
            if (m.X === loc.x && m.Y === loc.y) {
              m.ShowLetter = true;
            }
          });
        });
        w.IsFound = true;
        setWord('');
        await CheckWords(score + w.Coordinates.length * ratio);
      }
    });
  }

  const deviceWidth = Dimensions.get('window').width;
  const deviceHeight = Dimensions.get('window').height;
  async function SetAsyncLocalStorage(key: string, item: any) {
    try {
      await AsyncStorage.setItem(key, item);
    } catch (e) {
      console.error(e);
    }
  }
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
  const SettingsModal = (props) => {
    console.log('show setting');

    return (
      <Modal
        key="settings"
        isVisible={props.settings}
        deviceWidth={deviceWidth}
        deviceHeight={deviceHeight}
        style={{
          flex: 1,
          backgroundColor: 'white',
          flexDirection: 'column',
          justifyContent: 'center',
          alignSelf: 'center',
          marginTop: 340,
          marginBottom: 300,
          borderRadius: 20,
        }}>
        <View>
          <View style={{margin: 40, display: !subSettings ? 'flex' : 'none'}}>
            <Text style={styles.text}>Seviye seciniz</Text>
            <Text
              style={styles.levelText}
              onPress={() => {
                setLevel(1);
                setSubSettings(true);
              }}>
              1.Seviye
            </Text>
            <Text
              style={styles.levelText}
              onPress={() => {
                setLevel(2);
                setSubSettings(true);
              }}>
              2.Seviye
            </Text>
            <Text
              style={styles.levelText}
              onPress={() => {
                setLevel(3);
                setSubSettings(true);
              }}>
              3.Seviye
            </Text>
          </View>
          <View style={{margin: 40, display: subSettings ? 'flex' : 'none'}}>
            <Text style={styles.text}>Alt seviye seciniz</Text>
            <Text
              style={styles.levelText}
              onPress={() => {
                setSubLevel(1);
                setSubSettings(false);
                setSettings(false);
              }}>
              1.Seviye
            </Text>
            <Text
              style={styles.levelText}
              onPress={() => {
                setSubLevel(2);
                setSubSettings(false);
                setSettings(false);
              }}>
              2.Seviye
            </Text>
            <Text
              style={styles.levelText}
              onPress={() => {
                setSubLevel(3);
                setSubSettings(false);
                setSettings(false);
              }}>
              3.Seviye
            </Text>
            <Text
              style={styles.levelText}
              onPress={() => {
                setSubLevel(4);
                setSubSettings(false);
                setSettings(false);
              }}>
              4.Seviye
            </Text>
            <Text
              style={styles.levelText}
              onPress={() => {
                setSubLevel(5);
                setSubSettings(false);
                setSettings(false);
              }}>
              5.Seviye
            </Text>
            <Text
              style={styles.levelText}
              onPress={() => {
                setSubLevel(6);
                setSubSettings(false);
                setSettings(false);
              }}>
              6.Seviye
            </Text>
          </View>
        </View>
      </Modal>
    );
  };
  return (
    <>
      <StatusBar barStyle="dark-content" />
      <Title />
      <SettingsModal settings={settings} />

      <View style={styles.mainContainer}>
        <Modal
          isVisible={showModal}
          deviceWidth={deviceWidth}
          deviceHeight={deviceHeight}
          style={{
            flex: 1,
            backgroundColor: 'white',
            flexDirection: 'column',
            justifyContent: 'center',
            alignSelf: 'center',
            marginTop: 350,
            marginBottom: 350,
            borderRadius: 20,
          }}>
          <View style={{margin: 40}}>
            <Text style={styles.text}>Kullanıcı adı giriniz 📝</Text>
            <TextInput
              style={{
                height: 50,
                padding: 10,
                margin: 10,
                borderColor: 'gray',
                borderWidth: 1,
                color: '#af9a7d',
                fontWeight: 'bold',
                fontSize: 20,
              }}
              onChangeText={async (text) => {
                setUsername(text);
              }}
              value={username}
            />
            <Button
              title="Tamam"
              color="#af9a7d"
              onPress={() => {
                setUsername(username);
                setShowModal(false);
              }}
            />
          </View>
        </Modal>
        <View style={styles.row}>
          <Text
            style={styles.text}
            onPress={() => {
              navigation.navigate('HighScores');
            }}>
            👑 Rekorlar
          </Text>
          <Text style={styles.text} onPress={() => setSettings(true)}>
            ⚙️ Ayarlar
          </Text>
        </View>
        <Text style={styles.text} onPress={() => setShowModal(true)}>
          🙍🏼 {username} - Skor : {score} - Sure : {time}
        </Text>
        <View style={styles.puzzleContainer}>
          {lastMatrix?.map((row, i) => {
            return (
              <>
                <SquareLetter
                  key={`${i}-${row.Letter}`}
                  showLetter={row.ShowLetter}
                  visible={row.Visibility}
                  letter={row.Letter}
                />
              </>
            );
          })}
        </View>
        <View style={styles.row}>
          <Text
            onPress={async () => {
              await GetWords(2);
            }}
            style={styles.text}>
            Başlat ☑️
          </Text>
          <Text
            onPress={() => {
              clearInterval(timerCom);
            }}
            style={styles.text}>
            Durdur 🔘️
          </Text>
        </View>
        <View>
          <View style={styles.row}>
            <Text
              onPress={() => {
                setWord('');
                setLetters(letters);
              }}
              style={styles.text}>
              🗑 Temizle
            </Text>
            <Text style={styles.text}>➖</Text>
            <Text
              onPress={() => {
                setShuffling(true);
              }}
              style={styles.text}>
              🔀 Karıştır
            </Text>
            <Text style={styles.text}>➖</Text>
            <Text
              onPress={() => {
                setWord(word.substring(0, word.length - 1));
              }}
              style={styles.text}>
              Sil ⬅️
            </Text>
          </View>
          <Text style={styles.text}>{word}</Text>
        </View>
        <View style={styles.row}>
          {letters?.map((letter, index) => {
            return (
              <View
                key={index}
                onTouchStart={() => {
                  CheckWord(letter);
                }}>
                <CircleLetter key={index + letter} letter={letter} />
              </View>
            );
          })}
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-evenly',
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
