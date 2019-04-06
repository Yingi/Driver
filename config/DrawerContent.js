import React from 'react'
import { View, Platform, Text, Image, StyleSheet, ScrollView, TouchableOpacity, AsyncStorage } from 'react-native'
import { DrawerItems, NavigationActions } from 'react-navigation'
import { USER } from '../app/auth';
import { Container, Icon, Left, Content, Header, Body, Right } from 'native-base';
import { db } from "./MyFirebase";
import { Button } from "react-native-elements";
import ImagePicker from 'react-native-image-crop-picker';
import { saveImage } from "./database";
import { onSignOut } from "../app/auth";
import NavigationService from '../NavigationService';

export default class DrawerComponent extends React.PureComponent {
    constructor(props) {
        super(props)
        this.state = {
            user: null,
            avatarPic: null,
            image: null
        }
    }

    componentDidMount() {
        this.fetchData()
    }

    pickCamera() {
        let user = db.auth().currentUser;
        ImagePicker.openCamera({
            cropping: true,
            width: 500,
            height: 500,
            includeBase64: true,
            includeExif: true,
            cropperCircleOverlay: true
        })
            .then(image => {
                saveImage(user.uid, image.path)

                this.setState({
                    image: {
                        uri: image.path,
                        width: image.width,
                        height: image.height,
                        mime: image.mime,
                        size: image.size
                    }
                });




            })
            .catch(e => console.log(e));
    }


    fetchData = async () => {
        let data = await AsyncStorage.getItem(USER)
        this.setState({ user: data })
    }

    SignOut = () => {
        db.auth().signOut()
            .then(() => onSignOut())
            .then(() => this.props.navigation.navigate("SignedOut"))
    }

   

    renderImage(image) {
        return (
            <Image
                style={styles.drawerImage}
                source={image} />
        )
    }

    renderDefaultImage() {
        return (
            <Image style={styles.drawerImage}
                source={require('../app/images/user.png')} />
        )
    }

    render() {
        let { user } = this.state
        return (
            <Container>
                <Header style={{ height: 200, backgroundColor: "white" }}>
                    <Body>
                        {this.state.image ? this.renderImage(this.state.image) : this.renderDefaultImage()}

                        <Text>{user}</Text>

                        <TouchableOpacity onPress={this.pickCamera.bind(this)}>
                            <Text>Take a Picture</Text>
                        </TouchableOpacity>


                    </Body>
                </Header>
                <Content>

                    <DrawerItems {...this.props} />
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
                    
                </Content>
            </Container>
        )

        /*return (
            <ScrollView contentContainerStyle={{ flex: 1 }}>
                <View style={{ width: '100%', height: '30%', backgroundColor: 'white' }}>
                    <Image
                        style={{ width: 50, height: 50 }}
                        source={{ uri: this.state.avatarPic }}
                    />

                    <TouchableOpacity
                        onPress={() => {
                            this.props.properties.navigation.navigate('UserInfo')
                        }}
                        style={{ marginTop: 10 }}>
                        <Text>{user.name ? user.name : 'New User'}</Text>
                    </TouchableOpacity>

                </View>

                <DrawerItems {...this.props.properties} />

            </ScrollView>
        )*/
    }
}

const styles = StyleSheet.create({
    drawerImage: {
        width: 150,
        height: 150,
        borderRadius: 75
    },
});