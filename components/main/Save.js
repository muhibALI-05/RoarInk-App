import React, { useState } from 'react';
import { View, TextInput, Image, Button, ActivityIndicator, Text } from 'react-native';

import { getAuth } from 'firebase/auth';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';

import { NavigationContainer } from '@react-navigation/native';

export default function Save(props) {
  const [caption, setCaption] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  const uploadImage = async () => {
    const user = getAuth().currentUser;

    if (!user) {
      console.error('User not authenticated');
      return;
    }
    
    const uri = props.route.params.image;
    const childPath = `post/${getAuth().currentUser.uid}/${Math.random().toString(36)}`;

    try {
      setUploading(true);

      const response = await fetch(uri);
      const blob = await response.blob();

      const storageRef = ref(getStorage(), childPath);
      const uploadTask = uploadBytesResumable(storageRef, blob);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log(`Upload is ${progress}% done`);
        },
        (error) => {
          console.error(error);
          setUploading(false);
          setUploadError('Error uploading image');
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref)
            .then((downloadURL) => {
              savePostData(downloadURL);
              console.log(downloadURL);
            })
            .catch((error) => {
              console.error(error);
              setUploading(false);
              setUploadError('Error getting download URL');
            });
        }
      );
    } catch (error) {
      console.error(error);
      setUploading(false);
      setUploadError('Error fetching image data');
    }
  };

  const savePostData = (downloadURL) => {
    const db = getFirestore();

    addDoc(collection(db, 'posts', getAuth().currentUser.uid, 'userPosts'), {
      downloadURL,
      caption,
      creation: serverTimestamp(),
    })
      .then(() => {
        setUploading(false);
        props.navigation.navigate('Main');
      })
      .catch((error) => {
        console.error('Error adding document: ', error);
        setUploading(false);
        setUploadError('Error saving post data');
      });
  };

  return (
    <View style={{ flex: 1 }}>
      <Image source={{ uri: props.route.params.image }} />
      <TextInput
        placeholder="Write a Caption . . ."
        onChangeText={(caption) => setCaption(caption)}
      />
      <Button title="Save" onPress={() => uploadImage()} />
      {uploading && <ActivityIndicator />}
      {uploadError && <Text style={{ color: 'red' }}>{uploadError}</Text>}
    </View>
  );
}