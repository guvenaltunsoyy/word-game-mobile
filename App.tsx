import 'react-native-gesture-handler';
import React from 'react';
import {View, Text, Button} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import HomeScreen from './src/pages/HomeScreen';
import HighScores from './src/pages/HighScores';
import Welcome from './src/pages/Welcome';

const Stack = createStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Welcome" component={Welcome} />
        <Stack.Screen name="HighScores" component={HighScores} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
