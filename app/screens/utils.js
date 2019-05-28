import { Linking, Alert, Platform } from 'react-native';
import LaunchNavigator from 'react-native-launch-navigator';



export const callNumber = (phone) => {
    console.log('callNumber ----> ', phone);
    let phoneNumber = phone;
    if (Platform.OS !== 'android') {
        phoneNumber = `telprompt:${phone}`;
    }
    else  {
        phoneNumber = `tel:${phone}`;
    }
    Linking.canOpenURL(phoneNumber)
        .then(supported => {
            if (!supported) {
                Alert.alert('Phone number is not available');
            } 
            else {
                return Linking.openURL(phoneNumber);
            }
        })
        .catch(err => console.log(err));
};

export const NavigateNow = (origin, destination) => {

    LaunchNavigator.setGoogleApiKey("AIzaSyBIXZvDmynO3bT7i_Yck7knF5wgOVyj5Fk");
    LaunchNavigator.navigate([destination.latitude, destination.longitude], {
    start: `${origin.latitude}, ${origin.longitude}`
    })
    .then(() => console.log("Launched navigator"))
    .catch((err) => console.error("Error launching navigator: "+err));
}