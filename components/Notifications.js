import React from 'react';
import { View, Text, Image, ScrollView, StyleSheet ,TouchableOpacity} from 'react-native';
import { useNavigation } from '@react-navigation/native'; // Import useNavigation hook
import { Ionicons } from '@expo/vector-icons';

const NotificationsPage = () => {
  const navigation = useNavigation(); // Initialize navigation
  return (
    <ScrollView style={styles.container}>
      {/* Notification Items */}
      <View style={styles.Header}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.HeaderText}>Notifications</Text>
      </View>
      
      <View style={styles.notificationContainer}>
        {/* Notification Item 1 */}
        <View style={styles.notificationItem}>
          <Image
            source={require('../assets/images/avatar.jpg')}
            style={styles.notificationImage}
          />
          <View style={styles.notificationTextContainer}>
            <Text style={styles.notificationText}>
              <Text style={styles.boldText}>John Doe</Text> liked your photo.
            </Text>
            <Text style={styles.notificationTimestamp}>2 hours ago</Text>
          </View>
        </View>

        {/* Notification Item 2 */}
        <View style={styles.notificationItem}>
          <Image
            source={require('../assets/images/avatar.jpg')}
            style={styles.notificationImage}
          />
          <View style={styles.notificationTextContainer}>
            <Text style={styles.notificationText}>
              <Text style={styles.boldText}>Jane Smith</Text> started following you.
            </Text>
            <Text style={styles.notificationTimestamp}>5 hours ago</Text>
          </View>
        </View>

        {/* Add more notification items as needed */}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor:'white',
  },
  Header: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomRightRadius:20,
    borderBottomLeftRadius:20,
    justifyContent: 'space-between',
    backgroundColor: '#E1FFFD',
    padding: 10,
    paddingTop:45,
  },
  backButton: {
    padding: 5,
  },
   HeaderText:{
     textAlign:'center',
     fontWeight:'bold',
     marginRight:'40%'
     },

  notificationContainer: {
    marginTop: 10,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  notificationImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  notificationTextContainer: {
    flex: 1,
  },
  notificationText: {
    fontSize: 16,
  },
  boldText: {
    fontWeight: 'bold',
  },
  notificationTimestamp: {
    fontSize: 12,
    color: 'grey',
  },
});

export default NotificationsPage;
