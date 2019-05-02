
    
import React, { Component } from 'react';
import { View, Text, Dimensions, Image, StyleSheet } from "react-native";
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
import { callNumber } from './utils';



import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

const { width, height } = Dimensions.get('window');


export default class Enroute extends Component {
    

    constructor(props) {
    super(props);
    this.state = {
      
      PassengerOrigin: this.props.navigation.getParam('PassengerLocation', 'No_data'),
      MyLocationLat: 0.02,
      MyLocationLong: 0.02,
      NotificationData: this.props.navigation.getParam('data', 'No_data')

    }
    
    let user = firebase.auth().currentUser;
    dataBase = firebase.firestore()

     Geolocation.watchPosition(
      (position) => {

        // For some reason navigator refused to work on this itel phone
        
        
    
        this.setState({
          MyLocationLat: position.coords.latitude,
          MyLocationLong: position.coords.longitude,
          Angle: position.coords.heading


        });

        const geoFirestore = new GeoFirestore(dataBase);
        const GeoRef = geoFirestore.collection('DriversWorking');

        console.log('Did it create')
        const DocumentData = { coordinates: 
                new firebase.firestore.GeoPoint(position.coords.latitude, 
                                                position.coords.longitude)};

        
        GeoRef.doc(user.uid).update(DocumentData);
        
        

      },
      (error) => {

        Alert.alert(error.message)
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 },
    );

    }

    onLoad = () => {
    console.log('Marker has Loaded')
    this.forceUpdate()
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

        NavigationService.navigate("Main")
    }

    componentDidMount() {
        console.log(this.state.NotificationData)
        console.log(this.state.PassengerOrigin)

        // get the Phone Number of the Passenger
        

    }

    render() {
        const PresentLocation = { latitude: this.state.MyLocationLat, longitude: this.state.MyLocationLong }
        const GOOGLE_MAPS_APIKEY = 'AIzaSyBIXZvDmynO3bT7i_Yck7knF5wgOVyj5Fk';
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
              latitude: this.state.MyLocationLat,
              longitude: this.state.MyLocationLong,
              latitudeDelta: 0.02,
              longitudeDelta: 0.02,
            }}
            
            onLayout={this.onMapLayout}

          >
            
          

            <MapView.Marker.Animated
                coordinate={PresentLocation}
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


            <MapView.Marker.Animated
                coordinate={this.state.PassengerOrigin}
                anchor={{x: 0.35, y: 0.32}}
                ref= {marker => {this.marker = marker}}
                style={{width: 50, height:50}}
                image={require('../images/PassengerIcon.png')}
            />
            
            
          
          
          
          
          <MapViewDirections
              origin={PresentLocation}
              destination={this.state.PassengerOrigin}
              apikey={GOOGLE_MAPS_APIKEY}
              strokeWidth={3}
              strokeColor="hotpink"
                    />

            

            

          </MapView>
          </View>

          
          <SlidingPanel
                    headerLayoutHeight={100}
                    headerLayout={() =>
                        <View style={styles.headerLayoutStyle}>
                        <Button rounded light style={{marginTop: 30}}>
                            <Icon name="ios-call" onPress={() => callNumber(NotificationInfo.PhoneNumber)}
                             />
                            
                        </Button>
                            
                            
                            <Text style={styles.driverTextStyle}>{NotificationInfo.FirstName}</Text>
                        </View>
                    }
                    slidingPanelLayout={() =>
                        <View style={styles.slidingPanelLayoutStyle}>
                            
                            <Button
                                buttonStyle={{ marginTop: 20 }}
                                backgroundColor="#03A9F4"
                                title="Cancel Ride"
                                onPress={() => this.onCancel(NotificationInfo.ID)}
                            />
                            <Button
                                buttonStyle={{ marginTop: 20 }}
                                backgroundColor="#03A9F4"
                                title="Call"
                                onPress={() => callNumber(this.state.PhoneNumber)}
                            />
                        </View>
                    }
                />
            
          

          { // Below is what gets data from redux store 
          }

        

        </Container>
      )
    }
}
const styles = StyleSheet.create({
    icon: {
        width: 24,
        height: 24,
    },
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
    slidingPanelLayoutStyle: {
        width,
        height,
        backgroundColor: '#808080',
        justifyContent: 'center',
        alignItems: 'center',
    },
});

