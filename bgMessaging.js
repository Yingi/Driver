// @flow
import firebase from 'react-native-firebase';

import type { RemoteMessage } from 'react-native-firebase';

export default async (message: RemoteMessage) => {
    // handle your message
    console.log('Working Message')

    return Promise.resolve();
}