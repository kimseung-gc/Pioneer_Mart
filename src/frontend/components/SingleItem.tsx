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
import React from "react";
import ReportModal from "./ReportModal";
import { MaterialIcons } from "@expo/vector-icons";
import { useLatestItem } from "@/hooks/useLatestItem";

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

  // find the latest version of this item in any screen
  const latestItem = useLatestItem(item.id, item);

  // check if the current user is the owner of this item
  const isOwner = currentItem.seller === userData?.id;

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
          // isOwner && styles.myItemContainer,
        ]}
      >
        <ReportModal
          isVisible={isReportModalVisible}
          onClose={() => setIsReportModalVisible(false)}
          itemId={currentItem.id}
        />
        <Image
          source={{ uri: currentItem.image }}
          style={[isOwner ? styles.myItemImage : styles.itemImage]}
        />
        {/* sold tag */}
        {currentItem.is_sold && (
          <View style={styles.soldTagContainer}>
            <Text style={styles.soldTagText}>Sold</Text>
          </View>
        )}
        <View style={styles.buttonsContainer}>
          {showFavoritesIcon &&
          !isOwner &&
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
        </View>
        {!isDetailsPage && (
          <View style={styles.infoRow}>
            <Text style={styles.price}>${currentItem.price}</Text>
            {currentItem.purchase_request_count !== undefined && (
              <Text style={styles.requestersCount}>
                ({currentItem.purchase_request_count}{" "}
                {currentItem.purchase_request_count === 1
                  ? "request"
                  : "requests"}
                )
              </Text>
            )}
          </View>
        )}
        {!isDetailsPage && (
          <Text style={styles.title}>{currentItem.title}</Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

export default React.memo(SingleItem);

const styles = StyleSheet.create({
  container: {
    width: (width - 10) / 2,
    marginHorizontal: 5,
    position: "relative",
  },
  itemImage: {
    width: "100%",
    height: 200,
    borderRadius: 15,
    marginTop: 10,
    marginBottom: 10,
  },
  myItemImage: {
    width: "100%",
    height: 200,
    borderRadius: 15,
    marginTop: 10,
    marginBottom: 10,
    borderColor: "#ffd700",
    borderWidth: 4,
    backgroundColor: "rgba(255, 215, 0, 0.05)",
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
    backgroundColor: "rgba(255, 255, 255, 0.6)",
    padding: 5,
    borderRadius: 30,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  price: {
    fontSize: 16,
    fontWeight: "bold",
    color: "black",
  },
  requestersCount: {
    fontSize: 12,
    color: "black",
  },
  title: {
    fontSize: 14,
    fontWeight: "600",
    color: "black",
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
  detailsContainer: {
    paddingHorizontal: 5,
    paddingBottom: 8,
  },
  ownerLabel: {
    fontSize: 12,
    fontWeight: "500",
    color: "#ffd700",
    marginTop: 2,
  },
});
