import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import SearchBar from "./SearchBar";
import { useRoute } from "@react-navigation/native";
import Entypo from "@expo/vector-icons/Entypo";
import { router } from "expo-router";
import React from "react";

type HeaderProps = {
  screenId: "home" | "favorites" | "myItems";
};

const Header: React.FC<HeaderProps> = ({ screenId }) => {
  const insets = useSafeAreaInsets();
  const route = useRoute();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {route.name === "additionalinfo/MyItems" ? (
        <View style={styles.myItemsContainer}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            testID="back-button"
          >
            <Entypo name="chevron-left" size={24} color="black" />
          </TouchableOpacity>
          <View style={styles.searchContainer}>
            <SearchBar screenId={screenId} />
          </View>
          <Entypo name="chat" size={24} color="black" />
        </View>
      ) : (
        <View style={styles.myItemsContainer}>
          <SearchBar screenId={screenId} />
          <Entypo
            name="chat"
            size={24}
            color="black"
            onPress={() => router.push("/ChatRoomScreen")}
          />
        </View>
      )}
    </View>
  );
};

export default Header;

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  myItemsContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
  },
  backButton: {
    marginRight: 8,
    marginTop: 16,
  },
  searchContainer: {
    flex: 1,
  },
});
