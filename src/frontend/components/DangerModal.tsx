import React from "react";
import { View, Text, Modal, TouchableOpacity, StyleSheet } from "react-native";

interface DangerModalProps {
  isVisible: boolean;
  onClose: () => void;
  onDone?: () => void;
  dangerMessage: string;
  dangerOption1: string;
}

const DangerModal: React.FC<DangerModalProps> = ({
  isVisible,
  onClose,
  onDone,
  dangerMessage,
  dangerOption1,
}) => {
  return (
    <Modal animationType="slide" transparent={true} visible={isVisible}>
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Text testID="danger-message" style={styles.modalText}>
            {dangerMessage}
          </Text>
          <View style={styles.divider} />
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={() => {
              if (onDone) {
                onDone();
              }
            }}
          >
            <Text testID="danger-option" style={styles.logoutText}>
              {dangerOption1}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalView: {
    margin: 20,
    backgroundColor: "#FFFFFF", // soft muted rose-beige
    borderRadius: 20,
    paddingVertical: 30,
    paddingHorizontal: 25,
    alignItems: "center",
    width: "85%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 4,
  },
  modalText: {
    fontSize: 16,
    fontWeight: "500",
    textAlign: "center",
    color: "#3A2E2E", // soft dark brown for readability
    marginBottom: 15,
  },
  divider: {
    width: "100%",
    height: 1,
    backgroundColor: "#DABEB5", // warm neutral line
    marginVertical: 12,
  },
  logoutButton: {
    backgroundColor: "#B45757", // soft clay red
    borderRadius: 30,
    paddingVertical: 12,
    width: "85%",
    alignItems: "center",
    marginVertical: 6,
  },
  logoutText: {
    color: "#FFF9F0",
    fontSize: 16,
    fontWeight: "600",
  },
  cancelButton: {
    backgroundColor: "#E6D2C3", // soft beige tone
    borderRadius: 30,
    paddingVertical: 12,
    width: "85%",
    alignItems: "center",
    marginVertical: 6,
  },
  cancelButtonText: {
    color: "#3A2E2E",
    fontWeight: "600",
    fontSize: 15,
  },
});

export default DangerModal;
