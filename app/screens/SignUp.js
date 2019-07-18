import React, { Component } from 'react';
import { View, Alert, ScrollView, ActivityIndicator } from "react-native";
import { Card, Button, Input, Text, TextInput, AsyncStorage } from "react-native-elements";
import { onSignIn, firstUser } from "../auth";
import { db } from "../../config/MyFirebase";
import firebase from 'react-native-firebase';
import Database from "../../config/database";
import { StackActions, NavigationActions } from "react-navigation";
import { TextField } from 'react-native-material-textfield';
import { RaisedTextButton } from 'react-native-material-buttons';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';


let styles = {
  scroll: {
    backgroundColor: '#E8EAF6',
  },

  container: {
    margin: 8,
    marginTop: 24,
  },

  contentContainer: {
    padding: 8,
  },
};

export default class SignUp extends Component {

  constructor(props) {
    super(props);
    this.onFocus = this.onFocus.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
    this.onChangeText = this.onChangeText.bind(this);
    this.onSubmitFirstName = this.onSubmitFirstName.bind(this);
    this.onSubmitLastName = this.onSubmitLastName.bind(this);
    this.onSubmitEmail = this.onSubmitEmail.bind(this);
    this.onSubmitPassword = this.onSubmitPassword.bind(this);
    this.onSubmitPasswordConfirm = this.onSubmitPasswordConfirm.bind(this);
    this.onAccessoryPress = this.onAccessoryPress.bind(this);

    this.firstnameRef = this.updateRef.bind(this, 'firstname');
    this.lastnameRef = this.updateRef.bind(this, 'lastname');
    this.emailRef = this.updateRef.bind(this, 'email');
    this.phoneNumberRef = this.updateRef.bind(this, 'phoneNumber');
    this.passwordRef = this.updateRef.bind(this, 'password');
    this.passwordConfirmRef = this.updateRef.bind(this, 'passwordConfirm');

    this.renderPasswordAccessory = this.renderPasswordAccessory.bind(this);
    this.state = {
      secureTextEntry: true,
      password: "",
      passwordConfirm: "",
      phoneNumber: "",
      error: "",
      authenticating: false,
      confirmResult: null,
      VerificationId: null,
      codeInput: '',
      message: '',
      signUpScreen: true,
      ConfirmingCode: false

    }
  }

  onFocus() {
    let { errors = {} } = this.state;

    for (let name in errors) {
      let ref = this[name];

      if (ref && ref.isFocused()) {
        delete errors[name];
      }
    }

    this.setState({ errors });
  }

  onChangeText(text) {
    ['firstname', 'lastname', 'email', 'phoneNumber', 'password', 'passwordConfirm']
      .map((name) => ({ name, ref: this[name] }))
      .forEach(({ name, ref }) => {
        if (ref.isFocused()) {
          this.setState({ [name]: text });
        }
      });
  }

  onAccessoryPress() {
    this.setState(({ secureTextEntry }) => ({ secureTextEntry: !secureTextEntry }));
  }

  onSubmitFirstName() {
    this.lastname.focus();
  }

  onSubmitLastName() {
    this.email.focus();
  }

  onSubmitEmail() {
    this.phoneNumber.focus();
  }

  onSubmitPhoneNumber() {
    this.password.focus();
  }

  onSubmitPassword() {
    this.password.focus();
  }
  onSubmitPasswordConfirm() {
    this.passwordConfirm.blur();
  }

  isEmptyError(obj) {
    for (var key in obj) {
      if (obj.hasOwnProperty(key))
        return false;
    }
    return true;
  }

  onSubmit() {
    let errors = {};

    if (this.state.password != this.state.passwordConfirm) {
      Alert.alert("Password Did Not Match");
      return;
    }

    ['firstname', 'lastname', 'email', 'phoneNumber', 'password', 'passwordConfirm']
      .forEach((name) => {
        let value = this[name].value();

        if (!value) {
          errors[name] = 'Should not be empty';
        } else {
          if ('password' === name && value.length < 6) {
            errors[name] = 'Too short';
          }
        }
      });

    this.setState({ errors });
    if (this.isEmptyError(errors)) {
      console.log('No SignUp error')
      this.setState({ authenticating: true, signUpScreen: false })
      firebase.auth().createUserWithEmailAndPassword(this.state.email, this.state.password)
        .then(() => this.SaveDbDetails())
        //.then((id) => this.VerifyPhoneNumber())
        //.catch((error) => this.setState({ error: "Authentication Failed" }))
        .catch((error) => console.log(error))
    }
  }

  updateRef(name, ref) {
    this[name] = ref;
  }

  renderPasswordAccessory() {
    let { secureTextEntry } = this.state;

    let name = secureTextEntry ?
      'visibility' :
      'visibility-off';

    return (
      <MaterialIcon
        size={24}
        name={name}
        color={TextField.defaultProps.baseColor}
        onPress={this.onAccessoryPress}
        suppressHighlighting
      />
    );
  }

  

  // This function from our auth.js uses AsyncStorage to store FirstTime User
  VerifyPhoneNumber = () => {
    console.log(this.state.phoneNumber)
        
        firebase
          .auth()
          .verifyPhoneNumber(this.state.phoneNumber)
          .on(
            'state_changed',
            phoneAuthSnapshot => {
              switch (phoneAuthSnapshot.state) {
                case firebase.auth.PhoneAuthState.AUTO_VERIFIED:
                    console.log(phoneAuthSnapshot)
                    
                    let verificationId = phoneAuthSnapshot.verificationId
                    let code = phoneAuthSnapshot.code
                    let user = firebase.auth().currentUser
                    credential = firebase.auth.PhoneAuthProvider.credential(verificationId, code)
                    user.linkWithCredential(credential)
                    
                    console.log('code auto_verified')
    
                    user.updateProfile({
                      phoneNumber: this.state.phoneNumber
                    }).then(function() {
                      console.log('Update Successful')
                    }).catch(function(error) {
                      console.log('Error')
                    });
          
                    dataBase = firebase.firestore()
                    let userRef = dataBase.collection('drivers')
                    userRef.doc(user.uid).update({PhoneNumber: this.state.phoneNumber})
                    this.props.navigation.navigate("UnVerifiedDriver")
                    break
    
                case firebase.auth.PhoneAuthState.CODE_SENT:
                    console.log(phoneAuthSnapshot)
                    console.log('code sent')
                    this.setState({ VerificationId: phoneAuthSnapshot.verificationId, authenticating: false })
                    
                    break
    
                case firebase.auth.PhoneAuthState.AUTO_VERIFY_TIMEOUT:
                  console.log(phoneAuthSnapshot)
                  console.log('auto verify on android timed out');
                  break
    
    
                case firebase.auth.PhoneAuthState.ERROR:
                  console.log('verification error');
                    break
    
            }
            }
          )
        

  }

  SaveDbDetails = () => {
    let user = firebase.auth().currentUser;
    console.log('User has authenticated')
    
    
    user.updateProfile({
      displayName: `${this.state.firstname} ${this.state.surname}`,
      phoneNumber: `${this.state.phoneNumber}`
      
    }).then(() => {
      
      
      this.props.navigation.navigate("UnVerifiedDriver")
    })
    //We dont need to save Driver Details to database, since we are
    // going to do it via admin
    
    
    

    return (user.uid)

  }

  // This function below uses firebase to create user with email and password
  

  onSignInPress = () => {
    console.log('Navigate Now')
    var navActions = StackActions.reset({
      index: 0,
      actions: [
        NavigationActions.navigate({ routeName: "SignIn" })
      ]
    });

    this.props.navigation.dispatch(navActions);
    console.log('Whats goin on now')
  }



  confirmCode = () => {
    this.setState({ConfirmingCode: true})
    const { codeInput, confirmResult, VerificationId } = this.state;
    
        if (VerificationId && codeInput.length) {
          let user = firebase.auth().currentUser
          credential = firebase.auth.PhoneAuthProvider.credential(VerificationId, codeInput)
          user.linkWithCredential(credential).then(() => {
            user.updateProfile({
            phoneNumber: this.state.phoneNumber
            })
          })
          
          dataBase = firebase.firestore()
          let userRef = dataBase.collection('drivers')
          userRef.doc(user.uid).update({PhoneNumber: this.state.phoneNumber})
          //Dont Navigate to Drawer yet unless Custom Claim is checked
          this.props.navigation.navigate("UnVerifiedDriver")
    
        }
  }


  renderVerificationCodeInput() {
    const { codeInput } = this.state;

    return (
      <View style={{ marginTop: 25, padding: 25 }}>
        <Text>Enter verification code below:</Text>
        <Input
          autoFocus
          style={{ height: 40, marginTop: 15, marginBottom: 15 }}
          onChangeText={value => this.setState({ codeInput: value })}
          placeholder={'Code ... '}
          value={codeInput}
        />
        <Button title="Confirm Code" color="#841584" onPress={this.confirmCode} />
      </View>
    );
  }

  render() {
    let { errors = {}, secureTextEntry, ...data } = this.state;
    const { Name, email, password, passwordConfirm } = this.state;
    if (this.state.authenticating) {
      return (
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >
          <ActivityIndicator size='large' color="#00ff00" />
        </View>
      )
    }
    if (this.state.VerificationId) {
      const { codeInput } = this.state;
      console.log('U should render Now to Verify Phone Input')
      //this.renderVerificationCodeInput()
      return (
        <View style={{ marginTop: 25, padding: 25 }}>
          <Text>Enter verification code below:</Text>
          <Input
            autoFocus
            style={{ height: 40, marginTop: 15, marginBottom: 15 }}
            onChangeText={value => this.setState({ codeInput: value })}
            placeholder={'Code ... '}
            value={codeInput}
          />
          {
            this.state.ConfirmingCode ? (
              
                <View
                  style={{
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center'
                  }}
                >
                  <ActivityIndicator size='large' color="#00ff00" />
                </View>
            )
              : 
            (
              null
            )
              
            }
          <Button title="Confirm Code" color="#841584" onPress={this.confirmCode} />
        </View>
      );
    }
    if (this.state.signUpScreen) {
      return (
        <View style={{ paddingVertical: 20 }}>
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.contentContainer}
            keyboardShouldPersistTaps='handled'
          >
            <Card title="SIGN UP">
              <TextField
                ref={this.firstnameRef}
                value={data.firstname}
                autoCorrect={false}
                enablesReturnKeyAutomatically={true}
                onFocus={this.onFocus}
                onChangeText={this.onChangeText}
                onSubmitEditing={this.onSubmitFirstName}
                returnKeyType='next'
                label='First Name'
                error={errors.firstname}
              />

              <TextField
                ref={this.lastnameRef}
                value={data.lastname}
                autoCorrect={false}
                enablesReturnKeyAutomatically={true}
                onFocus={this.onFocus}
                onChangeText={this.onChangeText}
                onSubmitEditing={this.onSubmitLastName}
                returnKeyType='next'
                label='Last Name'
                error={errors.lastname}
              />


              <TextField
                ref={this.emailRef}
                value={data.email}
                keyboardType='email-address'
                autoCapitalize='none'
                autoCorrect={false}
                enablesReturnKeyAutomatically={true}
                onFocus={this.onFocus}
                onChangeText={this.onChangeText}
                onSubmitEditing={this.onSubmitEmail}
                returnKeyType='next'
                label='Email Address'
                error={errors.email}
              />

              <TextField
                ref={this.phoneNumberRef}
                value={data.phoneNumber}
                onFocus={this.onFocus}
                onChangeText={this.onChangeText}
                onSubmitEditing={this.onSubmitPhoneNumber}
                returnKeyType='next'
                multiline={true}
                blurOnSubmit={true}
                label='Phone Number'
                keyboardType={'phone-pad'}
              />

              <TextField
                ref={this.passwordRef}
                value={data.password}
                secureTextEntry={secureTextEntry}
                autoCapitalize='none'
                autoCorrect={false}
                enablesReturnKeyAutomatically={true}
                clearTextOnFocus={true}
                onFocus={this.onFocus}
                onChangeText={this.onChangeText}
                onSubmitEditing={this.onSubmitPassword}
                returnKeyType='done'
                label='Password'
                error={errors.password}
                title='Password should be more than 8 characters'
                maxLength={30}
                characterRestriction={20}
                renderAccessory={this.renderPasswordAccessory}
              />

              <TextField
                ref={this.passwordConfirmRef}
                value={data.passwordConfirm}
                secureTextEntry={secureTextEntry}
                autoCapitalize='none'
                autoCorrect={false}
                enablesReturnKeyAutomatically={true}
                clearTextOnFocus={true}
                onFocus={this.onFocus}
                onChangeText={this.onChangeText}
                onSubmitEditing={this.onSubmitPasswordConfirm}
                returnKeyType='done'
                label='Confirm Password'
                title='Password should be more than 8 characters'
                maxLength={30}
                characterRestriction={20}
                renderAccessory={this.renderPasswordAccessory}
              />

              <View style={styles.container}>
                <RaisedTextButton onPress={this.onSubmit} title='submit' color={TextField.defaultProps.tintColor} titleColor='white' />
              </View>
            </Card>
          </ScrollView>
        </View>
      );
    }
  }

}