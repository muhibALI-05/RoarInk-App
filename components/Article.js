import React from "react";
import { View,Text,Image, StyleSheet, ScrollView, TouchableOpacity,} from "react-native";
import Community from "./Community";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

const Article = ({ route }) => {
  const { article } = route.params;
  const navigation = useNavigation();
  const handleBackPress = () => {
    navigation.navigate(Community);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.Header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Image
          source={require("../assets/images/roarinklogo.png")}
          style={styles.centreicon}
        />
      </View>
      <View style={styles.articleContainer}>
        <Text style={styles.articleTitle}>{article.title}</Text>
        <Text style={styles.articleContent}>{article.content}</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  Header: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomRightRadius: 20,
    borderBottomLeftRadius: 20,
    justifyContent: "flex-start",
    backgroundColor: "#E1FFFD",
    padding: 10,
    paddingTop: 45,
  },
  centreicon: {
    height: 40,
    width: 100,
    //tintColor: "black",
    marginLeft: "27%",
  },
  backButton: {
    padding: 5,
  },
  articleContainer: {
    margin: 10,
    padding: 15,
  },
  articleTitle: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 8,
  },
  articleContent: {
    fontSize: 12,
  },
});

export default Article;
