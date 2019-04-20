import React, { Component } from 'react';
import { View, Platform, Image, Switch, Dimensions, PermissionsAndroid, StyleSheet, TouchableOpacity, ActivityIndicator, AsyncStorage, Alert } from "react-native";
import { Card, Button, Text } from "react-native-elements";
import { onSignOut, USER } from "../auth";
import { db } from "../../config/MyFirebase";
import firebase from 'react-native-firebase';
import Geolocation from 'react-native-geolocation-service';
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';
import { listenUserName } from "../../config/database";
import RNGooglePlaces from 'react-native-google-places';
import MapViewDirections from 'react-native-maps-directions';
import { Container, Icon, Left, Header, Body, Title, Right } from 'native-base';
import Spinner from 'react-native-spinkit';
import NavigationService from '../../NavigationService';
import SlidingPanel from 'react-native-sliding-up-down-panels';
import { Avatar } from 'react-native-elements';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import SwitchToggle from 'react-native-switch-toggle';
import { GeoFirestore } from 'geofirestore';
import CountdownCircle from 'react-native-countdown-circle'


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
      
      switchOn1: false,
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

    this.props.navigation.replace("Enroute", {PassengerLocation: Location, data: this.state.NotificationData})


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

    componentWillUnmount() {
      console.log('First Page has Unmounted')
      
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

    onPress1 = () => {
    dataBase = firebase.firestore()
    let user = firebase.auth().currentUser;
    let DriverRef = dataBase.collection('DriversAvailable').doc(user.uid)

    this.setState({ switchOn1: !this.state.switchOn1 });

    if (!this.state.switchOn1) {
      //Remember instead of Update, You are setting DriversAvailable with Location
      const geoFirestore = new GeoFirestore(dataBase);
      const GeoRef = geoFirestore.collection('DriversAvailable');
      const DocumentData = { 
              Name: 'Ebiowei Seikegba M',
              coordinates: new firebase.firestore.GeoPoint(this.state.MyLocationLat, 
                                                this.state.MyLocationLong)};
      GeoRef.doc(user.uid).set(DocumentData);
      
    }

    else {
      // Here u are taking away Driver From DriversAvailable
      DriverRef.delete()
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
        
        
        <View style={{ height: hp('60%') }}>
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
          <MapView.Marker coordinate={PassengerLocation}>
          <View style={{backgroundColor: "red", padding: 10}}>
            <Text>SF</Text>
          </View>
          </MapView.Marker>
          
          <MapViewDirections
              origin={PresentLocation}
              destination={PassengerLocation}
              apikey={GOOGLE_MAPS_APIKEY}
              strokeWidth={3}
              strokeColor="hotpink"
                    />

            

            

          </MapView>
          <CountdownCircle
            seconds={10}
            radius={30}
            borderWidth={8}
            color="#ff003f"
            bgColor="#fff"
            textStyle={{ fontSize: 20 }}
            onTimeElapsed={() => console.log('Elapsed!')}
        />
          </View>

      <View style={styles.panelContainer}>
        <View style={{
                  flex: 1,
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'stretch',
                  
            }}>
          <TouchableOpacity onPress={() => this.onAccept(NotificationInfo.ID, PassengerLocation)}>
            
            <View style={{height: 1}}>
            <Text style={{color: 'white',
                            fontSize: 10,
                            }}>Tap To Accept</Text>
            </View>

            <View style={styles.headerLayoutStyle}>
            
                {this.renderElement()}
                {this.renderDefaultImage(NotificationInfo.ID)}
                <Text style={styles.driverTextStyle}>{NotificationInfo.FirstName}</Text>
            
            </View>

            
            
           
            
            
          </TouchableOpacity>
        </View>
        </View>
      
          
          <Header transparent>
            <Left>

              <Icon name="ios-menu" onPress={() =>this.props.navigation.toggleDrawer()
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
            
              <Icon name="ios-menu" onPress={() =>this.props.navigation.toggleDrawer()
                } />

            </Left>
        
            
            <Right>
            

                
					<SwitchToggle
          containerStyle={{
            marginTop: 16,
            width: 70,
            height: 35,
            borderRadius: 25,
            backgroundColor: '#ccc',
            padding: 5
            
          }}
          circleStyle={{
            width: 30,
            height: 30,
            borderRadius: 19,
            backgroundColor: 'white', // rgb(102,134,205)
          }}
          switchOn={this.state.switchOn1}
          onPress={this.onPress1}
          backgroundColorOn='#a0e1e5'
          backgroundColorOff='dimgray'
          circleColorOff='gainsboro'
          circleColorOn='darkturquoise'
          duration={500}
        />
									

            
            </Right>
            
            
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
        width: 70,
        height: 70,
        borderRadius: 75,
        marginTop: 15,
    },
    panelContainer: {
      height: hp('40%'),
      backgroundColor: 'rgba(0,0,0, 0.9)', 
      
    },
    headerLayoutStyle: {
        width,
        height: 100,
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
    component: {
	    width: '100%',
	    flexDirection: 'row',
	    paddingLeft: 7.5,
	    paddingRight: 7.5,
	    paddingTop: 7.5,
	    paddingBottom: 7.5,
	},
	
	layouts: {
	    flexDirection: 'row',
	    flexWrap: 'wrap',
	},
	
	layout1: {
	    width: '100%',
	    height: 90,
	},
	
	itemcontainer1: {
	    width: '100%',
	    height: '100%',
	    paddingTop: 7.5,
	    paddingBottom: 7.5,
	    paddingLeft: 7.5,
	    paddingRight: 7.5,
	},
	
	itemcontainer1Inner: {
	    width: '100%',
	    height: '100%',
	    position: 'relative',
	    alignItems: 'center',
	    justifyContent: 'center',
	},
	
	item1: {
	    width: '100%',
	    height: '100%',
	    alignItems: 'center',
	    justifyContent: 'center',
	    overflow: 'hidden',
	},

})
