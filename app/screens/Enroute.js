import React, { Component } from 'react';
import { View, Text, Dimensions, Image, StyleSheet, Animated, TouchableOpacity } from "react-native";


import { Button } from 'native-base';
import { Icon } from "react-native-elements";
import { GeoFirestore } from 'geofirestore';
import firebase from 'react-native-firebase';
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import NavigationService from '../../NavigationService';
import SlidingUpPanel from 'rn-sliding-up-panel';
import Geolocation from 'react-native-geolocation-service';
import { callNumber } from './utils';
import LaunchNavigator from 'react-native-launch-navigator';

import Dialog, { DialogFooter, DialogTitle, DialogButton, DialogContent } from 'react-native-popup-dialog';



import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

const { width, height } = Dimensions.get('window');

const TAB_BAR_HEIGHT = 49;


export default class Enroute extends Component {
  static navigationOptions = { 
    header: null
      }

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
      PassengerOrigin: this.props.navigation.getParam('PassengerLocation', 'No_data'),
      MyLocationLat: 0.02,
      MyLocationLong: 0.02,
      NotificationData: this.props.navigation.getParam('data', 'No_data'),
      PassengerPhotoUrl: this.props.navigation.getParam('PassengerPhototUrl', 'No_data')

    }
    
    let user = firebase.auth().currentUser;

    console.log(this.state.NotificationData)
    console.log(this.state.NotificationData.ID)
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
        const DocumentData = {
           
          Angle: position.coords.heading,
          coordinates: 
                new firebase.firestore.GeoPoint(position.coords.latitude, 
                                                position.coords.longitude)};

        // Find a way to store heading angle in database.
        

        
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

    NavigateNow = (origin, destination) => {

      this.setState({visible: true})
      LaunchNavigator.setGoogleApiKey("AIzaSyBIXZvDmynO3bT7i_Yck7knF5wgOVyj5Fk");
      LaunchNavigator.navigate([destination.latitude, destination.longitude], {
      start: `${origin.latitude}, ${origin.longitude}`
      })
      .then(() => console.log("Launched navigator"))
      .catch((err) => console.error("Error launching navigator: "+err));
  }
    

    componentDidMount() {
        console.log(this.state.NotificationData)
        console.log(this.state.PassengerOrigin)

        // get the Phone Number of the Passenger
        

    }

    Move = () => {
      const { NotificationData, PassengerOrigin} = this.state
      this.props.navigation.navigate("StartRide", {PassengerOrigin, NotificationData})

    }

    onMapLayout = () => {
      console.log("Yess Map is Visible")
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

    render() {
        const PresentLocation = { latitude: this.state.MyLocationLat, longitude: this.state.MyLocationLong }
        const GOOGLE_MAPS_APIKEY = 'AIzaSyBIXZvDmynO3bT7i_Yck7knF5wgOVyj5Fk';

        const { NotificationData, PassengerOrigin} = this.state
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
                image={require('../images/CarMark2.png')}
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
          <Dialog
            visible={this.state.visible}
            width={0.9}
            rounded

            dialogTitle={
              <DialogTitle
                title="Arrived at Passengers Location??"
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
            const { NotificationData, PassengerOrigin, PassengerPhotoUrl} = this.state
            this.setState({ visible: false })
            this.props.navigation.navigate("StartRide", {PassengerOrigin, NotificationData, PassengerPhotoUrl})
             
          }}
        />
      </DialogFooter>
    }
  >
    <DialogContent>
    <Text>Arrived</Text>
    <Text>Click CANCEL To Keep Navigating, Or Click YES To Inform Passenger</Text>
    </DialogContent>
  </Dialog>
  

          

<SlidingUpPanel
          showBackdrop={false}
          ref={c => (this._panel = c)}
          draggableRange={this.props.draggableRange}
          animatedValue={this._draggedValue}>
          <View style={styles.panel}>
            <Animated.View style={[styles.favoriteIcon, {transform}]}>
            {this.renderDefaultImage(NotificationData.ID)}
            </Animated.View>
            <View style={styles.panelHeader}>
              <Text style={{color: '#FFF'}}>{NotificationData.Name}</Text>
            </View>

            <View style={styles.panelContent}>
            

                <TouchableOpacity style={{marginTop: 30, justifyContent: 'center', alignItems: "center"}} onPress={() => callNumber(NotificationData.PhoneNumber)}>
                    <Icon name="call" color={'blue'} size={25}/> 
                    <Text>Call</Text>
                </TouchableOpacity>


                <TouchableOpacity style={{marginTop: 30, justifyContent: 'center', alignItems: "center"}} onPress={() => this.onCancel(NotificationData.ID)}>
                <Icon name="close" color={'red'} size={25}/>
                <Text>Cancel</Text>
                </TouchableOpacity>

                
                <TouchableOpacity style={{marginTop: 30, justifyContent: 'center', alignItems: "center"}} onPress={() => this.NavigateNow(PresentLocation, this.state.PassengerOrigin)}>
                <Icon name="directions" color={'red'} size={25}/>
                <Text>Navigate</Text>
                </TouchableOpacity>

            </View>

          </View>
        </SlidingUpPanel>
          

          
          
          { // Below is what gets data from redux store 
          }

        

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
