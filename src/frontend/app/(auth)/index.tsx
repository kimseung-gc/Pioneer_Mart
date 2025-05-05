import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Dimensions,
} from "react-native";
import { router, Stack } from "expo-router";
import React, { useEffect, useState } from "react";
import InputField from "@/components/InputField";
import TCModal from "@/components/TCModal";
import { useAuth } from "../contexts/AuthContext";
import Constants from "expo-constants";
import { useTheme } from "../contexts/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import api from "@/types/api";

type Props = {};

const { width } = Dimensions.get("window");

const WelcomeScreen = (props: Props) => {
  const [email, setEmail] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [modalVisible, setModalVisible] = useState(true); // this needs to show the modal on first load
  const { isAuthenticated, loading } = useAuth();
  const { colors } = useTheme();

  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.replace("/(tabs)");
    }
  }, [loading, isAuthenticated]);

  if (loading) {
    return (
      <View
        style={[
          styles.loadingContainer,
          { backgroundColor: colors.background },
        ]}
      >
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  const requestOTP = async () => {
    if (!email || email.trim() === "") {
      Alert.alert("Error", "Please enter your username first");
      return;
    }

    try {
      const OTP_URL = `${Constants?.expoConfig?.extra?.apiUrl}/otpauth/request-otp/`;
      const fullEmail = email.trim() + "@grinnell.edu";
      await api.post(
        OTP_URL,
        {
          email: fullEmail,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );
      router.push({
        pathname: "/(auth)/OtpScreen",
        params: { email: fullEmail },
      });
    } catch (error) {
      console.error("Error:", error);
      Alert.alert(
        "Authentication Error",
        "Failed to send verification code. Please try again later."
      );
    }
  };

  const handleAcceptTerms = () => {
    setTermsAccepted(true);
    setModalVisible(false);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <Stack.Screen />

      <TCModal
        isVisible={modalVisible}
        termsAccepted={termsAccepted}
        onAccept={handleAcceptTerms}
        onClose={handleCloseModal}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidingView}
      >
        <View style={styles.content}>
          {/* Logo or welcome image */}
          <View style={styles.logoContainer}>
            <View
              style={[
                styles.logoPlaceholder,
                { backgroundColor: colors.accent + "20" },
              ]}
            >
              <Ionicons
                name="person-circle-outline"
                size={64}
                color={colors.accent}
              />
            </View>
          </View>

          <View style={styles.titleContainer}>
            <Text style={[styles.title, { color: colors.textPrimary }]}>
              Welcome to PioneerMart
            </Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Join our community to buy, sell, and trade items with fellow
              students, faculty, and staff
            </Text>
          </View>

          {termsAccepted ? (
            <View style={styles.formContainer}>
              <Text style={[styles.inputLabel, { color: colors.textPrimary }]}>
                Enter your Grinnell username
              </Text>
              <View
                style={[styles.inputContainer, { borderColor: colors.border }]}
              >
                <InputField
                  placeholder="Username"
                  placeholderTextColor={colors.textSecondary}
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                  style={styles.input}
                />
                <Text
                  style={[styles.emailDomain, { color: colors.textSecondary }]}
                >
                  @grinnell.edu
                </Text>
              </View>

              <TouchableOpacity
                style={[styles.button, { backgroundColor: colors.accent }]}
                onPress={requestOTP}
                testID="send-code-button"
              >
                <Text style={styles.buttonText}>Send Verification Code</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.termsLinkContainer}
                onPress={() => setModalVisible(true)}
              >
                <Text
                  testID="tc-modal-link"
                  style={[styles.termsLink, { color: colors.accent }]}
                >
                  View Terms and Conditions
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.acceptTermsContainer}>
              <View style={styles.messageBox}>
                <Ionicons
                  name="information-circle-outline"
                  size={24}
                  color={colors.accent}
                />
                <Text
                  style={[
                    styles.acceptTermsText,
                    { color: colors.textSecondary },
                  ]}
                >
                  Please accept the terms and conditions to continue
                </Text>
              </View>

              <TouchableOpacity
                style={[styles.button, { backgroundColor: colors.accent }]}
                onPress={() => setModalVisible(true)}
              >
                <Text style={styles.buttonText}>View Terms & Conditions</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>

      <View style={[styles.footer, { borderTopColor: colors.border }]}>
        <Text style={[styles.footerText, { color: colors.textSecondary }]}>
          PioneerMart - Built by Grinnellians
        </Text>
      </View>
    </SafeAreaView>
  );
};

export default WelcomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  logoPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
  },
  titleContainer: {
    marginBottom: 30,
    width: "100%",
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 22,
  },
  formContainer: {
    width: "100%",
    alignItems: "center",
  },
  inputLabel: {
    alignSelf: "flex-start",
    marginBottom: 8,
    fontSize: 15,
    fontWeight: "500",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    borderWidth: 1,
    borderRadius: 8,
    overflow: "hidden",
    marginBottom: 20,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  emailDomain: {
    paddingHorizontal: 16,
    fontSize: 16,
    fontWeight: "500",
  },
  button: {
    width: "100%",
    paddingVertical: 14,
    borderRadius: 8,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  termsLinkContainer: {
    paddingVertical: 10,
  },
  termsLink: {
    fontSize: 14,
    textDecorationLine: "underline",
  },
  acceptTermsContainer: {
    width: "100%",
    alignItems: "center",
  },
  messageBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(180, 87, 87, 0.1)",
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
    width: "100%",
  },
  acceptTermsText: {
    marginLeft: 8,
    fontSize: 15,
    flex: 1,
  },
  footer: {
    borderTopWidth: 1,
    paddingVertical: 15,
    alignItems: "center",
  },
  footerText: {
    fontSize: 13,
  },
});
