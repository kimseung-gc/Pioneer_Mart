import { useAuth } from "@/app/contexts/AuthContext";
import { useItemsStore } from "@/stores/useSearchStore";
import React from "react";
import { useState } from "react";
import {
  Alert,
  Modal,
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";

interface TCModalProps {
  isVisible: boolean;
  termsAccepted: boolean;
  onAccept: () => void;
  onClose: () => void;
}

const TCModal: React.FC<TCModalProps> = ({
  isVisible,
  termsAccepted,
  onAccept,
  onClose,
}) => {
  const handleClose = () => {
    if (!termsAccepted) {
      Alert.alert("You must accept the terms to continue");
    } else {
      onClose();
    }
  };

  return (
    <Modal
      testID="tc-modal"
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={handleClose}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Text style={styles.modalTitle}>Terms & Conditions</Text>

          <ScrollView style={styles.termsScrollView}>
            <Text style={styles.termsText}>
              By creating an account, you agree to the following terms and
              conditions:
              {"\n\n"}
              1. You must be a current Grinnell student with a valid Grinnell
              email address.
              {"\n\n"}
              2. Your account information will be handled according to our
              privacy policy.
              {"\n\n"}
              3. You are responsible for maintaining the confidentiality of your
              account.
              {"\n\n"}
              4. You agree to use this service in compliance with all applicable
              laws and regulations.
              {"\n\n"}
              5. Inappropriate content or behavior may result in account
              termination.
              {"\n\n"}
              6. We reserve the right to modify these terms at any time.
            </Text>
          </ScrollView>
          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.button, styles.buttonDeny]}
              onPress={handleClose}
            >
              <Text style={styles.buttonTextDeny}>Close</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.buttonAccept]}
              onPress={onAccept}
            >
              <Text testID="accept-button" style={styles.buttonTextAccept}>
                Accept
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default TCModal;

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
    width: "90%",
    maxHeight: "80%",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  termsScrollView: {
    maxHeight: 300,
    marginBottom: 15,
  },
  termsText: {
    fontSize: 14,
    lineHeight: 20,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  button: {
    borderRadius: 5,
    padding: 10,
    elevation: 2,
    flex: 1,
    marginHorizontal: 5,
  },
  buttonAccept: {
    backgroundColor: "#4b0082",
  },
  buttonDeny: {
    backgroundColor: "#f2f2f2",
  },
  buttonTextAccept: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
  buttonTextDeny: {
    color: "#333",
    fontWeight: "bold",
    textAlign: "center",
  },
});
