import { router, Stack, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { BASE_URL } from "@/config";
// import { BASE_URL, SE_API_USER, SE_SECRET_KEY, SE_WORKFLOW } from "@/config";
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
import { Entypo, MaterialIcons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import CameraModal from "@/components/CameraModal";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { useAuth } from "@/app/contexts/AuthContext";
import { useItemsStore } from "@/stores/useSearchStore";

const CATEGORIES = [
  { label: "Electronics", value: "electronics", id: 2 },
  { label: "Clothing", value: "clothing", id: 6 },
  { label: "Books", value: "books", id: 3 },
  { label: "Furniture", value: "furniture", id: 1 },
  { label: "Fitness", value: "fitness", id: 4 },
  { label: "Health", value: "health", id: 5 },
  { label: "Other", value: "other", id: 7 },
];

const EditItem = () => {
  const { item: itemString } = useLocalSearchParams();
  const originalItem = JSON.parse(itemString as string);
  const { authToken } = useAuth();

  const [title, setTitle] = useState(originalItem.title);
  const [description, setDescription] = useState(
    originalItem.description || ""
  );
  const [price, setPrice] = useState(originalItem.price.toString());
  const [selectedCategory, setSelectedCategory] = useState(
    originalItem.category
  );
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const [images, setImages] = useState<string[]>([]);
  const [modifiedImages, setModifiedImages] = useState(false);
  // const [isNewImage, setIsNewImage] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [loading, setLoading] = useState(false);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    const imageArray = [];
    if (originalItem.image) {
      imageArray.push(originalItem.image);
    }
    // add additional iamges if they exist
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

  const pickImage = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.status !== "granted") {
      if (!permissionResult.canAskAgain) {
        Alert.alert(
          "Permission required",
          "You've previously denied access to your photo library. Please enable it from your phone's settings to continue."
        );
      } else {
        Alert.alert(
          "Permission needed",
          "Please allow access to your photo library"
        );
      }
      return;
    }
    // The thing for picking images, we can crop and stuff like that
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
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

  const prepareFormData = () => {
    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("price", price);
    const category = CATEGORIES.find((cat) => cat.value === selectedCategory);
    formData.append("category", category ? category.id.toString() : "7"); // Default to "Other" (8) if not found

    // only process images if they've been modified
    if (modifiedImages && images.length > 0) {
      // process primary image (i.e. the first one in the array)
      const image = images[0];
      const imageFileName = image.split("/").pop() || "image.jpg";
      const imageType = imageFileName.endsWith("png")
        ? "image/png"
        : "image/jpeg";

      formData.append("image", {
        uri: Platform.OS === "android" ? image : image.replace("file://", ""),
        name: imageFileName,
        type: imageType,
      } as unknown as Blob);
    }
    // process additional images if there are any
    if (images.length > 1) {
      // skip the first image since it's already added as the primary image
      for (let i = 1; i < images.length; i++) {
        const additionalImage = images[i];
        const imageFileName =
          additionalImage.split("/").pop() || `image_${i}.jpg`;
        const imageType = imageFileName.endsWith("png")
          ? "image/png"
          : "image/jpeg";
        formData.append("additional_images", {
          uri:
            Platform.OS === "android"
              ? additionalImage
              : additionalImage.replace("file://", ""),
          name: imageFileName,
          type: imageType,
        } as unknown as Blob);
      }
    }
    return formData;
  };

  // Function to open camera
  const openCamera = () => {
    setShowCamera(true);
  };

  const handleCategorySelect = (value: string) => {
    setSelectedCategory(value);
    setDropdownOpen(false);
  };

  const handleSubmit = async () => {
    if (!title || !price || !selectedCategory) {
      Alert.alert("Validation Error", "Please fill in all required fields.");
      return;
    }

    try {
      setLoading(true);
      // setIsSaving(true);
      const formData = prepareFormData();
      // if (!userData) {
      //   await getProfile();
      // }

      // if (image) {
      //   const sightEngineFormData = new FormData();
      //   const imageFileName = image.split("/").pop() || "image.jpg";
      //   const imageType = imageFileName.endsWith("png")
      //     ? "image/png"
      //     : "image/jpeg";
      //   sightEngineFormData.append("media", {
      //     uri: image,
      //     name: imageFileName,
      //     type: imageType,
      //   } as unknown as Blob);
      //   //TODO: append image to form data
      //   type SightEngineParams = {
      //     workflow: string;
      //     api_user: string;
      //     api_secret: string;
      //   };

      //   const params: SightEngineParams = {
      //     workflow: SE_WORKFLOW,
      //     api_user: SE_API_USER,
      //     api_secret: SE_SECRET_KEY,
      //   };

      //   (Object.keys(params) as (keyof SightEngineParams)[]).forEach((key) => {
      //     sightEngineFormData.append(key, params[key]);
      //   });
      //   // Make API call to SightEngine
      //   const sightEngineResponse = await axios.post(
      //     "https://api.sightengine.com/1.0/check-workflow.json",
      //     sightEngineFormData,
      //     {
      //       headers: {
      //         "Content-Type": "multipart/form-data",
      //       },
      //     }
      //   );
      //   const output = sightEngineResponse.data;
      //   if (output.status === "failure") {
      //     console.error("SightEngine API error:", output.error);
      //     Alert.alert("Error", "Image validation failed. Please try again.");
      //     setLoading(false);
      //     return;
      //   }
      //   // Check if image should be rejected
      //   if (output.summary && output.summary.action === "reject") {
      //     console.log(
      //       "Image rejected with probability:",
      //       output.summary.reject_prob
      //     );
      //     console.log(
      //       "Rejection reasons:",
      //       output.summary.reject_reason[0].text
      //     );

      //     Alert.alert("NOT ALLOWED", `${output.summary.reject_reason[0].text}`);
      //     setLoading(false);
      //     return;
      //   }
      // }

      //   const formDataObj = createFormData();
      // console.log("hello", originalItem);
      const cleanToken = authToken?.trim();

      const config = {
        headers: {
          Authorization: `Bearer ${cleanToken}`,
          "Content-Type": "multipart/form-data",
          Accept: "application/json",
        },
      };
      const response = await axios.put(
        `${BASE_URL}/api/items/${originalItem.id}/`,
        formData,
        config
      );
      useItemsStore.getState().updateItem(response.data);

      Alert.alert("Success", "Item edited successfully", [
        {
          text: "OK",
          onPress: () => {
            // Go back to previous screen (which would be ItemDetails) with refreshed data
            router.back();

            // pass the updated item data back through URL params
            router.setParams({
              item: JSON.stringify(response.data),
              refreshKey: Date.now().toString(),
            });
          },
        },
      ]);
    } catch (error) {
      console.error("Error editting item:", error);
      Alert.alert("Error", "Could not edit item. Please try again later.");
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
                {CATEGORIES.map((category) => (
                  <TouchableOpacity
                    key={category.value}
                    style={[
                      styles.dropdownItem,
                      selectedCategory === category.value &&
                        styles.dropdownItemSelected,
                    ]}
                    onPress={() => handleCategorySelect(category.value)}
                  >
                    <Text
                      style={[
                        styles.dropdownItemText,
                        selectedCategory === category.value &&
                          styles.dropdownItemTextSelected,
                      ]}
                    >
                      {category.label}
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
          style={styles.container}
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
                    ? CATEGORIES.find((cat) => cat.value === selectedCategory)
                        ?.label
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
                          <View style={styles.primaryBadge}>
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
                    color="#007BFF"
                  />
                  <Text style={styles.imageButtonText}>Gallery</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.imageButton}
                  onPress={openCamera}
                >
                  <MaterialIcons name="camera-alt" size={24} color="#007BFF" />
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
              style={styles.button}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator testID="activity-indicator" color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Save Item</Text>
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
    // padding: 16,
    paddingTop: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
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
  },
  textarea: {
    height: 100,
    textAlignVertical: "top",
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
  },
  imageActions: {
    flexDirection: "row",
    justifyContent: "space-around",
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
    color: "#007BFF",
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
  button: {
    backgroundColor: "#007BFF",
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
    width: "80%",
    maxHeight: 300,
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
    backgroundColor: "rgba(0, 123, 255, 0.8)",
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
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
});

export default EditItem;
