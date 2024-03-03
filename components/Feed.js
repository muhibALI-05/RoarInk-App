import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, FlatList, Button, Modal, Pressable } from 'react-native';
import { colors } from './Colors';
import { connect } from 'react-redux';
import { getFirestore, collection, query, orderBy, getDocs, getDoc, doc, setDoc, deleteDoc } from 'firebase/firestore';
import Comment from './main/Comment';
import { format } from 'date-fns';
import { getAuth } from 'firebase/auth';

function Feed(props) {
  //console.log(props)
  console.log(props.following)
  const [posts, setPosts] = useState([]);
  const [showComments, setShowComments] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const handleCommentClick = (postId) => {
    setSelectedPostId(postId);
    setShowComments(true);
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp.seconds * 1000); // Convert seconds to milliseconds
    return format(date, 'MMMM dd, yyyy HH:mm');
  };
  const showModal = () => {
    setModalVisible(!modalVisible);
  };


  useEffect(() => {
    const loadPosts = async () => {
      try {
        let loadedPosts = [];

        if (props.usersFollowingLoaded === props.following.length && props.following.length !== 0) {
          const auth = getAuth();
          const firestore = getFirestore();

          for (let i = 0; i < props.following.length; i++) {
            const user = props.users.find((el) => el.uid === props.following[i]);

            if (user !== undefined) {
              const userPostsCollection = collection(firestore, 'posts', user.uid, 'userPosts');
              const q = query(userPostsCollection, orderBy('creation', 'asc'));
              const postsSnapshot = await getDocs(q);

              const userPosts = await Promise.all(postsSnapshot.docs.map(async (doc) => {
                const data = doc.data();
                const id = doc.id;

                // Query the likes collection for the current userPost
                const likesCollection = collection(firestore, `posts/${user.uid}/userPosts/${id}/likes`);
                const likesSnapshot = await getDocs(likesCollection);

                // Query the comments collection for the current userPost
                const commentsCollection = collection(firestore, `posts/${user.uid}/userPosts/${id}/comments`);
                const commentsSnapshot = await getDocs(commentsCollection);

                // Check if the current user has liked the post
                const currentUserLike = likesSnapshot.docs.some(doc => doc.id === auth.currentUser.uid);

                // Update likesCounter in userPosts document
                const likesCounter = likesSnapshot.size;

                // Update commentCounter in userPosts document
                const commentCounter = commentsSnapshot.size;

                return { id, ...data, user, likesCounter, commentCounter, currentUserLike };
              }));

              loadedPosts = [...loadedPosts, ...userPosts];
            }
          }

          loadedPosts.sort((x, y) => x.creation - y.creation);
          setPosts(loadedPosts);
        }
      } catch (error) {
        console.error('Error loading posts:', error);
      }
    };

    loadPosts();
  }, [props.usersFollowingLoaded, props.following, props.users, props.feed]);



  const onToggleLike = async (userId, postId, currentUserLike) => {
    const auth = getAuth();
    const firestore = getFirestore();
    const likeRef = doc(firestore, `posts/${userId}/userPosts/${postId}/likes`, auth.currentUser.uid);

    try {
      const likeDoc = await getDoc(likeRef);

      if (likeDoc.exists()) {
        await deleteDoc(likeRef);
      } else {
        await setDoc(likeRef, {});
      }
      const likesCollection = collection(firestore, `posts/${userId}/userPosts/${postId}/likes`);
      const likesSnapshot = await getDocs(likesCollection);
      const updatedLikeCount = likesSnapshot.size;

      // Update the state to reflect the change in liking status
      const updatedPosts = posts.map((item) => {
        if (item.user.uid === userId && item.id === postId) {
          return { ...item, currentUserLike: !currentUserLike, likesCounter: updatedLikeCount };
        }
        return item;
      });
      setPosts(updatedPosts);
    } catch (error) {
      console.error('Error toggling like/dislike:', error);
    }
  };


  return (
    <View style={styles.container}>
      <View style={styles.containerGallery}>
        <FlatList
          numColumns={1}
          horizontal={false}
          data={posts}
          renderItem={({ item }) => (

            <View style={styles.postContainer}>
              <View style={styles.headerWrapper}>
                <View style={{ flexDirection: 'row' }}>
                  <Image style={styles.profileThumb} source={{ uri: item.user.profileImageUrl }} />
                  <View style={styles.middleContainer}>
                    <Text >{item.user.name}</Text>
                    <Text style={styles.subtitleText}>{formatTimestamp(item.creation)}</Text>
                  </View>
                </View>
                <TouchableOpacity onPress={showModal}>
                  <Image style={styles.icon}
                    source={require('../assets/feedPage/options.png')}
                  /></TouchableOpacity>
                <Modal
                  animationType="none"
                  transparent={true}
                  visible={modalVisible}
                  onRequestClose={() => {
                    setModalVisible(!modalVisible);
                  }}
                >
                  <Pressable
                    style={styles.modalOverlay}
                    onPress={() => setModalVisible(!modalVisible)}
                  >
                    <View style={styles.modalContainer}>
                      <TouchableOpacity onPress={() => console.log('Not Interested')}>
                        <Text style={styles.modalOption}>Not Interested</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => console.log('Report')}>
                        <Text style={styles.modalOption}>Report</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => setModalVisible(false)}>
                        <Text style={styles.modalOptionClose}>Close</Text>
                      </TouchableOpacity>
                    </View>
                  </Pressable>
                </Modal>
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
                  <Text style={styles.likesTitle}>{item.likesCounter} likes</Text>
                </View>
                <Text>
                  <Text style={styles.likesTitle}>{item.commentCounter} comments</Text>
                </Text>
              </View>

              <View style={styles.feedImageFooter}>
                <View style={styles.feddimageFooterLeftWrapper}>
                  <TouchableOpacity onPress={() => onToggleLike(item.user.uid, item.id, item.currentUserLike)}>
                    <Image
                      style={styles.icons}
                      source={item.currentUserLike ? require('../assets/feedPage/likes.png') : require('../assets/feedPage/Heart.png')}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => props.navigation.navigate('Comment', { postId: item.id, uid: item.user.uid })}>
                    <Image
                      style={styles.icons}
                      source={require('../assets/feedPage/Chat.png')}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => props.navigation.navigate('SendModal', { uid: item.user.uid, followedUsers: props.following, postImageLink: item.downloadURL })}>
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
            </View>)}
        />
      </View>
    </View>
    //////////////////////////////////////////////////////////////////////


  );
};

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
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    position: 'absolute',
    top: '30%',
    right: 10,
    padding: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
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
  following: store.userState.following,
  users: store.usersState.users,
  usersFollowingLoaded: store.usersState.usersFollowingLoaded,
});

export default connect(mapStateToProps, null)(Feed);