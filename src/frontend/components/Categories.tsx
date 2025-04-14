import React from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { CategoryType } from "@/types/types";
import { useItemsStore } from "@/stores/useSearchStore";

/**
 * Props for the Categories component.
 */
type CategoriesProps = {
  /** Identifier for the screen using this component */
  screenId: "home" | "favorites" | "myItems";

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

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Categories</Text>

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
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 15,
    marginBottom: 10,
  },
  scrollViewContent: {
    paddingHorizontal: 10,
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
});
