import React, { Component } from 'react';
import { View, Text, Button, Image, StyleSheet } from "react-native";
import MaterialIcons from "react-native-vector-icons";

export default class MyNotificationsScreen extends Component {
    static navigationOptions = {
        drawerLabel: 'Notifications',
        drawerIcon: ({ tintColor }) => (
            <Image
                source={require('../images/user.png')}
                style={[styles.icon, { tintColor: tintColor }]}
            />
        )
    };

    constructor(props) {
    super(props);
    this.state = {
      
      NotificationData: this.props.navigation.getParam('data', 'No_data')

    }
    
    

  }
    componentDidMount() {
        console.log(this.state.NotificationData)

    }

    render() {
        return (
            <Button
                onPress={() => this.props.navigation.navigate('MyProfile')}
                title="Go to Profile"
            />
        );
    }
}
const styles = StyleSheet.create({
    icon: {
        width: 24,
        height: 24,
    },
});