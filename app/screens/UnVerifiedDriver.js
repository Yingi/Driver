import React, { Component } from 'react';
import { View, Text, Button, Image, StyleSheet } from "react-native";
import MaterialIcons from "react-native-vector-icons";
import { onSignOut } from "../auth";
import { StackActions, NavigationActions } from 'react-navigation';
import firebase from 'react-native-firebase';

export default class UnVerifiedDriver extends Component {
    

    constructor(props) {
    super(props);
    
    

  }

  SignOut = () => {
    firebase.auth().signOut()
        .then(() => onSignOut())
        .then(() => {
            //this.props.navigation.navigate("SignIn")
            var navActions = StackActions.reset({
                index: 0,
                key: null,
                actions: [
                    NavigationActions.navigate({ routeName: "SignIn" })
                ]
            });

            this.props.navigation.dispatch(navActions);

        })
}
    

    render() {
        return (
            <View style={{ marginTop: 25, padding: 25 }}>
            <Text>You are not Officially Registered By BertaCabs</Text>
            <Button
                        buttonStyle={{
                            backgroundColor: "rgba(0,0,0, 0.8)",
                            height: 45,
                            width: 300,
                            borderColor: "transparent",
                            borderWidth: 0,
                            borderRadius: 5
                        }}
                        title="SIGN OUT"
                        onPress={this.SignOut.bind(this)}
                    />
            </View>
        );
    }
}
const styles = StyleSheet.create({
    icon: {
        width: 24,
        height: 24,
    },
});