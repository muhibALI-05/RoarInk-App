import React, { Component } from "react";
import Modal from "react-native-modal";
import {
  KeyboardAvoidingView,
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { getFirestore } from "firebase/firestore";
import { Ionicons } from "@expo/vector-icons";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import * as ImagePicker from "expo-image-picker";
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  uploadBytesResumable,
} from "firebase/storage";

export class Register extends Component {
  constructor(props) {
    super(props);

    this.state = {
      email: "",
      password: "",
      confirmPassword: "",
      name: "",
      phoneNumber: "",
      date: "",
      month: "",
      year: "",
      pincode: "",
      isPoliticianModalVisible: false, // Track the visibility of the politician modal
      error: null,
      isPasswordVisible: false,
      isConfirmPasswordVisible: false,
      showPartyOptions: false, // Track the visibility of party options
      selectedParty: null, // Track the selected party
      isDatePickerVisible: false, // Track the visibility of the date picker
      selectedDate: null, // Track the selected date
      uploadedImageUri: null,
      uploadedProfileImageUri: null, // Add this line to declare the new property
      uploadedBackgroundImageUri: null,
      isImageUploaded: false,
    };

    this.onSignUp = this.onSignUp.bind(this);
  }

  isValidDate(date, month, year) {
    // Check if the date, month, and year are valid
    const isValid = !isNaN(Date.parse(`${year}-${month}-${date}`));

    return isValid;
  }
  async onSignUp() {
    const {
      email,
      password,
      name,
      phoneNumber,
      pincode,
      date,
      month,
      year,
      isPoliticianModalVisible,
      uploadedProfileImageUri,
      uploadedBackgroundImageUri,
      isImageUploaded, // Include isImageUploaded in the destructuring
    } = this.state;

    try {
      // Validate date before proceeding with sign up
      // if (!this.isValidDate(date, month, year)) {
      //   this.setState({ error: 'Invalid date. Please enter a valid date.' });
      //   return;
      // }

      const backgroundImageUrl = await this.uploadImage(
        uploadedBackgroundImageUri,
        "background_images"
      );
      const profileImageUrl = await this.uploadImage(
        uploadedProfileImageUri,
        "profile_images"
      );
      // Check if the image is successfully uploaded

      // Upload the image and get the download URL

      // Perform user registration
      console.log("hello");
      const auth = getAuth();
      const db = getFirestore();

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      console.log("Profile Image URI:", uploadedProfileImageUri);
      console.log("Background Image URI:", uploadedBackgroundImageUri);

      // Add the user data to Firestore
      await setDoc(doc(db, "users", user.uid), {
        name,
        email,
        phoneNumber,
        //dob: `${date}/${month}/${year}`,
        password,
        pincode,
        profileImageUrl,
        backgroundImageUrl,
      });

      console.log("User created successfully:", user);
    } catch (error) {
      console.error("Error during sign up:", error.code, error.message);
      this.setState({ error: error.message });
    } finally {
      this.togglePoliticianModal();
    }
  }

  onAddImageButtonPress = async () => {
    console.log("addimage");
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== "granted") {
        console.error("Permission to access media library denied");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [100, 40],
        quality: 1,
      });

      if (!result.canceled) {
        const selectedAsset = result.assets[0];
        console.log("Selected Background Image URI:", selectedAsset.uri);
        this.setState({ uploadedBackgroundImageUri: selectedAsset.uri });
      }
    } catch (error) {
      console.error("Error while picking image:", error);
    }
  };

  onProfileAddPress = async () => {
    console.log("Profile Add button pressed");
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== "granted") {
        console.error("Permission to access media library denied");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled) {
        const selectedAsset = result.assets[0];
        console.log("Selected Profile Image URI:", selectedAsset.uri);
        this.setState({ uploadedProfileImageUri: selectedAsset.uri });
      }
    } catch (error) {
      console.error("Error while picking image:", error);
    }
  };

  uploadImage = async (uri, storagePath) => {
    try {
      console.log("Uploading image...");
      const storage = getStorage();
      const storageRef = ref(storage, `${storagePath}/${Date.now()}`);

      const response = await fetch(uri);
      const blob = await response.blob();

      // Upload the blob to Firebase Storage
      const uploadTask = uploadBytesResumable(storageRef, blob);

      // Listen for state changes, errors, and completion of the upload.
      return new Promise((resolve, reject) => {
        uploadTask.on(
          "state_changed",
          (snapshot) => {
            const progress =
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log(`Upload is ${progress}% done`);
            // Update the UI with the progress information if needed
          },
          (error) => {
            console.error("Error during upload:", error);
            throw error;
          },
          async () => {
            // Upload completed successfully, get download URL
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            console.log("Storage Path:", uploadTask.snapshot.ref.fullPath);
            console.log("Download URL:", downloadURL);
            console.log("Image successfully uploaded!");

            resolve(downloadURL);
          }
        );
      });
    } catch (error) {
      console.error("Error while uploading image:", error);
      throw error;
    }
  };

  togglePoliticianModal = () => {
    this.setState((prevState) => ({
      isPoliticianModalVisible: !prevState.isPoliticianModalVisible,
      showPartyOptions: false, // Reset party options visibility
      selectedParty: null, // Reset selected party
    }));
  };

  togglePasswordVisibility = () => {
    this.setState((prevState) => ({
      isPasswordVisible: !prevState.isPasswordVisible,
    }));
  };

  toggleConfirmPasswordVisibility = () => {
    this.setState((prevState) => ({
      isConfirmPasswordVisible: !prevState.isConfirmPasswordVisible,
    }));
  };

  onSignInLinkPress = () => {
    this.props.navigation.navigate("Login");
  };

  handlePartySelection = (party) => {
    this.setState({ selectedParty: party });
  };

  showDatePicker = () => {
    this.setState({ isDatePickerVisible: true });
  };

  hideDatePicker = () => {
    this.setState({ isDatePickerVisible: false });
  };

  handleDateConfirm = (date) => {
    this.setState({
      selectedDate: date,
      isDatePickerVisible: false,
    });
  };

  renderPoliticianModal() {
    const { isPoliticianModalVisible, showPartyOptions, selectedParty } =
      this.state;
    const partyOptions = ["Party 1", "Party 2", "Party 3", "Party 4"];

    return (
      <Modal
        isVisible={isPoliticianModalVisible}
        onBackdropPress={this.togglePoliticianModal}
      >
        <View style={styles.politicianModalContainer}>
          <Text style={styles.politicianModalText}>Are you a politician?</Text>

          <View style={styles.optionsContainer}>
            <TouchableOpacity
              style={styles.politicianModalButton}
              onPress={() => {
                this.setState({ showPartyOptions: true });
                console.log("yes");
              }}
            >
              <Text style={styles.politicianModalButtonText}>Yes</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.politicianModalButton}
              onPress={() => {
                this.togglePoliticianModal();
                console.log("no");
                this.onSignUp();
              }}
            >
              <Text style={styles.politicianModalButtonText}>No</Text>
            </TouchableOpacity>
          </View>

          {showPartyOptions && (
            <View style={styles.yesOption}>
              <Text style={styles.politicianModalText}>Select Party:</Text>
              {partyOptions.map((party, index) => (
                <View style={styles.partyOptions}>
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.partyButton,
                      selectedParty === party && styles.selectedPartyButton,
                    ]}
                    onPress={() => this.handlePartySelection(party)}
                  >
                    <Text
                      style={[
                        styles.partyButtonText,
                        selectedParty === party &&
                          styles.selectedPartyButtonText,
                      ]}
                    >
                      {party}
                    </Text>
                  </TouchableOpacity>
                </View>
              ))}

              {/* Submit Button */}
              <TouchableOpacity
                style={styles.submitButton}
                onPress={() => {
                  // Perform any necessary actions before navigating
                  console.log("submit");
                  this.togglePoliticianModal();
                  this.onSignUp();
                }}
              >
                <Text style={styles.submitButtonText}>Submit</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </Modal>
    );
  }

  render() {
    return (
      <KeyboardAvoidingView
        style={styles.overallcontainer}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.container}>
            {this.state.error && (
              <Text style={{ color: "red" }}>{this.state.error}</Text>
            )}
            {/* Background Image with Add Image Button */}
            <View style={styles.backgroundContainer}>
              <Text style={styles.headingText}>Sign Up</Text>
              {this.state.uploadedBackgroundImageUri && (
                <Image
                  source={{ uri: this.state.uploadedBackgroundImageUri }}
                  style={{
                    width: "100%",
                    height: "130%",
                    position: "absolute",
                    top: 0,
                    left: 0,
                  }}
                />
              )}
              <TouchableOpacity
                style={styles.addImageButton}
                onPress={this.onAddImageButtonPress}
              >
                {/* You can use an icon or text as per your requirement */}
                <Text style={styles.addImageButtonText}>Add Image</Text>
              </TouchableOpacity>
            </View>

            {/* Circular Profile Image */}
            <View style={styles.profileImageContainer}>
              {this.state.uploadedProfileImageUri ? (
                <Image
                  source={{ uri: this.state.uploadedProfileImageUri }}
                  style={styles.profileImage}
                />
              ) : (
                <Image
                  source={require("../../assets/signupPage/User.png")}
                  style={styles.profileImage}
                />
              )}
            </View>
            <TouchableOpacity onPress={this.onProfileAddPress}>
              <Image
                source={require("../../assets/signupPage/profileadd.png")}
                style={styles.profileadd}
              />
            </TouchableOpacity>
            {/* Input Fields */}
            <View style={styles.inputContainer}>
              <Image
                source={require("../../assets/loginpage/Profile.png")}
                style={styles.inputIcon}
                resizeMode="cover"
              />
              <TextInput
                style={styles.input}
                placeholder="Full Name"
                onChangeText={(name) => this.setState({ name })}
              />
            </View>
            <View style={styles.inputContainer}>
              <Image
                source={require("../../assets/signupPage/Message.png")}
                style={styles.inputIcon}
                resizeMode="cover"
              />
              <TextInput
                style={styles.input}
                placeholder="Email Address"
                keyboardType="email-address"
                onChangeText={(email) => this.setState({ email })}
              />
            </View>
            <View style={styles.inputContainer}>
              <Image
                source={require("../../assets/signupPage/Call.png")}
                style={styles.inputIcon}
                resizeMode="cover"
              />
              <TextInput
                style={styles.input}
                placeholder="+91 Phone Number"
                keyboardType="phone-pad"
                maxLength={10}
                onChangeText={(phoneNumber) => this.setState({ phoneNumber })}
              />
            </View>
            <View style={styles.dobContainer}>
              <Image
                source={require("../../assets/signupPage/Calendar.png")}
                style={styles.inputIcon}
                resizeMode="cover"
              />
              <TouchableOpacity
                onPress={this.showDatePicker}
                style={{ height: 50 }}
              >
                <Text style={styles.dobInput}>
                  {this.state.selectedDate
                    ? this.state.selectedDate.toDateString()
                    : "Select D.O.B"}
                </Text>
              </TouchableOpacity>
              <DateTimePickerModal
                isVisible={this.state.isDatePickerVisible}
                mode="date"
                onConfirm={this.handleDateConfirm}
                onCancel={this.hideDatePicker}
              />
            </View>
            <View style={styles.inputContainer}>
              <Image
                source={require("../../assets/signupPage/Location.png")}
                style={styles.inputIcon}
                resizeMode="cover"
              />
              <TextInput
                style={styles.input}
                placeholder="Pincode"
                keyboardType="phone-pad"
                onChangeText={(pincode) => this.setState({ pincode })}
              />
            </View>
            <View style={styles.inputContainer}>
              <Image
                source={require("../../assets/signupPage/lock.png")}
                style={styles.inputIcon}
                resizeMode="cover"
              />
              <TextInput
                style={styles.input}
                placeholder="Password"
                secureTextEntry={!this.state.isPasswordVisible}
                onChangeText={(password) => this.setState({ password })}
              />
              <TouchableOpacity onPress={this.togglePasswordVisibility}>
                <Ionicons
                  name={this.state.isPasswordVisible ? "eye" : "eye-off"}
                  size={20}
                  color="#A49797"
                  style={styles.visibilityIcon}
                />
              </TouchableOpacity>
            </View>
            <View style={styles.inputContainer}>
              <Image
                source={require("../../assets/signupPage/lock.png")}
                style={styles.inputIcon}
                resizeMode="cover"
              />
              <TextInput
                style={styles.input}
                placeholder="Confirm Password"
                secureTextEntry={!this.state.isConfirmPasswordVisible}
                onChangeText={(confirmPassword) =>
                  this.setState({ confirmPassword })
                }
              />
              <TouchableOpacity onPress={this.toggleConfirmPasswordVisibility}>
                <Ionicons
                  name={this.state.isConfirmPasswordVisible ? "eye" : "eye-off"}
                  size={20}
                  color="#A49797"
                  style={styles.visibilityIcon}
                />
              </TouchableOpacity>
            </View>
            {/* Sign Up Button */}
            <TouchableOpacity
              style={styles.signupButton}
              onPress={() => this.togglePoliticianModal()}
              title="Sign Up"
            >
              <Text style={styles.signupButtonText}>Sign Up</Text>
            </TouchableOpacity>

            {/* Sign In Link */}
            <TouchableOpacity
              style={styles.signInContainer}
              onPress={this.onSignInLinkPress}
            >
              <Text style={{ color: "#A49797" }}>
                Already have an account?{" "}
                <Text style={styles.signInText}>Sign in</Text>
              </Text>
            </TouchableOpacity>
            {this.renderPoliticianModal()}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }
}

const styles = StyleSheet.create({
  politicianModalContainer: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
  },

  optionsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  politicianModalText: {
    fontSize: 14,
    marginBottom: 20,
  },
  politicianModalButton: {
    backgroundColor: "#0BCC9E",
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
    width: 70,
    marginHorizontal: 10,
    justifyContent: "center",
    alignContent: "center",
  },
  politicianModalButtonText: {
    display: "flex",
    color: "white",
    fontSize: 14,
    justifyContent: "center",
    alignContent: "center",
    textAlign: "center", // Center the text within the button
  },
  submitButton: {
    display: "flex",
    backgroundColor: "#0BCC9E",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    width: 100,
    marginHorizontal: 10,
    justifyContent: "center",
    alignContent: "center",
  },
  submitButtonText: {
    display: "flex",
    color: "white",
    fontSize: 14,
    justifyContent: "center",
    alignContent: "center",
    textAlign: "center", // Center the text within the button
  },
  partyOptions: {
    flexDirection: "row",
    marginBottom: 10,
  },
  partyButton: {
    width: "80%",
    padding: 15,
    borderColor: "#A49797",
    borderWidth: 1,
    borderRadius: 10,
    marginHorizontal: 10,
    justifyContent: "center",
    alignContent: "center",
  },
  selectedPartyButton: {
    backgroundColor: "#0BCC9E", // Change the color for the selected party
  },
  selectedPartyButtonText: {
    color: "white", // Change the color for the selected party
  },
  partyButtonText: {
    color: "#A49797",
    fontSize: 14,
  },
  yesOption: {
    alignItems: "center",
    justifyContent: "center",
  },
  overallcontainer: {
    flex: 1,
    //alignItems: "center",
    backgroundColor: "white",
    width: "100%",
    //height: "100%",
  },
  container: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "white",
    width: "100%",
    height: "100%",
  },

  addImageButton: {
    position: "absolute",
    top: 108,
    right: 10,
    backgroundColor: "#0BCC9E",
    padding: 2,
    paddingLeft: 15,
    paddingRight: 15,
    borderRadius: 10,
    marginRight: 10,
  },
  addImageButtonText: {
    fontSize: 10,
    color: "white",
    fontWeight: "bold",
  },
  backgroundContainer: {
    height: "17%",
    width: "100%",
    overflow: "hidden",
    backgroundColor: "#E1FFFD",
    paddingTop: 30,
  },
  backButton: {
    marginLeft: 20,
    marginTop: 10,
  },
  backgroundImage: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  headingText: {
    fontSize: 14,
    fontWeight: "heavy",
    alignSelf: "center",
    top: 20,
  },
  profileImageContainer: {
    alignItems: "center",
    marginVertical: "-13%", // Adjust the margin as needed
  },
  profileImage: {
    width: 105, // Set a default width
    height: 105, // Set a default height
    borderRadius: 75, // Half of the width and height for a perfect circle
    marginBottom: 40,
  },
  profileadd: {
    width: 30, // Set a default width
    height: 30, // Set a default height
    bottom: 30,
    left: 36,
  },
  scrollViewContent: {
    flexGrow: 1,
    alignItems: "center",
    paddingVertical: 20, // Add some padding to the content inside ScrollView
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "90%",
    borderWidth: 1,
    borderColor: "#E3E3E3",
    borderRadius: 10,
    marginVertical: 6,
  },
  input: {
    flex: 1,
    height: 50,
    padding: 15,
    fontSize: 14,
  },
  inputIcon: {
    width: 20,
    height: 20,
    marginLeft: 10,
    color: "#927474",
  },
  signupButton: {
    width: "90%",
    backgroundColor: "#0BCC9E",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
  },
  signupButtonText: {
    color: "white",
    fontSize: 14,
  },
  signInContainer: {
    top: 20,
  },
  signInText: {
    color: "#4A7AFF",
  },
  visibilityIcon: {
    marginRight: 10,
  },
  dobContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "90%",
    borderWidth: 1,
    borderColor: "#E3E3E3",
    borderRadius: 10,
    marginVertical: 6,
    color: "grey",
  },
  dobInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    paddingHorizontal: 5, // Adjust as needed
    //color:'grey',
  },
  dobInput: {
    flex: 1,
    height: 50,
    padding: 10, // Adjust as needed
    fontSize: 14,
    // color:'grey',
  },
  dobSeparator: {
    fontSize: 18,
  },
});

export default Register;
