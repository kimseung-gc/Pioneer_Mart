import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Alert,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useAuth } from "../contexts/AuthContext";
import { useUserStore } from "@/stores/userStore";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";

const ProfileScreen = () => {
  const { authToken, onLogout } = useAuth();
  const [isLogoutVisible, setIsLogoutVisible] = useState(false);
  const insets = useSafeAreaInsets();

  const { userData, isLoading, error, fetchUserData } = useUserStore();

  useEffect(() => {
    if (authToken) {
      loadUserProfile();
    }
  }, [authToken]);

  const loadUserProfile = async () => {
    try {
      await fetchUserData(authToken || "");
    } catch (error) {
      Alert.alert("Error", "Failed to load profile. Please try again");
    }
  };

  const openLogoutModal = () => {
    setIsLogoutVisible(true);
    console.log("Wants to log out...");
  };

  const closeLogoutModal = () => {
    setIsLogoutVisible(false);
    console.log("Doesn't want to log out...");
  };

  if (isLoading && !userData) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <Text>Loading profile...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { paddingTop: insets.top }]}>
      <Text>Hello</Text>
      <TouchableOpacity style={styles.logoutButton} onPress={openLogoutModal}>
        <MaterialIcons
          name="logout"
          size={22}
          color="white"
          style={styles.logoutIcon}
        />
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 20,
  },
  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    width: "100%",
    alignItems: "center",
    marginTop: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
  },
  divider: {
    height: 1,
    backgroundColor: "#e0e0e0",
    marginVertical: 8,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f44336",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    width: "100%",
    marginTop: 20,
  },
  logoutIcon: {
    marginRight: 8,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "white",
  },
});
