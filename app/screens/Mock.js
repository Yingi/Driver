import React, { Component } from 'react';
import { View, Text, Dimensions } from 'react-native';
import {Header} from 'react-native-elements'
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';

const { width, height } = Dimensions.get('window');
export default class Mock extends Component {
  render() {
    return (
      <View>
      <Text></Text>
      </View>
    );
  }
}

const styles = {
  container: {
    
    flex: 1
  },
  headerStyle: {
    fontSize: 36,
    textAlign: 'center',
    fontWeight: '100',
    marginBottom: 24
  },
  elementsContainer: {
    backgroundColor: '#ecf5fd',
    
  }
}