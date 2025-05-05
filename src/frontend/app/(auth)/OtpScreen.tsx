import { useState } from "react";
import {
  TouchableOpacity,
  Text,
  View,
  Alert,
  SafeAreaView,
  Dimensions,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { router, Stack, useLocalSearchParams } from "expo-router";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { OtpInput } from "react-native-otp-entry";
import React from "react";
import { useAuth } from "../contexts/AuthContext";
import Toast from "react-native-toast-message";
import Constants from "expo-constants";
import api from "@/types/api";
import { useTheme } from "../contexts/ThemeContext";

const width = Dimensions.get("window").width;

const OtpScreen = () => {
  const { email } = useLocalSearchParams();
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { setTokens } = useAuth();
  const { colors } = useTheme();

  const verifyOtp = async () => {
    if (otp.length !== 6) {
      Toast.show({
        type: "error",
        text1: "Please enter a valid 6-digit code",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.post(
        `${Constants?.expoConfig?.extra?.apiUrl}/otpauth/verify-otp/`,
        {
          email,
          otp,
        }
      );
      const { access, refresh } = response.data;
      if (access && refresh) {
        setTokens(access, refresh);
        Toast.show({
          type: "success",
          text1: "Logged in successfully",
        });
        router.replace("/(tabs)");
        setTimeout(() => {
          //adding this to REALLYY prevent back navigation
          router.setParams({});
        }, 100);
      } else {
        Alert.alert("Error", "Token not received from server.");
      }
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Invalid verification code",
        text2: "Please try again or request a new code",
      });
      console.error("Error", error);
    } finally {
      setIsLoading(false);
    }
  };

  const resendCode = async () => {
    try {
      const OTP_URL = `${Constants?.expoConfig?.extra?.apiUrl}/otpauth/request-otp/`;
      const fullEmail = (email as string).trim();
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
      Toast.show({
        type: "info",
        text1: "Sending new verification code",
        text2: "Please check your Grinnell email",
      });
    } catch (error) {
      console.error("Error:", error);
      Toast.show({
        type: "error",
        text1: "Error sending new verification code",
        text2: "Please try again",
      });
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <Stack.Screen
        options={{
          headerShown: false,
          gestureEnabled: false,
        }}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollViewContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.contentContainer}>
            <View
              style={[styles.iconContainer, { backgroundColor: colors.card }]}
            >
              <MaterialIcons name="verified" size={100} color={colors.accent} />
            </View>

            <Text style={[styles.heading, { color: colors.textPrimary }]}>
              Verification Code
            </Text>

            <Text style={[styles.subheading, { color: colors.textSecondary }]}>
              Please enter the 6-digit code we sent to your Grinnell email
            </Text>

            <View style={styles.otpContainer}>
              <OtpInput
                numberOfDigits={6}
                onTextChange={(text) => setOtp(text)}
                focusColor={colors.accent}
                focusStickBlinkingDuration={400}
                disabled={isLoading}
                theme={{
                  containerStyle: {
                    marginVertical: 20,
                    justifyContent: "center",
                    width: "100%",
                  },
                  pinCodeContainerStyle: {
                    backgroundColor: colors.card,
                    width: 48,
                    height: 60,
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: colors.border,
                    marginHorizontal: 5,
                  },
                  pinCodeTextStyle: {
                    color: colors.textPrimary,
                    fontSize: 20,
                    fontWeight: "600",
                  },
                }}
              />
            </View>

            <View style={styles.resendContainer}>
              <Text style={{ color: colors.textSecondary }}>
                Didn't receive the code?
              </Text>
              <TouchableOpacity
                onPress={resendCode}
                disabled={isLoading}
                testID="resend-button"
              >
                <Text style={[styles.resendText, { color: colors.accent }]}>
                  {" "}
                  Resend
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[
                styles.verifyButton,
                { backgroundColor: colors.accent },
                isLoading && { opacity: 0.7 },
              ]}
              onPress={verifyOtp}
              disabled={isLoading}
              testID="verify-code-button"
            >
              {isLoading ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <Text style={styles.verifyButtonText}>Verify</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
              disabled={isLoading}
            >
              <Text
                style={[styles.backButtonText, { color: colors.textSecondary }]}
              >
                Go Back
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default OtpScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingBottom: 20,
  },
  contentContainer: {
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 30,
  },
  iconContainer: {
    width: 160,
    height: 160,
    borderRadius: 80,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  heading: {
    fontSize: 28,
    marginBottom: 12,
    fontWeight: "700",
    textAlign: "center",
  },
  subheading: {
    fontSize: 16,
    textAlign: "center",
    marginHorizontal: 20,
    lineHeight: 22,
  },
  otpContainer: {
    marginTop: 20,
    marginBottom: 10,
    width: "100%",
    alignItems: "center",
  },
  resendContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
  },
  resendText: {
    fontSize: 16,
    fontWeight: "600",
  },
  verifyButton: {
    width: width * 0.8,
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  verifyButtonText: {
    fontSize: 18,
    fontWeight: "700",
    color: "white",
  },
  backButton: {
    marginTop: 16,
    paddingVertical: 10,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: "500",
  },
});
