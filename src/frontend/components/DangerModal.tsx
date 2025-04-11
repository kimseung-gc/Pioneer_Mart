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
          <Text style={styles.modalText}>{dangerMessage}</Text>
          <View style={styles.divider} />
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={() => {
              if (onDone) {
                onDone();
              }
              console.log("this guys crazy..");
            }}
          >
            <Text style={styles.logoutText}>{dangerOption1}</Text>
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
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    elevation: 5,
    width: "80%", // Adjust width as needed
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center",
    fontSize: 16,
  },
  cancelButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2196F3",
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 10,
    width: "70%",
    marginVertical: 5,
  },
  cancelButtonText: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
  divider: {
    width: "100%",
    height: 1,
    backgroundColor: "#ccc",
    marginVertical: 10,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f44336",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    width: "70%",
    marginVertical: 5,
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

export default DangerModal;
