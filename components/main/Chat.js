import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, StyleSheet, Image, TouchableOpacity, FlatList, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { getFirestore, collection, addDoc, query, orderBy, onSnapshot, where, serverTimestamp, getDocs, deleteDoc, updateDoc, doc } from 'firebase/firestore';
import { app, auth } from '../firebase-config';

const MessageItem = ({ isSender, message, time, read, image }) => (
    <View style={isSender ? styles.senderMessageContainer : styles.receiverMessageContainer}>
        <View style={styles.messageContentContainer}>
            <View style={isSender ? styles.senderTriangle : styles.receiverTriangle} />
            <View style={isSender ? styles.senderMessage : styles.receiverMessage}>
                {image ? (
                    <View>
                    <Image source={{ uri: image }} style={{ width: 200, height: 200, borderRadius: 5 }} />
                    <Text style={[styles.messageText, { color: isSender ? '#FFFFFF' : '#686A79' }]}>{message}</Text>
                    </View>
                ) : (
                    <Text style={[styles.messageText, { color: isSender ? '#FFFFFF' : '#686A79' }]}>{message}</Text>
                )}
            </View>
        </View>
        <View style={styles.messageInfoContainer}>
            {isSender && (
                <>
                    <Text style={styles.readStatus}>{read ? 'Read' : 'Unread'}</Text>
                    <View style={styles.statusDot} />
                </>
            )}
            <Text style={isSender ? styles.senderMessageTime : styles.receiverMessageTime}>
                {time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
        </View>
    </View>
);


const ChatPage = ({ route }) => {
    const { user, postImageLink, textMessage } = route.params;
    const navigation = useNavigation();
    const [isSender, setIsSender] = useState(true);
    const [messages, setMessages] = useState([]);
    const [messageText, setMessageText] = useState(textMessage || '');
    const [selectedUser, setSelectedUser] = useState(null);
    const [db] = useState(getFirestore(app));
    const [authUser] = useState(auth.currentUser);
    const [postImage, setPostImage] = useState(postImageLink)

    const [isMenuVisible, setIsMenuVisible] = useState(false);

    const [isBlocked, setIsBlocked] = useState(false);
    const flatListRef = useRef(null);

    useEffect(() => {
        // Fetch messages when the component mounts
        if (user) {
            console.log('User Name:', user.name);
            fetchMessages();
        }
    }, [user]);

    useEffect(() => {
        // Scroll to the bottom when messages change
        if (flatListRef.current) {
            flatListRef.current.scrollToEnd({ animated: true });
        }
    }, [messages]);

    useEffect(() => {
        // Check if the recipient is blocked
        const checkAndSetBlockStatus = async () => {
            const userBlocked = await checkBlockStatus(authUser.uid, user.id);
            setIsBlocked(userBlocked);
        };

        checkAndSetBlockStatus();
    }, [user]);


    const checkBlockStatus = async (blockerId, blockedUserId) => {
        try {
            if (!blockerId || !blockedUserId) {
                console.log('Invalid parameters.');
                return false;
            }

            const blockedUsersRef = collection(db, 'blockedUsers');
            const q = query(
                blockedUsersRef,
                where('blockerId', '==', blockerId),
                where('blockedUserId', '==', blockedUserId)
            );

            const querySnapshot = await getDocs(q);

            return !querySnapshot.empty;
        } catch (error) {
            console.error('Error checking block status: ', error);
            return false;
        }
    };


    const toggleBlockStatus = async () => {
        if (!authUser || !user) {
            return;
        }

        const blockedUsersRef = collection(db, 'blockedUsers');
        const q = query(
            blockedUsersRef,
            where('blockerId', '==', authUser.uid),
            where('blockedUserId', '==', user.id)
        );

        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            // User is blocked, unblock
            querySnapshot.forEach(async (doc) => {
                await deleteDoc(doc.ref);
            });
            setIsBlocked(false); // Update state after unblocking
        } else {
            // User is not blocked, block
            const newBlockedUser = {
                blockerId: authUser.uid,
                blockedUserId: user.id,
            };
            await addDoc(blockedUsersRef, newBlockedUser);
            setIsBlocked(true); // Update state after blocking
        }
    };


    useEffect(() => {
        // Fetch messages when the component mounts
        if (user) {
            console.log('User Name:', user.name);
            fetchMessages();
        }
    }, [user]);

    const fetchMessages = async () => {
        if (!user || !authUser) {
            console.error("Error fetching messages: User information not available.");
            return;
        }

        const messagesRef = collection(db, 'messages');

        const q = query(
            messagesRef,
            orderBy('timestamp'),
            where('senderId', 'in', [authUser.uid, user.id]),
            where('receiverId', 'in', [authUser.uid, user.id])
        );

        onSnapshot(q, async (snapshot) => {
            const fetchedMessages = snapshot.docs.map(async (doc) => {
                const messageData = { id: doc.id, ...doc.data() };

                // Update read status when the recipient reads the message
                if (!messageData.read && messageData.receiverId === authUser.uid) {
                    await updateDoc(doc.ref, { read: true });
                }

                return messageData;
            });

            const updatedMessages = await Promise.all(fetchedMessages);
            setMessages(updatedMessages);
        });
    };

    const sendMessage = async () => {
        try {
            const userBlockedBySelected = await checkBlockStatus(authUser.uid, user.id);
            const selectedBlockedByUser = await checkBlockStatus(user.id, authUser.uid);

            if (selectedBlockedByUser) {
                console.log('You have been blocked by the user.');
                return;
            }

            if (userBlockedBySelected) {
                console.log('You cannot send messages to a blocked user.');
                return;
            }

            const messagesRef = collection(db, 'messages');

            if (!user || !authUser) {
                console.error("Error sending message: User information not available.");
                return;
            }

            const newMessage = {
                isSender,
                message: messageText,
                time: new Date().toLocaleTimeString(),
                read: false,
                senderId: authUser.uid,
                receiverId: user.id,
                timestamp: serverTimestamp(),
                image: postImage || null, // Set image to postImageLink if available, otherwise, set it to null
            };

            const docRef = await addDoc(messagesRef, newMessage);

            console.log('Sending message:', newMessage);

            setMessages([...messages, { id: docRef.id, ...newMessage }]);

            setMessageText('');
            if (postImage !== null) {
                // Modify the postImageLink value after sending the message
                // This is to ensure that the image is sent only once
                setPostImage(null);
            }
        } catch (error) {
            console.error('Error sending message: ', error);
        }
    };





    return (
        <SafeAreaView style={styles.container}>
        <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                <Ionicons name="arrow-back" size={24} color="black" />
            </TouchableOpacity>
            <View style={styles.userInfoContainer}>
                <View style={styles.userInfo}>
                    <Image source={require('../../assets/images/profilepic.png')} style={styles.profilePicture} />
                    <View>
                        <Text style={styles.userName}>{user.name}</Text>
                        <View style={styles.statusContainer}>
                            <Image style={styles.dot} source={require('../../assets/images/dot.png')} />
                            
                        </View>
                    </View>
                </View>
            </View>
            <TouchableOpacity style={styles.menuButton} onPress={() => setIsMenuVisible(!isMenuVisible)}>
                <Ionicons name="ellipsis-horizontal" size={24} color="black" />
            </TouchableOpacity>
            {isMenuVisible && (
                <View style={styles.menu}>
                    <TouchableOpacity style={styles.menuItem} onPress={toggleBlockStatus}>
                        <Text style={styles.menuItemText}>
                            {isBlocked ? 'Unblock' : 'Block'}
                        </Text>
                    </TouchableOpacity>
                    {/* Add more menu items as needed */}
                </View>
            )}
        </View>
        <FlatList
                ref={flatListRef}
                data={messages}
                renderItem={({ item }) => (
                    <MessageItem
                        isSender={item.senderId === authUser.uid}
                        message={item.message}
                        time={item.time}
                        read={item.read}
                        image={item.image}
                    />
                )}
                keyExtractor={(item) => item.time}
                inverted={false}
                onContentSizeChange={() => flatListRef.current.scrollToEnd({ animated: true })}
            />
        <View style={styles.inputContainer}>
            <View style={styles.textInputContainer}>
                <TextInput
                    style={styles.textInput}
                    placeholder="Type your message..."
                    onChangeText={(text) => setMessageText(text)}
                    value={messageText}
                />
                <TouchableOpacity style={styles.iconButton}>
                    <Image source={require('../../assets/images/emoji.png')} style={{ width: 25, height: 25 }} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.iconButton}>
                    <Image source={require('../../assets/images/attach.png')} style={{ width: 25, height: 25 }} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
                    <Image source={require('../../assets/images/send.png')} style={{ width: 40, height: 40 }} />
                </TouchableOpacity>
            </View>
        </View>
    </SafeAreaView>
    );
};


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomRightRadius: 20,
        borderBottomLeftRadius: 20,
        backgroundColor: '#E1FFFD',
        padding: 10,
        paddingTop: 40,
    },
    dot: {
        right: 3
    },
    backButton: {
        padding: 5,
        marginLeft: '2%',
    },
    blockButton: {
        paddingHorizontal: 10
    },
    userInfoContainer: {
        flexDirection: 'row',
        flex: 3,
        paddingLeft: 10
    },
    userInfo: {
        flexDirection: 'row',
    },
    profilePicture: {
        width: 40,
        height: 40,
        borderRadius: 20,
    },
    userName: {
        fontSize: 14,
        paddingLeft: 10,
        fontWeight: 'bold',
    },
    statusContainer: {
        paddingLeft: 10,
        flexDirection: 'row',
        alignItems: 'center',
    },
    statusDot: {
        width: 7,
        height: 7,
        borderRadius: 5,
        backgroundColor: '#0BCC9E',
        alignItems: 'center',
    },
    userStatus: {
        fontSize: 11,
        color: '#A49797',
    },
    menuButton: {
        padding: 5,
    },
    messageContentContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        marginVertical: 5,
        maxWidth: '70%',
        margin: 15,
        flexWrap: 'wrap',
    },

    senderMessageContainer: {
        alignSelf: 'flex-end',
        flexDirection: 'column', // Use flexDirection to align time to the right
        alignItems: 'flex-end', // Align time to the bottom of the sender's message
        marginVertical: 5,
        maxWidth: '70%',
        margin: 15,
        flexWrap: 'wrap',
    },
    receiverMessageContainer: {
        alignSelf: 'flex-start',
        flexDirection: 'column', // Use flexDirection to align time to the left
        alignItems: 'flex-start', // Align time to the bottom of the receiver's message
        marginVertical: 5,
        maxWidth: '70%',
        margin: 15,
        flexWrap: 'wrap',
    },
    senderTriangle: {
        width: 0,
        height: 0,
        backgroundColor: 'transparent',
        borderStyle: 'solid',
        position: 'absolute',
        bottom: 0,
        borderLeftWidth: 15,
        borderRightWidth: 15,
        borderBottomWidth: 20.8,
        borderRightColor: 'transparent',
        borderBottomColor: '#0BCC93',
        right: 0,
        marginRight: -7,
    },

    receiverTriangle: {
        width: 0,
        height: 0,
        backgroundColor: 'transparent',
        borderStyle: 'solid',
        position: 'absolute',
        bottom: 0,
        borderLeftWidth: 15,
        borderRightWidth: 15,
        borderBottomWidth: 20.8,
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        borderBottomColor: '#EDEDED',
        left: -7,
    },

    senderMessage: {
        backgroundColor: '#0BCC93',
        borderRadius: 5,
        padding: 10,
    },
    receiverMessage: {
        backgroundColor: '#EDEDED',
        borderRadius: 5,
        padding: 10,
    },
    messageText: {
        fontSize: 16,
    },
    statusDot: {
        width: 4,
        height: 4,
        borderRadius: 5,
        backgroundColor: '#BDBECC',
        left: 3,
        top: 7
    },
    senderMessageTime: {
        fontSize: 12,
        color: '#ccc',
        marginLeft: 5, // Add margin to separate time from the message
        marginRight: 5, // Adjusted margin for sender's message
        paddingLeft: 5,
    },
    receiverMessageTime: {
        fontSize: 12,
        color: '#ccc',
        marginLeft: 5, // Add margin to separate time from the message
        marginRight: 5, // Adjusted margin for receiver's message
    },
    readStatus: {
        fontSize: 12,
        color: '#ccc',
        marginLeft: 5, // Add margin to separate read status from the message
        paddingRight: 5
    },
    messageInfoContainer: {
        flexDirection: 'row',
        //alignItems: 'center',
        marginTop: 5,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: '#ccc',
        backgroundColor: '#ededed',
        borderRadius: 15,
        margin: 10,
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
    menu: {
        position: 'absolute',
        top: '100%',
        right: 10,
        backgroundColor: '#fff',
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
    menuItem: {
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
    menuItemText: {
        fontSize: 16,
        color: '#000',
    },
});

export default ChatPage;
