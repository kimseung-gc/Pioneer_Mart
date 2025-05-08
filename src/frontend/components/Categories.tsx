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
import { useTheme } from "@/app/contexts/ThemeContext";

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
  sortByDatePosted: "recent" | "older" | null;
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
  const { colors } = useTheme();
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
  const [error, setError] = useState(null);

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
      sortByDatePosted: null,
    };
    setLocalFilterOptions(defaultFilters);
    setSliderValues([0, 1000]);
    useItemsStore.getState().resetFilters(screenId);
  };

  const handlePriceRangeChange = (values: number[]) => {
    setSliderValues([values[0], values[1]]);
  };

  /**
   * Styles for the Categories component layout and buttons.
   */
  const styles = StyleSheet.create({
    container: {
      paddingVertical: 15,
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
      color: colors.textPrimary,
    },
    filterButton: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.accentSecondary + "22",
      paddingVertical: 6,
      paddingHorizontal: 12,
      borderRadius: 16,
    },
    filterText: {
      color: colors.accent,
      fontSize: 12,
      fontWeight: "500",
      marginLeft: 4,
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
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
    },
    selectedCategory: {
      backgroundColor: colors.accent,
      borderColor: colors.accent,
    },
    categoryText: {
      fontSize: 14,
      color: colors.textPrimary,
    },
    selectedCategoryText: {
      color: "#fff",
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
      color: colors.textSecondary,
    },
    modalContainer: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.5)",
      justifyContent: "flex-end",
    },
    modalContent: {
      backgroundColor: colors.background,
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
      borderBottomColor: colors.border,
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: "bold",
      color: colors.textPrimary,
    },
    modalCategoryItem: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      padding: 15,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    modalSelectedCategory: {
      backgroundColor: colors.accentSecondary + "11",
    },
    modalCategoryText: {
      fontSize: 16,
      color: colors.textPrimary,
    },
    modalSelectedCategoryText: {
      color: colors.accent,
      fontWeight: "500",
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.titleContainer}>
        <Text style={styles.title}>Categories</Text>
        {/* filter button */}
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setFilterModalVisible(true)}
        >
          <MaterialIcons name="filter-list" size={16} color={colors.accent} />
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
          <MaterialIcons name="keyboard-arrow-right" size={14} color={colors.textSecondary} />
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
                <MaterialIcons name="close" size={24} color={colors.textPrimary} />
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
                    <MaterialIcons name="check" size={20} color={colors.accent} />
                  )}
                </TouchableOpacity>
              }
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.modalCategoryItem,
                    selectedCategory === item.id && styles.modalSelectedCategory,
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
                    <MaterialIcons name="check" size={20} color={colors.accent} />
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
                <MaterialIcons name="close" size={24} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ paddingHorizontal: 16 }}>
              {/* price range section */}
              <View style={{ marginVertical: 16 }}>
                <Text style={[styles.modalTitle, { marginBottom: 12 }]}>
                  Price Range
                </Text>
                <Text
                  style={{
                    color: colors.textPrimary,
                    textAlign: "center",
                    marginBottom: 8,
                  }}
                >
                  ${sliderValues[0]} - ${sliderValues[1]}
                </Text>
                <MultiSlider
                  values={sliderValues}
                  min={0}
                  max={1000}
                  step={10}
                  sliderLength={280}
                  onValuesChange={handlePriceRangeChange}
                  allowOverlap={false}
                  minMarkerOverlapDistance={10}
                  snapped
                  selectedStyle={{
                    backgroundColor: colors.accent,
                  }}
                  unselectedStyle={{
                    backgroundColor: colors.border,
                  }}
                  containerStyle={{
                    height: 40,
                    alignSelf: "center",
                  }}
                  markerStyle={{
                    backgroundColor: colors.accent,
                    height: 24,
                    width: 24,
                    borderRadius: 12,
                    borderWidth: 2,
                    borderColor: colors.card,
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.2,
                    shadowRadius: 1,
                    elevation: 2,
                  }}
                  pressedMarkerStyle={{
                    backgroundColor: colors.accentSecondary,
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

               {/* sort by price section */}
              <View style={{ marginBottom: 20 }}>
                <Text style={[styles.modalTitle, { marginBottom: 12 }]}>
                  Sort by Price
                </Text>
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                  {[
                    { label: "None", value: null },
                    { label: "Low to High", value: "asc" },
                    { label: "High to Low", value: "desc" },
                  ].map(({ label, value }) => {
                    const isSelected = localFilterOptions.sortByPrice === value;
                    return (
                      <TouchableOpacity
                        key={label}
                        onPress={() =>
                          setLocalFilterOptions({
                            ...localFilterOptions,
                            sortByPrice: "asc",
                          })
                        }
                        style={{
                          paddingVertical: 8,
                          paddingHorizontal: 14,
                          borderRadius: 20,
                          backgroundColor: isSelected ? colors.accent : colors.card,
                          borderWidth: 1,
                          borderColor: isSelected ? colors.accent : colors.border,
                        }}
                      >
                        <Text
                          style={{
                            color: isSelected ? "#fff" : colors.textPrimary,
                            fontWeight: isSelected ? "600" : "400",
                          }}
                        >
                          {label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
              {/* sort by date section */}
              <View style={{ marginBottom: 20 }}>
              <Text style={[styles.modalTitle, { marginBottom: 12 }]}>
                Sort by Date Posted
              </Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                {([
                  { label: "None", value: null },
                  { label: "Most Recent", value: "recent" },
                  { label: "Oldest First", value: "older" },
                ] as { label: string; value: "recent" | "older" | null }[]).map(({ label, value }) => {
                  const isSelected = localFilterOptions.sortByDatePosted === value;
                  return (
                    <TouchableOpacity
                      key={label}
                      onPress={() =>
                        setLocalFilterOptions({
                          ...localFilterOptions,
                          sortByDatePosted: value,
                        })
                      }
                      style={{
                        paddingVertical: 8,
                        paddingHorizontal: 14,
                        borderRadius: 20,
                        backgroundColor: isSelected ? colors.accent : colors.card,
                        borderWidth: 1,
                        borderColor: isSelected ? colors.accent : colors.border,
                      }}
                    >
                      <Text
                        style={{
                          color: isSelected ? "#fff" : colors.textPrimary,
                          fontWeight: isSelected ? "600" : "400",
                        }}
                      >
                        {label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
                </View>
              </View>



              {/* status filters */}
              <View style={{ marginBottom: 20 }}>
                <Text style={[styles.modalTitle, { marginBottom: 12 }]}>
                  Item Status
                </Text>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Text style={{ color: colors.textPrimary }}>
                    Has Active Purchase Request
                  </Text>
                  <Switch
                    trackColor={{ false: "#ECECEC", true: colors.accentSecondary }}
                    thumbColor="#fff"
                    ios_backgroundColor="#ECECEC"
                    value={localFilterOptions.hasActivePurchaseRequest}
                    onValueChange={(value) =>
                      setLocalFilterOptions({
                        ...localFilterOptions,
                        hasActivePurchaseRequest: value,
                      })
                    }
                  />
                </View>
              </View>
            </ScrollView>

            {/* action buttons */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                paddingHorizontal: 16,
                paddingVertical: 16,
                borderTopWidth: 1,
                borderColor: colors.border,
              }}
            >
              <TouchableOpacity
                style={{
                  paddingVertical: 12,
                  paddingHorizontal: 20,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: colors.border,
                }}
                onPress={resetFilters}
              >
                <Text style={{ color: colors.textPrimary, fontWeight: "500" }}>
                  Reset
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  paddingVertical: 12,
                  paddingHorizontal: 30,
                  borderRadius: 8,
                  backgroundColor: colors.accent,
                }}
                onPress={handleFilterApply}
              >
                <Text
                  style={{
                    color: "white",
                    fontWeight: "600",
                    textShadowColor: "rgba(0, 0, 0, 0.2)",
                    textShadowOffset: { width: 0, height: 1 },
                    textShadowRadius: 2,
                  }}
                >
                  Apply
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </Modal>
    </View>
  );
};

export default Categories;
