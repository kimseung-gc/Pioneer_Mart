import React from "react";
import { useTheme } from "@/app/contexts/ThemeContext";
import { View, Text, Modal, TouchableOpacity, StyleSheet } from "react-native";

interface DangerModalProps {
  isVisible: boolean;
  onClose: () => void;
  onDone?: () => void;
  dangerMessage: string;
  dangerOption1: string;
}

const { colors } = useTheme();

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
    backgroundColor: colors.card, 
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
    color: colors.textPrimary, 
    marginBottom: 15,
  },
  divider: {
    width: "100%",
    height: 1,
    backgroundColor: colors.border, 
    marginVertical: 12,
  },
  logoutButton: {
    backgroundColor: colors.danger, 
    borderRadius: 30,
    paddingVertical: 12,
    width: "85%",
    alignItems: "center",
    marginVertical: 6,
  },
  logoutText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: "600",
  },
  cancelButton: {
    backgroundColor: colors.accentSecondary,
    borderRadius: 30,
    paddingVertical: 12,
    width: "85%",
    alignItems: "center",
    marginVertical: 6,
  },
  cancelButtonText: {
    color: colors.textPrimary,
    fontWeight: "600",
    fontSize: 15,
  },
});

export default DangerModal;
