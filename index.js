/** @format */

import bgMessaging from './bgMessaging';

import { AppRegistry } from 'react-native';
import App from './App';


AppRegistry.registerComponent('Driver', () => App);

AppRegistry.registerHeadlessTask('RNFirebaseBackgroundMessage', () => bgMessaging);
