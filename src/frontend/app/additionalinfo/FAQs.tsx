import { Entypo } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useState } from "react";
import { faqItem } from "@/types/types";
import React from "react";
import { useTheme } from "../contexts/ThemeContext";

const { colors } = useTheme();

const FAQs = () => {
  const router = useRouter();

  // FAQ data with questions and answers
  const faqData: faqItem[] = [
    {
      id: 1,
      question: "How do I edit my account?",
      answer:
        "The only part of your account that you can edit is your preferred payment method, pronouns, and preferred name.",
    },
    {
      id: 2,
      question: "Do I need to have a username or password to access the app?",
      answer:
        "No, you only enter your Grinnell email which we verify on our end. We didn't want users to have to constantly enter their email and password because it's really frustrating",
    },
    {
      id: 3,
      question: "How do I contact customer support?",
      answer:
        "You can contact our customer support team by going to the Contact Us page or by sending an email to support@pioneermart.com.",
    },
    {
      id: 4,
      question: "What payment methods do you accept?",
      answer:
        "We don't support payments currently though we might introduce the feature in the future. For now, you can go ahead and click 'Purchase Request' to notify the seller that you're interested in their item and they will reach out to you.",
    },
    {
      id: 5,
      question: "Once I send a Purchase Request, how do I get the item?",
      answer:
        "When you click the 'Purchase Request' button, the seller is immediately notified. The seller will then contact you to finalize the price and meeting location.",
    },
    {
      id: 6,
      question: "What happens if the seller doesn't contact me or forgets?",
      answer:
        "If the seller doesn't reach out to you within 48 hours, you can contact them through their Grinnell email.",
    },
  ];

  type ExpandedItemsState = {
    [key: number]: boolean;
  };
  // State to track which FAQs are expanded
  const [expandedItems, setExpandedItems] = useState<ExpandedItemsState>({});

  // Toggle expanded state for a specific FAQ
  const toggleExpand = (id: number) => {
    setExpandedItems((prevState) => ({
      ...prevState,
      [id]: !prevState[id],
    }));
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerTitle: "Frequently Asked Questions",
          headerTitleAlign: "center",
          headerShown: true,
          headerBackTitle: "Back",
          headerTintColor: colors.accent
        }}
      />

      <ScrollView style={styles.contentContainer}>
        {faqData.map((faq) => (
          <View key={faq.id} style={styles.faqItem}>
            <TouchableOpacity
              style={styles.questionContainer}
              onPress={() => toggleExpand(faq.id)}
              activeOpacity={0.8}
            >
              <Text style={styles.questionText}>{faq.question}</Text>
              <Entypo
                name={expandedItems[faq.id] ? "chevron-up" : "chevron-down"}
                size={20}
                color={colors.textPrimary}
              />
            </TouchableOpacity>

            {expandedItems[faq.id] && (
              <View style={styles.answerContainer}>
                <View style={styles.divider} />
                <Text style={styles.answerText}>{faq.answer}</Text>
              </View>
            )}
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

export default FAQs;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginHorizontal: 20,
    marginVertical: 12,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 30,
    marginBottom: 20,
  },
  backBtn: {
    padding: 10,
    zIndex: 1,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "600",
    position: "absolute",
    left: 0,
    right: 0,
    textAlign: "center",
  },
  contentContainer: {
    flex: 1,
    marginTop: 20,
  },
  faqItem: {
    backgroundColor: colors.card,
    borderRadius: 10,
    marginBottom: 15,
    overflow: "hidden",
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
  },
  questionContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  questionText: {
    fontSize: 16,
    fontWeight: "500",
    flex: 1,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginHorizontal: 16,
  },
  answerContainer: {
    paddingBottom: 16,
  },
  answerText: {
    fontSize: 15,
    color: colors.textSecondary,
    padding: 16,
    paddingTop: 12,
  },
});
