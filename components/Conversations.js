import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, Image, StyleSheet, Modal, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { getFirestore, collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import ChatPage from './main/Chat'; // Import your Chat screen component
import { onSnapshot } from 'firebase/firestore';


const ConversationsPage = () => {
  const [activeTab, setActiveTab] = useState('allChats');
  const [searchText, setSearchText] = useState('');
  const [userList, setUserList] = useState([]);
  const navigation = useNavigation(); // Add this line to get the navigation object
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const auth = getAuth();
  useEffect(() => {
    const fetchUsers = async () => {
      const db = getFirestore();
      const followingRef = collection(db, 'following', auth.currentUser.uid, 'userFollowing');
  
      try {
        const snapshot = await getDocs(followingRef);
        const followingList = snapshot.docs.map(doc => doc.id);
        const usersData = [];
  
        for (const userId of followingList) {
          const userDocRef = doc(db, 'users', userId);
          const userSnapshot = await getDoc(userDocRef);
  
          if (userSnapshot.exists()) {
            const userData = userSnapshot.data();
            usersData.push({
              id: userSnapshot.id,
              name: userData.name,
              dob: userData.dob,
              email: userData.email,
              phoneNumber: userData.phoneNumber,
            });
          }
        }
  
        setUserList(usersData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching users:', error);
        setError('Error fetching users');
        setLoading(false);
      }
    };
  
    const unsubscribe = onSnapshot(collection(getFirestore(), 'following', auth.currentUser.uid, 'userFollowing'), () => {
      fetchUsers();
    });
  
    return () => unsubscribe();
  }, []);

const handleTabPress = (tab) => {
  setActiveTab(tab);
};
const showModal = () => {
  setModalVisible(!modalVisible);
};

const allChatsData = [
  {
    id: '1',
    profilePic: require('../assets/images/avatar.jpg'),
    name: 'John Doe',
    lastMessage: 'Hey, how are you?',
    time: '12:30 PM',
  },
  // Add more chat data as needed
];

const groupsData = [
  {
    id: '1',
    groupName: 'Family Group',
    profilePic: require('../assets/images/avatar.jpg'),
    lastMessage: 'Lets plan for the weekend!',
    time: 'Yesterday',
  },
  // Add more group data as needed
];

const callsData = [
  {
    id: '1',
    callerName: 'Alice',
    profilePic: require('../assets/images/avatar.jpg'),
    callType: 'Incoming', // or 'Outgoing'
    time: '2 days ago',
  },
  // Add more call data as needed
];



const renderChatItem = ({ item }) => (
  <TouchableOpacity
    style={styles.chatItem}
    onPress={() => navigation.navigate('ChatPage', { user: item })}
  >
    <Image source={require('../assets/images/profilepic.png')} style={styles.profilePic} />
    <View style={styles.chatContent}>
      <Text style={styles.name}>{item.name}</Text>
    </View>
    <Text style={styles.time}>9:00 PM</Text>
  </TouchableOpacity>
);


const renderGroupItem = ({ item }) => (
  <TouchableOpacity style={styles.chatItem}>
    <Image source={require('../assets/images/profilepic.png')} style={styles.profilePic} />
    <View style={styles.groupContent}>
      <Text style={styles.groupName}>{item.groupName}</Text>
      <Text style={styles.lastMessage}>{item.lastMessage}</Text>
    </View>
    <Text style={styles.time}>9:00 PM</Text>
  </TouchableOpacity>
);

const renderCallItem = ({ item }) => (
  <TouchableOpacity style={styles.chatItem}>
    <Image source={require('../assets/images/profilepic.png')} style={styles.profilePic} />
    <View style={styles.callContent}>
      <Text style={styles.callerName}>{item.callerName}</Text>
      <Text style={styles.callType}>{item.callType} Call</Text>
    </View>
    <Text style={styles.time}>9:00 PM</Text>
  </TouchableOpacity>
);

const renderContent = () => {
  switch (activeTab) {
    case 'allChats':
      return (
        <FlatList
          data={userList}
          keyExtractor={(item) => item.id}
          renderItem={renderChatItem}
        />
      );
    /* case 'groups':
      return (
        <FlatList
          data={groupsData}
          keyExtractor={(item) => item.id}
          renderItem={renderGroupItem}
        />
      );
    case 'calls':
      return (
        <FlatList
          data={callsData}
          keyExtractor={(item) => item.id}
          renderItem={renderCallItem}
        />
      ); */
    default:
      return null;
  }

};

return (
  <View style={styles.container}>

    <View style={styles.Header}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()} >
        <Ionicons name="arrow-back" size={24} color="black" />
      </TouchableOpacity>
      <Text style={styles.HeaderText}>Conversations</Text>
      </View>
    <Modal
      animationType="none"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => { setModalVisible(!modalVisible) }}
    >
      <Pressable
        style={styles.modalOverlay}
        onPress={() => setModalVisible(!modalVisible)}
      >
        <View style={styles.modalContainer}>
          {/* <TouchableOpacity onPress={() => console.log('New Call')}>
            <Text style={styles.modalOption}>New Call</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => console.log('New Group')}>
            <Text style={styles.modalOption}>New Group</Text>
          </TouchableOpacity> */}
          <TouchableOpacity onPress={() => console.log('New Chat')}>
            <Text style={styles.modalOption}>New Chat</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setModalVisible(false)}>
            <Text style={styles.modalOptionClose}>Close</Text>
          </TouchableOpacity>
        </View>
      </Pressable>
    </Modal>

    {/* Search Bar */}
    <View style={styles.searchBarContainer}>
      <Image
        source={require('../assets/images/Search.png')}
        style={styles.Searchicon}
      />
      <TextInput
        style={styles.searchInput}
        placeholder="Search"
        value={searchText}
        onChangeText={(text) => setSearchText(text)}
      />
    </View>

    {/* Tabs */}
    <View style={styles.tabsContainer}>
      <TouchableOpacity
        style={[styles.tab, activeTab === 'allChats' && styles.activeTab]}
        onPress={() => handleTabPress('allChats')}
      >
        <Text style={[styles.tabText, activeTab === 'allChats' && styles.activeText]}>All Chats</Text>
      </TouchableOpacity>
      {/* <TouchableOpacity
        style={[styles.tab, activeTab === 'groups' && styles.activeTab]}
        onPress={() => handleTabPress('groups')}
      >
        <Text style={[styles.tabText, activeTab === 'groups' && styles.activeText]}>Groups</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.tab, activeTab === 'calls' && styles.activeTab]}
        onPress={() => handleTabPress('calls')}
      >
        <Text style={[styles.tabText, activeTab === 'calls' && styles.activeText]}>Calls</Text>
      </TouchableOpacity> */}
    </View>

    {/* Conversations List (Content of the selected tab) */}
    {renderContent()}
  </View>
);
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  Header: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomRightRadius: 20,
    borderBottomLeftRadius: 20,
    justifyContent: 'space-between',
    backgroundColor: '#E1FFFD',
    padding: 10,
    paddingTop: 45,
  },
  backButton: {
    padding: 5,
  },
  HeaderText: {
    textAlign: 'center',
    fontWeight: 'bold',
    marginRight: '37%',
  },
  messageadd: {
    height: 24,
    width: 24,
    marginRight: 10
  },
  Searchicon: {
    position: 'absolute',
    height: 15,
    width: 15,
    top: 17,
    marginLeft: 10
  },
  searchBarContainer: {
    width: '90%',
    alignSelf: 'center',
    marginVertical: 10,
  },
  searchInput: {
    paddingLeft: 30,
    borderWidth: 1,
    fontSize: 11,
    borderColor: '#E3E3E3',
    padding: 10,
    borderRadius: 10,
  },
  tabsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 10,
    marginHorizontal: 10
  },
  tab: {
    flex: 1,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderColor: 'lightgrey',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#0BCC9E',
  },
  activeText: {
    fontWeight: 'bold',
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E3E3E3',
    padding: 10,
  },
  groupContent: {
    flex: 1,
  },
  profilePic: {
    width: 35,
    height: 35,
    borderRadius: 50,
    marginRight: 10,
  },
  groupName: {
    fontWeight: 'bold',
    fontSize: 13,
  },
  callContent: {
    flex: 1,
  },
  name: {
    fontWeight: 'bold',
    fontSize: 13,
  },
  lastMessage: {
    color: 'grey',
    fontSize: 12,
  },
  time: {
    marginLeft: 'auto',
    color: 'grey',
    fontSize: 13,
  },
  callerName: {
    fontWeight: 'bold',
    fontSize: 13,
  },
  callType: {
    color: '#0BCC9E',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    position: 'absolute',
    top: 0,
    right: 10,
    padding: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.40,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalOption: {
    fontSize: 12,
    marginVertical: 10,
    color: 'black',
  },
  modalOptionClose: {
    fontSize: 12,
    color: 'black',
    marginTop: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },

});

export default ConversationsPage;