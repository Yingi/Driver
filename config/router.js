import React from 'react';
import { StyleSheet } from "react-native";
import { createStackNavigator, createDrawerNavigator } from "react-navigation";
import SignIn from "../app/screens/SignIn";
import SignUp from "../app/screens/SignUp";
import Home from "../app/screens/Home";
import Enroute from "../app/screens/Enroute";
import StartRide from "../app/screens/StartRide";
import MyProfile from "../app/screens/MyProfile";
import MyNotificationsScreen from "../app/screens/MyNotificationsScreen";
import ForgotPassword from "../app/screens/ForgotPassword";
import { USER } from "../app/auth";
import DrawerComponent from './DrawerContent'



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
},
    {
        headerMode: 'float',
        navigationOptions: ({ navigation }) => ({
            header: null,
        }),
    });


export const HomeStack = createDrawerNavigator({
    Home: {
        screen: MyApp
    },

    MyProfile: {
        screen: MyProfile

    },
    MyNotificationsScreen: {
        screen: MyNotificationsScreen
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
        headerMode: 'float',
        navigationOptions: ({ navigation }) => ({
            header: null,
        }),

    });


const Route = (val) => {
    if (val) {
        return ('Drawer')
    }
    return ('SignIn')

}

// Below function will route to Drawer if signedIn is true else SignedOut
// It will also route to NewUser if its a first time user
export const RootNavigator = (val) => {

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
            initialRouteName: Route(val),
            headerMode: 'float',
            navigationOptions: ({ navigation }) => ({
                header: null,
            }),
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