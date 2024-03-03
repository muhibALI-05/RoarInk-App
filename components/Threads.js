import React, { useState, useEffect } from 'react';
import { ScrollView, View, Text, TextInput, TouchableOpacity, Image, StyleSheet, Button } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import ThreadPost from './ThreadPost';
import { getFirestore, collection, addDoc, query, where, serverTimestamp, getDocs } from 'firebase/firestore';
import { app, auth } from './firebase-config';

const Threads = () => {
  const navigation = useNavigation();
  const [searchText, setSearchText] = useState('');
  const [threads, setThreads] = useState([]);
  const [showAddThreadSection, setShowAddThreadSection] = useState(false);
  const [newThreadTitle, setNewThreadTitle] = useState('');
  const [newThreadContent, setNewThreadContent] = useState('');

  const handleBackPress = () => {
    //navigation.popToTop();
    // navigation.goBack();
    console.log("back")
    navigation.reset({
      index: 0,
      routes: [{ name: 'Feed' }],
    });
  };
  
  
  const fetchThreads = async () => {
    try {
      let query = collection(getFirestore(app), 'threads');

      // If there's search text, add a filter to the query
      if (searchText) {
        query = query(collection(getFirestore(app), 'threads'), where('title', '>=', searchText.toLowerCase()));
      }

      const threadsSnapshot = await getDocs(query);
      const threadsData = threadsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setThreads(threadsData);
    } catch (error) {
      console.error('Error fetching threads:', error.message);
      // Handle the error
    }
  };

  useEffect(() => {
    console.log("hello")
    fetchThreads();
  }, [searchText]);


  const toggleAddThreadSection = () => {
    setShowAddThreadSection(!showAddThreadSection);
  };

  const handleAddThread = async () => {
    try {
      // Check if both title and content are provided
      if (newThreadTitle && newThreadContent) {
        const threadDocRef = await addDoc(collection(getFirestore(app), 'threads'), {
          title: newThreadTitle,
          content: newThreadContent,
          createdAt: serverTimestamp(), // Add the creation timestamp
          userId: auth.currentUser ? auth.currentUser.uid : null, // Replace with the actual user ID
          // You can add more fields as needed
        });

        // Reset the input fields and refresh the threads
        setNewThreadTitle('');
        setNewThreadContent('');
        fetchThreads(); // You may need to re-fetch threads to update the list
      } else {
        // Handle the case where either title or content is missing
        console.warn('Please provide both title and content for the new thread.');
      }
    } catch (error) {
      console.error('Error adding thread:', error.message);
      // Handle the error
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.Header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Image source={require('../assets/images/roarinklogo.png')} style={styles.centreicon} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchBarContainer}>
        <Image source={require('../assets/images/Search.png')} style={styles.Searchicon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search"
          value={searchText}
          onChangeText={(text) => setSearchText(text)}
        />
      </View>

      {/* Toggle button for showing/hiding the add thread section */}
      <TouchableOpacity style={styles.toggleButton} onPress={toggleAddThreadSection}>
        <Text style={styles.toggleButtonText}>
          {showAddThreadSection ? 'Hide Add Thread Section' : 'Show Add Thread Section'}
        </Text>
      </TouchableOpacity>
      <View style={styles.horizontalLine} />
      {/* Add Thread Section */}
      {showAddThreadSection && (
        <View style={styles.addThreadContainer}>
          <TextInput
            style={styles.addThreadInput}
            placeholder="Enter thread title"
            value={newThreadTitle}
            onChangeText={(text) => setNewThreadTitle(text)}
          />
          <TextInput
            style={styles.addThreadInput}
            placeholder="Enter thread content"
            value={newThreadContent}
            onChangeText={(text) => setNewThreadContent(text)}
          />
          <TouchableOpacity  style={styles.addButton}>
          <Text  style={styles.addButtonText} onPress={handleAddThread} >Add Thread </Text> 
          </TouchableOpacity>
        </View>
      )}

      {/* Thread Posts */}
      {threads.length === 0 ? (
        // If there are no threads, render a message
        <View style={styles.noThreadsContainer}>
          <Text>No threads found. Add some threads to get started!</Text>
        </View>
      ) : (
        // If there are threads, render ThreadPost components
        threads.map(thread => (
          <ThreadPost key={thread.id} thread={thread} />
        ))
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  Header: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomRightRadius: 20,
    borderBottomLeftRadius: 20,
    justifyContent: 'flex-start',
    backgroundColor: '#E1FFFD',
    padding: 10,
    paddingTop: 45,
  },
  centreicon: {
    height: 40,
    width: 100,
    //tintColor: 'black',
    marginLeft: '27%',
  },
  backButton: {
    padding: 5,
  },
  HeaderText: {
    textAlign: 'center',
    fontWeight: 'bold',
  },
  messageadd: {
    height: 24,
    width: 24,
    marginRight: 10,
  },
  Searchicon: {
    position: 'absolute',
    height: 15,
    width: 15,
    top: 17,
    marginLeft: 10,
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
  toggleButton: {
    padding: 10,
    backgroundColor: '#E1FFFD',
    // marginVertical: 10,
  },
  toggleButtonText: {
    textAlign: 'center',
    fontWeight: 'bold',
  },
  addThreadContainer: {
    padding: 20,
    backgroundColor: '#E1FFFD',
    paddingTop:10,
    // marginVertical: 10,
  },
  addThreadInput: {
    borderWidth: 1,
    borderColor: '#E3E3E3',
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
    backgroundColor:'white'
  },
  noThreadsContainer: {
    padding: 10,
  },
  addButton:{
    width: 150,
    height:40,
    alignSelf:'center',
    backgroundColor: '#0BCC9E',
    justifyContent: 'center',
    borderRadius: 10,
    alignItems: 'center',
    marginLeft:10,
    // marginBottom:10
  },
  addButtonText:{
    color:'white',
    fontSize:14,
    paddingHorizontal:10
  },
  horizontalLine: {
    borderBottomWidth: 1,
    borderBottomColor: 'lightgrey',
    marginLeft: '5%',
    marginRight: '5%',
  },
});

export default Threads;
