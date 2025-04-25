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

interface ReportModalProps {
  isVisible: boolean;
  onClose: () => void;
  itemId: number;
}
const ReportModal = ({ isVisible, onClose, itemId }: ReportModalProps) => {
  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { authToken } = useAuth();
  const { toggleReport } = useItemsStore();

  const reportReasons = [
    "Prohibited item",
    "Counterfeit or replica",
    "Offensive content",
    "Misleading description",
    "Scam or fraud",
    "Inappropriate price",
    "Other",
  ];

  const handleSubmit = async () => {
    if (!selectedReason) {
      Alert.alert("Error", "Please select a reason for reporting");
      return;
    }
    setIsSubmitting(true);
    try {
      await toggleReport(itemId, authToken || "", selectedReason);
      setSelectedReason(null);
      onClose();
    } catch (error) {
      console.error("Error reporting item:", error);
      Alert.alert("Error", "Failed to report item. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Text style={styles.modalTitle}>Report Item</Text>
          <Text style={styles.modalSubtitle}>
            Select a reason for reporting:
          </Text>

          <ScrollView style={styles.reasonsContainer}>
            {reportReasons.map((reason) => (
              <TouchableOpacity
                key={reason}
                style={[
                  styles.reasonItem,
                  selectedReason === reason && styles.selectedReason,
                ]}
                onPress={() => setSelectedReason(reason)}
              >
                <Text style={styles.reasonText}>{reason}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onClose}
              disabled={isSubmitting}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              testID="submit-report-button"
              style={[
                styles.button,
                styles.submitButton,
                !selectedReason && styles.disabledButton,
              ]}
              onPress={handleSubmit}
              disabled={!selectedReason || isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator
                  testID="activity-indicator"
                  size="small"
                  color="white"
                />
              ) : (
                <Text style={styles.buttonText}>Submit</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default ReportModal;
const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalView: {
    width: "80%",
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
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
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  modalSubtitle: {
    fontSize: 14,
    marginBottom: 15,
    textAlign: "center",
  },
  reasonsContainer: {
    width: "100%",
    maxHeight: 250,
  },
  reasonItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    width: "100%",
  },
  selectedReason: {
    backgroundColor: "#e6f7ff",
  },
  reasonText: {
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: "row",
    marginTop: 20,
    width: "100%",
    justifyContent: "space-between",
  },
  button: {
    padding: 10,
    borderRadius: 5,
    width: "48%",
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#ddd",
  },
  submitButton: {
    backgroundColor: "#FF5252",
  },
  disabledButton: {
    backgroundColor: "#ffb8b8",
  },
  buttonText: {
    color: "white",
    fontWeight: "600",
  },
});
