import React, { Component } from 'react';
import { View, Text, Button, Image, StyleSheet } from "react-native";
import MaterialIcons from "react-native-vector-icons";

export default class NotifyMe extends Component {
    

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
                
                title="Notify"
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