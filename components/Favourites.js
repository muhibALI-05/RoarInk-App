import React from 'react';
import { View, Text, FlatList, StyleSheet, Image } from 'react-native';

const Favourites = () => {
  const data = [
    {
      id: '1',
      title: 'Narendra Modi',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    },
    {
      id: '2',
      title: 'Rahul Gandhi',
      description: 'Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    },
    {
      id: '3',
      title: 'Amith Shah',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    },
    {
      id: '4',
      title: 'Sonia Gandhi',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
     
    },
    {
      id: '5',
      title: 'Sonia Gandhi',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      
    },
    {
      id: '6',
      title: 'Sonia Gandhi',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      
    },
    // Add more card data as needed
  ];

  const renderCard = ({ item }) => (
    <View style={styles.card}>
      <Image source={require('../assets/images/bjp.png')} style={styles.cardImage} />
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{item.title}</Text>
        <Text style={styles.cardDescription}>{item.description}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        renderItem={renderCard}
        numColumns={2}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  card: {
    flex: 1,
    flexDirection: 'column',
    margin: 8,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  cardImage: {
    height: 150, // Set the desired height
    resizeMode: 'cover',
  },
  cardContent: {
    padding: 10,
  },
  cardTitle: {
    fontWeight: 'bold',
    fontSize: 12,
    marginBottom: 5,
  },
  cardDescription:{
    fontSize: 10,
    color:'#A49797'
  }
});

export default Favourites;
