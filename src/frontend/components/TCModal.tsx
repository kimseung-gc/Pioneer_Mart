import React, { useState } from "react";
import {
  Alert,
  Modal,
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
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
  const [sections, setSections] = useState({
    eligibility: false,
    userContent: false,
    dataPrivacy: false,
    userResponsibility: false,
    liability: false,
  });

  const toggleSection = (section: string) => {
    setSections((prev) => ({
      ...prev,
      [section]: !prev[section as keyof typeof prev],
    }));
  };

  const handleClose = () => {
    if (!termsAccepted) {
      Alert.alert(
        "Terms & Conditions Required",
        "You must accept the terms and conditions to continue using the platform.",
        [{ text: "OK", style: "default" }]
      );
    } else {
      onClose();
    }
  };

  const SectionHeader = ({
    title,
    section,
  }: {
    title: string;
    section: keyof typeof sections;
  }) => (
    <TouchableOpacity
      testID={`section-${section}`}
      style={styles.sectionHeader}
      onPress={() => toggleSection(section)}
      activeOpacity={0.7}
    >
      <Text style={styles.sectionHeaderText}>{title}</Text>
      <Text style={styles.expandIcon}>{sections[section] ? "-" : "+"}</Text>
    </TouchableOpacity>
  );

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={handleClose}
      testID="tc-modal"
    >
      <SafeAreaView style={styles.centeredView}>
        <View style={styles.modalView}>
          <Text style={styles.modalTitle}>Terms & Conditions</Text>

          <ScrollView
            style={styles.termsScrollView}
            showsVerticalScrollIndicator={true}
          >
            <Text style={styles.introText}>
              By creating an account, you agree to the following terms and
              conditions.
            </Text>

            <SectionHeader
              title="1. Eligibility & Account"
              section="eligibility"
            />
            {sections.eligibility && (
              <View style={styles.sectionContent}>
                <Text style={styles.termsText}>
                  • You must be a current Grinnell student with a valid Grinnell
                  email address.{"\n"}• Creating multiple accounts is
                  prohibited.{"\n"}• You agree that your Grinnell email address
                  will be visible to other users on items you post.
                </Text>
              </View>
            )}

            <SectionHeader
              title="2. User Content & Moderation"
              section="userContent"
            />
            {sections.userContent && (
              <View style={styles.sectionContent}>
                <Text style={styles.termsText}>
                  • All content (images, descriptions, messages, chats) is
                  subject to moderation.{"\n"}• Prohibited content includes but
                  is not limited to:{"\n"}◦ Illegal items or services{"\n"}◦
                  Offensive, discriminatory, or hateful content{"\n"}◦ Content
                  that violates Grinnell College policies{"\n"}◦ Fraudulent
                  listings or misrepresentations{"\n"}• We reserve the right to
                  remove any content that violates these terms.{"\n"}• Repeated
                  violations may result in account suspension or termination.
                </Text>
              </View>
            )}

            <SectionHeader
              title="3. Data Privacy & Storage"
              section="dataPrivacy"
            />
            {sections.dataPrivacy && (
              <View style={styles.sectionContent}>
                <Text style={styles.termsText}>
                  • We collect and store:{"\n"}◦ Your Grinnell email address
                  {"\n"}◦ Chat messages between users{"\n"}◦ Purchase requests
                  {"\n"}◦ Reported items and associated information{"\n"}◦ Item
                  listings and associated content{"\n"}• Your email address will
                  be visible to other users on your listed items.{"\n"}• We do
                  not sell your personal information to third parties.{"\n"}• We
                  may use anonymized data for platform improvements.{"\n"}• You
                  may request deletion of your account data by contacting us
                  directly in the Contact Us page in Settings.
                </Text>
              </View>
            )}

            <SectionHeader
              title="4. User Responsibilities"
              section="userResponsibility"
            />
            {sections.userResponsibility && (
              <View style={styles.sectionContent}>
                <Text style={styles.termsText}>
                  • You are responsible for all activities that occur under your
                  account.{"\n"}• You must conduct transactions safely and in
                  person when possible.{"\n"}• You agree to use this service in
                  compliance with all applicable laws and regulations.{"\n"}•
                  You are responsible for the accuracy of your listings.{"\n"}•
                  You agree to report suspicious activity or policy violations.
                  {"\n"}• You will not use the platform to harass, scam, or harm
                  other users.
                </Text>
              </View>
            )}

            <SectionHeader
              title="5. Liability & Disclaimers"
              section="liability"
            />
            {sections.liability && (
              <View style={styles.sectionContent}>
                <Text style={styles.termsText}>
                  • We operate as a platform for connecting buyers and sellers
                  and do not handle any payments.{"\n"}• Users can only send
                  purchase requests through the platform.{"\n"}• We do not
                  accept any responsibility for scams, fraud, or disputes
                  between users.{"\n"}• We do not guarantee the quality, safety,
                  or legality of items listed.{"\n"}• We reserve the right to
                  modify these terms at any time with reasonable notice.{"\n"}•
                  We may suspend or terminate access to the service at our
                  discretion.{"\n"}• By using this platform, you agree to
                  release us from liability related to your use of the service.
                </Text>
              </View>
            )}

            <Text style={styles.updateNote}>Last updated: May 4, 2025</Text>
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
              testID="tc-accept-button"
            >
              <Text style={styles.buttonTextAccept}>Accept</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

export default TCModal;

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
  },
  modalView: {
    margin: 20,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 24,
    width: "90%",
    maxHeight: "85%",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.27,
    shadowRadius: 4.65,
    elevation: 6,
    borderColor: "#FFE0B2",
    borderWidth: 1,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
    color: "#B45757",
  },
  introText: {
    fontSize: 14,
    marginBottom: 16,
    lineHeight: 20,
    color: "#333333",
  },
  termsScrollView: {
    maxHeight: 400,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FFE0B2",
    padding: 12,
    marginVertical: 6,
    borderRadius: 6,
  },
  sectionHeaderText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#B45757",
    flex: 1,
  },
  expandIcon: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#B45757",
  },
  sectionContent: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#FFF9F0",
    borderRadius: 6,
    marginBottom: 10,
    borderColor: "#FFE0B2",
    borderWidth: 1,
  },
  termsText: {
    fontSize: 14,
    lineHeight: 20,
    color: "#333333",
  },
  updateNote: {
    fontSize: 12,
    color: "#777777",
    fontStyle: "italic",
    marginTop: 8,
    marginBottom: 8,
    textAlign: "center",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  button: {
    borderRadius: 8,
    padding: 12,
    elevation: 2,
    flex: 1,
    marginHorizontal: 6,
  },
  buttonAccept: {
    backgroundColor: "#B45757",
  },
  buttonDeny: {
    backgroundColor: "#f2f2f2",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  buttonTextAccept: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
    fontSize: 16,
  },
  buttonTextDeny: {
    color: "#777777",
    fontWeight: "600",
    textAlign: "center",
    fontSize: 16,
  },
});
