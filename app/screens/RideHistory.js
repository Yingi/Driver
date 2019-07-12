import React, { Component } from 'react';
import { View, Text, Button, StyleSheet, Image } from "react-native";
import MaterialIcons from "react-native-vector-icons";

export default class RideHistory extends Component {
    static navigationOptions = {
        drawerLabel: 'Ride History',
        drawerIcon: ({ tintColor }) => (
            <Image
                source={require('../images/user.png')}
                style={[styles.icon, { tintColor: tintColor }]}
            />
        )

    };

    render() {
        return (
            <View>
                <Text>Ride History Unavailable Now</Text>
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