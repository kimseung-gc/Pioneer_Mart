import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Modal,
  FlatList,
} from "react-native";
import { CategoryType, ScreenId } from "@/types/types";
import { useItemsStore } from "@/stores/useSearchStore";
import { MaterialIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

/**
 * Props for the Categories component.
 */
type CategoriesProps = {
  /** Identifier for the screen using this component */
  screenId: ScreenId;
  /** List of available categories to display */
  categories: CategoryType[] | null;
};

/**
 * A horizontal scrollable list of category filters used in different screens (Home, Favorites, MyItems).
 * Users can select a category to filter the displayed items by category.
 *
 * @param screenId - Screen context in which this component is rendered
 * @param categories - List of available categories to choose from
 */
const Categories: React.FC<CategoriesProps> = ({
  screenId,
  categories,
}: CategoriesProps) => {
  const { screens, filterByCategory } = useItemsStore();
  const { selectedCategory } = screens[screenId];
  const [modalVisible, setModalVisible] = useState(false);

  const handleCategorySelect = (categoryId: string | null) => {
    const numCatId = categoryId === null ? null : Number(categoryId);
    filterByCategory(screenId, numCatId);
    setModalVisible(false);
  };
  console.log(categories?.length);
  return (
    <View style={styles.container}>
      <View style={styles.titleContainer}>
        <Text style={styles.title}>Categories</Text>
        {/* view all button below the categories */}
        <TouchableOpacity
          style={styles.viewAllButton}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.viewAllText}>View All</Text>
          <MaterialIcons
            name="keyboard-arrow-right"
            size={14}
            color="#4285F4"
          />
        </TouchableOpacity>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollViewContent}
      >
        {/* "All" category option — represented by `null` in selectedCategory */}
        <TouchableOpacity
          style={[
            styles.categoryItem,
            selectedCategory === null && styles.selectedCategory,
          ]}
          onPress={() => filterByCategory(screenId, null)}
        >
          <Text
            style={[
              styles.categoryText,
              selectedCategory === null && styles.selectedCategoryText,
            ]}
          >
            All
          </Text>
        </TouchableOpacity>

        {/* Render each category as a touchable button */}
        {categories &&
          categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryItem,
                selectedCategory === category.id && styles.selectedCategory,
              ]}
              onPress={() => filterByCategory(screenId, category.id)}
            >
              <Text
                style={[
                  styles.categoryText,
                  selectedCategory === category.id &&
                    styles.selectedCategoryText,
                ]}
              >
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
      </ScrollView>
      {/* modal for showing all categories */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>All Categories</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <MaterialIcons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={categories || []}
              keyExtractor={(item) => item.id.toString()}
              ListHeaderComponent={
                <TouchableOpacity
                  style={[
                    styles.modalCategoryItem,
                    selectedCategory === null && styles.modalSelectedCategory,
                  ]}
                  onPress={() => handleCategorySelect(null)}
                >
                  <Text
                    style={[
                      styles.modalCategoryText,
                      selectedCategory === null &&
                        styles.modalSelectedCategoryText,
                    ]}
                  >
                    All Items
                  </Text>
                  {selectedCategory === null && (
                    <MaterialIcons name="check" size={20} color="#4285F4" />
                  )}
                </TouchableOpacity>
              }
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.modalCategoryItem,
                    selectedCategory === item.id &&
                      styles.modalSelectedCategory,
                  ]}
                  onPress={() => handleCategorySelect(item.id.toString())}
                >
                  <Text
                    style={[
                      styles.modalCategoryText,
                      selectedCategory === item.id &&
                        styles.modalSelectedCategoryText,
                    ]}
                  >
                    {item.name}
                  </Text>
                  {selectedCategory === item.id && (
                    <MaterialIcons name="check" size={20} color="#4285F4" />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </SafeAreaView>
      </Modal>
    </View>
  );
};

export default Categories;

/**
 * Styles for the Categories component layout and buttons.
 */
const styles = StyleSheet.create({
  container: {
    paddingVertical: 15,
    // position: "relative",
  },
  titleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 15,
    marginBottom: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
  },
  viewAllButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  viewAllText: {
    color: "#4285F4",
    fontSize: 12,
    fontWeight: "500",
  },
  scrollViewContent: {
    paddingHorizontal: 10,
    paddingBottom: 5,
  },
  categoryItem: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginHorizontal: 5,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  selectedCategory: {
    backgroundColor: "#4285F4",
    borderColor: "#4285F4",
  },
  categoryText: {
    fontSize: 14,
    color: "#333",
  },
  selectedCategoryText: {
    color: "white",
    fontWeight: "600",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 30,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  modalCategoryItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  modalSelectedCategory: {
    backgroundColor: "#f7f9fe",
  },
  modalCategoryText: {
    fontSize: 16,
    color: "#333",
  },
  modalSelectedCategoryText: {
    color: "#4285F4",
    fontWeight: "500",
  },
});
