import { router, Stack, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Image,
  Platform,
  FlatList,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import React from "react";
import { MaterialIcons } from "@expo/vector-icons";
import CameraModal from "@/components/CameraModal";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "@/app/contexts/AuthContext";
import { useItemsStore } from "@/stores/useSearchStore";
import Constants from "expo-constants";
import api from "@/types/api";
import { useTheme } from "@/app/contexts/ThemeContext";
import Toast from "react-native-toast-message";

// Import the needed text moderation function
const SE_API_USER = Constants?.expoConfig?.extra?.SE_API_USER;
const SE_SECRET_KEY = Constants?.expoConfig?.extra?.SE_SECRET_KEY;
const SE_WORKFLOW = Constants?.expoConfig?.extra?.SE_WORKFLOW;

const sightEngineTextModeration = async (text: string) => {
  const textFormData = new URLSearchParams();
  textFormData.append("text", text);
  textFormData.append("lang", "en");
  textFormData.append("api_user", SE_API_USER);
  textFormData.append("api_secret", SE_SECRET_KEY);
  textFormData.append("mode", "rules");
  textFormData.append("categories", "profanity,drug,extremism,violence");
  const response = await api.post(
    "https://api.sightengine.com/1.0/text/check.json",
    textFormData,
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );
  return response.data;
};

// Add the same image processing function from AddItemScreen
const getImageFileForFormData = async (
  uri: string,
  name: string,
  type: string
) => {
  if (Platform.OS === "web") {
    try {
      // Skip remote S3 images since they’re already hosted — no need to re-upload
      if (uri.includes("s3.amazonaws.com")) {
        console.warn("Skipping fetch for hosted image:", uri);
        return null;
      }

      const res = await fetch(uri, { mode: "cors", redirect: "follow" });
      const blob = await res.blob();
      return new File([blob], name, { type });
    } catch (error) {
      console.error("Failed to prepare image for form data:", error);
      throw error;
    }
  } else {
    return {
      uri: Platform.OS === "android" ? uri : uri.replace("file://", ""),
      name,
      type,
    } as unknown as Blob;
  }
};

const EditItem = () => {
  const { colors } = useTheme();
  const BASE_URL = Constants?.expoConfig?.extra?.apiUrl;
  const { item: itemString } = useLocalSearchParams();
  const originalItem = JSON.parse(itemString as string);
  const { authToken } = useAuth();

  const [title, setTitle] = useState(originalItem.title);
  const [description, setDescription] = useState(
    originalItem.description || ""
  );
  const [price, setPrice] = useState(originalItem.price.toString());
  const [selectedCategory, setSelectedCategory] = useState<string>(
    originalItem.category_name
  );
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const [images, setImages] = useState<string[]>([]);
  const [modifiedImages, setModifiedImages] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [loading, setLoading] = useState(false);
  const { categories } = useItemsStore();

  useEffect(() => {
    const imageArray = [];
    if (originalItem.image) {
      imageArray.push(originalItem.image);
    }
    // add additional images if they exist
    if (
      originalItem.additional_images &&
      Array.isArray(originalItem.additional_images)
    ) {
      const additionalUrls = originalItem.additional_images.map(
        (img: any) => img.image
      );
      imageArray.push(...additionalUrls);
    }
    setImages(imageArray);
  }, []);

  // Effect for handling dropdown open state
  useEffect(() => {
    if (dropdownOpen && scrollViewRef.current) {
      // Scroll to make the dropdown visible when it opens
      scrollViewRef.current.scrollTo({ y: 300, animated: true });
    }
  }, [dropdownOpen]);

  const pickImage = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.status !== "granted") {
      if (!permissionResult.canAskAgain) {
        window.alert(
          "Permission required\n\nYou've previously denied access to your photo library. Please enable it from your phone's settings to continue."
        );
      } else {
        window.alert(
          "Permission needed\n\nPlease allow access to your photo library"
        );
      }
      return;
    }
    // The thing for picking images, we can crop and stuff like that
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
      allowsMultipleSelection: true, //TODO: this only works on ios
    });
    if (!result.canceled && result.assets.length > 0) {
      const newImages = result.assets.map((asset) => asset.uri);
      setImages((prevImages) => [...prevImages, ...newImages]); //update image uris
      setModifiedImages(true);
    }
  };

  // Function to handle this image
  const handleCapturedImage = (imageUri: string) => {
    setImages((prevImages) => [...prevImages, imageUri]);
    setModifiedImages(true);
    setShowCamera(false);
  };

  const removeImage = (indexToRemove: number) => {
    setImages(images.filter((_, index) => index !== indexToRemove));
    setModifiedImages(true);
  };

  // Updated to match the AddItemScreen implementation
  const createFormData = async () => {
    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("price", price);

    // Find the matching category object and send its ID
    const selectedCategoryObj = categories.find(
      (cat) => cat.name === selectedCategory
    );
    formData.append(
      "category",
      selectedCategoryObj ? selectedCategoryObj.id.toString() : "7"
    ); // Default to "Other" (7) if not found

    // Only process images if they've been modified
    if (modifiedImages && images.length > 0) {
      // Primary image (first one)
      const primaryImage = images[0];
      const imageFileName = primaryImage.split("/").pop() || "image.jpg";
      const imageType = imageFileName.endsWith("png")
        ? "image/png"
        : "image/jpeg";

      // Process the image file using the same function from AddItemScreen
      const imageFile = await getImageFileForFormData(
        primaryImage,
        imageFileName,
        imageType
      );
      if (imageFile) {
        formData.append("image", imageFile);
      }
      // Additional images
      if (images.length > 1) {
        // Process each additional image
        for (let i = 1; i < images.length; i++) {
          const additionalImage = images[i];
          const additionalImageFileName =
            additionalImage.split("/").pop() || `image_${i}.jpg`;
          const additionalImageType = additionalImageFileName.endsWith("png")
            ? "image/png"
            : "image/jpeg";

          const additionalImageFile = await getImageFileForFormData(
            additionalImage,
            additionalImageFileName,
            additionalImageType
          );
          if (additionalImageFile) {
            formData.append("additional_images", additionalImageFile);
          }
        }
      }
    }

    return formData;
  };

  // Function to open camera
  const openCamera = () => {
    setShowCamera(true);
  };

  const handleCategorySelect = (name: string) => {
    setSelectedCategory(name);
    setDropdownOpen(false);
  };

  const handleSubmit = async () => {
    if (!title || !price || !selectedCategory) {
      window.alert("Validation Error\n\nPlease fill in all required fields.");
      return;
    }

    try {
      setLoading(true);

      // Text moderation (from AddItemScreen)
      const combinedText = `${title}\n${description}`;
      const textModerationResult = await sightEngineTextModeration(
        combinedText
      );

      if (textModerationResult.status === "failure") {
        console.error(
          "SightEngine text moderation error:",
          textModerationResult.error
        );
        window.alert("Error\n\nText validation failed. Please try again");
        setLoading(false);
        return;
      }

      // Check text moderation results
      if (
        (textModerationResult.profanity?.matches[0] &&
          textModerationResult.profanity.matches[0].intensity === "high") ||
        (textModerationResult.drug?.matches[0] &&
          textModerationResult.drug.matches[0].intensity === "high") ||
        (textModerationResult.extremism?.matches[0] &&
          textModerationResult.extremism.matches[0].intensity === "high") ||
        (textModerationResult.violence?.matches[0] &&
          textModerationResult.violence.matches[0].intensity === "high")
      ) {
        window.alert("NOT ALLOWED");
        setLoading(false);
        return;
      }

      // Image moderation - using the same approach as AddItemScreen
      if (modifiedImages) {
        for (const image of images) {
          if (image) {
            const imageFileName = image.split("/").pop() || "image.jpg";
            const imageType = imageFileName.endsWith("png")
              ? "image/png"
              : "image/jpeg";
            const imageFile = await getImageFileForFormData(
              image,
              imageFileName,
              imageType
            );

            if (!imageFile) {
              console.warn(
                "Skipping SightEngine check for existing image:",
                image
              );
              continue;
            }
            const sightEngineFormData = new FormData();
            sightEngineFormData.append("media", imageFile);
            sightEngineFormData.append("workflow", SE_WORKFLOW);
            sightEngineFormData.append("api_user", SE_API_USER);
            sightEngineFormData.append("api_secret", SE_SECRET_KEY);

            // Make API call to SightEngine
            const sightEngineResponse = await api.post(
              "https://api.sightengine.com/1.0/check-workflow.json",
              sightEngineFormData,
              {
                headers: {
                  "Content-Type": "multipart/form-data",
                },
              }
            );

            const output = sightEngineResponse.data;
            if (output.status === "failure") {
              console.error("SightEngine API error:", output.error);
              window.alert(
                "Error\n\nImage validation failed. Please try again."
              );
              setLoading(false);
              return;
            }

            // Check if image should be rejected
            if (output.summary && output.summary.action === "reject") {
              window.alert("NOT ALLOWED");
              setLoading(false);
              return;
            }
          }
        }
      }

      // Create form data using the updated approach
      const formData = await createFormData();
      const cleanToken = authToken?.trim();

      const config = {
        headers: {
          Authorization: `Bearer ${cleanToken}`,
          "Content-Type": "multipart/form-data",
          Accept: "application/json",
        },
      };

      const response = await api.put(
        `${BASE_URL}/api/items/${originalItem.id}/`,
        formData,
        config
      );
      console.log("hello");
      useItemsStore.getState().updateItem(response.data);

      if (Platform.OS === "web") {
        Toast.show({
          type: "success",
          text1: "Edited",
          text2: "Item edited successfully",
        });
        router.back();
      } else {
        window.alert("Success\n\nItem edited successfully");
        router.back();
      }
    } catch (error) {
      console.error("Error editing item:", error);
      window.alert("Error\n\nCould not edit item. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const renderCategoryDropdown = () => {
    if (dropdownOpen) {
      return (
        <TouchableWithoutFeedback onPress={() => setDropdownOpen(false)}>
          <View style={styles.dropdownOverlay}>
            <View style={styles.dropdownContainer}>
              <ScrollView nestedScrollEnabled={true}>
                {categories.map((category) => (
                  <TouchableOpacity
                    key={category.name}
                    style={[
                      styles.dropdownItem,
                      selectedCategory === category.name &&
                        styles.dropdownItemSelected,
                    ]}
                    onPress={() => handleCategorySelect(category.name)}
                  >
                    <Text
                      style={[
                        styles.dropdownItemText,
                        selectedCategory === category.name &&
                          styles.dropdownItemTextSelected,
                      ]}
                    >
                      {category.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </TouchableWithoutFeedback>
      );
    }
    return null;
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: "Edit Item",
          headerTitleAlign: "center",
          headerShown: true,
          headerBackTitle: "Back",
        }}
      />
      <SafeAreaView style={{ flex: 1 }} edges={["left", "right", "bottom"]}>
        <KeyboardAvoidingView
          style={[styles.container, { backgroundColor: colors.background }]}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <ScrollView
            ref={scrollViewRef}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            nestedScrollEnabled={true}
          >
            <View style={styles.formGroup}>
              <Text style={styles.label}>Name *</Text>
              <TextInput
                style={styles.input}
                value={title}
                onChangeText={setTitle}
                placeholder="Item name"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.input, styles.textarea]}
                value={description}
                onChangeText={setDescription}
                placeholder="Item Description"
                multiline
                numberOfLines={4}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Price *</Text>
              <TextInput
                style={styles.input}
                value={price}
                onChangeText={setPrice}
                placeholder="0.00"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Category</Text>
              <TouchableOpacity
                testID="category-selector"
                style={styles.dropdownTrigger}
                onPress={() => setDropdownOpen(!dropdownOpen)}
              >
                <Text style={styles.dropdownTriggerText}>
                  {selectedCategory
                    ? categories.find((cat) => cat.name === selectedCategory)
                        ?.name
                    : "Select a category"}
                </Text>
                <MaterialIcons
                  name={dropdownOpen ? "arrow-drop-up" : "arrow-drop-down"}
                  size={24}
                  color="#007BFF"
                />
              </TouchableOpacity>
            </View>

            <View
              style={[styles.formGroup, { marginTop: dropdownOpen ? 120 : 0 }]}
            >
              <Text style={styles.label}>
                Images * ({images.length} selected)
              </Text>
              {images.length > 0 ? (
                <View style={styles.imageGallery}>
                  <FlatList
                    data={images}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    keyExtractor={(_, index) => index.toString()}
                    renderItem={({ item, index }) => (
                      <View style={styles.imageContainer}>
                        <Image
                          source={{ uri: item }}
                          style={styles.thumbnailImage}
                        />
                        <TouchableOpacity
                          style={styles.removeIcon}
                          testID="remove-image-button"
                          onPress={() => removeImage(index)}
                        >
                          <MaterialIcons name="close" size={24} color="#fff" />
                        </TouchableOpacity>
                        {index === 0 && (
                          <View
                            style={[
                              styles.primaryBadge,
                              { backgroundColor: colors.accent },
                            ]}
                          >
                            <Text style={styles.primaryBadgeText}>Primary</Text>
                          </View>
                        )}
                      </View>
                    )}
                  />
                </View>
              ) : (
                <View style={styles.imagePicker}>
                  <Text style={styles.imagePickerText}>No Image Selected</Text>
                </View>
              )}
              <View style={styles.imageActions}>
                <TouchableOpacity
                  style={styles.imageButton}
                  onPress={pickImage}
                >
                  <MaterialIcons
                    name="photo-library"
                    size={24}
                    color={colors.accent}
                  />
                  <Text style={styles.imageButtonText}>Gallery</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.imageButton}
                  onPress={openCamera}
                >
                  <MaterialIcons
                    name="camera-alt"
                    size={24}
                    color={colors.accent}
                  />
                  <Text style={styles.imageButtonText}>Camera</Text>
                </TouchableOpacity>
              </View>
              <CameraModal
                visible={showCamera}
                onClose={() => setShowCamera(false)}
                onCapture={handleCapturedImage}
              />
            </View>

            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator testID="activity-indicator" color="#fff" />
              ) : (
                <Text style={styles.saveButtonText}>Save Item</Text>
              )}
            </TouchableOpacity>
          </ScrollView>
          {/* Render the dropdown outside the ScrollView */}
          {renderCategoryDropdown()}
        </KeyboardAvoidingView>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: "500",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#FFFFFF",
  },
  textarea: {
    height: 100,
    textAlignVertical: "top",
    backgroundColor: "#FFFFFF",
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
  },
  imageActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 10,
    marginTop: 10,
  },
  imageButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    backgroundColor: "#f9f9f9",
  },
  imageButtonText: {
    marginLeft: 8,
    fontWeight: "500",
  },
  imagePicker: {
    height: 200,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
    overflow: "hidden",
    position: "relative",
  },
  imageGallery: {
    height: 150,
    marginBottom: 10,
  },
  imageContainer: {
    width: 120,
    height: 120,
    margin: 5,
    borderRadius: 8,
    overflow: "hidden",
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  imagePickerText: {
    color: "#777",
  },
  saveButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#B45757",
    paddingVertical: 14,
    borderRadius: 30,
    marginTop: 30,
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFF9F0",
  },
  button: {
    backgroundColor: "#B45757",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    marginVertical: 20,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  dropdownStyle: {
    borderColor: "#ddd",
    borderRadius: 8,
    backgroundColor: "#fff",
  },
  dropdownContainerStyle: {
    borderColor: "#ddd",
    backgroundColor: "#fff",
  },
  dropdownItemStyle: {
    justifyContent: "flex-start",
  },
  dropdownTrigger: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    backgroundColor: "#fff",
  },
  dropdownTriggerText: {
    fontSize: 16,
    color: "#333",
  },
  dropdownOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  dropdownContainer: {
    width: "85%",
    height: "70%",
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 10,
    zIndex: 1001,
  },
  dropdownItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  dropdownItemText: {
    fontSize: 16,
    color: "#333",
  },
  dropdownItemSelected: {
    backgroundColor: "#f0f8ff",
  },
  dropdownItemTextSelected: {
    color: "#007BFF",
    fontWeight: "bold",
  },
  primaryBadge: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#B45757",
    padding: 4,
    alignItems: "center",
  },
  primaryBadgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  removeIcon: {
    position: "absolute",
    top: 8,
    right: 8,
    padding: 4,
    zIndex: 10,
  },
  thumbnailImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
});

export default EditItem;
