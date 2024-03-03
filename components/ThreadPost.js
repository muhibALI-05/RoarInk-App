import React, { memo, useState, useEffect } from "react";

import {
  getDoc,
  doc,
  collection,
  addDoc,
  query,
  orderBy,
  getDocs,
  serverTimestamp,
  getFirestore,
  setDoc,
  deleteDoc
} from "firebase/firestore";
import { useNavigation } from '@react-navigation/native';
import { db, app, auth } from "./firebase-config";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  TextInput,
} from "react-native";

const ThreadPost = memo(({ thread }) => {
  const navigation = useNavigation();
  const [userName, setUserName] = useState("");
  const [showReplyBox, setShowReplyBox] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [replies, setReplies] = useState([]);
  const [liked, setLiked] = useState(false); // Added state for like status
  const [likesCount, setLikesCount] = useState(0);
  const [replyLikes, setReplyLikes] = useState({});

  const fetchReplies = async () => {
    try {
      const repliesQuery = query(
        collection(db, "threads", thread.id, "replies"),
        orderBy("createdAt")
      );
      const repliesSnapshot = await getDocs(repliesQuery);
      const repliesData = await Promise.all(
        repliesSnapshot.docs.map(async (replyDoc) => {
          const replyData = replyDoc.data();
          const userRef = doc(db, "users", replyData.userId);
          const userDoc = await getDoc(userRef);

          if (userDoc.exists()) {
            const userData = userDoc.data();

            return {
              id: replyDoc.id,
              ...replyData,
              userName: userData.name || "Unknown User",
            };
          } else {
            return {
              id: replyDoc.id,
              ...replyData,
              userName: "Unknown User",
            };
          }
        })
      );

      const likesPromises = repliesSnapshot.docs.map(async (replyDoc) => {
        const likesQuery = query(
          collection(db, "threads", thread.id, "replies", replyDoc.id, "likes")
        );
        const likesSnapshot = await getDocs(likesQuery);

        const userLiked = likesSnapshot.docs.some(
          (doc) => doc.id === auth.currentUser?.uid
        );

        return { replyId: replyDoc.id, liked: userLiked };
      });

      const likesData = await Promise.all(likesPromises);

      const replyLikesMap = {};
      likesData.forEach((like) => {
        replyLikesMap[like.replyId] = like.liked;
      });

      setReplyLikes(replyLikesMap);

      setReplies(repliesData);
    } catch (error) {
      console.error("Error fetching replies:", error.message);
    }
  };

  const fetchLikes = async () => {
    try {
      const likesQuery = query(
        collection(db, "threads", thread.id, "likes")
      );
      const likesSnapshot = await getDocs(likesQuery);
      setLikesCount(likesSnapshot.size);

      const userLiked = likesSnapshot.docs.some(
        (doc) => doc.id === auth.currentUser?.uid
      );

      setLiked(userLiked);
    } catch (error) {
      console.error("Error fetching likes:", error.message);
    }
  };

  const handleReplyLikeToggle = async (replyId) => {
    try {
      const likesCollectionRef = collection(
        db,
        "threads",
        thread.id,
        "replies",
        replyId,
        "likes"
      );

      if (replyLikes[replyId]) {
        // If liked, remove like
        await deleteDoc(doc(likesCollectionRef, auth.currentUser.uid));
      } else {
        // If not liked, add like
        await setDoc(doc(likesCollectionRef, auth.currentUser.uid), {});
      }

      fetchReplies(); // Refresh likes after toggling
    } catch (error) {
      console.error("Error toggling like for reply:", error.message);
    }
  };

  const [followedUsers, setFollowedUsers] = useState([]); // State to store followed users

  const fetchFollowedUsers = async () => {
    try {
      // Assuming `following` is a collection and `userFollowing` is a subcollection
      const userFollowingQuery = query(
        collection(db, "following", auth.currentUser?.uid, "userFollowing")
      );
      
      const userFollowingSnapshot = await getDocs(userFollowingQuery);
      
      // Extract user IDs from the documents in the 'userFollowing' subcollection
      const followedUsers = userFollowingSnapshot.docs.map((doc) => doc.id);
  
      // Update the state with the list of followed users
      setFollowedUsers(followedUsers);
    } catch (error) {
      console.error("Error fetching followed users:", error.message);
    }
  };
  

  // Fetch replies, likes, and followed users on component mount
  useEffect(() => {
    const fetchUserName = async () => {
      try {
        if (thread.userId) {
          const userDoc = await getDoc(doc(db, "users", thread.userId));
          const userData = userDoc.data();
          console.log("User data:", userData);

          if (userData && userData.name !== undefined) {
            setUserName(userData.name || "Unknown User");
          } else {
            setUserName("Unknown User");
          }
        } else {
          setUserName("Unknown User");
        }
      } catch (error) {
        console.error("Error fetching user name:", error.message);
      }
    };

   
    fetchUserName();
    fetchReplies();
    fetchLikes();
    
    fetchFollowedUsers();
  }, [thread.userId, thread.id]);

  // Function to format timestamp
  const formatTimestamp = (timestamp) => {
    const date = timestamp.toDate();
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
  };

  const handleReplySubmit = async () => {
    try {
      if (replyText.trim() !== "") {
        const repliesCollectionRef = collection(
          getFirestore(app),
          "threads",
          thread.id,
          "replies"
        );
        await addDoc(repliesCollectionRef, {
          text: replyText,
          userId: auth.currentUser ? auth.currentUser.uid : null,
          createdAt: serverTimestamp(),
        });

        setReplyText("");
        fetchReplies();
        // You may want to fetch and update the thread data to include the new replies
        // Fetch the thread again using fetchThreads or any other appropriate method
        // fetchThreads();
      }
    } catch (error) {
      console.error("Error submitting reply:", error.message);
      // Handle the error
    }
  };

  const handleLikeToggle = async () => {
    try {
      const likesCollectionRef = collection(db, "threads", thread.id, "likes");

      if (liked) {
        // If liked, remove like
        await deleteDoc(doc(likesCollectionRef, auth.currentUser.uid));
      } else {
        // If not liked, add like
        await setDoc(doc(likesCollectionRef, auth.currentUser.uid), {});
      }

      fetchLikes(); // Refresh likes after toggling
    } catch (error) {
      console.error("Error toggling like:", error.message);
    }
  };

  return (
    <View key={thread.id} style={styles.container}>
      <View style={styles.headerWrapper}>
        <View style={styles.headerLeftWrapper}>
          {/* Display user profile image */}
          <Image
            style={styles.profileThumb}
            source={require("../assets/images/profilepic.png")}
          />
          <View style={styles.middleContainer}>
            {/* Display username and time created */}
            <Text style={styles.headerTitle}>{userName}</Text>
            <Text style={styles.subtitleText}>
              {thread.createdAt
                ? formatTimestamp(thread.createdAt)
                : "Unknown Date"}
            </Text>
          </View>

          <View style={styles.underLineWRapper}>
            <View style={styles.underLine} />
          </View>
        </View>
        {/* Add any additional UI components or actions as needed */}
      </View>
      {/* Display thread title (bolded) */}
      <Text style={styles.boldTitle}>{thread.title}</Text>
      {/* Display thread content */}
      <View style={styles.captionContainer}>
        <Text style={styles.caption}>{thread.content}</Text>
      </View>
      <View style={styles.likesAndCommentsWrapper}>
        <View style={styles.likescontainer}>
          <Image
            style={styles.likeicon}
            source={require("../assets/feedPage/likes.png")}
          />
          <Text style={styles.likesTitle}>{likesCount} Likes</Text>
        </View>
        <Text>
          <Text style={styles.likesTitle}>{replies.length} replies</Text>
        </Text>
      </View>
      <View style={styles.feedImageFooter}>
        <View style={styles.feddimageFooterLeftWrapper}>
          <TouchableOpacity onPress={handleLikeToggle}>
            <Image
              style={styles.icons}
              source={liked ? require('../assets/feedPage/likes.png') : require('../assets/feedPage/Heart.png')}
            />
          </TouchableOpacity>
          {/* <Image
            style={styles.icons}
            source={require("../assets/feedPage/Chat.png")}
          /> */}
          <TouchableOpacity onPress={() => { console.log("send") 
                  navigation.navigate('SendTextModal', { followedUsers: followedUsers, textMessage: thread.content })}}>
                    <Image
                      style={styles.icons}
                      source={require('../assets/feedPage/Send.png')}
                    />
                  </TouchableOpacity>
          <TouchableOpacity onPress={() => setShowReplyBox(!showReplyBox)}>
            <Text style={{ color: "#927474", fontSize: 14, opacity: 0.8 }}>
              {showReplyBox ? "Cancel" : "Reply..."}
            </Text>
          </TouchableOpacity>
        </View>
        {/* <Image
          style={styles.icons}
          source={require("../assets/feedPage/Bookmark.png")}
        /> */}
      </View>
      <View style={styles.underLineWRapper}>
        <View style={styles.underLine} />
      </View>
      {replies.length > 0 && (
        <View style={styles.replySection}>
          <Text style={styles.replySectionTitle}>Replies:</Text>
          {replies.map((reply, index) => (
            <View key={reply.id} style={styles.replyContainer}>
              <Text style={styles.replyUserName}>{reply.userName}</Text>
              <Text>{reply.text}</Text>
              <Text style={styles.replyTimestamp}>
                {formatTimestamp(reply.createdAt)}
              </Text>
              {index < replies.length - 1 && (
                <View style={styles.connectorLine} />
              )}
              <View style={styles.feedImageFooter}>
                <View style={styles.replyFooterLeftWrapper}>
                <TouchableOpacity
                    onPress={() => handleReplyLikeToggle(reply.id)}
                  >
                    <Image
                      style={styles.icons}
                      source={
                        replyLikes[reply.id]
                          ? require("../assets/feedPage/likes.png")
                          : require("../assets/feedPage/Heart.png")
                      }
                    />
                  </TouchableOpacity>
                  {/* <Image
                    style={styles.icons}
                    source={require("../assets/feedPage/Chat.png")}
                  /> */}
                  <TouchableOpacity onPress={() => { console.log("send") 
                  navigation.navigate('SendTextModal', { followedUsers: followedUsers, textMessage: thread.content })}}>
                    
                  </TouchableOpacity>
                  {/* <TouchableOpacity onPress={() => setShowReplyBox(!showReplyBox)}>
            <Text style={{ color: '#927474', fontSize: 14, opacity: 0.8 }}>
              {showReplyBox ? 'Cancel' : 'Reply...'}
            </Text>
          </TouchableOpacity> */}
                </View>
              </View>
            </View>
          ))}
        </View>
      )}
      {showReplyBox && (
        <View
          style={{
            marginLeft: "10%",
            borderBottomWidth: 1,
            borderColor: "#927474",
            borderRadius: 10,
            opacity: 0.8,
          }}
        >
          <TextInput
            style={{ paddingLeft: "10%", paddingVertical: 20 }}
            placeholder="Type your reply here..."
            value={replyText}
            onChangeText={(text) => setReplyText(text)}
          />

          <TouchableOpacity style={styles.submitButton} onPress={() => handleReplySubmit()}>
            <Text style={{ paddingLeft: "10%" }}>Submit</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
});

export default ThreadPost;

const styles = StyleSheet.create({
  replySection: {
    marginTop: 10,
  },
  replySectionTitle: {
    fontWeight: "bold",
    fontSize: 14,
    marginBottom: 5,
  },
  replyContainer: {
    marginVertical: 5,
  },
  replyTimestamp: {
    fontSize: 11,
    color: "#888",
  },
  container: {
    display: "flex",
  },
  profileThumb: {
    width: 40,
    height: 40,
    borderRadius: 50,
  },
  middleContainer: {
    marginLeft: 20,
  },
  caption: {
    padding: 10,
    fontSize: 12,
  },
  subtitleText: {
    fontSize: 11,
    color: "#888",
  },
  headerWrapper: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 10,
  },
  headerLeftWrapper: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: "600",
  },
  captionContainer: {
    width: "70%", // Adjust the width based on your layout requirements
    // paddingRight: 10, // Add some padding between the text and the image
    paddingLeft: 10,
    top: -8,
  },
  boldTitle: {
    fontWeight: "bold",
    fontSize: 12, // Adjust the font size as needed
    marginTop: 5, // Add margin for separation
    paddingLeft: 20,
  },
  icon: {
    width: 40,
    height: 40,
  },
  icons: {
    width: 20,
    height: 20,
    opacity: 0.6,
    marginRight: 15,
  },
  feedImageFooter: {
    paddingBottom: 10,
    paddingLeft: 5,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  feddimageFooterLeftWrapper: {
    flexDirection: "row",
    marginLeft: "3%",
  },
  likesAndCommentsWrapper: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 15,
    paddingTop: 0,
  },
  likescontainer: {
    flexDirection: "row",
  },
  likeicon: {
    height: 20,
    width: 20,
  },
  likesTitle: {
    fontSize: 11,
    color: "#A49797",
  },
  underLine: {
    height: 1,
    backgroundColor: "lightgrey",
  },
  underLineWRapper: {
    marginLeft: "5%",
    marginRight: "5%",
  },
  replySection: {
    marginTop: 10,
    width: "80%",
    alignSelf: "flex-end",
  },

  replyContainer: {
    marginVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#e1e8ed", // Border color between replies
  },

  replyTimestamp: {
    fontSize: 11,
    color: "#888",
    marginTop: 5,
  },
  connectorLine: {
    width: 2,
    backgroundColor: "#e1e8ed",
    marginLeft: 5,
  },
  replyFooterLeftWrapper: {
    paddingTop: 5,
    flexDirection: "row",
    marginLeft: "-2%",
  },
  submitButton: {
    width: '30%',
    backgroundColor: "#0bcc9e", // Add your desired background color
    paddingVertical: 10,
    alignContent: "wrap",
    //alignItems: "center",
    borderRadius: 5,
    alignSelf: "flex-end",
    //marginTop: 10, // Add margin-top for separation
  },
});
//<Image
//style={styles.icons}
//source={require('../assets/feedPage/Send.png')}
///>