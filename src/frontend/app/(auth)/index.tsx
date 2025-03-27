import { Text, View, StyleSheet, TouchableOpacity } from "react-native";
import { router, Stack } from "expo-router";
import React, { useState } from "react";
import axios from "axios";
import { Colors } from "react-native/Libraries/NewAppScreen";
import { BASE_URL } from "@/config";
import InputField from "@/components/InputField";

type Props = {};

const WelcomeScreen = (props: Props) => {
  const [email, setEmail] = useState("");

  const requestOTP = async () => {
    try {
      const OTP_URL = `${BASE_URL}/api/otpauth/request-otp/`;
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
      console.log("requested OTP....");
      router.push({ pathname: "/OtpScreen", params: { email: fullEmail } });
    } catch (error) {
      console.log(email);
      console.log("Error:", error);
      alert("Failed to do OTP stuff");
    }
  };
  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: "Sign Up",
          headerTitleAlign: "center",
          headerShown: true,
          headerLeft: () => null, // This removes the back button
          headerBackVisible: false,
          gestureEnabled: false, //remove gesture
        }}
      />
      <View style={styles.container}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Create an Account</Text>
          <Text style={{ textAlign: "center", color: "gray" }}>
            We'll send a code to your Grinnell email account!
          </Text>
        </View>
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
  divider: {
    borderTopColor: Colors.gray,
    borderTopWidth: StyleSheet.hairlineWidth,
    width: "30%",
    marginBottom: 30,
  },
});
