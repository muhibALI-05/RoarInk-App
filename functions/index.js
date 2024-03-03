const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { Expo } = require('expo-server-sdk');

admin.initializeApp();

exports.sendPushNotification = functions.firestore
  .document('messages/{messageId}')
  .onCreate(async (snapshot, context) => {
    const messageData = snapshot.data();
    console.log('New message created:', snapshot.data());
    const receiverId = messageData.receiverId;

    // Retrieve the Expo Push Token from the user collection
    const userDoc = await admin.firestore().collection('users').doc(receiverId).get();
    const userData = userDoc.data();
    const expoPushToken = userData.expoPushToken;

    if (!expoPushToken) {
      console.error('Expo Push Token not found for user:', receiverId);
      return null;
    }

    const expo = new Expo();
    const messages = [];

    // Construct the push notification message
    const pushMessage = {
      to: expoPushToken,
      sound: 'default',
      title: 'New Message',
      body: 'You have a new message!',
      data: {
        // Include any additional data you want to send to the app
      },
    };

    messages.push(pushMessage);

    // Send the push notification
    const chunks = expo.chunkPushNotifications(messages);
    const tickets = [];

    for (let chunk of chunks) {
      try {
        let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
        tickets.push(...ticketChunk);
      } catch (error) {
        console.error('Error sending push notification:', error);
      }
    }

    console.log('Notification sent successfully.');

    return null;
  });
