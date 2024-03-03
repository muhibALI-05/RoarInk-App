import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Button, Image } from 'react-native';
import { Camera } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { getStorage, ref, uploadString, getDownloadURL } from 'firebase/storage';

export default function Add({ navigation }) {
  const [hasGalleryPermission, setHasGalleryPermission] = useState(null);
  const [hasCameraPermission, setHasCameraPermission] = useState(null);
  const [camera, setCamera] = useState(null);
  const [image, setImage] = useState(null);
  const [type, setType] = useState(Camera.Constants.Type.back);

  useEffect(() => {
    (async () => {
      const cameraStatus = await Camera.requestCameraPermissionsAsync();
      setHasCameraPermission(cameraStatus.status === 'granted');

      const galleryStatus = await ImagePicker.requestMediaLibraryPermissionsAsync();
      setHasGalleryPermission(galleryStatus.status === 'granted');
    })();
  }, []);

  const takePicture = async () => {
    if (camera) {
      const data = await camera.takePictureAsync(null);
      setImage(data.uri);
    }
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.cancelled) {
      setImage(result.uri);
    }
  };

  const uploadImageToFirebase = async () => {
    const storage = getStorage();
    const imageRef = ref(storage, 'images/' + new Date().toISOString());

    const response = await fetch(image);
    const blob = await response.blob();

    await uploadString(imageRef, blob, 'data_url');
    const downloadURL = await getDownloadURL(imageRef);

    // Now you can use the downloadURL as needed, for example, store it in your database.
    console.log('Image uploaded to Firebase:', downloadURL);

    // Add logic here to store downloadURL in your database (Firestore or Realtime Database)

    // Navigate to the next screen or perform any other action as needed
    navigation.navigate('Save', { downloadURL });
  };

  if (hasCameraPermission === null || hasGalleryPermission === false) {
    return <View />;
  }
  if (hasCameraPermission === false || hasGalleryPermission === false) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>No access to camera or gallery. Please enable permissions in settings.</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.cameraContainer}>
        <Camera ref={(ref) => setCamera(ref)} style={styles.fixedRatio} type={type} ratio={'1:1'} />
      </View>

      <Button title="Flip Camera" onPress={() => setType(type === Camera.Constants.Type.back ? Camera.Constants.Type.front : Camera.Constants.Type.back)} />
      <Button title="Take Picture" onPress={takePicture} />
      <Button title="Pick Image From Gallery" onPress={pickImage} />
      <Button title="Upload" onPress={uploadImageToFirebase} />

      {image && <Image source={{ uri: image }} style={{ flex: 1 }} />}
    </View>
  );
}

const styles = StyleSheet.create({
  cameraContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  fixedRatio: {
    flex: 1,
    aspectRatio: 1,
  },
});
