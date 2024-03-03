import React, { useEffect, useState } from 'react';
import { View, Text, Image, ScrollView, StyleSheet, TouchableOpacity, Modal, Pressable, TextInput } from 'react-native';
import Myposts from '../Myposts';
import { Ionicons } from '@expo/vector-icons';
import { getAuth, signOut } from 'firebase/auth';
import { getFirestore, doc, getDoc, collection, query, orderBy, getDocs, setDoc, deleteDoc } from 'firebase/firestore';
import { connect } from 'react-redux';

function Profile(props) {
  console.log(props)
  const [userPosts, setUserPosts] = useState([]);
  const [user, setUser] = useState(null);
  const [following, setFollowing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [showLogoutButton, setShowLogoutButton] = useState(false);
  const [bio, setBio] = useState('');
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [followingCount, setFollowingCount] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      console.log("Received props in Profile: ", props);
  
      if (props.route.params.uid === getAuth().currentUser.uid) {
        setUser(props.currentUser); // Update this line
        setUserPosts(props.posts); // Update this line

        // Fetch and update the user's bio
        const userDoc = await getDoc(doc(getFirestore(), 'users', props.route.params.uid));
        setBio(userDoc.data().bio || '');

        // Fetch and update the following count
        const userFollowingQuery = query(
          collection(getFirestore(), 'following',  props.route.params.uid, 'userFollowing')
        );
        const userFollowingSnapshot = await getDocs(userFollowingQuery);
        setFollowingCount(userFollowingSnapshot.size);
      } else {
        try {
          const userDoc = await getDoc(doc(getFirestore(), 'users', props.route.params.uid));
          const postsQuery = query(
            collection(getFirestore(), 'posts', props.route.params.uid, 'userPosts'),
            orderBy('creation', 'asc')
          );

          const postsSnapshot = await getDocs(postsQuery);

          setUser(userDoc.data());

          const posts = postsSnapshot.docs.map(doc => {
            const data = doc.data();
            const id = doc.id;
            return { id, ...data };
          });

          setUserPosts(posts);

          // Fetch and update the user's bio
          setBio(userDoc.data().bio || '');

          // Fetch and update the following count
          const userFollowingQuery = query(
            collection(getFirestore(), 'following', getAuth().currentUser.uid, 'userFollowing', props.route.params.uid)
          );
          const userFollowingSnapshot = await getDocs(userFollowingQuery);
          setFollowingCount(userFollowingSnapshot.size);
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      }

      if (props.following.indexOf(props.route.params.uid) > -1) {
        setFollowing(true);
      } else {
        setFollowing(false);
      }
    };

    fetchData();
  }, [props.route.params.uid, props.following, props.currentUser, props.posts]);
  

  const onFollow = async () => {
    const followingDocRef = doc(getFirestore(), 'following', getAuth().currentUser.uid, 'userFollowing', props.route.params.uid);
    await setDoc(followingDocRef, {});
  };

  const onUnfollow = async () => {
    const followingDocRef = doc(getFirestore(), 'following', getAuth().currentUser.uid, 'userFollowing', props.route.params.uid);
    await deleteDoc(followingDocRef);
  };

  const showModal = () => {
    setModalVisible(!modalVisible);
  };

  const onLogout = () => {
    signOut(getAuth());
  };

  const saveBio = async () => {
    const userDocRef = doc(getFirestore(), 'users', getAuth().currentUser.uid);

    try {
      await setDoc(userDocRef, { bio }, { merge: true });
      setIsEditingBio(false);
    } catch (error) {
      console.error('Error saving bio:', error);
    }
  };

  useEffect(() => {
    // Check if the modal is open to determine whether to show the logout button
    if (modalVisible) {
      setShowLogoutButton(true);
    } else {
      setShowLogoutButton(false);
    }
  }, [modalVisible]);

  if (user === null) {
    return <View />;
  }

  const renderModalOptions = () => {
    if (props.route.params.uid === getAuth().currentUser.uid) {
      // Options for the user's own profile
      return (
        <>
          <TouchableOpacity onPress={() => console.log('Settings')}>
            <Text style={styles.modalOption}>Settings</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => console.log('Saved')}>
            <Text style={styles.modalOption}>Saved</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setIsEditingBio(true)}>
            <Text style={styles.modalOption}>Edit Bio</Text>
          </TouchableOpacity>
          {showLogoutButton && (
            <TouchableOpacity onPress={() => onLogout()}>
              <Text style={styles.modalOption}>Logout</Text>
            </TouchableOpacity>
          )}
        </>
      );
    } else {
      // Options for someone else's profile
      return (
        <>
          <TouchableOpacity onPress={() => console.log('Block')}>
            <Text style={styles.modalOption}>Block</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => console.log('Share')}>
            <Text style={styles.modalOption}>Share</Text>
          </TouchableOpacity>
        </>
      );
    }
  };
  const postsCount = userPosts.length;

  return (
    <ScrollView style={styles.container}>
      {/* Background Photo */}
      <View style={styles.backgroundContainer}>
        <Image
          source={{ uri: user.backgroundImageUrl }}
          style={styles.backgroundImage}
          resizeMode="cover"
        />
      </View>
      {/* Search and Three Horizontal Icons */}
      <View style={styles.headerIcons}>
        {/* <Image
          source={require('../../assets/images/Search.png')}
          style={styles.search}
        /> */}
        {/* Three Horizontal Icons */}
        <TouchableOpacity onPress={showModal} style={styles.info}>
          <Ionicons name="ellipsis-horizontal" size={24} color="black" />
        </TouchableOpacity>
      </View>
      <Modal
        animationType="none"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(!modalVisible)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setModalVisible(!modalVisible)}
        >
          <View style={styles.modalContainer}>
            {renderModalOptions()}
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={styles.modalOptionClose}>Close</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
      {/* Circular Profile Photo */}
      <View style={styles.profileImageContainer}>
        <Image
          source={{ uri: user.profileImageUrl }}
          style={styles.profileImage}
        />
      </View>

      {/* Name and Email */}
      <View style={styles.nameContainer}>
        <Text style={styles.nameText}>{user.name}</Text>
        <Text style={styles.emailText}>{user.email}</Text>
      </View>

      <View>
        {props.route.params.uid !== getAuth().currentUser.uid ? (
          <View>
            {following ? (
              <TouchableOpacity style={styles.button} onPress={() => onUnfollow()}>
                <Text style={styles.buttonText}>Following</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.button} onPress={() => onFollow()}>
                <Text style={styles.buttonText}>Follow</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          showLogoutButton ? (
            <TouchableOpacity>
            </TouchableOpacity>
          ) : null
        )}
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{postsCount}</Text>
          <Text style={styles.statLabel}>Posts</Text>
        </View>
        {/* <View style={styles.statItem}>
          <Text style={styles.statNumber}>1400</Text>
          <Text style={styles.statLabel}>Followers</Text>
        </View>*/}
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{followingCount}</Text>
          <Text style={styles.statLabel}>Following</Text>
        </View> 
      </View>

      {/* Horizontal Line */}
      <View style={styles.horizontalLine} />

      {/* Bio */}
      <View style={styles.bioContainer}>
        {isEditingBio ? (
          <>
            <Text style={styles.bioHeading}>Edit Bio</Text>
            <TextInput
              style={styles.bioTextInput}
              multiline={true}
              numberOfLines={4}
              value={bio}
              onChangeText={setBio}
            />
            <TouchableOpacity style={styles.button} onPress={saveBio}>
              <Text style={styles.buttonText}>Save</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={styles.bioHeading}>Bio</Text>
            <Text style={styles.bioText}>
              {bio || 'No bio available'}
            </Text>
          </>
        )}
      </View>

      {/* Horizontal Line */}
      <View style={styles.horizontalLine} />
      {/* tabs Line */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={styles.tab}>
          <Image
            source={require('../../assets/images/menu.png')}
            style={styles.tabicon}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.tab}>
          <Image
            source={require('../../assets/images/movie.png')}
            style={styles.tabicon}
          />
        </TouchableOpacity>
      </View>
      {/* Horizontal Line */}
      <View style={styles.horizontalLine} />

      {/* Posts */}
      <View style={styles.postsContainer}>
        {/* <Myposts posts={posts} userName={currentUser.name} /> */}
        <Myposts posts={userPosts} setPosts={setUserPosts} userName={user.name} navigation={props.navigation} uid={props.route.params.uid} />
      </View>
      <View style={styles.blankview}>
        <Text></Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  postsContainer: {
    overflow: 'hidden',
    padding: 10,
  },
  containerGallery: {
    flex: 1,
  },
  containerImage: {
    flex: 1,
  },
  image: {
    flex: 1,
    aspectRatio: 1 / 1,
  },
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  backgroundContainer: {
    height: '5%',
    width: '100%',
    overflow: 'hidden',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    position: 'relative',
  },
  headerIcons: {
    marginLeft: '80%',
    flexDirection: 'row',
  },
  icon: {
    left: 90,
  },
  button: {
    width: 100,
    height: 40,
    alignSelf: 'center',
    backgroundColor: '#0BCC9E',
    justifyContent: 'center',
    borderRadius: 10,
    alignItems: 'center',
    marginLeft: 10,
    marginBottom: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 14,
    paddingHorizontal: 10,
  },
  search: {
    top: 12,
    height: 20,
    width: 20,
    padding: 5,
    tintColor: 'black',
  },
  info: {
    borderRadius: 10,
    padding: 10,
    left: 20,
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  profileImageContainer: {
    alignItems: 'center',
    marginVertical: '-20%', // Adjust the margin as needed
  },
  profileImage: {
    width: 85, // Set a default width
    height: 85, // Set a default height
    borderRadius: 75, // Half of the width and height for a perfect circle
  },
  nameContainer: {
    alignItems: 'center',
    marginTop: '23%',
    marginBottom: 15,
  },
  nameText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  emailText: {
    fontSize: 10,
    color: 'grey',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  statNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    paddingRight: 2,
  },
  statLabel: {
    fontSize: 10,
    color: 'grey',
    paddingLeft: 2,
  },
  horizontalLine: {
    borderBottomWidth: 1,
    borderBottomColor: 'lightgrey',
    marginVertical: 10,
    marginLeft: '5%',
    marginRight: '5%',
  },
  bioContainer: {
    marginVertical: 10,
    paddingHorizontal: 20,
  },
  bioHeading: {
    fontSize: 14,
    color: 'grey',
  },
  bioText: {
    fontSize: 12,
  },
  bioTextInput: {
    fontSize: 12,
    borderColor: 'lightgrey',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 8,
    paddingVertical: 6,
    marginVertical: 10,
  },
  tabsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    padding: 10,
  },
  tabicon: {
    height: 24,
    width: 24,
  },
  blankview: {
    marginBottom: 110,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    position: 'absolute',
    top: 90,
    right: 10,
    padding: 10,
    borderRadius: 10,
    paddingHorizontal: 20,
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

const mapStateToProps = (store) => ({
  currentUser: store.userState.currentUser,
  posts: store.userState.posts,
  following: store.userState.following,
});

export default connect(mapStateToProps, null)(Profile);
