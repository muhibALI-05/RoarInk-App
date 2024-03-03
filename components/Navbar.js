import React, { Component } from 'react';
import { View, Image, TouchableOpacity, Text, StyleSheet } from 'react-native';
import FeedScreen from './main/Feed';
import ProfileScreen from './main/Profile';
import Conversations from '../screens/Conversations';
import Chat from './main/Chat';
import NotificationsPage from '../screens/Notifications';
import Add from './main/Add'; // Import the Add component

const SCREENS = {
  Feed: FeedScreen,
  Notifications: NotificationsPage,
  Add: Add, // Use the Add component
  Conversations: Conversations,
  Profile: ProfileScreen,
};

export class Main extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeScreen: 'Feed', // Initial active screen
    };
  }

  navigateToScreen = (screenName) => {
    if (screenName === 'AddContainer') {
      // Handle the "AddContainer" case
      // Add your logic for navigating to the "Add" screen or performing the "Add" action
      console.log('Navigate to Add screen or perform the "Add" action');
    } else {
      this.setState({ activeScreen: screenName });
    }
  };

  render() {
    const { activeScreen } = this.state;

    const renderScreen = () => {
      const ScreenComponent = SCREENS[activeScreen];

      if (ScreenComponent) {
        return <ScreenComponent />;
      }

      // Handle the case where Add screen is not defined
      return <Text>Add screen not implemented</Text>;
    };

    return (
      <View style={styles.container}>
        {renderScreen()}

        <View style={styles.navigationContainer}>
          <TouchableOpacity onPress={() => this.navigateToScreen('Feed')} style={styles.navItem}>
            <Image source={require('../assets/images/home.png')} style={styles.icon} />
            
          </TouchableOpacity>

          <TouchableOpacity onPress={() => this.navigateToScreen('Notifications')} style={styles.navItem}>
            <Image source={require('../assets/images/Notification.png')} style={styles.icon} />
          
          </TouchableOpacity>

          <TouchableOpacity onPress={() => this.navigateToScreen('Add')} >
            <Image style={styles.navadd} source={require('../assets/images/add.png')} />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => this.navigateToScreen('Conversations')} style={styles.navItem}>
            <Image source={require('../assets/images/Chat.png')} style={styles.icon} />
            
          </TouchableOpacity>

          <TouchableOpacity onPress={() => this.navigateToScreen('Profile')} style={styles.navItem}>
            <Image source={require('../assets/images/profile.png')} style={styles.icon} />
           
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    padding: 10,
    paddingVertical:5
  },
  navItem: {
    alignItems: 'center',
  },
  icon: {
    width: 26,
    height: 26,
  },
  label: {
    marginTop: 5,
  },
  navadd:{
    height:58,
    width:58,
    bottom:30
  }
});

export default Main;

