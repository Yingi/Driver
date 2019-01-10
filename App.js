//@flow

import React, { Component } from "react";
import { RootNavigator } from "./config/router";
import Spinner from 'react-native-spinkit';
import firebase from 'react-native-firebase';
import { Image, Alert, View } from 'react-native';
import type { Notification, NotificationOpen } from 'react-native-firebase';


export default class App extends Component {
  constructor(props) {
    super(props);


    this.state = {
      isLoadingComplete: false,
      isAuthenticationReady: false,
      isAuthenticated: false,
      isUnmounted: false

    };
    this.unsubscriber = firebase.auth().onAuthStateChanged(this.onAuthStateChanged)
    //db.auth().onAuthStateChanged(this.onAuthStateChanged)

  }

  onAuthStateChanged = (user) => {
    console.log("DriverApp Authenticated Now")
    console.log(user)
    this.setState({ isAuthenticationReady: true });
    this.setState({ isAuthenticated: !!user });
    this.unsubscriber();
    console.log('Driver Zaza')

  };



  async componentDidMount() {
    const notificationOpen: NotificationOpen = await firebase.notifications().getInitialNotification();
    if (notificationOpen) {
      const action = notificationOpen.action;
      const notification: Notification = notificationOpen.notification;
      var seen = [];
      alert(JSON.stringify(notification.data, function (key, val) {
        if (val != null && typeof val == "object") {
          if (seen.indexOf(val) >= 0) {
            return;
          }
          seen.push(val);
        }
        return val;
      }));
    }
    const channel = new firebase.notifications.Android.Channel('test-channel', 'Test Channel', firebase.notifications.Android.Importance.Max)
      .setDescription('My apps test channel');

    // Create the channel
    firebase.notifications().android.createChannel(channel);
    this.notificationDisplayedListener = firebase.notifications().onNotificationDisplayed((notification: Notification) => {
      // Process your notification as required
      // ANDROID: Remote notifications do not contain the channel ID. You will have to specify this manually if you'd like to re-display the notification.
    });
    this.notificationListener = firebase.notifications().onNotification((notification: Notification) => {
      // Process your notification as required
      notification
        .android.setChannelId('test-channel')
        .android.setSmallIcon('ic_launcher');
      firebase.notifications()
        .displayNotification(notification);

    });
    this.notificationOpenedListener =
      firebase.notifications().onNotificationOpened((notificationOpen: NotificationOpen) => {
        // Get the action triggered by the notification being opened
        const action = notificationOpen.action;
        // Get information about the notification that was opened
        const notification: Notification = notificationOpen.notification;
        var seen = [];
        alert(JSON.stringify(notification.data, function (key, val) {
          if (val != null && typeof val == "object") {
            if (seen.indexOf(val) >= 0) {
              return;
            }
            seen.push(val);
          }
          return val;
        }));
        firebase.notifications().removeDeliveredNotification(notification.notificationId);

      });
  }

  componentWillUnmount() {
    this.notificationDisplayedListener();
    this.notificationListener();
    this.notificationOpenedListener();
    console.log('Unmounting')
  }


  render() {
    console.log('It is Showing')
    // If we haven't checked AsyncStorage yet, don't render anything (better ways to do this)
    if (!this.state.isLoadingComplete && !this.state.isAuthenticationReady) {
      return (
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0, 0.9)',
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >
          <View
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              backgroundColor: 'rgba(0,0,0, 0.9)'
            }}
          >
            <Image
              style={{
                backgroundColor: '#ccc',
                flex: 1,
                resizeMode: 'contain',
                position: 'absolute',
                width: '100%',
                height: '100%',
                justifyContent: 'center',
              }}
              source={require('./app/images/BertaCabs.jpg')}
            />
          </View>
          <Spinner
            style={{
              marginBottom: 50
            }}
            isVisible={true}
            size={150}
            type={'Bounce'}
            color={'#faebd7'}

          />
        </View>

      );
      //return null;
      //OR
      // return <ActivityIndicator />
    }


    // Sends signedIn state as parameter to Navigator in router.js file
    const Layout = RootNavigator(this.state.isAuthenticated);


    return (

      <Layout />

    )

  }
}
