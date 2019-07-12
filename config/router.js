import React from 'react';
import { StyleSheet } from "react-native";
import { createStackNavigator, createDrawerNavigator } from "react-navigation";
import SignIn from "../app/screens/SignIn";
import SignUp from "../app/screens/SignUp";
import Home from "../app/screens/Home";
import Enroute from "../app/screens/Enroute";
import StartRide from "../app/screens/StartRide";
import RideHistory from "../app/screens/RideHistory";
import UnVerifiedDriver from "../app/screens/UnVerifiedDriver";
import MyNotificationsScreen from "../app/screens/MyNotificationsScreen";
import ForgotPassword from "../app/screens/ForgotPassword";
import { USER } from "../app/auth";
import DrawerComponent from './DrawerContent';




export const MyApp = createStackNavigator({
    Main: {
        screen: Home
    },
    Enroute: {
        screen: Enroute
    },
    StartRide: {
        screen: StartRide
    }
}
    );


export const HomeStack = createDrawerNavigator({
    Home: {
        screen: MyApp
    },

    RideHistory: {
        screen: RideHistory

    }

},
    {
        initialRouteName: 'Home',
        drawerPosition: 'left',
        drawerBackgroundColor: 'blue',
        contentComponent: DrawerComponent,
        drawerOpenRoute: 'DrawerOpen',
        drawerCloseRoute: 'DrawerClose',
        drawerToggleRoute: 'DrawerToggle',
        

    });


const Route = (val, claim) => {
    if (val && claim) {
        console.log(val)
        console.log(claim)
        console.log("Should route now boy")
        return ('Drawer')
    }
    else if(val) {
        console.log(val)
        console.log("Why is this showing")
        console.log(claim)
        
        return ('UnVerifiedDriver')
    }
    
    else {

        console.log(claim)
        console.log('Between')
        console.log(val)
        console.log('Going to Sign In')
        return ('SignIn')
    }
    
    

}

// Below function will route to Drawer if signedIn is true else SignedOut
// It will also route to NewUser if its a first time user
export const RootNavigator = (val, claim) => {

    return createStackNavigator(

        {
            SignIn: {
                screen: SignIn,
                navigationOptions: {
                    title: "Sign In",


                }

            },

            SignUp: {
                screen: SignUp,
                navigationOptions: {
                    title: "Sign Up",


                }
            },
            UnVerifiedDriver: {
                screen: UnVerifiedDriver

            },
            ForgotPassword: {
                screen: ForgotPassword,
                navigationOptions: {
                    title: "Forgot Password",

                }
            },

            Drawer: {
                screen: HomeStack
            }

        },
        {
            initialRouteName: Route(val, claim),
            
        }


    )
}

const styles = StyleSheet.create({
    drawerImage: {
        width: 150,
        height: 150,
        borderRadius: 75
    },
});