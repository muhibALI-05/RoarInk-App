import React, { useEffect, useState } from 'react';
import { Modal, TouchableOpacity, View, Image, Text, FlatList, Button, TextInput, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { CommonActions } from '@react-navigation/native';
import { Keyboard } from 'react-native';

import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  serverTimestamp,
  query,
  orderBy,
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { fetchUsersData } from '../../redux/actions/index';



function Comment(props) {
  const [comments, setComments] = useState([]);
  const [postId, setPostId] = useState("");
  const [text, setText] = useState("");
  const [modalVisible, setModalVisible] = useState(true);


  const firestore = getFirestore();
  const auth = getAuth();



  useEffect(() => {
    const fetchData = async () => {
      try {
        const q = query(
          collection(
            firestore,
            'posts',
            props.route.params.uid,
            'userPosts',
            props.route.params.postId,
            'comments'
          ),
          orderBy('timestamp', 'desc')
        );
        const snapshot = await getDocs(q);

        const comments = snapshot.docs.map(doc => {
          const data = doc.data();
          const id = doc.id;
          return { id, ...data };
        });

        const updatedComments = await Promise.all(
          comments.map(async comment => {
            if (!comment.hasOwnProperty('user')) {
              const user = props.users.find(x => x.uid === comment.creator);
              if (user === undefined) {
                await props.fetchUsersData(comment.creator, false);
              } else {
                comment.user = user;
              }
            }
            return comment;
          })
        );

        setComments(updatedComments);
      } catch (error) {
        console.error('Error fetching comments:', error.message);
      }
    };

    if (props.route.params.postId !== postId) {
      fetchData();
      setPostId(props.route.params.postId);
    } else {
      fetchData();
    }
    console.log('UID:', props.route.params.uid);
    console.log('PostID:', props.route.params.postId);

  }, [props.route?.params?.postId, props.users]);



  const onCommentSend = async () => {
    if (text.trim() === "") {
      // Check if the comment is empty
      return;
    }

    const auth = getAuth();
    const newComment = {
      creator: auth.currentUser.uid,
      text,
      timestamp: serverTimestamp(),
    };

    // Fetch user data before updating state
    const user = props.users.find(x => x.uid === newComment.creator);
    if (user === undefined) {
      await props.fetchUsersData(newComment.creator, false);
    } else {
      newComment.user = user;
    }

    // Update state immediately to show the new comment
    setComments([newComment, ...comments]);

    await addDoc(
      collection(
        firestore,
        'posts',
        props.route.params.uid,
        'userPosts',
        props.route.params.postId,
        'comments'
      ),
      newComment
    );
    // Clear the input field
    setText("");
    Keyboard.dismiss();
  };
  // Get the navigation object
  const navigation = useNavigation();

  // Replace the "Close" button with a "Back" button
  const renderBackButton = () => {
    return (
      <TouchableOpacity onPress={() => navigation.dispatch(CommonActions.goBack())}>
        <Text style={styles.modalOptionClose}>Close</Text>
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => { setModalVisible(!modalVisible) }}
    >
      <View style={styles.modalContainer}>
        <View style={styles.commentsContainer}>
          {renderBackButton()}
          <FlatList
            numColumns={1}
            horizontal={false}
            data={comments}
            renderItem={({ item }) => (
              // <View style={styles.commentContainer}>
              //   {item.user !== undefined ? (
              //     <Text style={{ fontWeight: 'bold' }}>{item.user.name}</Text>
              //   ) : null}
              //   <Text style={styles.commentText}>{item.text}</Text>
              // </View>

              //////////////
              <View style={styles.commentContainer}>
                <View style={styles.headerWrapper}>
                  <View style={{ flexDirection: 'row' }}>
                    <Image style={styles.profileThumb} source={require('../../assets/images/profilepic.png')} />
                    <View style={styles.middleContainer}>
                      {item.user !== undefined ? (
                        <Text style={{ fontWeight: 'bold' }}>{item.user.name}</Text>
                      ) : null}
                      <Text style={styles.commentText}>{item.text}</Text>
                    </View>
                  </View>

                  {/* <Image style={styles.likeicon}
                    source={require('../../assets/feedPage/Heart.png')}
                  /> */}

                </View>
                <View style={styles.underLineWRapper}>
                  <View style={styles.underLine} />
                </View>
              </View>

              /////////////////
            )}
          />

          {/* <View style={styles.commentContainer}>
        <TextInput
          placeholder="Comment.."
          onChangeText={(text) => setText(text)}
          style={{ marginBottom: 8 }}
        />
        <Button onPress={() => onCommentSend()} title="Send Comment" />
      </View> */}
          {/* ///////////////////// */}
          <View style={styles.inputContainer}>
            <View style={styles.textInputContainer}>
              <TextInput
                style={styles.textInput}
                placeholder="Comment...."
                onChangeText={(text) => setText(text)}
              />
              <TouchableOpacity style={styles.iconButton} >
                <Image source={require('../../assets/images/emoji.png')} style={{ width: 25, height: 25 }} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconButton}>
                <Image source={require('../../assets/images/attach.png')} style={{ width: 25, height: 25 }} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.sendButton} onPress={() => onCommentSend()}>
                <Image source={require('../../assets/images/send.png')} style={{ width: 40, height: 40 }} />
              </TouchableOpacity>
            </View>
          </View>
          {/* /////////////////// */}
        </View>
      </View>
    </Modal>
  );
}


const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',  // Use rgba to set opacity
    justifyContent: 'flex-end',
  },
  commentsContainer: {
    height: '50%',  // Set the height as needed
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 10,
  },
  profileThumb: {
    width: 40,
    height: 40,
    borderRadius: 50,
  },
  modalOptionClose: {
    justifyContent: 'center',
    alignContent: 'center'
  },
  middleContainer: {
    marginLeft: 20
  },
  feedimgcontainer: {

  },
  likeicon: {
    height: 24,
    width: 24
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
  commentContainer: {
    marginBottom: 16,
  },
  commentText: {
    fontSize: 16
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#ccc',
    backgroundColor: '#ededed',
    borderRadius: 15,
    // margin: 10,
  },
  textInput: {
    flex: 1,
    height: 40,
    //borderColor: 'gray',
    //borderWidth: 1,
    //borderRadius: 20,
    paddingHorizontal: 10,
    //marginRight: 10,

  },
  sendButton: {
    padding: 5,
  },
  iconButton: {
    padding: 5,
  },
  textInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  underLine: {
    height: 1,
    backgroundColor: '#E3E3E3',
  },
  underLineWRapper: {
    marginLeft: 10,
    marginRight: 10,
  },
});

const mapStateToProps = (store) => ({
  users: store.usersState.users,
});

const mapDispatchProps = (dispatch) => bindActionCreators({ fetchUsersData }, dispatch);

export default connect(mapStateToProps, mapDispatchProps)(Comment);