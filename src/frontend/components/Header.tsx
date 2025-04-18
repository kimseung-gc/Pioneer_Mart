import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import SearchBar from "./SearchBar";
import { useRoute } from "@react-navigation/native";
import Entypo from "@expo/vector-icons/Entypo";
import { router } from "expo-router";
import React from "react";
import { ScreenId } from "@/types/types";

type HeaderProps = {
  screenId: ScreenId;
};

const Header: React.FC<HeaderProps> = ({ screenId }) => {
  const insets = useSafeAreaInsets();
  const route = useRoute();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {route.name === "additionalinfo/MyItems" ||
      route.name == "additionalinfo/ReportedItems" ? (
        <View style={styles.myItemsContainer}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            testID="back-button"
          >
            <Entypo name="chevron-left" size={24} color="black" />
          </TouchableOpacity>
          <View style={styles.myItemsContainer}>
            <View style={styles.searchContainer}>
              <SearchBar screenId={screenId} />
            </View>
            <View style={styles.iconContainer}>
              <Entypo name="chat" size={24} color="black" />
            </View>
          </View>
        </View>
      ) : (
        <View style={styles.myItemsContainer}>
          <View style={styles.searchContainer}>
            <SearchBar screenId={screenId} />
          </View>
          <View style={styles.iconContainer}>
            <Entypo
              name="chat"
              size={24}
              color="black"
              onPress={() => router.push("/ChatRoomScreen")}
            />
          </View>
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
    justifyContent: "space-between",
    width: "95%",
  },
  backButton: {
    marginTop: 16,
  },
  searchContainer: {
    flex: 1,
  },
  iconContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
});
