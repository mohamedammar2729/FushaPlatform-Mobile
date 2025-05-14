import React, { useState, lazy, Suspense, useRef, useEffect } from "react";
import {
  View,
  Image,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  Modal,
  Platform,
  Dimensions,
  StatusBar,
  Animated,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialIcons } from "@expo/vector-icons";
import { Card } from "react-native-paper";
import { BlurView } from "expo-blur";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import Loading from "./Loading"; // Change the import to use the Create-specific Loading component
import { useTheme } from "../../context/ThemeContext";
import {
  Users,
  CirclePlus as PlusCircle,
  CircleMinus as MinusCircle,
} from "lucide-react-native";
import { TouchableOpacity } from "react-native";

const Next = lazy(() => import("../Next"));

const Create = () => {
  const { theme, isDarkMode } = useTheme();
  const [next, setNext] = useState(false);
  const [final, setFinal] = useState(false);
  const [form, setForm] = useState({
    people: "",
    amount: "",
    destination: "",
    category: "",
  });
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true); // Add this state for loading screen

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  // Add this effect for the initial loading screen
  useEffect(() => {
    // Show loading screen for 2 seconds
    const timer = setTimeout(() => {
      setInitialLoading(false);
    }, 2000);

    // Clean up the timer if component unmounts
    return () => clearTimeout(timer);
  }, []);

  // Form elements entrance animation - keep this as is
  useEffect(() => {
    if (!initialLoading) {
      // Only start animations after loading screen
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [initialLoading]);

  const storeData = async () => {
    try {
      await AsyncStorage.setItem("programData", JSON.stringify(form));
      console.log("Data saved!");
    } catch (error) {
      console.error("Error saving data:", error);
    }
  };

  const categories = [
    { main: "ثقافية", image: require("../../assets/1.jpeg") },
    { main: "تاريخية", image: require("../../assets/2.jpeg") },
    { main: "ترفيهية", image: require("../../assets/3.jpeg") },
    { main: "عائلية", image: require("../../assets/4.jpeg") },
    { main: "دينية", image: require("../../assets/5.jpeg") },
    { main: "رومانسية", image: require("../../assets/6.webp") },
    { main: "مغامرات", image: require("../../assets/7.jpeg") },
    { main: "تجربية", image: require("../../assets/8.jpeg") },
    { main: "بحرية", image: require("../../assets/9.jpeg") },
  ];

  const destinations = [
    { label: "القاهرة 🏛", value: "القاهرة" },
    { label: "الإسكندرية 🌊", value: "الإسكندرية" },
    { label: "جنوب سيناء ⛰", value: "جنوب سيناء" },
    { label: "مطروح 🏖", value: "مطروح" },
    { label: "أسوان ☀", value: "أسوان" },
  ];

  // Add this effect to clear data when screen is focused
  useFocusEffect(
    React.useCallback(() => {
      setNext(false);
      setFinal(false);
      const clearData = async () => {
        try {
          await AsyncStorage.removeItem("programData");
          setForm({ people: "", amount: "", destination: "", category: "" });
        } catch (error) {
          console.error("Error clearing data:", error);
        }
      };
      clearData();
    }, [])
  );

  // Add useCallback for handlers
  const handleChange = React.useCallback((field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleTravelersChange = React.useCallback((increment) => {
    setForm((prev) => {
      const newValue = parseInt(prev.people || "0") + increment;
      if (newValue >= 1 && newValue <= 10) {
        return { ...prev, people: newValue.toString() };
      }
      return prev;
    });
  }, []);

  // Memoize the categories list to prevent re-renders
  const categoriesComponents = React.useMemo(() => {
    return categories.map((category, index) => (
      <Pressable
        key={index}
        style={[
          styles.imageContainer,
          form.category === category.main && [
            styles.selectedCategory,
            { borderColor: isDarkMode ? "#81c784" : "green" },
          ],
        ]}
        onPress={() => handleChange("category", category.main)}
      >
        <Image source={category.image} style={styles.smallImage} />
        <BlurView
          intensity={isDarkMode ? 55 : 70}
          tint="dark"
          style={styles.blurContainer}
        >
          <Text style={styles.categoryMain}>{category.main}</Text>
        </BlurView>
        <View
          style={[
            styles.checkbox,
            {
              borderColor: isDarkMode ? "#78f87f" : "green",
              backgroundColor: isDarkMode ? theme.colors.surface : "white",
            },
          ]}
        >
          {form.category === category.main && (
            <MaterialIcons
              name="check"
              size={13}
              color={isDarkMode ? "#78f87f" : "green"}
            />
          )}
        </View>
      </Pressable>
    ));
  }, [
    categories,
    form.category,
    handleChange,
    isDarkMode,
    theme.colors.surface,
  ]);

  // If in initial loading state, show the Loading component
  if (initialLoading) {
    return <Loading />;
  }

  // Return your existing Create component UI
  return (
    <>
      <StatusBar
        barStyle={isDarkMode ? "light-content" : "dark-content"}
        backgroundColor={theme.colors.background}
      />
      {!next && (
        <Animated.ScrollView
          contentContainerStyle={{
            paddingBottom: Platform.select({
              ios: 110,
              android: 100,
            }),
          }}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          style={[
            styles.scrollContainer,
            {
              backgroundColor: theme.colors.background,
              opacity: fadeAnim,
            },
          ]}
        >
          {/* Header with Logo */}
          <View style={styles.headerContainer}>
            <Animated.Image
              source={
                isDarkMode
                  ? require("../../assets/white_logo.png")
                  : require("../../assets/colored_logo.png")
              }
              style={{
                objectFit: "contain",
                width: 175,
                height: 40,
                alignSelf: "center",
                opacity: fadeAnim,
                transform: [{ scale: fadeAnim }],
              }}
            />
            <Animated.Text
              style={[
                styles.headerTitle,
                {
                  color: theme.colors.text,
                  opacity: fadeAnim,
                  transform: [
                    {
                      translateX: fadeAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [-20, 0],
                      }),
                    },
                  ],
                },
              ]}
            >
              فصل رحلتك علي مزاجك 🌟
            </Animated.Text>
          </View>

          {/* Rest of your form components wrapped in Animated.View */}
          <Animated.View
            style={[
              styles.container,
              {
                backgroundColor: theme.colors.background,
                transform: [{ translateY: slideAnim }],
                opacity: fadeAnim,
              },
            ]}
          >
            {/* Travelers Input */}
            <Animated.View
              style={[
                styles.inputContainer,
                {
                  backgroundColor: isDarkMode ? theme.colors.surface : "white",
                  borderColor: isDarkMode ? theme.colors.border : "transparent",
                  borderWidth: isDarkMode ? 1 : 0,
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
                },
              ]}
            >
              <View style={{ marginTop: 6, flex: 1 }}>
                <Text style={[styles.label, { color: theme.colors.text }]}>
                  عدد المسافرين 👥
                </Text>
              </View>
              <View
                style={{
                  flex: 0.7,
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <TouchableOpacity
                  style={styles.travelerButton}
                  onPress={() => handleTravelersChange(1)}
                >
                  <PlusCircle
                    size={24}
                    color={isDarkMode ? "#64B5F6" : "#0984e3"}
                  />
                </TouchableOpacity>
                <View style={styles.travelerCountContainer}>
                  <Text
                    style={[styles.travelerCount, { color: theme.colors.text }]}
                  >
                    {form.people || "0"}
                  </Text>
                  <Users
                    size={20}
                    color={isDarkMode ? "#64B5F6" : "#0984e3"}
                    style={styles.travelerIcon}
                  />
                </View>
                <TouchableOpacity
                  style={styles.travelerButton}
                  onPress={() => handleTravelersChange(-1)}
                >
                  <MinusCircle
                    size={24}
                    color={isDarkMode ? "#64B5F6" : "#0984e3"}
                  />
                </TouchableOpacity>
              </View>
            </Animated.View>

            {/* Amount Input */}
            <Animated.View
              style={[
                styles.inputContainer,
                {
                  backgroundColor: isDarkMode ? theme.colors.surface : "white",
                  borderColor: isDarkMode ? theme.colors.border : "transparent",
                  borderWidth: isDarkMode ? 1 : 0,
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
                },
              ]}
            >
              <View style={{ marginTop: 6, flex: 1 }}>
                <Text style={[styles.label, { color: theme.colors.text }]}>
                  معاك كام 💰
                </Text>
              </View>
              <View
                style={{
                  flex: 0.7,
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <TextInput
                  style={[styles.input, { color: theme.colors.text }]}
                  keyboardType="numeric"
                  placeholder="اكتب المبلغ هنا..."
                  placeholderTextColor={isDarkMode ? "#ffffff" : "#999"}
                  value={form.amount}
                  onChangeText={(v) => handleChange("amount", v)}
                />
              </View>
            </Animated.View>

            {/* Destination Dropdown */}
            <Animated.View
              style={[
                styles.inputContainer,
                {
                  backgroundColor: isDarkMode ? theme.colors.surface : "white",
                  borderColor: isDarkMode ? theme.colors.border : "transparent",
                  borderWidth: isDarkMode ? 1 : 0,
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
                },
              ]}
            >
              <View style={{ marginTop: 6 }}>
                <Text style={[styles.label, { color: theme.colors.text }]}>
                  هتسفح فين 🌍
                </Text>
              </View>
              <Pressable
                style={[
                  styles.dropdownButton,
                  {
                    backgroundColor: isDarkMode
                      ? theme.colors.surface
                      : "white",
                  },
                ]}
                onPress={() => setIsDropdownOpen(true)}
              >
                <Text
                  style={[
                    styles.dropdownButtonText,
                    { color: theme.colors.text },
                  ]}
                >
                  {form.destination || "اختر المحافظة 🏙"}
                </Text>
                <MaterialIcons
                  name="arrow-drop-down"
                  size={24}
                  color={theme.colors.text}
                />
              </Pressable>

              <Modal
                visible={isDropdownOpen}
                transparent={true}
                animationType="none"
              >
                <Pressable
                  style={[
                    styles.modalContainer,
                    {
                      backgroundColor: isDarkMode
                        ? "rgba(0,0,0,0.7)"
                        : "rgba(0,0,0,0.5)",
                    },
                  ]}
                  onPress={() => setIsDropdownOpen(false)}
                >
                  <Pressable
                    style={[
                      styles.dropdownList,
                      {
                        backgroundColor: isDarkMode
                          ? theme.colors.surface
                          : "white",
                      },
                    ]}
                    onPress={(e) => e.stopPropagation()} // Prevent clicks on dropdown from closing modal
                  >
                    {destinations.map((item, index) => (
                      <Pressable
                        key={index}
                        style={[
                          styles.dropdownItem,
                          {
                            borderBottomColor: isDarkMode
                              ? theme.colors.border
                              : "#eee",
                          },
                        ]}
                        onPress={() => {
                          handleChange("destination", item.value);
                          setIsDropdownOpen(false);
                        }}
                      >
                        <Text
                          style={[
                            styles.dropdownItemText,
                            { color: theme.colors.text },
                          ]}
                        >
                          {item.label}
                        </Text>
                      </Pressable>
                    ))}
                  </Pressable>
                </Pressable>
              </Modal>
            </Animated.View>
          </Animated.View>

          {/* Categories Card */}
          <View style={{ flex: 1 }}>
            <Card
              style={[
                styles.card,
                {
                  backgroundColor: isDarkMode ? theme.colors.surface : "white",
                  shadowColor: isDarkMode ? "#000" : "#387be0",
                  elevation: isDarkMode ? 3 : 5,
                },
              ]}
            >
              <View style={styles.imageGallery2}>{categoriesComponents}</View>
            </Card>
          </View>

          {/* Submit Button */}
          <LinearGradient
            colors={
              isDarkMode ? ["#e29454", "#d9843f"] : ["#4a72ac", "#387be0"]
            }
            style={[
              styles.submitButton,
              {
                opacity:
                  !form.people ||
                  !form.amount ||
                  !form.destination ||
                  !form.category
                    ? 0.5
                    : 1,
                width: "50%",
                alignSelf: "center",
              },
            ]}
          >
            <Pressable
              style={[
                styles.buttonInner,
                {
                  justifyContent: "center",
                  width: "100%",
                },
              ]}
              disabled={
                !form.people ||
                !form.amount ||
                !form.destination ||
                !form.category
              }
              onPress={() => {
                storeData();
                setNext(true);
              }}
            >
              <Text
                style={[
                  styles.buttonText,
                  {
                    fontSize: 20,
                    letterSpacing: 1,
                    textAlign: "center",
                  },
                ]}
              >
                التالي
              </Text>
            </Pressable>
          </LinearGradient>
        </Animated.ScrollView>
      )}
      {next && (
        <Suspense fallback={<Loading />}>
          <Next myHandle={setNext} myFinal={final} mySetFinal={setFinal} />
        </Suspense>
      )}
    </>
  );
};
const styles = StyleSheet.create({
  container: {
    direction: "rtl",
    paddingBottom: 10,
    paddingHorizontal: 10,
  },
  headerContainer: {
    paddingTop: 5,
    paddingBottom: 5,
    flexDirection: "column",
    alignItems: "center",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    marginVertical: 10,
    backgroundColor: "white",
    borderRadius: 25,
    padding: 10,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  numberCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 10,
  },
  numberText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  label: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2D3250",
    marginHorizontal: 10,
    flex: 1,
    textAlign: "left",
  },
  input: {
    flex: 2,
    fontSize: 16,
    color: "#2D3250",
    textAlign: "right",
    paddingHorizontal: 10,
  },
  dropdownButton: {
    flex: 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "white",
    borderRadius: 25,
    paddingHorizontal: 15,
    height: 40,
  },
  dropdownButtonText: {
    fontSize: 16,
    color: "#2D3250",
    marginRight: 10,
    textAlign: "right",
    marginRight: 60,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  dropdownList: {
    backgroundColor: "white",
    width: "80%",
    marginRight: 10,
    borderRadius: 15,
    padding: 10,
  },
  dropdownItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  dropdownItemText: {
    fontSize: 16,
    color: "#2D3250",
    textAlign: "right",
  },
  submitButton: {
    borderRadius: 30,
    marginTop: 10,
    alignSelf: "flex-end",
    overflow: "hidden",
    direction: "rtl",
    marginHorizontal: 10,
    paddingVertical: 10,
    elevation: 8,
    shadowColor: "#387be0",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  buttonInner: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 25,
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 8,
  },
  priceText: {
    marginVertical: 10,
    fontSize: 18,
    fontWeight: "normal",
    color: "#000",
  },
  card: {
    borderRadius: 15,
    overflow: "hidden",
    margin: 10,
    paddingBottom: 2,
    paddingTop: 2,
    elevation: 5,
  },
  imageGallery: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 10,
    gap: 10,
  },
  headerTitle: {
    paddingTop: 15,
    paddingBottom: 10,
    fontSize: 18,
    fontWeight: "bold",
  },
  imageGallery2: {
    width: "100%",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: 5,
  },
  imageContainer: {
    position: "relative",
    width: Dimensions.get("window").width > 400 ? "30%" : "33%",
    marginVertical: 4,
    borderWidth: 2, // Add default border
    borderColor: "transparent", // Hide by default
  },
  blurContainer: {
    position: "absolute",
    height: "100%",
    bottom: 0,
    left: 0,
    right: 0,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    overflow: "hidden",
    justifyContent: "center",
  },
  categoryMain: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
  },
  smallImage: {
    width: "100%",
    height: 90,
    borderRadius: 8,
  },
  selectedCategory: {
    borderColor: "green", // Green border when selected
    borderRadius: 8, // Match image borderRadius
  },
  checkbox: {
    position: "absolute",
    top: 3,
    right: 3,
    width: 17,
    height: 17,
    borderRadius: 12.5,
    borderWidth: 2,
    borderColor: "green",
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  travelerButton: {
    padding: 5,
  },
  travelerCountContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 10,
  },
  travelerCount: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginRight: 5,
  },
  travelerIcon: {
    marginRight: 5,
  },
  scrollContainer: {
    flex: 1,
    paddingTop: 40,
  },
  imageGallery2: {
    width: "100%",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: Dimensions.get("window").width < 400 ? 5 : 10,
  },
  categoryImage: {
    width: "100%",
    height: Dimensions.get("window").width * 0.3,
    borderRadius: 10,
  },
  submitButton: {
    marginHorizontal: "5%",
    marginVertical: 20,
    borderRadius: 25,
  },
});

export default Create;
