import React from 'react'
import { Text, Image, StyleSheet, TouchableOpacity, AsyncStorage } from 'react-native'
import { DrawerItems, StackActions, NavigationActions } from 'react-navigation'
import { USER } from '../app/auth';
import { Container, Content, Header, Body } from 'native-base';

import { Button, Icon } from "react-native-elements";
import ImagePicker from 'react-native-image-crop-picker';
import { saveImage } from "./database";
import { onSignOut } from "../app/auth";

import firebase from 'react-native-firebase';

export default class DrawerComponent extends React.PureComponent {
    constructor(props) {
        super(props)
        this.state = {
            user: null,
            avatarPic: null,
            image: null,
            url: null
        }
    }

    componentDidMount() {
        this.fetchData()
    }

    galleryPick() {
        let user = firebase.auth().currentUser;
        console.log("Open Camera")
        ImagePicker.openPicker({
            width: 300,
            height: 400,
            cropping: true
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

    pickCamera() {
        let user = firebase.auth().currentUser;
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
        firebase.auth().signOut()
            .then(() => onSignOut())
            .then(() => {
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

                        <TouchableOpacity onPress={this.galleryPick.bind(this)}>
                        <Text>Open Gallery</Text>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={this.pickCamera.bind(this)}>
                            <Icon name="camera" color="#000000" size={25} style={{alignSelf: 'center', left: 40}}/>
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

        
    }
}

const styles = StyleSheet.create({
    drawerImage: {
        width: 150,
        height: 150,
        borderRadius: 75
    },
});