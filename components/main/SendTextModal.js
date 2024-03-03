import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

function SendTextModal({ route, navigation }) {
  const { followedUsers, textMessage } = route.params; // Access textMessage from props
  const [usersData, setUsersData] = useState([]);
console.log(followedUsers)
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const firestore = getFirestore();

        const usersPromises = followedUsers.map(async (userId) => {
          const userDocRef = doc(firestore, 'users', userId);
          const userDocSnapshot = await getDoc(userDocRef);

          if (userDocSnapshot.exists()) {
            const userData = userDocSnapshot.data();
            return { id: userId, ...userData };
          }

          return null;
        });

        const usersDataResult = await Promise.all(usersPromises);
        setUsersData(usersDataResult.filter(Boolean));
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, [followedUsers]);

  const handleSend = (userData) => {
    console.log(`Sending text message to user with UID: ${userData.id}`);
    console.log(`Text message: ${textMessage}`);

    // Navigate to ChatPage and pass user: id and textMessage as props
    navigation.navigate('ChatPage', { user: userData, textMessage });
  };

  return (
    <View>
      <FlatList
        data={usersData}
        keyExtractor={(item) => item.uid}
        renderItem={({ item }) => (
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text>{item.name}</Text>
            <TouchableOpacity onPress={() => handleSend(item)}>
              <Text style={{ color: 'blue' }}>Send</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

export default SendTextModal;
