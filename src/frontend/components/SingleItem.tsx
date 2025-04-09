import { ItemType } from "@/types/types";
import {
  Dimensions,
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import AntDesign from "@expo/vector-icons/AntDesign";
import { router } from "expo-router";
import { useRoute } from "@react-navigation/native";
import { useItemsStore } from "@/stores/useSearchStore";
import { useAuth } from "@/app/contexts/AuthContext";
import useSingleItemStore from "@/stores/singleItemStore";
import { useEffect, useState } from "react";

import { useUserStore } from "@/stores/userStore";
import ZoomModal from "./ZoomModal";
import React from "react";

type Props = {
  item: ItemType;
  source?: string;
};

const width = Dimensions.get("window").width - 40;

const SingleItem = ({ item, source }: Props) => {
  const route = useRoute();
  const { toggleFavorite } = useItemsStore();
  const { authToken } = useAuth();
  const { showFavoritesIcon, setShowFavoritesIcon } = useSingleItemStore();
  const { userData } = useUserStore();

  // Subscribe to the active screen and get updated items
  const activeScreen = useItemsStore((state) => state.activeScreen);
  const items = useItemsStore((state) => state.screens[activeScreen].items);

  // Get the latest version of this item from the store
  const currentItem = items.find((i) => i.id === item.id) || item;

  const [isZoomVisible, setIsZoomVisible] = useState(false);

  const handleItemPress = () => {
    if (source === "myItems") {
      setShowFavoritesIcon(false);
      router.push({
        pathname: "/ItemDetails",
        params: { item: JSON.stringify(item), source: source },
      });
    } else {
      setShowFavoritesIcon(true);
      router.push({
        pathname: "/ItemDetails",
        params: { item: JSON.stringify(item) },
      });
    }
  };

  // Get all items from all screens to find the most up-to-date version
  const homeItems = useItemsStore((state) => state.screens.home.items);
  const favoritesItems = useItemsStore(
    (state) => state.screens.favorites.items
  );
  const myItemsItems = useItemsStore((state) => state.screens.myItems.items);

  // Find the latest version of this item in any screen
  const latestItem =
    homeItems.find((i) => i.id === item.id) ||
    favoritesItems.find((i) => i.id === item.id) ||
    myItemsItems.find((i) => i.id === item.id) ||
    item;

  const handleFavoriteToggle = async () => {
    await toggleFavorite(item.id, authToken || "");
  };

  return (
    <TouchableOpacity
      onPress={
        route.name === "ItemDetails"
          ? () => setIsZoomVisible(true)
          : handleItemPress
      }
    >
      <View
        style={[
          styles.container,
          route.name === "ItemDetails" && { width: width },
        ]}
      >
        {isZoomVisible && (
          <ZoomModal
            isVisible={isZoomVisible}
            onClose={() => setIsZoomVisible(false)}
            item={currentItem} // Use the updated item
          />
        )}
        <Image source={{ uri: currentItem.image }} style={styles.itemImage} />
        {currentItem.seller === userData?.id && (
          <View style={styles.myItemTag} />
        )}
        {showFavoritesIcon &&
        currentItem.seller !== userData?.id &&
        route.name !== "additionalinfo/MyItems" ? (
          <TouchableOpacity
            style={styles.favBtn}
            onPress={handleFavoriteToggle}
          >
            <AntDesign
              name={latestItem.is_favorited ? "heart" : "hearto"} // Use currentItem from store
              size={22}
              color="black"
            />
          </TouchableOpacity>
        ) : null}
        {route.name === "ItemDetails" ? null : (
          <Text style={styles.title}>${currentItem.price}</Text>
        )}
        {route.name === "ItemDetails" ? null : (
          <Text style={styles.title}>{currentItem.title}</Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

export default SingleItem;

// Styles remain unchanged

const styles = StyleSheet.create({
  container: {
    width: (width - 10) / 2, // Ensure spacing works correctly
    marginHorizontal: 5, // Add margin for spacing
  },
  itemImage: {
    width: "100%",
    height: 200,
    borderRadius: 15,
    marginTop: 10,
    marginBottom: 10,
  },
  favBtn: {
    position: "absolute",
    right: 20,
    top: 20,
    backgroundColor: "rgba(255, 255, 255, 0.6)",
    padding: 5,
    borderRadius: 30,
  },
  title: {
    fontSize: 14,
    fontWeight: "600",
    color: "black",
  },
  myItemTag: {
    width: 10,
    height: 10,
    backgroundColor: "#ffd700",
    position: "absolute",
    borderRadius: 100 / 2,
    top: 20,
    left: 10,
  },
});
