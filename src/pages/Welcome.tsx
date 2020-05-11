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
import Modal from 'react-native-modal';
import AsyncStorage from '@react-native-community/async-storage';

export default function Welcome({navigation}) {
  const [username, setUsername] = useState<string>();
  const [showModal, setShowModal] = useState(true);

  const deviceWidth = Dimensions.get('window').width;
  const deviceHeight = Dimensions.get('window').height;

  async function SetAsyncLocalStorage(key: string, item: any) {
    try {
      await AsyncStorage.setItem(key, item);
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
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
            onPress={async () => {
              setUsername(username);
              await SetAsyncLocalStorage(`username`, JSON.stringify(username));
              setShowModal(false);
              navigation.navigate('Home');
            }}
          />
        </View>
      </Modal>
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
