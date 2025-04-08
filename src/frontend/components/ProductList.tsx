import React from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { ItemType, ScreenId } from "@/types/types";
import SingleItem from "./SingleItem";
import { useRoute } from "@react-navigation/native";
import { useItemsStore } from "@/stores/useSearchStore";
import { useAuth } from "@/app/contexts/AuthContext";

type ProductListProps = {
  items: ItemType[] | null;
  isLoading?: boolean;
  source: ScreenId; //tracks which page is rendering this list for favorite icon purpose
};

const ProductList = ({
  items,
  isLoading = false,
  source,
}: ProductListProps) => {
  const route = useRoute();
  const { refreshItems, loadMoreItems, screens } = useItemsStore();
  const { authToken } = useAuth();

  const currentScreen = screens[source];
  const hasMore = currentScreen.hasMore;
  const isLoadingMore = currentScreen.isLoadingMore;

  // handles loading more items
  const handleLoadMore = () => {
    if (authToken && hasMore && !isLoadingMore) {
      loadMoreItems(source, authToken);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#4285F4" />
        <Text style={styles.loadingText}>Loading items...</Text>
      </View>
    );
  }

  if (items && items.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.noItemsText}>No items found in this category</Text>
      </View>
    );
  }

  const renderFooter = () => {
    if (!isLoadingMore) return null;
    return (
      <View style={styles.footerContainer}>
        <ActivityIndicator size="small" color="#4285F4" />
        <Text style={styles.loadingMoreText}>Loading more items...</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={items}
        renderItem={({ item }) => <SingleItem item={item} source={source} />}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        contentContainerStyle={styles.listContent}
        columnWrapperStyle={{ justifyContent: "space-between" }}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={() => {
              authToken && refreshItems(source, authToken);
            }}
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0}
        ListFooterComponent={renderFooter}
        ListHeaderComponent={() => (
          <View style={styles.titleContainer}>
            <Text style={styles.title}>
              {route.name === "index" ? "Latest" : "Your"}{" "}
              {route.name === "favorites" ? "Favorites" : "Items"}
            </Text>
            <View style={styles.myTimeTagContainer}>
              <View style={styles.myItemTag} />
              <Text>My Items</Text>
            </View>
          </View>
        )}
      />
    </View>
  );
};

export default ProductList;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 10,
  },
  titleContainer: {
    flexDirection: "row",
    // justifyContent: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 5,
    marginBottom: 10,
  },
  myTimeTagContainer: {
    position: "absolute",
    top: 3,
    right: 10,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
  },
  myItemTag: {
    width: 10,
    height: 10,
    backgroundColor: "#ffd700",
    borderRadius: 100 / 2,
    marginRight: 5, // Add spacing between the tag and text
  },
  listContent: {
    paddingBottom: 20,
    justifyContent: "space-between", // Helps distribute items evenly
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
  },
  footerContainer: {
    paddingVertical: 20,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
  },
  loadingMoreText: {
    marginLeft: 10,
    fontSize: 14,
    color: "#666",
  },
  noItemsText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
});
