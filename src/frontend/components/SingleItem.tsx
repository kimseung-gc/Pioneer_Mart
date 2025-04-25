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
import { useState } from "react";

import { useUserStore } from "@/stores/userStore";
// import ZoomModal from "./ZoomModal";
import React from "react";
import ReportModal from "./ReportModal";
import { MaterialIcons } from "@expo/vector-icons";

type Props = {
  item: ItemType;
  source?: string;
};

const width = Dimensions.get("window").width - 40;

const SingleItem = ({ item, source }: Props) => {
  const route = useRoute();
  const { toggleFavorite, toggleReport } = useItemsStore();
  const { authToken } = useAuth();
  const { showFavoritesIcon, setShowFavoritesIcon } = useSingleItemStore();
  const { userData } = useUserStore();

  // Subscribe to the active screen and get updated items
  const activeScreen = useItemsStore((state) => state.activeScreen);
  const items = useItemsStore((state) => state.screens[activeScreen].items);

  // Get the latest version of this item from the store
  const currentItem = items.find((i) => i.id === item.id) || item;

  const [isReportModalVisible, setIsReportModalVisible] = useState(false);
  const handleItemPress = () => {
    if (source === "myItems") {
      setShowFavoritesIcon(false);
    } else {
      setShowFavoritesIcon(true);
    }
    router.push({
      pathname: `/item/[id]`,
      params: { id: item.id.toString(), source },
    });
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
  // Check if we're already on the item details page
  const isDetailsPage = route.name === "item/[id]";
  return (
    <TouchableOpacity onPress={handleItemPress}>
      <View
        style={[
          styles.container,
          route.name === "ItemDetails" && { width: width },
        ]}
      >
        <ReportModal
          isVisible={isReportModalVisible}
          onClose={() => setIsReportModalVisible(false)}
          itemId={currentItem.id}
        />
        <Image source={{ uri: currentItem.image }} style={styles.itemImage} />
        {currentItem.seller === userData?.id && (
          <View style={styles.myItemTag} />
        )}
        {/* sold tag */}
        {currentItem.is_sold && (
          <View style={styles.soldTagContainer}>
            <Text style={styles.soldTagText}>Sold</Text>
          </View>
        )}
        <View style={styles.buttonsContainer}>
          {showFavoritesIcon &&
          currentItem.seller !== userData?.id &&
          route.name !== "additionalinfo/MyItems" ? (
            <>
              <TouchableOpacity
                style={styles.iconBtn}
                onPress={async (e) => {
                  e.stopPropagation();
                  if (latestItem.is_reported) {
                    await toggleReport(latestItem.id, authToken || "", "");
                  } else {
                    setIsReportModalVisible(true);
                  }
                }}
              >
                <MaterialIcons
                  testID={
                    latestItem.is_reported ? "flag-icon" : "outlined-flag-icon"
                  }
                  name={latestItem.is_reported ? "flag" : "outlined-flag"}
                  size={24}
                  color="black"
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.favBtn}
                onPress={handleFavoriteToggle}
              >
                <AntDesign
                  testID={
                    latestItem.is_favorited ? "heart-icon" : "hearto-icon"
                  }
                  name={latestItem.is_favorited ? "heart" : "hearto"}
                  size={22}
                  color="black"
                />
              </TouchableOpacity>
            </>
          ) : null}

          {/* Show the report button if user is not the owner
          {!isOwner && (
            <TouchableOpacity
              style={styles.iconBtn}
              onPress={(e) => {
                e.stopPropagation();
                setIsReportModalVisible(true);
              }}
            >
              <Entypo name="flag" size={20} color="black" />
            </TouchableOpacity>
          )} */}
        </View>
        {!isDetailsPage && (
          <>
            <Text style={styles.title}>${currentItem.price}</Text>
            <Text style={styles.title}>{currentItem.title}</Text>
          </>
        )}
      </View>
    </TouchableOpacity>
  );
};

export default SingleItem;

const styles = StyleSheet.create({
  container: {
    width: (width - 10) / 2,
    marginHorizontal: 5,
  },
  itemImage: {
    width: "100%",
    height: 200,
    borderRadius: 15,
    marginTop: 10,
    marginBottom: 10,
  },
  buttonsContainer: {
    position: "absolute",
    right: 10,
    top: 20,
    flexDirection: "row",
    gap: 10,
  },
  iconBtn: {
    backgroundColor: "rgba(255, 255, 255, 0.6)",
    padding: 5,
    borderRadius: 30,
  },
  favBtn: {
    // position: "absolute",
    // right: 20,
    // top: 20,
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
  soldTagContainer: {
    position: "absolute",
    right: 10,
    top: "10%",
    paddingVertical: 8,
    transform: [{ translateY: -15 }],
  },
  soldTagText: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
    fontSize: 16,
  },
});
