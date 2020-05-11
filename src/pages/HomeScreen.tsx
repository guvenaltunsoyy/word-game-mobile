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
  const [level, setLevel] = useState(1);
  const [subLevel, setSubLevel] = useState(1);
  const [settings, setSettings] = useState(false);
  const [subSettings, setSubSettings] = useState(false);
  const [shuffling, setShuffling] = useState(false);
  const [firstTime, setFirstTime] = useState(true);
  const [lastMatrix, setLastMatrix] = useState<mModel[]>();
  const [username, setUsername] = useState('');
  const [score, setScore] = useState(0);
  const [ratio, setRatio] = useState(10);
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
    GetAsyncLocalStorage('username')
      .then((res) => {
        if (res === undefined) return;
        let item = JSON.parse(res);
        console.log(item);
        if (item !== null && item !== undefined) {
          setUsername(item ?? '');
        }
      })
      .catch((e) => console.error(e));
    if (shuffling) {
      shuffle(letters);
      setShuffling(false);
    }
    if (firstTime) {
      console.log('firstTime');

      GetAsyncLocalStorage('userInfo')
        .then((res) => {
          if (res === undefined) return;
          let item = JSON.parse(res);
          if (item !== null && item !== undefined) {
            setScore(item.score ?? 0);
            setTime(item.time ?? 0);
            setLevel(item.level ?? 1);
            setSubLevel(item.subLevel ?? 1);
            setLastMatrix(JSON.parse(item.matrix) ?? []);
            setLetters(JSON.parse(item.letter) ?? '');
            setWords(JSON.parse(item.words) ?? []);
            setRatio(item.ratio ?? 10);

            JSON.parse(item.words).map(async (tempW: Word) => {
              const w = JSON.parse(JSON.stringify(tempW));
              console.log(w);
              if (w.IsFound) {
                w.Coordinates.map((loc) => {
                  lastMatrix?.map((m) => {
                    if (m.X === loc.x && m.Y === loc.y) {
                      m.ShowLetter = true;
                    }
                  });
                });
                w.IsFound = true;
              }
            });
          }
        })
        .catch((e) => console.error(e));

      GetAsyncLocalStorage(`highScores`).then((rs) => {
        if (rs !== undefined) {
          const result = JSON.parse(rs);
          let i = 0;
          result.map(
            (m: {
              username: string;
              level: number;
              subLevel: number;
              s: number;
            }) => {
              allScores[i].username = m.username;
              allScores[i].level = m.level;
              allScores[i].subLevel = m.subLevel;
              allScores[i].highScore = m.s;
              i++;
            },
          );
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
    setRatio(10);
    clearInterval(timerCom);
    console.info('Game Started');
    let res = await http<string[][]>(
      `http://52a368c4.ngrok.io/api/words/${level}/${subLevel}`,
    );
    http<Word[]>('http://52a368c4.ngrok.io/api/words').then((response) => {
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
      setRatio((r) => r - 0.1);
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
        matrix: JSON.stringify(lastMatrix),
        letter: JSON.stringify(letters),
        words: JSON.stringify(words),
        ratio: ratio,
      }),
    );
  }
  async function SaveHighScoreGame(s: number) {
    //console.log(`saveHighScore ${s} subLevel ${level} ${subLevel}`);
    let currentHighScore = await GetAsyncLocalStorage(`highScores`);
    if (currentHighScore !== undefined) {
      const tempScores = JSON.parse(currentHighScore);
      setScores(tempScores);
      if (tempScores[subLevel - 1].highScore > s) {
        console.info(`current score high ${JSON.parse(currentHighScore)}`);
      } else {
        //console.info(`high${subLevel}Score changed`);
        tempScores[subLevel - 1].username = username;
        tempScores[subLevel - 1].level = level;
        tempScores[subLevel - 1].subLevel = subLevel;
        tempScores[subLevel - 1].highScore = s;
        setScores(tempScores);
        await SetAsyncLocalStorage(`highScores`, JSON.stringify(tempScores));
        console.log(JSON.stringify(scores));
      }
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
        console.log(ratio);
        w.Coordinates.map((loc) => {
          lastMatrix?.map((m) => {
            if (m.X === loc.x && m.Y === loc.y) {
              m.ShowLetter = true;
            }
          });
        });
        w.IsFound = true;
        await SaveGame(score + w.Coordinates.length * ratio);
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

  return (
    <>
      <StatusBar barStyle="dark-content" />
      <Title />
      <Modal
        key="settings"
        isVisible={settings}
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
                setLevel(3);
                setSubSettings(true);
              }}>
              1.Seviye
            </Text>
            <Text
              style={styles.levelText}
              onPress={() => {
                setLevel(4);
                setSubSettings(true);
              }}>
              2.Seviye
            </Text>
            <Text
              style={styles.levelText}
              onPress={() => {
                setLevel(5);
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
      <View style={styles.mainContainer}>
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
        <Text
          style={styles.text}
          onPress={() => navigation.navigate('Welcome')}>
          🙍🏼 {username} - Skor : {score.toFixed(2)} - Sure : {time}
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
              startTimer();
            }}
            style={styles.text}>
            Devam ⏯
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
