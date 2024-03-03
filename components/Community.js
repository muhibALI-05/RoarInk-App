import React, { useState, useEffect, useRef } from 'react';
import { ScrollView, View, Text, TextInput, TouchableOpacity, Image, StyleSheet, Button, FlatList, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, setDoc, serverTimestamp, collection, addDoc, getDocs, query, orderBy, getDoc } from 'firebase/firestore';
import Article from './Article';

const Community = ({ user }) => {
  const navigation = useNavigation();
  const [searchText, setSearchText] = useState('');
  const [articles, setArticles] = useState([]);
  const [newArticleTitle, setNewArticleTitle] = useState('');
  const [newArticleContent, setNewArticleContent] = useState('');
  const flatListRef = useRef(null);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const articlesCollection = collection(getFirestore(), 'articles');
        const articlesQuery = query(articlesCollection, orderBy('createdAt', 'desc')); // Order by creation time in descending order

        const articlesSnapshot = await getDocs(articlesQuery);
        const articlesData = articlesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        setArticles(articlesData);
      } catch (error) {
        console.error('Error fetching articles:', error.message);
        Alert.alert('Error', 'There was an error fetching articles. Please try again.');
      }
    };

    fetchArticles();
  }, []);

  const handleBackPress = () => {
    //navigation.popToTop();
    // navigation.goBack();
    console.log("back")
    navigation.reset({
      index: 0,
      routes: [{ name: 'Feed' }],
    });
  };


  const renderArticleItem = ({ item }) => {
    const title = extractTitle(item.content);
    return (
      <TouchableOpacity
        style={styles.articleItemContainer}
        onPress={() => handleArticlePress(item)}
      >
        <Text style={styles.article}>{item.username}</Text>
        <Text style={styles.articleTitle}>{title}</Text>
        <Text style={styles.articleContent}>{item.content}</Text>
      </TouchableOpacity>
    );
  };

  const extractTitle = (content) => {
    // Extract the first 15-20 words as the title
    const words = content.split(' ');
    const titleWords = words.slice(0, Math.min(10, words.length));
    return titleWords.join(' ');
  };

  const handleArticlePress = (article) => {
    // Navigate to the article page with the full content
    navigation.navigate('Article', { article });
  };

  const handleArticleSubmit = async () => {
    try {
      // Ensure the user is authenticated
      const currentUser = getAuth().currentUser;
      if (!currentUser) {
        console.error('User not authenticated');
        return;
      }

      const uid = currentUser.uid;

      // Fetch the user data from the Firebase Realtime Database
      const userRef = doc(getFirestore(), 'users', uid);
      const userSnapshot = await getDoc(userRef);
      const userData = userSnapshot.data();

      // Extract the name from user data
      const userName = userData?.name || 'Anonymous';

      const newArticle = {
        username: userName || 'Anonymous', // Use the user's display name if available, otherwise use 'Anonymous'
        title: newArticleTitle,
        content: newArticleContent,
        createdAt: serverTimestamp(),
      };

      // Add the new article to Firestore
      const articlesCollection = collection(getFirestore(), 'articles');
      const newArticleRef = await addDoc(articlesCollection, newArticle);

      // Update the articles state with the newly added article
      setArticles(prevArticles => [newArticle, ...prevArticles]);

      // Clear the article input fields
      setNewArticleContent('');
      setNewArticleTitle('');

      // Scroll to the newly added article
      // This assumes that the FlatList is set up with a keyExtractor that uses article IDs
      // Replace 'articleId' with the actual ID field in your article objects
      // and set FlatList's keyExtractor={(item) => item.articleId}
      // and ref={flatListRef} in FlatList component
      // and ref={(ref) => { flatListRef.current = ref; }} in the FlatList's parent component
      const newArticleIndex = articles.findIndex(article => article.id === newArticleRef.id);
      if (newArticleIndex !== -1) {
        flatListRef.current.scrollToIndex({ index: newArticleIndex, animated: true });
      }
    } catch (error) {
      console.error('Error submitting article:', error.message);
      Alert.alert('Error', 'There was an error submitting your article. Please try again.');
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
      {/* Add Article Section */}
      <View style={styles.articleSection}>
        <Text style={styles.articleHeading}>Add New Article</Text>
        <TextInput
        style={styles.articleTitle} // Add style for the title input
        placeholder="Title" // Placeholder for the title input
        value={newArticleTitle} // Value for the title input
        onChangeText={(text) => setNewArticleTitle(text)} // Handling title input change
        />
        <TextInput
          style={styles.articleInput}
          placeholder="Content"
          multiline
          numberOfLines={4}
          value={newArticleContent}
          onChangeText={(text) => setNewArticleContent(text)}
        />
        <TouchableOpacity style={styles.articleButton} onPress={handleArticleSubmit}>
          <Text style={styles.articleButtonText}>Submit</Text>
        </TouchableOpacity>
      </View>
      {/* List of Articles */}
      <FlatList
        data={articles}
        keyExtractor={(item) => item.id}
        renderItem={renderArticleItem}
        ref={flatListRef}
      />
    </ScrollView>
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
    justifyContent: 'flex-start',
    backgroundColor: '#E1FFFD',
    padding: 10,
    paddingTop: 45,
  },
  centreicon: {
    height: 40,
    width: 100,
    // tintColor: 'black',
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
  articleItemContainer: {
    borderBottomWidth: 1,
    borderColor: '#E3E3E3',
    margin: 10,
    padding: 15,
  },
  article: {

    fontSize: 12,
    marginBottom: 8,
  },
  articleTitle: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  horizontalLine: {
    borderBottomWidth: 1,
    borderBottomColor: 'lightgrey',
    marginLeft: '5%',
    marginRight: '5%',
  },
  articleSection: {
    paddingLeft:20,
    borderBottomWidth:1,
    borderColor:'#E3E3E3'
  },
  articleButton:{
    width: 100,
    height:30,
    backgroundColor: '#0BCC9E',
    justifyContent: 'center',
    borderRadius: 10,
    alignItems: 'center',
    marginBottom:10
  },
  articleButtonText:{
    color:'white'
  },
  articleHeading:{
    fontWeight:'bold',
  }
  


});
export default Community