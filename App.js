//@flow

import React, { Component } from "react";
import { RootNavigator } from "./config/router";
import Spinner from 'react-native-spinkit';
import firebase from 'react-native-firebase';
import { Image, Alert, View, AsyncStorage } from 'react-native';

import type { Notification, NotificationOpen, RemoteMessage } from 'react-native-firebase';
import NavigationService from './NavigationService';
import { createAppContainer } from 'react-navigation';

console.disableYellowBox = true;

export default class App extends Component {
  constructor(props) {
    super(props);


    this.state = {
      isLoadingComplete: false,
      isAuthenticationReady: false,
      isAuthenticated: false,
      isUnmounted: false,
      DriverCustomClaim: false

    };
    this.unsubscriber = firebase.auth().onAuthStateChanged(this.onAuthStateChanged)
    //db.auth().onAuthStateChanged(this.onAuthStateChanged)

  }

  onAuthStateChanged = (user) => {
    console.log(user)
    if (user){
    user.getIdTokenResult()
    .then((IdTokenResult) => {
      if(IdTokenResult.claims.driver){ 
        console.log("Yess Has Claims")
        this.setState({ isAuthenticationReady: true, isAuthenticated: !!user, DriverCustomClaim: true });
        this.unsubscriber();
      }
      else {
        this.setState({ isAuthenticationReady: true, isAuthenticated: !!user})
        console.log(this.state.isAuthenticated)

        this.unsubscriber();
      }
    })
  }
  else{
    console.log(user)
    console.log("lets see")
    this.setState({ isAuthenticationReady: true, isAuthenticated: !!user})
    console.log(this.state.isAuthenticated)
    console.log('rained')
    this.unsubscriber();
  }
    
    

  };


    
async componentDidMount() {
  this.checkPermission();
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
      console.log("Was Notification Displayed")
      // ANDROID: Remote notifications do not contain the channel ID. You will have to specify this manually if you'd like to re-display the notification.
    });
    this.notificationListener = firebase.notifications().onNotification((notification: Notification) => {
      // Process your notification as required
      const { title, body } = notification;
      notification
        .android.setChannelId('test-channel')
        .android.setSmallIcon('ic_launcher')
        .android.setPriority(firebase.notifications.Android.Priority.Max)
        .setSound('default')

        console.log(notification.data)
        console.log("Notification Has Just Arrived")

        //Dispatch to Screen Where u want the Notification Data Displayed
        NavigationService.navigate("Main", {data: notification.data })
        console.log('Navigated')

        //this.showAlert(title, body);

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
        {/*
        alert(JSON.stringify(notification.data, function (key, val) {
          if (val != null && typeof val == "object") {
            if (seen.indexOf(val) >= 0) {
              return;
            }
            seen.push(val);
          }
          return val;
        }));*/}
        
        NavigationService.navigate("Main", {data: notification.data })
        firebase.notifications().removeDeliveredNotification(notification.notificationId);

      });
      
}




async checkPermission() {
  const enabled = await firebase.messaging().hasPermission();
  if (enabled) {
      //This works for already installed app
      console.log("Yes Has Permission")
      this.getToken();
  } else {
      console.log("No Permission granted")
      
      this.requestPermission();
  }
}

async requestPermission() {
  try {
      await firebase.messaging().requestPermission();
      // This for first time Phone
      // User has authorised
      this.getToken();
  } catch (error) {
      // User has rejected permissions
      console.log('permission rejected');
      Alert.alert("You wont be able to get Pickup Notifications")
  }
}

async getToken() {
  console.log('getting Token')
  let fcmToken = await AsyncStorage.getItem('fcmToken');
  
  if (!fcmToken) {
      // Since this is for New Device or New App install we have to update
      // firebase token of driver reference
      fcmToken = await firebase.messaging().getToken();
      if (fcmToken) {
          // user Now has a device token
          
          // You Have to now store Token On Firebase Now
          // But you cant store it here. You can store it when user
          // signs in and when they register
      
          console.log(firebase.auth().currentUser)
          console.log(fcmToken)
          console.log("Do we have current User?? Noo For First Time User" )
          await AsyncStorage.setItem('fcmToken', fcmToken);
      }
  }
  else{
    console.log("Token is in Async")
  }
}



componentWillUnmount() {
    this.notificationDisplayedListener();
    this.notificationListener();
    this.notificationOpenedListener();
    this.messageListener();
    console.log('Unmounting')
  }


  

showAlert(title, body) {
  Alert.alert(
    title, body,
    [
        { text: 'OK', onPress: () => console.log('OK Pressed') },
    ],
    { cancelable: false },
  );
}


  render() {
    console.log('It is Showing')
    // If we haven't checked AsyncStorage yet, don't render anything (better ways to do this)
    if (!this.state.isLoadingComplete && !this.state.isAuthenticationReady) {
      return (
        <View
          style={{
            flex: 1
          }}
        >
          
            <Image
              style={{
                backgroundColor: '#ccc',
                flex: 1,
                resizeMode: 'cover',
                position: 'absolute',
                width: '100%',
                height: '100%',
                justifyContent: 'center',
              }}
              source={require('./app/images/LoadingPage.jpg')}
            />
          
          
        </View>


      );
      //return null;
      //OR
      // return <ActivityIndicator />
    }


    // Sends signedIn state as parameter to Navigator in router.js file
    const claim = this.state.DriverCustomClaim
    const Layout = RootNavigator(this.state.isAuthenticated, claim);
    const AppContainer = createAppContainer(Layout);


    return (
      <AppContainer
        ref={Layout => {
          NavigationService.setTopLevelNavigator(Layout);
        }}
      />
      //<Layout />

    )

  }
}
