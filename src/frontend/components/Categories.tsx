import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Modal,
  FlatList,
  Switch,
} from "react-native";
import MultiSlider from "@ptomasroos/react-native-multi-slider";
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
 * Filter options for the items
 */
type FilterOptions = {
  priceRange: [number, number];
  hasActivePurchaseRequest: boolean;
  isSold: boolean;
  sortByPrice: "asc" | "desc" | null;
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
  // const { selectedCategory } = screens[screenId];
  const screenState = screens[screenId];
  const selectedCategory = screenState.selectedCategory;
  const filterOptions = screenState.filterOptions;
  const [categoriesModalVisible, setCategoriesModalVisible] = useState(false);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [localFilterOptions, setLocalFilterOptions] =
    useState<FilterOptions>(filterOptions);
  // memoisze price values to prevent excessive re-renders
  const [sliderValues, setSliderValues] = useState<[number, number]>(
    filterOptions.priceRange
  );

  useEffect(() => {
    setLocalFilterOptions(filterOptions);
    setSliderValues(filterOptions.priceRange);
  }, [filterOptions]);

  const handleCategorySelect = (categoryId: string | null) => {
    const numCatId = categoryId === null ? null : Number(categoryId);
    filterByCategory(screenId, numCatId);
    setCategoriesModalVisible(false);
  };

  const handleFilterApply = () => {
    // console.log("Applying filters:", filterOptions);
    const updatedFilterOptions = {
      ...localFilterOptions,
      priceRange: sliderValues,
    };
    useItemsStore.getState().applyFilters(screenId, updatedFilterOptions);
    setFilterModalVisible(false);
  };

  const resetFilters = () => {
    const defaultFilters = {
      priceRange: [0, 1000] as [number, number],
      hasActivePurchaseRequest: false,
      isSold: false,
      sortByPrice: null,
    };
    setLocalFilterOptions(defaultFilters);
    setSliderValues([0, 1000]);
    useItemsStore.getState().resetFilters(screenId);
  };

  const handlePriceRangeChange = (values: number[]) => {
    setSliderValues([values[0], values[1]]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.titleContainer}>
        <Text style={styles.title}>Categories</Text>
        {/* filter button */}
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setFilterModalVisible(true)}
        >
          <MaterialIcons name="filter-list" size={16} color="#4285F4" />
          <Text style={styles.filterText}>Filter & Sort</Text>
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

        {/* view all categories button */}
        <TouchableOpacity
          style={styles.viewAllCategoriesButton}
          onPress={() => setCategoriesModalVisible(true)}
        >
          <Text style={styles.viewAllCategoriesText}>View All</Text>
          <MaterialIcons name="keyboard-arrow-right" size={14} color="#555" />
        </TouchableOpacity>
      </ScrollView>

      {/* modal for showing all categories */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={categoriesModalVisible}
        onRequestClose={() => setCategoriesModalVisible(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>All Categories</Text>
              <TouchableOpacity
                onPress={() => setCategoriesModalVisible(false)}
              >
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

      {/* filter and sort by other stuff modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={filterModalVisible}
        onRequestClose={() => setFilterModalVisible(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filter & Sort</Text>
              <TouchableOpacity onPress={() => setFilterModalVisible(false)}>
                <MaterialIcons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.filterScrollView}>
              {/* price range section */}
              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>Price Range</Text>
                <View style={styles.priceRangeContainer}>
                  <Text style={styles.priceLabel}>
                    ${sliderValues[0]} - ${sliderValues[1]}
                  </Text>
                  <View style={styles.sliderContainer}>
                    <MultiSlider
                      values={[sliderValues[0], sliderValues[1]]}
                      min={0}
                      max={1000}
                      step={10}
                      sliderLength={280}
                      onValuesChange={handlePriceRangeChange}
                      allowOverlap={false}
                      minMarkerOverlapDistance={10}
                      snapped
                      selectedStyle={{
                        backgroundColor: "#4285F4",
                      }}
                      unselectedStyle={{
                        backgroundColor: "#ECECEC",
                      }}
                      containerStyle={{
                        height: 40,
                      }}
                      markerStyle={{
                        backgroundColor: "#4285F4",
                        height: 24,
                        width: 24,
                        borderRadius: 12,
                        borderWidth: 2,
                        borderColor: "#FFFFFF",
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: 1 },
                        shadowOpacity: 0.2,
                        shadowRadius: 1,
                        elevation: 2,
                      }}
                      pressedMarkerStyle={{
                        backgroundColor: "#2A73E8",
                        height: 30,
                        width: 30,
                        borderRadius: 15,
                      }}
                      trackStyle={{
                        height: 6,
                        borderRadius: 3,
                      }}
                    />
                  </View>
                  <View style={styles.priceRangeLabels}>
                    <Text style={styles.priceRangeLabel}>$0</Text>
                    <Text style={styles.priceRangeLabel}>$1000</Text>
                  </View>
                </View>
              </View>
              {/* sort by price section */}
              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>Sort By Price</Text>
                <View style={styles.sortOptionsContainer}>
                  <TouchableOpacity
                    style={[
                      styles.sortOption,
                      localFilterOptions.sortByPrice === null &&
                        styles.selectedSortOption,
                    ]}
                    onPress={() =>
                      setLocalFilterOptions({
                        ...localFilterOptions,
                        sortByPrice: null,
                      })
                    }
                  >
                    <Text
                      style={[
                        styles.sortOptionText,
                        localFilterOptions.sortByPrice === null &&
                          styles.selectedSortOptionText,
                      ]}
                    >
                      None
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.sortOption,
                      localFilterOptions.sortByPrice === "asc" &&
                        styles.selectedSortOption,
                    ]}
                    onPress={() =>
                      setLocalFilterOptions({
                        ...localFilterOptions,
                        sortByPrice: "asc",
                      })
                    }
                  >
                    <Text
                      style={[
                        styles.sortOptionText,
                        localFilterOptions.sortByPrice === "asc" &&
                          styles.selectedSortOptionText,
                      ]}
                    >
                      Low to High
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.sortOption,
                      localFilterOptions.sortByPrice === "desc" &&
                        styles.selectedSortOption,
                    ]}
                    onPress={() =>
                      setLocalFilterOptions({
                        ...localFilterOptions,
                        sortByPrice: "desc",
                      })
                    }
                  >
                    <Text
                      style={[
                        styles.sortOptionText,
                        localFilterOptions.sortByPrice === "desc" &&
                          styles.selectedSortOptionText,
                      ]}
                    >
                      High to Low
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* status filters */}
              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>Item Status</Text>
                <View style={styles.switchContainer}>
                  <Text style={styles.switchLabel}>
                    Has Active Purchase Requests
                  </Text>
                  <Switch
                    trackColor={{ false: "#ECECEC", true: "#4285F4" }}
                    thumbColor="#FFFFFF"
                    ios_backgroundColor="#ECECEC"
                    onValueChange={(value) =>
                      setLocalFilterOptions({
                        ...localFilterOptions,
                        hasActivePurchaseRequest: value,
                      })
                    }
                    value={localFilterOptions.hasActivePurchaseRequest}
                  />
                </View>
              </View>
            </ScrollView>

            {/* action buttons */}
            <View style={styles.filterActions}>
              <TouchableOpacity
                style={styles.resetButton}
                onPress={resetFilters}
              >
                <Text style={styles.resetButtonText}>Reset</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.applyButton}
                onPress={handleFilterApply}
              >
                <Text style={styles.applyButtonText}>Apply</Text>
              </TouchableOpacity>
            </View>
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
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EFF4FE",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  filterText: {
    color: "#4285F4",
    fontSize: 12,
    fontWeight: "500",
    marginLeft: 4,
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
  viewAllCategoriesButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginHorizontal: 5,
  },
  viewAllCategoriesText: {
    fontSize: 14,
    color: "#555",
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
  filterScrollView: {
    maxHeight: "60%",
  },
  filterSection: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  priceRangeContainer: {
    marginBottom: 10,
  },
  priceLabel: {
    fontSize: 14,
    color: "#333",
    marginBottom: 8,
    textAlign: "center",
  },
  sliderContainer: {
    alignItems: "center",
    marginVertical: 10,
  },
  priceRangeLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 10,
    marginTop: 5,
  },
  priceRangeLabel: {
    fontSize: 12,
    color: "#888",
  },
  sortOptionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 8,
  },
  sortOption: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: 8,
    marginBottom: 8,
    borderRadius: 16,
    backgroundColor: "#f0f0f0",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  selectedSortOption: {
    backgroundColor: "#4285F4",
    borderColor: "#4285F4",
  },
  sortOptionText: {
    fontSize: 14,
    color: "#333",
  },
  selectedSortOptionText: {
    color: "white",
  },
  switchContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  switchLabel: {
    fontSize: 14,
    color: "#333",
  },
  filterActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  resetButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  resetButtonText: {
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
  },
  applyButton: {
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    backgroundColor: "#4285F4",
  },
  applyButtonText: {
    fontSize: 14,
    color: "white",
    fontWeight: "500",
  },
});
