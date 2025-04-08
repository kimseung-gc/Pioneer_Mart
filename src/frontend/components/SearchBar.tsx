import React, { useEffect, useState } from "react";
import { TextInput, View, StyleSheet, TouchableOpacity } from "react-native";
import EvilIcons from "@expo/vector-icons/EvilIcons";
import { useAuth } from "@/app/contexts/AuthContext";
import { useItemsStore } from "@/stores/useSearchStore";

type SearchBarProps = {
  screenId: "home" | "favorites" | "myItems";
};

const SearchBar: React.FC<SearchBarProps> = ({ screenId }) => {
  const [localQuery, setLocalQuery] = useState("");
  const authToken = useAuth();
  const { screens, performSearch, clearSearch } = useItemsStore();

  const { searchQuery } = screens[screenId]; //get the current screen's search query

  const handleSearch = () => {
    performSearch(screenId, localQuery, authToken || null);
  };

  // TODO: add icon to search bar to clear...check on claude
  const handleClear = () => {
    setLocalQuery("");
    clearSearch(screenId);
  };

  //keep local state in sync with global state
  useEffect(() => {
    setLocalQuery(searchQuery);
  }, [searchQuery]);

  return (
    <View>
      <TouchableOpacity style={styles.searchBarContainer}>
        <TextInput
          style={styles.searchTxt}
          placeholder="Search items..."
          value={localQuery}
          onChangeText={setLocalQuery}
          onSubmitEditing={handleSearch}
        />
        <TouchableOpacity style={styles.searchIcon}>
          <EvilIcons
            name="search"
            size={24}
            onPress={handleSearch}
            color="black"
          />
        </TouchableOpacity>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  searchBarContainer: {
    width: "90%",
    alignSelf: "center",
    backgroundColor: "#D3D3D3",
    paddingHorizontal: 10,
    flexDirection: "row",
    justifyContent: "center",
    borderRadius: 15,
    alignItems: "center",
    marginTop: 20,
  },
  searchTxt: {
    flex: 1,
    paddingVertical: 8,
    color: "black",
  },
  searchIcon: {
    padding: 5,
  },
});

export default SearchBar;
