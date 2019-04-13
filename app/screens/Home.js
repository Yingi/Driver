import React, { Component } from 'react';
import { View, Platform, Image, Dimensions, PermissionsAndroid, StyleSheet, TouchableOpacity, ActivityIndicator, AsyncStorage, Alert } from "react-native";
import { Card, Button, Text } from "react-native-elements";
import { onSignOut, USER } from "../auth";
import { db } from "../../config/MyFirebase";
import firebase from 'react-native-firebase';
import Geolocation from 'react-native-geolocation-service';
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';
import { listenUserName } from "../../config/database";
import RNGooglePlaces from 'react-native-google-places';
import MapViewDirections from 'react-native-maps-directions';
import { Container, Icon, Left, Header, Body, Right } from 'native-base';
import Spinner from 'react-native-spinkit';
import NavigationService from '../../NavigationService';
import SlidingPanel from 'react-native-sliding-up-down-panels';

const { width, height } = Dimensions.get('window');


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
      isMapReady: false,
      NotificationData: this.props.navigation.getParam('data', 'No_data'),
      PassengerAvailable: false,
      PassengerPhotoUrl: null,

    }
    console.log('fresh')
    

  }

  
  componentWillReceiveProps(nextProps) {
    console.log(nextProps)
    let PassengerID = nextProps.navigation.state.params.data.ID
    let data = nextProps.navigation.state.params.data

    //Get Passenger Photo
    
    this.Photo(PassengerID)

    const PresentLocation = { latitude: this.state.MyLocationLat, longitude: this.state.MyLocationLong }
    const GOOGLE_MAPS_APIKEY = 'AIzaSyBIXZvDmynO3bT7i_Yck7knF5wgOVyj5Fk';
    const NotificationInfo = data
    const PassengerLocation = {latitude: parseFloat(NotificationInfo.Lat), longitude: parseFloat(NotificationInfo.Long)}

      //this.mergeCoords(PresentLocation, PassengerLocation);

    this.setState({NotificationData: data, PassengerAvailable: true})

    this.mergeCoords(PresentLocation, PassengerLocation);

    this.Distance(PresentLocation, PassengerLocation);

  }
  componentDidMount() {

    console.log(this.state.NotificationData)

    
    
    let user = firebase.auth().currentUser;
    console.log(user.uid)
    console.log(this.state.NotificationData)

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
    Geolocation.getCurrentPosition(
      (position) => {

        // For some reason navigator refused to work on this itel phone
        console.log('What is goin on here itel')
        console.log(this.state.NotificationData)
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
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 },
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

  onCancel = (key) => {
    dataBase = firebase.firestore()
    let RideRef = dataBase.collection('ride-request').doc(key)
    RideRef.collection('RideStatus').doc(key).update({ status: 'cancelled' })

    // You may want to set NotificationData to its previous state
    this.setState({
      PassengerAvailable: false,
      NotificationData: this.props.navigation.getParam('data', 'No_data')
      })
  }

  onAccept = (key, Location) => {
    dataBase = firebase.firestore()
    let RideRef = dataBase.collection('ride-request').doc(key)
    RideRef.collection('RideStatus').doc(key).update({ status: 'accepted' })

    NavigationService.navigate("Enroute", {PassengerLocation: Location, data: this.state.NotificationData})


  }

  mergeCoords = (origin, destination) => {

        let concatOrigin = origin.latitude + "," + origin.longitude
        let concatDest = destination.latitude + "," + destination.longitude
        this.setState({
            concatOrigin: concatOrigin,
            concatDest: concatDest
        });
    }

  Distance = (origin, destination) => {
    
    let API_KEY = 'AIzaSyBIXZvDmynO3bT7i_Yck7knF5wgOVyj5Fk'
    fetch(`https://maps.googleapis.com/maps/api/distancematrix/json?origins=${this.state.concatOrigin}&destinations=${this.state.concatDest}&key=${API_KEY}`)
      .then(response =>
            response.json())
      .then(responseJson => {
          // After getting the distanceMatrix, we will now use it
          // to calculate the fare and then set price for auto and
          // car and then set duration and distance too
          console.log('It is search look')
          console.log(responseJson)


          // Temporarily set state so map will show because unpaid distance matrix api will give an error
          // Remember these are default duration and distance because we havent paid distanceMatrix API
          this.setState({ done: true, duration: '10mins', distance: '5km' })
          let dsKm = responseJson.rows[0].elements[0].distance.text
          let dsM = responseJson.rows[0].elements[0].distance.value
          let duration = responseJson.rows[0].elements[0].duration.text
          

          console.log(dsKm);

            // Setting state will only work here if the above doesnt give an error
          this.setState({
            duration: duration,
            distance: dsKm,
            done: true
            })
        })
        .catch(error => console.log(error))

  }

  Photo(key) {
        let dbStorage = db.storage()
        const { PassengerPhotoUrl } = this.state;

        var firebaseStorageRef = dbStorage.ref('Passengers');

        const imageRef = firebaseStorageRef.child(key).child('IMG_0189.JPG');
        const imgUrl = imageRef.getDownloadURL()
        imgUrl.then((url) => {
            console.log(url)
            this.setState({ PassengerPhotoUrl: url })
            //this.setState({ error: "Badd" })

        });
        return (PassengerPhotoUrl)
    }

    callUpon = () => {
      console.log('Show')
      this.setState({gab: 'man'})
    }

   renderDefaultImage(key) {
        const { PassengerPhotoUrl } = this.state;

        if (PassengerPhotoUrl == null) {

            console.log('No Driver Photo')
            return (
                <Image style={styles.PassengerImage}
                    source={require('../images/user.png')} />
            )
        }

        else {


            return (
                <Image style={styles.PassengerImage}
                    source={{ uri: PassengerPhotoUrl }} />
            )

        }
    }

    renderElement() {
        if(this.state.done) {
          return(
           <View>
          <Text style={styles.distanceTextStyle}>{this.state.distance}</Text>
          <Text style={styles.distanceTextStyle}>{this.state.duration} away</Text>
          </View>
          )

        }
        else {
          return null;
        }
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


    if (this.state.PassengerAvailable) {

      const PresentLocation = { latitude: this.state.MyLocationLat, longitude: this.state.MyLocationLong }
      const GOOGLE_MAPS_APIKEY = 'AIzaSyBIXZvDmynO3bT7i_Yck7knF5wgOVyj5Fk';
      const NotificationInfo = this.state.NotificationData
      const PassengerLocation = {latitude: parseFloat(NotificationInfo.Lat), longitude: parseFloat(NotificationInfo.Long)}

      //this.mergeCoords(PresentLocation, PassengerLocation);

      //this.Distance(PresentLocation, PassengerLocation);

      //this.callUpon()

      
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
          <MapView.Marker coordinate={PresentLocation} />
          <MapView.Marker coordinate={PassengerLocation} />
          <MapViewDirections
              origin={PresentLocation}
              destination={PassengerLocation}
              apikey={GOOGLE_MAPS_APIKEY}
              strokeWidth={3}
              strokeColor="hotpink"
                    />

            

            

          </MapView>
          <SlidingPanel
                    headerLayoutHeight={100}
                    headerLayout={() =>
                        <View style={styles.headerLayoutStyle}>
                            {this.renderElement()}
                            {this.renderDefaultImage(NotificationInfo.ID)}
                            <Text style={styles.driverTextStyle}>{NotificationInfo.FirstName}</Text>
                        </View>
                    }
                    slidingPanelLayout={() =>
                        <View style={styles.slidingPanelLayoutStyle}>
                            {this.renderElement()}
                            <Text>Hmm</Text>
                            <Button
                                buttonStyle={{ marginTop: 20 }}
                                backgroundColor="#03A9F4"
                                title="Cancel Ride"
                                onPress={() => this.onCancel(NotificationInfo.ID)}
                            />
                            <Button
                                buttonStyle={{ marginTop: 20 }}
                                backgroundColor="#03A9F4"
                                title="Accept Ride"
                                onPress={() => this.onAccept(NotificationInfo.ID, PassengerLocation)}
                            />
                        </View>
                    }
                />
          <Header transparent>
            <Left>

              <Icon name="ios-menu" onPress={() =>this.props.navigation.openDrawer()
                } />

            </Left>
            <Body />
            <Right />
          </Header>

          { // Below is what gets data from redux store 
          }

        

        </Container>
      )
      

      
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

              <Icon name="ios-menu" onPress={() =>this.props.navigation.openDrawer()
                } />

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
  buttonsContainer: {
    alignItems: 'center'
  },
  map: { ...StyleSheet.absoluteFillObject },
  horizontal: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 10
  },
  buttonsContainer: {
    alignItems: 'center'
  },
  PassengerImage: {
        width: 95,
        height: 95,
        borderRadius: 75
    },
    headerLayoutStyle: {
        width,
        height: 100,
        backgroundColor: 'rgba(0,0,0, 0.9)',
        justifyContent: 'space-evenly',
        //alignItems: 'center',
        flexDirection: 'row',
    },
    driverTextStyle: {
        color: 'white',
        fontSize: 18,
        marginTop: 30,
    },

    distanceTextStyle: {
      color: 'white',
      fontSize: 10,
      marginTop: 25,
    },
    slidingPanelLayoutStyle: {
        width,
        height,
        backgroundColor: '#808080',
        justifyContent: 'center',
        alignItems: 'center',
    },

})
