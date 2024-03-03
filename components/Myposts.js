import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, FlatList } from 'react-native';
import { colors } from './Colors';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, deleteDoc, collection, getDocs } from 'firebase/firestore';

const Feed = (props) => {
  console.log(props)
  const {uid} = props
  console.log("Navigation prop:", props.navigation);
  console.log("Posts in Feed component: ", props.posts);

  const reversedPosts = [...props.posts].reverse();

  const formatPostDate = (creationDate) => {
    // Format the date and time here (you can use a library like 'date-fns' for more advanced formatting)
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric' };
    const formattedDate = new Date(creationDate.seconds * 1000).toLocaleDateString(undefined, options);
    return formattedDate;
  };
  const [likedPosts, setLikedPosts] = useState([]);

  const [followedUsers, setFollowedUsers] = useState([]);

  
  useEffect(() => {
    const fetchFollowedUsers = async () => {
      try {
        const auth = getAuth();
        const firestore = getFirestore();
  
        // Reference to the "following" collection
        const followingCollectionRef = collection(firestore, 'following');
  
        // Reference to the "userFollowing" subcollection within the document for the current user
        const userFollowingRef = collection(followingCollectionRef, auth.currentUser.uid, 'userFollowing');
  
        // Log the document reference path
        console.log('User Following Subcollection Reference:', userFollowingRef.path);
  
        // Get the documents in the "userFollowing" subcollection
        const userFollowingSnapshot = await getDocs(userFollowingRef);
  
        // Log the documents in the "userFollowing" subcollection
        userFollowingSnapshot.forEach(doc => {
          console.log('User Following Document ID:', doc.id);
        });
  
        // Extract the list of followed user IDs from the subcollection documents
        const userFollowing = userFollowingSnapshot.docs.map(doc => doc.id);
  
        // Update the state with the list of followed user IDs
        setFollowedUsers(userFollowing);
      } catch (error) {
        console.error('Error fetching followed users:', error);
      }
    };
  
    // Call the fetchFollowedUsers function when the component mounts
    fetchFollowedUsers();
  }, []);
  


  useEffect(() => {
    const fetchPostDetails = async () => {
      const auth = getAuth();
      const firestore = getFirestore();

      const updatedPosts = await Promise.all(reversedPosts.map(async (item) => {
        // Fetch likes count for each post
        const likeRef = collection(firestore, `posts/${uid}/userPosts/${item.id}/likes`);
        const likesSnapshot = await getDocs(likeRef);
        const likesCount = likesSnapshot.size;

        // Check if the current user has liked the post
        const currentUserLike = likesSnapshot.docs.some(doc => doc.id === auth.currentUser.uid);

        // Fetch comments count for each post
        const commentsRef = collection(firestore, `posts/${uid}/userPosts/${item.id}/comments`);
        const commentsSnapshot = await getDocs(commentsRef);
        const commentsCount = commentsSnapshot.size;

        return { ...item, likesCounter: likesCount, currentUserLike: currentUserLike, commentsCounter: commentsCount };
      }));

      // Update the state with the updated posts
      props.setPosts(updatedPosts);
    };

    // Call the fetchPostDetails function when the component mounts or when posts change
    fetchPostDetails();
  }, [uid, props.setPosts]);
   
  
  const onToggleLike = async (userId, postId, currentUserLike, posts, setPosts) => {
    const auth = getAuth();
    const firestore = getFirestore();
    const likeRef = doc(firestore, `posts/${userId}/userPosts/${postId}/likes`, auth.currentUser.uid);
  
    try {
      const likeDoc = await getDoc(likeRef);
  
      if (likeDoc.exists()) {
        await deleteDoc(likeRef);
        // If the like was removed, decrement the likes counter
        const updatedPosts = posts.map((item) => {
          if (item.id === postId) {
            return { ...item, currentUserLike: false, likesCounter: Math.max(0, item.likesCounter - 1) };
          }
          return item;
        });
        setPosts(updatedPosts);
      } else {
        await setDoc(likeRef, {});
        // If a new like was added, increment the likes counter
        const updatedPosts = posts.map((item) => {
          if (item.id === postId) {
            return { ...item, currentUserLike: true, likesCounter: item.likesCounter + 1 };
          }
          return item;
        });
        setPosts(updatedPosts);
      }
    } catch (error) {
      console.error('Error toggling like/dislike:', error);
    }
  };
  

  return (
    <View style={styles.container}>
      <FlatList
        data={reversedPosts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.postContainer}>
            <View style={styles.headerWrapper}>
              <View style={{ flexDirection: 'row' }}>
                <Image style={styles.profileThumb} source={require('../assets/images/profilepic.png')} />
                <View style={styles.middleContainer}>
                  <Text >{props.userName}</Text>
                  <Text style={styles.subtitleText}>{formatPostDate(item.creation)}</Text>
                </View>
              </View>
              <Image style={styles.icon}
                source={require('../assets/feedPage/options.png')}
              />
            </View>
            <Text style={styles.caption}>{item.caption}</Text>
            <Image style={styles.postImage} source={{ uri: item.downloadURL }} />
            {/* Add other post details like caption, date, etc. */}
            <View style={styles.likesAndCommentsWrapper}>
              <View style={styles.likescontainer}>
                <Image
                  style={styles.likeicon}
                  source={require('../assets/feedPage/likes.png')}
                />
                <Text style={styles.likesTitle}>{item.likesCounter || 0} Likes</Text>
              </View>
              <Text>
                <Text style={styles.likesTitle}>{item.commentsCounter} Comments</Text>
              </Text>
            </View>

            <View style={styles.feedImageFooter}>
              <View style={styles.feddimageFooterLeftWrapper}>
                <TouchableOpacity onPress={() => onToggleLike(uid, item.id, item.currentUserLike, props.posts, props.setPosts)}>
                  <Image
                    style={styles.icons}
                    source={item.currentUserLike ? require('../assets/feedPage/likes.png') : require('../assets/feedPage/Heart.png')}
                  />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => {
                    props.navigation.navigate('Comment', { postId: item.id, uid:uid });
                }}>
                  <Image
                    style={styles.icons}
                    source={require('../assets/feedPage/Chat.png')}
                  />
                </TouchableOpacity>
                
                <TouchableOpacity onPress={() => props.navigation.navigate('SendModal', { followedUsers: followedUsers, postImageLink: item.downloadURL })}>
                    <Image
                      style={styles.icons}
                      source={require('../assets/feedPage/Send.png')}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => {
                    console.log("Pressed Save with imageDownloadURL:", item.downloadURL);
                    props.navigation.navigate('Save', { imageDownloadURL: item.downloadURL });
                  }}>
                    <Image
                      style={styles.icons}
                      source={require('../assets/feedPage/repeat.png')}
                    />
                  </TouchableOpacity>
              </View>
              <Image
                style={styles.icons}
                source={require('../assets/feedPage/Bookmark.png')}
              />
            </View>
            <View style={styles.underLineWRapper}>
              <View style={styles.underLine} />
            </View>
          </View>
        )} // You can adjust the number of columns as needed
      />
    </View>
    // <View style={styles.container}>
    //   <View style={styles.headerWrapper}>
    //     <View style={styles.headerLeftWrapper}>
    //       <Image
    //         style={styles.profileThumb}
    //         source={require('../assets/images/profilepic.png')}
    //       />
    //       <View style={styles.middleContainer}>
    //         <Text style={styles.headerTitle}> name </Text>
    //         <Text style={styles.subtitleText}>12 August 2023</Text>
    //       </View>
    //     </View>
    //     <Image
    //       style={styles.icon}
    //       source={require('../assets/feedPage/options.png')}
    //     />
    //   </View>
    //   <View styles={styles.feedimgcontainer}>
    //     <Text style={styles.caption}>
    //       Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin tempor eget neque lacinia dictum. Donec placerat sed sem vel hendrerit.
    //     </Text>

    //   </View>


    //   <View style={styles.likesAndCommentsWrapper}>
    //     <View style={styles.likescontainer}>
    //       <Image
    //         style={styles.likeicon}
    //         source={require('../assets/feedPage/likes.png')}
    //       />
    //       <Text style={styles.likesTitle}>1,124 Likes</Text>
    //     </View>
    //     <Text>
    //       <Text style={styles.likesTitle}>22.6k Comments</Text>
    //     </Text>
    //   </View>

    //   <View style={styles.feedImageFooter}>
    //     <View style={styles.feddimageFooterLeftWrapper}>
    //       <Image
    //         style={styles.icons}
    //         source={require('../assets/feedPage/Heart.png')}
    //       />
    //       <Image
    //         style={styles.icons}
    //         source={require('../assets/feedPage/Chat.png')}
    //       />
    //       <Image
    //         style={styles.icons}
    //         source={require('../assets/feedPage/Send.png')}
    //       />
    //     </View>
    //     <Image
    //       style={styles.icons}
    //       source={require('../assets/feedPage/Bookmark.png')}
    //     />
    //   </View>
    //   <View style={styles.underLineWRapper}>
    //     <View style={styles.underLine} />
    //   </View>

    // </View>
  );
};

export default Feed;

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    padding: 10,
  },
  postContainer: {
    flex: 1,
    margin: 5,
  },
  postImage: {
    flex: 1,
    aspectRatio: 1 / 1,
    borderRadius: 10,
    marginTop: 5,
  },
  caption: {
    fontSize: 12,
    marginTop: 5,
  },
  container: {
    display: 'flex',
  },
  profileThumb: {
    width: 40,
    height: 40,
    borderRadius: 50,
  },
  middleContainer: {
    marginLeft: 20
  },
  feedimgcontainer: {

  },
  subtitleText: {
    fontSize: 11,
    color: '#888',
  },
  headerWrapper: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
  },
  icon: {
    width: 40,
    height: 40
  },
  icons: {
    width: 20,
    height: 20,
    opacity: 0.6,
    marginRight: 15
  },
  headerLeftWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  caption: {
    padding: 5,
    fontSize: 12,
  },
  feedImage: {
    width: '100%',
    zIndex: 1,
    borderRadius: 10,
    padding: 5
  },
  feedImageFooter: {
    paddingBottom: 10,
    paddingLeft: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  feddimageFooterLeftWrapper: {
    flexDirection: 'row',
    marginLeft: '3%',
  },

  underLine: {
    height: 1,
    backgroundColor: colors.gray1,
  },
  underLineWRapper: {
    marginLeft: 10,
    marginRight: 10,
  },
  likesImage: {
    width: 25,
    height: 25,
  },
  likesAndCommentsWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
  },
  likescontainer: {
    flexDirection: 'row'
  },
  likeicon: {
    height: 20,
    width: 20
  },
  likesTitle: {
    fontSize: 11,
    color: '#A49797',
  },
});