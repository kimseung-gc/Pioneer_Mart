import { Entypo } from "@expo/vector-icons";
import { Stack } from "expo-router";
import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { useAuth } from "../contexts/AuthContext";
import axios from "axios";
import { useUserStore } from "@/stores/userStore";
import Constants from "expo-constants";

const ContactUs = () => {
  const BASE_URL = Constants?.expoConfig?.extra?.apiUrl;
  const { authToken } = useAuth();
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { userData } = useUserStore();

  const handleSubmit = async () => {
    if (!description.trim()) {
      Alert.alert("Error", "Please enter a description");
      return;
    }
    setIsSubmitting(true);
    try {
      const cleanToken = authToken?.trim();
      const user_email = userData?.email;
      const response = await axios.post(
        `${BASE_URL}/otpauth/contact`,
        { description, user_email },
        {
          headers: {
            Authorization: `Bearer ${cleanToken}`,
            "Content-Type": "application/json",
          },
        }
      );
      setDescription("");
      Alert.alert(
        "Thank You!",
        "Your message has been sent successfully. We'll get back to you soon.",
        [{ text: "OK" }]
      );
    } catch (error) {
      console.error("Error sending contact form:", error);
      Alert.alert(
        "Error",
        "Failed to send your message. Please try again later."
      );
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={100}
    >
      <Stack.Screen
        options={{
          headerTitle: "Contact Us",
          headerTitleAlign: "center",
          headerBackTitle: "Back",
          headerShown: true,
        }}
      />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.contentContainer}>
          <Text style={styles.text1}>
            If you have any questions or feedback about PioneerMart, please fill
            out the form below.
          </Text>
          <Text style={styles.text2}>
            We'd love to hear from you about how we can improve the app!
          </Text>
          <View style={styles.formContainer}>
            <Text style={styles.label}>Message</Text>
            <TextInput
              style={styles.textArea}
              placeholder="Enter your message here..."
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
            />

            <TouchableOpacity
              style={[
                styles.submitButton,
                !description.trim() && styles.disabledButton,
              ]}
              onPress={handleSubmit}
              disabled={isSubmitting || !description.trim()}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text style={styles.submitButtonText}>Submit</Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.contactInfoContainer}>
            <Text style={styles.contactInfoText}>
              You can also reach us directly at:
            </Text>
            <View style={styles.emailContainer}>
              <Entypo name="mail" size={16} color="#4a4a4a" />
              <Text style={styles.emailText}>email@gmail.com</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default ContactUs;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  contentContainer: {
    flex: 1,
    justifyContent: "center",
  },
  text1: {
    fontSize: 16,
    marginBottom: 10,
    textAlign: "center",
  },
  text2: {
    fontSize: 16,
    marginBottom: 30,
    textAlign: "center",
  },
  formContainer: {
    backgroundColor: "#f9f9f9",
    borderRadius: 10,
    padding: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    color: "#333",
  },
  textArea: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    minHeight: 120,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  submitButton: {
    backgroundColor: "#4285F4",
    borderRadius: 8,
    padding: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  disabledButton: {
    backgroundColor: "#a0a0a0",
  },
  submitButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  contactInfoContainer: {
    alignItems: "center",
    marginTop: 20,
  },
  contactInfoText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  emailContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  emailText: {
    fontSize: 14,
    color: "#4285F4",
    marginLeft: 6,
  },
});
