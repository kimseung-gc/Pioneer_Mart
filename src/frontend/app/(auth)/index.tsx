import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { router, Stack } from "expo-router";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Colors } from "react-native/Libraries/NewAppScreen";
import InputField from "@/components/InputField";
import TCModal from "@/components/TCModal";
import { useAuth } from "../contexts/AuthContext";
import Constants from "expo-constants";

type Props = {};

const WelcomeScreen = (props: Props) => {
  const [email, setEmail] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [modalVisible, setModalVisible] = useState(true); // this needs to show the modal on first load
  const { isAuthenticated, loading } = useAuth();

  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.replace("/(tabs)");
    }
  }, [loading, isAuthenticated]);

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: "center" }]}>
        <ActivityIndicator size="large" color="#4b0082" />
      </View>
    );
  }

  const requestOTP = async () => {
    try {
      const OTP_URL = `${Constants?.expoConfig?.extra?.apiUrl}/otpauth/request-otp/`;
      const fullEmail = email + "@grinnell.edu";
      await axios.post(
        OTP_URL,
        {
          // response for future error checking
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
      Alert.alert("Failed to do OTP stuff");
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
    <>
      <Stack.Screen
        options={{
          headerTitle: "Sign Up",
          headerTitleAlign: "center",
          headerShown: true,
          headerBackVisible: false,
          gestureEnabled: false, //remove gesture
        }}
      />

      <TCModal
        isVisible={modalVisible}
        termsAccepted={termsAccepted}
        onAccept={handleAcceptTerms}
        onClose={handleCloseModal}
      />
      <View style={styles.container}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Create an Account</Text>
          <Text style={{ textAlign: "center", color: "gray" }}>
            We'll send a code to your Grinnell email account!
          </Text>
        </View>
        {termsAccepted ? (
          <>
            <View style={styles.inputContainer}>
              <InputField
                placeholder="Username"
                placeholderTextColor={Colors.gray}
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
              <Text style={styles.emailDomain}>@grinnell.edu</Text>
            </View>
            <TouchableOpacity style={styles.btn} onPress={requestOTP}>
              <Text style={styles.btnTxt}>Send Code</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setModalVisible(true)}>
              <Text style={styles.termsLink}>View Terms and Conditions</Text>
            </TouchableOpacity>
          </>
        ) : (
          <View style={styles.acceptTermsContainer}>
            <Text style={styles.acceptTermsText}>
              Please accept the terms and conditions to continue
            </Text>
            <TouchableOpacity
              style={styles.btn}
              onPress={() => setModalVisible(true)}
            >
              <Text style={styles.btnTxt}>View Terms</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.divider} />
      </View>
    </>
  );
};

export default WelcomeScreen;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 30,
    backgroundColor: Colors.background,
  },
  titleContainer: {
    marginBottom: 30,
    justifyContent: "center",
    alignSelf: "stretch",
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    textAlign: "center",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "stretch",
    justifyContent: "center",
  },
  emailDomain: {
    paddingVertical: 8,
    paddingLeft: 12,
    fontSize: 16,
    color: "gray",
  },
  btn: {
    backgroundColor: "#4b0082",
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 5,
    marginTop: 15,
  },
  btnTxt: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  loginTxt: {
    marginTop: 20,
    fontSize: 14,
    color: Colors.black,
    lineHeight: 24,
  },
  loginTxtSpan: {
    fontWeight: "600",
    color: Colors.primary,
  },
  termsLink: {
    marginTop: 15,
    color: "#4b0082",
    textDecorationLine: "underline",
  },
  acceptTermsContainer: {
    alignItems: "center",
    marginTop: 20,
  },
  acceptTermsText: {
    textAlign: "center",
    marginBottom: 10,
    color: "gray",
  },
  divider: {
    borderTopColor: Colors.gray,
    borderTopWidth: StyleSheet.hairlineWidth,
    width: "30%",
    marginBottom: 30,
  },
});
