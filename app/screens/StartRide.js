import React, { Component } from 'react';
import { View, Text, Dimensions, Image, Alert, StyleSheet } from "react-native";
import { Card} from "react-native-elements";
import MaterialIcons from "react-native-vector-icons";
import { Container, Icon, Left, Header, Body, Title, Button, Right } from 'native-base';
import { GeoFirestore } from 'geofirestore';
import firebase from 'react-native-firebase';
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import NavigationService from '../../NavigationService';
import SlidingPanel from 'react-native-sliding-up-down-panels';
import Geolocation from 'react-native-geolocation-service';
import { callNumber, NavigateNow } from './utils';
import BottomDrawer from 'rn-bottom-drawer';
import LaunchNavigator from 'react-native-launch-navigator';

import Dialog, { DialogFooter, DialogTitle, DialogButton, DialogContent } from 'react-native-popup-dialog';

import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';


export default class StartRide extends Component {
    
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

    constructor(props) {
    super(props);
    this.state = {
      
      visible: false,
      PassengerOrigin: this.props.navigation.state.params.PassengerOrigin,
      MyLocationLat: 0.02,
      MyLocationLong: 0.02,
      PassengerDestination: { latitude: 0.02, longitude: 0.02 },
      PassengerDetails: this.props.navigation.state.params.NotificationData,
      concatOrigin: "",
      concatDest: "",
      carPrice: 0.00,
      autoPrice: 0.00,

    }

    console.log("New Page UP")
    console.log(this.state.PassengerOrigin.latitude)
    console.log(this.state.PassengerDetails)

    // Check if u can Have Watch Position and Get Position thesame time
    // Because watchPosition doesnt trigger position when component Mounts at first
    Geolocation.watchPosition(
        (position) => {
  
          // For some reason navigator refused to work on this itel phone
          
          
          
          console.log('Geolocation Working Now')
          this.setState({
            PassengerDestination: { latitude: position.coords.latitude, longitude: position.coords.longitude }
          });
          
          
  
        },
        (error) => {
  
          Alert.alert(error.message)
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 },
      );
}

mergeLocationCoordinates = (origin, destination) => {

    let concatOrigin = origin.latitude + "," + origin.longitude
    let concatDest = destination.latitude + "," + destination.longitude
    this.setState({
        concatOrigin: concatOrigin,
        concatDest: concatDest
    });
}

CalculateFare = () => {
    let PassengerOrigin = this.state.PassengerOrigin
    let PassengerDestination = this.state.PassengerDestination
    let API_KEY = 'AIzaSyBIXZvDmynO3bT7i_Yck7knF5wgOVyj5Fk'
    this.mergeLocationCoordinates(PassengerOrigin, PassengerDestination);

    

    fetch(`https://maps.googleapis.com/maps/api/distancematrix/json?origins=${this.state.concatOrigin}&destinations=${this.state.concatDest}&key=${API_KEY}`)
        .then(response =>
            response.json())
        .then(responseJson => {
            let dsM = responseJson.rows[0].elements[0].distance.value
            let CarPricePerMetre = 0.12065637
            let CarPrice = Math.round(CarPricePerMetre * dsM)

            let BasePrice = 200

            //Check if car fare is greater than base Price
            // If its not then set the carPrice as Base Price
            // If its greater than base price, then set carPrice
            // as the car fare Price
            this.setState({carPrice: CarPrice })
        })
}

LaunchRoute = (origin) => {
    this.setState({visible: true})
    let dropOff = this.state.PassengerDetails.DropOffAddress
    LaunchNavigator.setGoogleApiKey("AIzaSyBIXZvDmynO3bT7i_Yck7knF5wgOVyj5Fk");
    LaunchNavigator.navigate(dropOff)
        .then(() => console.log("Launched navigator"))
        .catch((err) => console.error("Error launching navigator: "+err));
}

renderBottomDrawer = (PresentLocation) => {
  return (
  
  <View style={styles.bottomDrawer}>
      <Text style={{paddingHorizontal: 5, color: 'white'}}>Start Trip Now</Text>
    
    <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-evenly'}}>
                      <Button rounded light style={{marginTop: 30}}>
                          <Icon name="ios-call" onPress={() => callNumber(this.state.PassengerDetails.PhoneNumber)}
                           />
                          
                      </Button>

                      <Button rounded light style={{marginTop: 30}}>
                          <Icon name="md-navigate" onPress={() => this.LaunchRoute()}
                           />
                          
                      </Button>
                          
                          
                          
      </View>
  </View>
  )
}

render () {
        const MyLocation = this.state.PassengerDestination
        const NotificationInfo = this.state.NotificationData
        let angle = this.state.Angle || 0

        return (
        <Container>
        <Header>
          <Left>
            <Button transparent>
              <Icon name="ios-menu" onPress={() =>this.props.navigation.openDrawer()
                } />
            </Button>
          </Left>
          <Body>
            <Title>Header</Title>
          </Body>
          <Right />
        </Header>

        <View style={{ height: hp('70%') }}>

            
          <MapView
            provider={PROVIDER_GOOGLE}
            style={styles.map}
            region={{
              latitude: MyLocation.latitude,
              longitude: MyLocation.longitude,
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
                image={require('../images/car-icon.png')}
            />


          </MapView>

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
            this.CalculateFare()
          }}
        />
      </DialogFooter>
    }
  >
    <DialogContent>
    <Text>Default Animation</Text>
    <Text>No onTouchOutside handler. will not dismiss when touch overlay.</Text>
    </DialogContent>
  </Dialog>
          </View>

          

            <BottomDrawer
                containerHeight={100}
                offset={109}
                roundedEdges={true}
                backgroundColor={'#000000'}
                >
                {this.renderBottomDrawer(MyLocation)}
            </BottomDrawer>
          

          

        

        </Container>
      )
}
}

const styles = StyleSheet.create({
  
bottomDrawer: {
  flex: 1,
  alignItems: 'center',
  justifyContent: 'space-around'
},
map: { ...StyleSheet.absoluteFillObject }
})