import React, { Component } from 'react';
import { Text, View, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';

export class Stories extends Component {
  render() {
    return (
      <View style={styles.container}>
        <ScrollView horizontal={true}>
          <View style={styles.myStoryImageWrapper}>
            <View style={styles.myStoryImageContainer}>
              <Image
                style={styles.myStoryImage}
                source={require('../assets/images/profilepic.png')}
              />
            </View>
            <TouchableOpacity style={styles.addIconContainer}>
                <Image
                  style={styles.addmyStory}
                  source={require('../assets/feedPage/add.png')}
                />
              </TouchableOpacity>
            <Text style={styles.profileName}>Add Story</Text>
          </View>
          <View style={styles.otherStoryImageWrapper}>
            <View style={styles.storyRound}>
              <Image
                style={styles.otherStories}
                source={require('../assets/images/lina.png')}
              />
            </View>
            <Text style={styles.profileName}>Seona</Text>
          </View>
          <View style={styles.otherStoryImageWrapper}>
            <View style={styles.liveStoryRound}>
              <Image
                style={styles.otherStories}
                source={require('../assets/images/face.jpeg')}
              />
            </View>
            <Text style={styles.profileName}>Margeret</Text>
          </View>
          <View style={styles.otherStoryImageWrapper}>
            <View style={styles.storyRound}>
              <Image
                style={styles.otherStories}
                source={require('../assets/images/face.jpeg')}
              />
            </View>
            <Text style={styles.profileName}>Sonia</Text>
          </View>
          <View style={styles.otherStoryImageWrapper}>
            <View style={styles.storyRound}>
              <Image
                style={styles.otherStories}
                source={require('../assets/images/face.jpeg')}
              />
            </View>
            <Text style={styles.profileName}>Sonia</Text>
          </View>
        </ScrollView>
      </View>
    );
  }
}

export default Stories;

export const styles = StyleSheet.create({
  container: {
    display: 'flex',
    backgroundColor: 'transparent'
  },
  storiesHeaderWrapper: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
  },
  myStoryImage: {
    width: 64,
    height: 64,
    borderRadius: 50,
    margin: 1,
  },
  addmyStory: {
    width: 20,
    height: 20,
    zIndex: 2,
  },
  addIconContainer: {
    position: 'absolute',
    // bottom: 5,
    // right: 5,
    top: 53,
    left: 63,
    borderRadius: 15,
    zIndex: 2,
  },

  myStoryImageContainer: {
    borderRadius: 50,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#0BCC9E',
    position: 'relative',
  },
  myStoryImageWrapper: {
    padding: 10,
  },
  otherStories: {
    width: 64,
    height: 64,
    borderRadius: 50,
    margin: 1
  },
  storyRound: {
    width: 70,
    height: 70,
    borderRadius: 50,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#0BCC9E',
  },
  liveStoryRound: {
    width: 70,
    height: 70,
    borderRadius: 50,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#0BCC9E', // You can change the color for live stories
  },
  otherStoryImageWrapper: {
    padding: 8,
  },
  profileName: {
    fontSize: 12,
    textAlign: 'center',
    fontWeight: 'medium-bold',
  },
});
