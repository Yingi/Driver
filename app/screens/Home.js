import React, { Component } from 'react';
import { View, StyleSheet, TouchableOpacity, ActivityIndicator, AsyncStorage, Alert } from "react-native";
import { Card, Button, Text } from "react-native-elements";
import { onSignOut, USER } from "../auth";
import { db } from "../../config/MyFirebase";
import firebase from 'react-native-firebase';
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';
import { listenUserName } from "../../config/database";
import RNGooglePlaces from 'react-native-google-places';
import MapViewDirections from 'react-native-maps-directions';
import { Container, Icon, Left, Header, Body, Right } from 'native-base';
import Spinner from 'react-native-spinkit';



export default class Home extends Component {


  constructor(props) {
    super(props);
    this.state = {
      MyLocationLat: 0.02,
      MyLocationLong: 0.02,
      isLoading: true,
      driverLoading: true,
      isAuthenticated: false,
      Name: "",
      isMapReady: false

    }

  }

  componentDidMount() {
    let user = firebase.auth().currentUser;
    console.log(user.uid)

    // Store your device Token In Firebase
    firebase.messaging().getToken()
      .then(fcmToken => {
            if (fcmToken) {
                console.log(fcmToken)
              } 
            else {
                console.log('No Token')
              } 
          });

    console.log('Is this Navigator working at all')
    // For some reasons, this function finishes before database listener in the constructor
    // But in our Slow Itel, this function gets called only after the constructor is finished
    // So we need to set up isloading here after component DidMount
    navigator.geolocation.getCurrentPosition(
      (position) => {

        // For some reason navigator refused to work on this itel phone
        console.log('What is goin on here itel')
        if (this.isUnmounted) {
          return;
        }

        this.setState({
          MyLocationLat: position.coords.latitude,
          MyLocationLong: position.coords.longitude,

          error: null,

          Name: "",
          isLoading: false


        });

      },
      (error) => {

        Alert.alert(error.message)
      },
      { timeout: 20000, maximumAge: 60000 },
    );


  }

  componentWillUnmount() {
    this.isUnmounted = true;
  }


  SignOut = () => {
    firebase.auth().signOut()
      .then(() => onSignOut())
      .then(() => this.props.navigation.navigate("SignedOut"))
  }


  onMapLayout = () => {
    this.setState({ isMapReady: true });
  }


  onSearchPlace = () => {
    this.props.navigation.navigate("SearchPlace");
  }

  render() {
    if (this.state.isLoading) {
      return (
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0, 0.9)',
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >
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
    }


    else {

      const PresentLocation = { latitude: this.state.MyLocationLat, longitude: this.state.MyLocationLong }
      const GOOGLE_MAPS_APIKEY = 'AIzaSyBIXZvDmynO3bT7i_Yck7knF5wgOVyj5Fk';

      return (
        <Container>
          <MapView
            provider={PROVIDER_GOOGLE}
            style={styles.map}
            region={{
              latitude: this.state.MyLocationLat,
              longitude: this.state.MyLocationLong,
              latitudeDelta: 0.02,
              longitudeDelta: 0.02,
            }}
            showsUserLocation={true}
            onLayout={this.onMapLayout}

          >
            {
              this.state.isMapReady &&
              <MapView.Marker coordinate={PresentLocation} />

            }

          </MapView>
          <Header transparent>
            <Left>

              <Icon name="ios-menu" onPress={() =>
                this.props.navigation.openDrawer()} />

            </Left>
            <Body />
            <Right />
          </Header>

          { // Below is what gets data from redux store 
          }



        </Container>
      )
    }

  }
}
const styles = StyleSheet.create({

  map: { ...StyleSheet.absoluteFillObject },
  horizontal: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 10
  },
  buttonsContainer: {
    alignItems: 'center'
  }

})
