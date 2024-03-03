import React, { Component } from 'react';
import { View, TextInput, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { getAuth, signInWithEmailAndPassword, sendPasswordResetEmail, fetchSignInMethodsForEmail } from 'firebase/auth';
import { db } from '../firebase-config'; 
import { Ionicons } from '@expo/vector-icons';

class Login extends Component {
  constructor(props) {
    super(props);

    this.state = {
      email: '',
      password: '',
      resetPasswordEmail: '',
      showResetPassword: false,
      resetEmailSent: false,
      emailExists: false,
      errorMessage: '',
      isPasswordVisible: false,
    };

    this.onSignIn = this.onSignIn.bind(this);
    this.onForgotPassword = this.onForgotPassword.bind(this);
    this.onResetPassword = this.onResetPassword.bind(this);
    this.checkEmailExists = this.checkEmailExists.bind(this);
    this.togglePasswordVisibility = this.togglePasswordVisibility.bind(this);
  }



  async onSignIn() {
    const { email, password } = this.state;
    const auth = getAuth();

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log('User signed in:', user);
      // Navigate to the next screen or perform any other actions upon successful sign-in.
    } catch (error) {
      console.error('Error signing in:', error.code, error.message);
      this.setState({ errorMessage: 'Invalid email or password' });
    }
  }

  onForgotPassword() {
    // Toggle the "Forgot Password" UI
    this.setState({
      showResetPassword: true,
      resetEmailSent: false,
      emailExists: false,
      errorMessage: '',
    });
  }

  onResetPassword() {
    const { resetPasswordEmail } = this.state;

    if (resetPasswordEmail.trim() === '') {
      this.setState({ errorMessage: 'Please enter your email.' });
      return;
    }

    const auth = getAuth();

    sendPasswordResetEmail(auth, resetPasswordEmail)
      .then(() => {
        console.log('Password reset email sent');
        this.setState({
          resetEmailSent: true,
          errorMessage: '',
          showResetPassword: false, // Hide the reset password UI after sending the email
        });
      })
      .catch((error) => {
        console.error(error);
        this.setState({ errorMessage: 'Error sending password reset email.' });
      });
  }

  checkEmailExists() {
    const { resetPasswordEmail } = this.state;
    const auth = getAuth();

    fetchSignInMethodsForEmail(auth, resetPasswordEmail)
      .then((methods) => {
        const emailExists = methods.length > 0;
        this.setState({ emailExists });
        if (emailExists) {
          console.log('Email exists:', resetPasswordEmail);
          // You can perform additional actions if needed
        } else {
          this.setState({ errorMessage: 'Email does not exist!', resetEmailSent: false });
        }
      })
      .catch((error) => {
        console.error(error);
        this.setState({ errorMessage: 'Error checking email existence.' });
      });
  }

  togglePasswordVisibility = () => {
    this.setState((prevState) => ({ isPasswordVisible: !prevState.isPasswordVisible }));
  };

  onSignUpLinkPress = () => {
    this.props.navigation.navigate('Register');
  };

  render() {
    const { showResetPassword, resetEmailSent, emailExists, errorMessage } = this.state;

    return (
      <View style={styles.container}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Image
            source={require('../../assets/images/roarinklogo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        {/* Heading */}
        <View style={styles.headingContainer}>
          <Text style={styles.headingText}>Login</Text>
        </View>

        {/* Subheading */}
        <View style={styles.subheadingContainer}>
          <Text style={styles.subheadingText}>
            Please login to continue with the app
          </Text>
        </View>

        {/* Email Input */}
        <View style={styles.inputContainer}>
          <Image
            source={require('../../assets/loginpage/Profile.png')}
            style={styles.inputIcon}
            resizeMode="contain"
          />
          <TextInput
            style={styles.input}
            placeholder="Email address or Phone number"
            keyboardType="email-address"
            autoCompleteType="email"
            onChangeText={(email) => this.setState({ email })}
          />
        </View>

        {/* Password Input */}
        <View style={styles.inputContainer}>
          <Image
            source={require('../../assets/loginpage/Lock.png')}
            style={styles.inputIcon}
            resizeMode="contain"
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            autoCompleteType="password"
            secureTextEntry={!this.state.isPasswordVisible}
            onChangeText={(password) => this.setState({ password })}
          />
          <TouchableOpacity
            onPress={this.togglePasswordVisibility}
            style={styles.eyeIconContainer}
          >
            <Ionicons
              name={this.state.isPasswordVisible ? 'eye' : 'eye-off'}
              size={20}
              color="#A49797"
              style={styles.visibilityIcon}
            />
          </TouchableOpacity>
        </View>

        {/* Forgot Password Link */}
        <TouchableOpacity
          onPress={() => this.onForgotPassword()}
          style={styles.forgotPasswordContainer}
        >
          <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
        </TouchableOpacity>

        {/* Login Button */}
        <TouchableOpacity
          style={styles.loginButton}
          onPress={() => this.onSignIn()}
          title="Sign In"
        >
          <Text style={styles.loginButtonText}>Login</Text>
        </TouchableOpacity>

        <View>
          <Text style={styles.ortext}>or</Text>
        </View>

        {/* Social Buttons */}
        <View style={styles.socialButtonsContainer}>
          <TouchableOpacity style={styles.socialButton}>
            <Image
              source={require('../../assets/loginpage/google.png')}
              style={styles.socialIcon}
              resizeMode="contain"
            />
            <Text style={styles.socialButtonText}>
              Continue with Google
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.socialButton}>
            <Image
              source={require('../../assets/loginpage/fb.png')}
              style={styles.socialIcon}
              resizeMode="contain"
            />
            <Text style={styles.socialButtonText}>
              Continue with Facebook
            </Text>
          </TouchableOpacity>
        </View>

        {/* Sign Up Link */}
        <View style={styles.signUpContainer}>
          <Text style={{ color: '#A49797' }}>
            {' '}
            Don't have an account?{' '}
            <Text
              style={styles.signUpText}
              onPress={this.onSignUpLinkPress}
            >
              {' '}
              Sign up{' '}
            </Text>
          </Text>
        </View>

        {/* Password Reset UI */}
        {showResetPassword && (
          <View>
            <TextInput
              style={styles.input}
              placeholder="Enter your email"
              onChangeText={(resetPasswordEmail) =>
                this.setState({ resetPasswordEmail })
              }
            />
            <Button
              onPress={this.onResetPassword}
              title="Reset Password"
            />
          </View>
        )}

        {resetEmailSent && (
          <Text style={styles.successMessage}>
            Password reset email has been sent!
          </Text>
        )}

        {errorMessage !== '' && (
          <Text style={styles.errorMessage}>{errorMessage}</Text>
        )}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  successMessage: {
    color: 'green',
    marginTop: 10,
  },
  errorMessage: {
    color: 'red',
    marginTop: 10,
  },
  container: {
    alignItems: 'center',
    marginTop: 25,
    backgroundColor: 'white',
  },

  logo: {
    height: 150,
    width: 150,
  },
  headingContainer: {
    justifyContent: 'center',
  },
  headingText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'black',
    marginTop: -30,
  },
  subheadingContainer: {
    justifyContent: 'center',
    marginTop: 4,
    marginBottom: 50,
  },
  ortext: {
    color: '#A49797',
  },
  subheadingText: {
    fontSize: 10,
    color: '#A49797',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '90%',
    borderWidth: 1,
    borderColor: '#E3E3E3',
    borderRadius: 10,
    marginVertical: 10,
  },
  input: {
    height: 50,
    padding: 12,
  },
  inputIcon: {
    width: 20,
    height: 20,
    marginLeft: 10,
  },
  forgotPasswordContainer: {
    alignSelf: 'flex-end',
    marginVertical: 10,
    marginRight: '5%',
  },
  forgotPasswordText: {
    color: '#4A7AFF',
  },
  loginButton: {
    width: '90%',
    backgroundColor: '#0BCC9E',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginVertical: 20,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 16,
  },
  socialButtonsContainer: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    width: '90%',
    marginVertical: 10,
    backgroundColor: 'white',
  },
  socialButton: {
    backgroundColor: 'white',
    flexDirection: 'row',
    height: 55,
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E3E3E3',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 5,
  },
  socialIcon: {
    width: 20,
    height: 20,
    marginRight: 10,
  },
  socialButtonText: {
    color: 'black',
    fontSize: 14,
  },
  signUpContainer: {
    padding: 50,
    backgroundColor: 'white',
  },
  signUpText: {
    color: '#4A7AFF',
  },
  eyeIconContainer: {
    position: 'absolute',
    right: 10,
    zIndex: 1,
  },
});

export default Login;
