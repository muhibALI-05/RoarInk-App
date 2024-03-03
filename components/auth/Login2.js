import React, { Component } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export class Login2 extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isPolitician: null,
    };
  }

  onOptionSelect = (isPolitician) => {
    this.setState({ isPolitician });
  };

  onContinue = () => {
    if (this.state.isPolitician === null) {
      // Show an error or alert the user to select an option
      return;
    }

    if (this.state.isPolitician) {
      // Redirect to politician options page
      //this.props.navigation.navigate('PoliticianOptions');
    } else {
      // Redirect to feed page
      this.setState({ loggedIn: false });
      this.props.navigation.navigate('Feed');
    }
  };

  render() {
    return (
      <View style={styles.container}>
        <Text style={styles.questionText}>Are you a politician?</Text>
        <TouchableOpacity
          style={[styles.optionButton, this.state.isPolitician === false && styles.selectedOption]}
          onPress={() => this.onOptionSelect(false)}
        >
          <Text style={styles.optionButtonText}>No</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.optionButton, this.state.isPolitician === true && styles.selectedOption]}
          onPress={() => this.onOptionSelect(true)}
        >
          <Text style={styles.optionButtonText}>Yes</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.continueButton} onPress={this.onContinue}>
          <Text style={styles.continueButtonText}>Continue</Text>
        </TouchableOpacity>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  questionText: {
    fontSize: 18,
    marginBottom: 20,
  },
  optionButton: {
    backgroundColor: '#0BCC9E',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  selectedOption: {
    backgroundColor: '#0BCC9E', // Change color for selected option
  },
  optionButtonText: {
    color: 'white',
    fontSize: 16,
  },
  continueButton: {
    backgroundColor: '#4A7AFF',
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
  },
  continueButtonText: {
    color: 'white',
    fontSize: 16,
  },
});

export default Login2;
