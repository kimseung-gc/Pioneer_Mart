import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Alert,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from "react-native";
import { useAuth } from "../contexts/AuthContext";
import { useUserStore } from "@/stores/userStore";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { FontAwesome, Foundation, MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import DangerModal from "@/components/DangerModal";

const ProfileScreen = () => {
  const { authToken, onLogout } = useAuth();
  const [isClearHistoryVisible, setIsClearHistoryVisible] = useState(false);
  const [isLogoutVisible, setIsLogoutVisible] = useState(false);
  const insets = useSafeAreaInsets();
  const router = useRouter();

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

  const openClearHistoryModal = () => {
    setIsClearHistoryVisible(true);
  };

  const closeClearHistoryModal = () => {
    setIsClearHistoryVisible(false);
  };

  const openLogoutModal = () => {
    setIsLogoutVisible(true);
  };

  const closeLogoutModal = () => {
    setIsLogoutVisible(false);
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
      <DangerModal
        isVisible={isClearHistoryVisible}
        onClose={closeClearHistoryModal}
        dangerMessage={"Are you sure you want to clear your history?"}
        dangerOption1="Yes"
        // TODO: add clear history function
      />
      <DangerModal
        isVisible={isLogoutVisible}
        onClose={closeLogoutModal}
        dangerMessage={"Are you sure you want to logout?"}
        dangerOption1="Log out"
        onDone={async () => await onLogout()}
      />
      {/* Top row with profile image and email */}
      <View style={styles.topRowContainer}>
        <View style={styles.profileContainer}>
          <Image
            source={require("../../assets/images/profile.jpeg")}
            style={styles.profileImage}
          />
        </View>

        <View style={styles.userInfoContainer}>
          <View style={styles.userInfoEmailContainer}>
            <MaterialIcons name="email" size={22} color="#555" />
            <Text style={styles.userEmail}>{userData?.email}</Text>
          </View>
        </View>
      </View>
      {/* General Information Section */}
      <View style={styles.infoSection}>
        <Text style={styles.sectionTitle}>General Information</Text>

        {/* Purchase Requests */}
        <TouchableOpacity
          style={styles.infoItem}
          onPress={() => router.push("../additionalinfo/PurchaseRequests")}
        >
          <View style={styles.infoItemLeft}>
            <FontAwesome name="send" size={22} color="#555" />
            <Text style={styles.infoItemText}>Purchase Requests</Text>
          </View>
          <MaterialIcons name="chevron-right" size={22} color="#999" />
        </TouchableOpacity>

        {/* My Items */}
        <TouchableOpacity
          style={styles.infoItem}
          onPress={() => router.push("../additionalinfo/MyItems")}
        >
          <View style={styles.infoItemLeft}>
            <Foundation name="shopping-bag" size={22} color="#555" />
            <Text style={styles.infoItemText}>My Items</Text>
          </View>
          <MaterialIcons name="chevron-right" size={22} color="#999" />
        </TouchableOpacity>

        {/* Reported Items */}
        <TouchableOpacity
          style={styles.infoItem}
          onPress={() => router.push("../additionalinfo/ReportedItems")}
        >
          <View style={styles.infoItemLeft}>
            <MaterialIcons name="flag" size={22} color="#555" />
            <Text style={styles.infoItemText}>Reported Items</Text>
          </View>
          <MaterialIcons name="chevron-right" size={22} color="#999" />
        </TouchableOpacity>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Clear History */}
        <TouchableOpacity
          style={styles.infoItem}
          onPress={openClearHistoryModal}
        >
          <View style={styles.infoItemLeft}>
            <MaterialIcons name="delete-outline" size={22} color="#555" />
            <Text style={styles.infoItemText}>Clear History</Text>
          </View>
          <MaterialIcons name="chevron-right" size={22} color="#999" />
        </TouchableOpacity>

        {/* FAQs */}
        <TouchableOpacity
          style={styles.infoItem}
          onPress={() => router.push("../additionalinfo/FAQs")}
        >
          <View style={styles.infoItemLeft}>
            <MaterialIcons name="help-outline" size={22} color="#555" />
            <Text style={styles.infoItemText}>FAQs</Text>
          </View>
          <MaterialIcons name="chevron-right" size={22} color="#999" />
        </TouchableOpacity>

        {/* Contact Us */}
        <TouchableOpacity
          style={styles.infoItem}
          onPress={() => router.push("../additionalinfo/ContactUs")}
        >
          <View style={styles.infoItemLeft}>
            <MaterialIcons name="mail-outline" size={22} color="#555" />
            <Text style={styles.infoItemText}>Contact Us</Text>
          </View>
          <MaterialIcons name="chevron-right" size={22} color="#999" />
        </TouchableOpacity>
      </View>
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
  topRowContainer: {
    flexDirection: "column",
    alignItems: "center",
    width: "100%",
    padding: 10,
  },
  profileContainer: {
    position: "relative",
    marginRight: 15,
  },
  profileImage: {
    width: 140,
    height: 140,
    borderRadius: 40,
  },
  userInfoContainer: {
    flex: 1,
    justifyContent: "center",
  },
  userInfoEmailContainer: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  userEmail: {
    fontSize: 16,
    color: "#666",
    marginLeft: 8,
  },
  infoSection: {
    marginTop: 25,
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
  },
  infoItemLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  infoItemText: {
    fontSize: 12,
    color: "#333",
    marginLeft: 12,
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
