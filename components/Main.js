import React, { Component } from 'react';
import { SafeAreaView,View, Image, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { fetchUser, fetchUserPosts, fetchUserFollowing, clearData } from '../redux/actions/index'
import { getAuth } from 'firebase/auth';

import FeedScreen from './main/Feed';
import Feed from './Feed';
import ProfileScreen from './main/Profile';
import Conversations from './Conversations';
import NotificationsPage from './Notifications';
import Add from './main/Add'; // Import the Add component


const Tab = createBottomTabNavigator();

const footer_home = require('../assets/images/home.png');
const footer_home_active = require('../assets/images/home_active.png');
const footer_notification = require('../assets/images/Notification.png');
const footer_notification_active = require('../assets/images/Notification_active.png');
const footer_chat = require('../assets/images/Chat.png');
const footer_chat_active = require('../assets/images/Chat_active.png');
const footer_profile = require('../assets/images/profile.png');
const footer_profile_active = require('../assets/images/profile_active.png');
const footer_add = require('../assets/images/add.png');

const EmptyScreen = () => {
  return (null)
}

export class Main extends Component {
  componentDidMount() {
    this.props.clearData();
    this.props.fetchUser();
    this.props.fetchUserPosts();
    this.props.fetchUserFollowing();
  }

  render() {
    return (
      <SafeAreaView style={styles.container}>
        <Tab.Navigator initialRouteName='Feed'
           screenOptions={({ route }) => ({
            headerShown: false, 
            tabBarShowLabel: false,
            tabBarStyle: {
              position: 'absolute',
              shadowColor: 'black',
              shadowOffset: {
                width: 0,
                height: 10,
              },
              shadowOpacity: 0.3,
              shadowRadius: 20,
              elevation: 10,
            },
            tabBarIcon: ({focused}) => {
              let icon = "";
              let size = 24;

              if (route.name === 'Feed') {
                icon = focused ?  footer_home_active : footer_home;
                size = 24;
              } else if (route.name === 'Notification') {
                icon = focused ?  footer_notification_active : footer_notification;
                size = 24;
              } else if (route.name === 'AddContainer') {
                icon = footer_add;
                size = 20;
              } else if (route.name === 'Conversation') {
                icon = focused ?  footer_chat_active : footer_chat;
                size = 24;
              } else if (route.name === 'Profile') {
                icon = focused ?  footer_profile_active : footer_profile;
                size = 24;
              }

              if (route.name === 'AddContainer') {
                return (
                  <View>
                    <Image source={icon}  style={styles.navadd} resizeMode="contain" />
                  </View>
                )
              }else{
                return (
                  <Image source={icon} resizeMode="contain" style={{ width: size, height: size }} />
                )
              }
            }
           })}>
          <Tab.Screen name="Feed" component={FeedScreen} />
          <Tab.Screen name="Notification" component={NotificationsPage} />
          <Tab.Screen name="AddContainer" component={Add} 
            listeners={({ navigation }) => ({
              tabPress: (event) => {
                event.preventDefault();
                navigation.navigate("Add");
              },
            })}
          />
          <Tab.Screen name="Conversation" component={Conversations} />
          <Tab.Screen name="Profile" component={ProfileScreen} 
            listeners={({ navigation }) => ({
              tabPress: (event) => {
                event.preventDefault();
                navigation.navigate('Profile', { uid: getAuth().currentUser.uid });
              },
            })}
          />
        </Tab.Navigator>
        
      </SafeAreaView>
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
    bottom:1,
    justifyContent:'center',
    position: 'absolute',
    left: '50%', // Center horizontally
    marginLeft: -60,
  }
});

const mapStateToProps = (store) => ({
  currentUser: store.userState.currentUser
})
const mapDispatchProps = (dispatch) => bindActionCreators({ fetchUser, fetchUserPosts, fetchUserFollowing, clearData }, dispatch);

export default connect(mapStateToProps, mapDispatchProps)(Main);

