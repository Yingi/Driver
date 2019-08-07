import React, { Component } from 'react';
import { View, Text, Dimensions, Image, Alert, StyleSheet, Animated, ActivityIndicator, TouchableOpacity } from "react-native";
import MaterialIcons from "react-native-vector-icons";
import { Icon } from "react-native-elements";
import { Container, Left, Header, Body, Title, Button, Right } from 'native-base';
import { GeoFirestore } from 'geofirestore';
import firebase from 'react-native-firebase';
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';
import NavigationService from '../../NavigationService';
import MapViewDirections from 'react-native-maps-directions';
import SlidingUpPanel from 'rn-sliding-up-panel';
import Geolocation from 'react-native-geolocation-service';
import { callNumber, NavigateNow } from './utils';
import LaunchNavigator from 'react-native-launch-navigator';


import Dialog, { DialogFooter, DialogTitle, DialogButton, DialogContent } from 'react-native-popup-dialog';

import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

const { height } = Dimensions.get('window');

export default class StartRide extends Component {
  static navigationOptions = { 
    header: null
      }
    
    //Note That When Driver Arrives at Passenger Location, Passenger
    // Destination is now thesame as Drivers Present Location.

    // We use the Passenger DropOffAddress to navigate to the destination
    // But we use PassengerDestination which is also Drivers Current Location
    // Coordinates to calculate fare

    // We have three coordinates input in this component

    // 1. DropOffAddress to Launch Navigator
    // 2. PassengerDestination which is also Drivers Location used to
    //    show map region and to used as the start up point for Navigator
    // 3. PassengerOrigin used by combining it with PassengerDestination
    //    to calculate fare.


    static defaultProps = {
      draggableRange: {
        top: height / 1.75,
        bottom: 120
      }
    }
  
    _draggedValue = new Animated.Value(120)

    constructor(props) {
    super(props);
    this.state = {
      
      visible: false,
      PassengerOrigin: this.props.navigation.state.params.PassengerOrigin,
      PassengerPhotoUrl: this.props.navigation.state.params.PassengerPhotoUrl,
      MyLocationLat: 0.02,
      MyLocationLong: 0.02,
      PassengerDestination: { latitude: 0.02, longitude: 0.02 },
      PassengerDetails: this.props.navigation.state.params.NotificationData,
      prevLatLng: { latitude: 0.02, longitude: 0.02 },
      concatOrigin: "",
      concatDest: "",
      carPrice: 0.00,
      autoPrice: 0.00,
      CalculatingFare: false,
      meter: 0

    }

    console.log("New Page UP")
    console.log(this.state.PassengerOrigin.latitude)
    console.log(this.state.PassengerDetails)

    // Check if u can Have Watch Position and Get Position thesame time
    // Because watchPosition doesnt trigger position when component Mounts at first
    Geolocation.getCurrentPosition(
        (position) => {
  
          // For some reason navigator refused to work on this itel phone
          
          
          
          console.log('Geolocation Working Now')
          this.setState({
            PassengerDestination: { latitude: position.coords.latitude, longitude: position.coords.longitude },
            prevLatLng: { latitude: position.coords.latitude, longitude: position.coords.longitude },
            MyLocationLat: position.coords.latitude,
            MyLocationLong: position.coords.longitude,
          });
          
          
  
        },
        (error) => {
  
          Alert.alert(error.message)
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 },
      );

      
}


CalculateFare() {
  Geolocation.clearWatch(this.watchTrip)
  
  dataBase = firebase.firestore()
  let user = firebase.auth().currentUser;

  let dsM = this.state.meter
  let CarPricePerMetre = 0.15065637
  let CarPrice = Math.round(CarPricePerMetre * dsM)
  let BasePrice = 200
  if (CarPrice > BasePrice){
              let DriverRef = dataBase.collection("drivers").doc(user.uid)
              
              let TripRefKey = dataBase.collection('TripKey').doc(this.state.PassengerDetails.ID)
              //Get Ride Key
              //Use the Ride Key to update Ride Price in Ride collection
              TripRefKey.get()
              .then((val) => {
                const RefID = val.get('Key')
                //Now update Ride
                let Ride = dataBase.collection('Rides').doc(RefID)
                Ride.update({Fare: CarPrice, Status: 'Completed'})

                //Now Update Driver Ref with Trip
                DriverRef.collection('Trips').doc(RefID).set({Fare: CarPrice, DropOffAddress: this.state.PassengerDetails.DropOffAddress})
                
                
              })
              .then(() => {
                //Remove Driver From DriversWorking and Immediately 
                
                let user = firebase.auth().currentUser;
                let DriverWorkingRef = dataBase.collection("DriversWorking").doc(user.uid)
                DriverWorkingRef.delete()
                console.log("Delete Homie")
                //Remove NewRide Child from Driver
                let Ref = dataBase.collection("drivers").doc(user.uid)
                Ref.collection("NewRide").doc(this.state.PassengerDetails.ID).delete()
              })

              this.setState({carPrice: CarPrice, CalculatingFare: false })
              
              Alert.alert(
                'Trip Fare',
                `Amount For Your Trip is N${CarPrice}`,
                [
                  {text: 'OK', onPress: () => this.HomeScreen()}
                ],
                { cancelable: false }
              )
            }
          else {
              let DriverRef = dataBase.collection("drivers").doc(user.uid)
              let TripRefKey = dataBase.collection('TripKey').doc(this.state.PassengerDetails.ID)
              
              //Get Ride Key
              //Use the Ride Key to update Ride Price in Ride collection
              TripRefKey.get()
              .then((val) => {
                const RefID = val.get('Key')
                //Now update Ride
                let Ride = dataBase.collection('Rides').doc(RefID)
                Ride.update({Fare: BasePrice, Status: 'Completed'})

                //Now Update Driver Ref with Trip
                
                DriverRef.collection('Trips').doc(RefID).set({Fare: BasePrice, DropOffAddress: this.state.PassengerDetails.DropOffAddress})
               
                
              })
              .then(() => {
                //Remove Driver From DriversWorking and Immediately Put Him On
                //DriversAvailable
                let user = firebase.auth().currentUser;
                let DriverWorkingRef = dataBase.collection("DriversWorking").doc(user.uid)
                DriverWorkingRef.delete()

                //Remove NewRide Child from Driver
                let Ref = dataBase.collection("drivers").doc(user.uid)
                Ref.collection("NewRide").doc(this.state.PassengerDetails.ID).delete()
              })
              this.setState({carPrice: BasePrice, CalculatingFare: false })
              
              Alert.alert(
                'Trip Fare',
                `Amount For Your Trip is N${BasePrice}`,
                [
                  {text: 'OK', onPress: () => this.HomeScreen()}
                ],
                { cancelable: false }
              )
            }
}

calculateDistance(newCoordinate){

  
  let start = this.state.prevLatLng
  let end = newCoordinate
  const haversine = require('haversine')
  value = haversine(start, end, {unit: 'meter'})
  /// We should know that this value give us the meters in decimal. That is 32.000

  this.setState({
    prevLatLng: newCoordinate,
    meter: this.state.meter + value
    })


}

watchDriverTrip(){
  this.watchTrip = Geolocation.watchPosition(
        (position) => {
  
          // For some reason navigator refused to work on this itel phone
          let dist = { latitude: position.coords.latitude, longitude: position.coords.longitude }
          this.calculateDistance(dist)

          
          console.log('Trip Has just started')
          this.setState({
            PassengerDestination: { latitude: position.coords.latitude, longitude: position.coords.longitude },
            prevLatLng: { latitude: position.coords.latitude, longitude: position.coords.longitude },
            MyLocationLat: position.coords.latitude,
            MyLocationLong: position.coords.longitude,
          });
          
          
  
        },
        (error) => {
  
          Alert.alert(error.message)
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000, distanceFilter:100 },
      );

}

componentDidMount(){

  // Tell Passenger When You have arrived at their destination
  
  let user = firebase.auth().currentUser;
  dataBase = firebase.firestore()

  const geoFirestore = new GeoFirestore(dataBase);
  const GeoRef = geoFirestore.collection('DriversWorking');

  console.log('Did it create')
  const DocumentData = {
  Arrived: 'Yes'
  } 
        
  GeoRef.doc(user.uid).update(DocumentData);


}

HomeScreen() {
  console.log('Should go to Home Driver')
  NavigationService.navigate("Main")
}





 calculate() {
  
  this.CalculateFare()

}

LaunchRoute = () => {
    this.setState({visible: true})
    
    let dropOff = this.state.PassengerDetails.DropOffAddress
    LaunchNavigator.setGoogleApiKey("AIzaSyBIXZvDmynO3bT7i_Yck7knF5wgOVyj5Fk");
    LaunchNavigator.navigate(dropOff)
        .then(() => this.watchDriverTrip())
        .catch((err) => console.error("Error launching navigator: "+err));
}

renderBottomDrawer = (PresentLocation) => {
  return (
  
  <View style={styles.bottomDrawer}>
      <Text style={{paddingHorizontal: 5, color: 'white'}}>Start Trip Now</Text>
    
    <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-evenly'}}>
                      <Button rounded light style={{marginTop: 30}}>
                          <Icon name="call" onPress={() => callNumber(this.state.PassengerDetails.PhoneNumber)}
                           />
                          
                      </Button>

                      <Button rounded light style={{marginTop: 30}}>
                          <Icon name="directions" onPress={() => this.LaunchRoute()}
                           />
                          
                      </Button>
                          
                          
                          
      </View>
  </View>
  )
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

render () {
        const MyLocation = this.state.PassengerDestination
        
        let angle = this.state.Angle || 0

        const {top, bottom} = this.props.draggableRange

    const draggedValue = this._draggedValue.interpolate({
      inputRange: [bottom, top],
      outputRange: [0, 1],
      extrapolate: 'clamp'
    })

    const transform = [{scale: draggedValue}]

    

        return (
        
        

        <View style={styles.container}>

            
          <MapView
            provider={PROVIDER_GOOGLE}
            style={styles.map}
            region={{
              latitude: this.state.MyLocationLat,
              longitude: this.state.MyLocationLong,
              latitudeDelta: 0.02,
              longitudeDelta: 0.02,
            }}
          >
            
          

            <MapView.Marker.Animated
                coordinate={MyLocation}
                anchor={{x: 0.35, y: 0.32}}
                ref= {marker => {this.marker = marker}}
                style={{
                    transform: [{
                            rotate: angle === undefined ? 
                            '0deg' : `${angle}deg`
                            }],
                     width: 50, height:50}}
                image={require('../images/CarMark2.png')}
            />


          </MapView>
          {
            this.state.CalculatingFare ? (
              
                <View
                  style={{
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center'
                  }}
                >
                  <ActivityIndicator size='large' color="#00ff00" />
                </View>
            )
              : 
            (
              null
            )
              
            }

          <Dialog
            visible={this.state.visible}
            width={0.9}
            rounded

            dialogTitle={
              <DialogTitle
                title="Arrived at Passengers Destination?"
                style={{
                  backgroundColor: '#F7F7F8',
                }}
                hasTitleBar={false}
                align="left"
              />
            }
            footer={
            <DialogFooter>
              <DialogButton
              text="CANCEL"
              bordered
              onPress={() => {
                this.setState({ visible: false })
              }}
              />
        <DialogButton
          text="YES"
          bordered
          onPress={() => {
            this.setState({ visible: false, CalculatingFare: true })
            this.calculate()
          }}
        />
      </DialogFooter>
    }
  >
    <DialogContent>
    <Text>Arrived at DropOff ?</Text>
    <Text>Click CANCEL To Keep Navigating, Or Click YES To End Trip</Text>
    </DialogContent>
  </Dialog>
          

          

          <SlidingUpPanel
          showBackdrop={false}
          ref={c => (this._panel = c)}
          draggableRange={this.props.draggableRange}
          animatedValue={this._draggedValue}>
          <View style={styles.panel}>
            <Animated.View style={[styles.favoriteIcon, {transform}]}>
            {this.renderDefaultImage(this.state.PassengerDetails.ID)}
            </Animated.View>
            <View style={styles.panelHeader}>
              <Text style={{color: '#FFF'}}>{this.state.PassengerDetails.Name}</Text>
            </View>

            <View style={styles.panelContent}>
            

                <TouchableOpacity style={{marginTop: 30, justifyContent: 'center', alignItems: "center"}} onPress={() => callNumber(this.state.PassengerDetails.PhoneNumber)}>
                    <Icon name="call" color={'blue'} size={25}/> 
                    <Text>Call</Text>
                </TouchableOpacity>


                <TouchableOpacity style={{marginTop: 30, justifyContent: 'center', alignItems: "center"}} onPress={() => this.LaunchRoute()}>
                <Icon name="directions" color={'red'} size={25}/>
                <Text>Start Trip</Text>
                </TouchableOpacity>
            </View>

          </View>
        </SlidingUpPanel>    

          

        

        </View>
      )
}
}

const styles = StyleSheet.create({
  map: { ...StyleSheet.absoluteFillObject },
  container: {
      flex: 1,
      backgroundColor: '#f8f9fa',
      alignItems: 'center',
      justifyContent: 'center'
    },
    panel: {
      flex: 1,
      backgroundColor: 'white',
      position: 'relative'
    },
    panelContent:{
      flexDirection: 'row', 
      alignItems: 'center', 
      justifyContent: 'space-evenly'
    },
    driverImage: {
      width: 35, 
      height: 35,
      borderRadius: 75
      },
    panelHeader: {
      height: 120,
      backgroundColor: '#b197fc',
      alignItems: 'center',
      justifyContent: 'center'
    },
    favoriteIcon: {
      position: 'absolute',
      top: -24,
      right: 24,
      backgroundColor: '#2b8a3e',
      width: 48,
      height: 48,
      padding: 8,
      borderRadius: 24,
      zIndex: 1
    }
    
});
