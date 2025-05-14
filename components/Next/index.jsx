// Import Reanimated properly
import React, { useState, lazy, Suspense, useRef } from "react";
import {
  View,
  Image,
  StyleSheet,
  Dimensions,
  Animated,
  TouchableOpacity,
  Platform,
  TextInput,
  FlatList,
} from "react-native";
import { Card, Text } from "react-native-paper";
import { Ionicons, FontAwesome, MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { MotiView, MotiImage } from "moti";
import { Search, MapPin, Star } from "lucide-react-native";
import { useFocusEffect } from "@react-navigation/native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Pressable } from "react-native";
import Loading from "../Loading";
import { useTheme } from "../../context/ThemeContext";

const { width } = Dimensions.get("window");
const Final = lazy(() => import("../Final"));

// Use Animated instead of Reanimated
const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);

const Next = ({ myHandle, myFinal, mySetFinal }) => {
  const { theme, isDarkMode } = useTheme();

  const [places, setPlaces] = useState([]);
  const [filteredPlaces, setFilteredPlaces] = useState([]);
  const [program, setProgram] = useState(null);
  const [selectedType, setSelectedType] = useState(null);
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [savedPlaces, setSavedPlaces] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [hasScrolled, setHasScrolled] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      let isActive = true;

      const fetchDataAndFilter = async () => {
        try {
          const placesResponse = await axios.get(
            "https://iti-server-production.up.railway.app/api/places"
          );
          const programData = await AsyncStorage.getItem("programData");
          const parsedProgram = programData ? JSON.parse(programData) : null;
          const savedData = await AsyncStorage.getItem("savedPlaces");

          if (savedData) setSavedPlaces(JSON.parse(savedData));

          if (isActive) {
            setPlaces(placesResponse.data);
            setProgram(parsedProgram);

            if (parsedProgram) {
              let filtered = placesResponse.data
                .filter((place) => place.city === parsedProgram.destination)
                .filter((place) => place.cate.includes(parsedProgram.category));

              // Apply type filter
              if (selectedType && selectedType !== "الكل") {
                filtered = filtered.filter(
                  (place) => place.type === selectedType
                );
              }

              setFilteredPlaces(filtered);
            }
          }
        } catch (error) {
          console.error("Error loading data:", error);
        }
      };

      fetchDataAndFilter();
      return () => {
        isActive = false;
      };
    }, [selectedType]) // Add selectedType to dependencies
  );

  const toggleSave = async (place) => {
    try {
      const { _id, image, name, price, city } = place;
      const saved = await AsyncStorage.getItem("savedPlaces");
      let savedArray = saved ? JSON.parse(saved) : [];

      const isSaved = savedArray.some((p) => p._id === _id);

      if (isSaved) {
        savedArray = savedArray.filter((p) => p._id !== _id);
      } else {
        savedArray.push({ _id, image, name, price, city });
      }

      await AsyncStorage.setItem("savedPlaces", JSON.stringify(savedArray));
      setSavedPlaces(savedArray);
    } catch (error) {
      console.error("Error toggling save:", error);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      const clearData = async () => {
        try {
          await AsyncStorage.removeItem("savedPlaces");
        } catch (error) {
          console.error("Error clearing data:", error);
        }
      };
      clearData();
    }, [])
  );

  const getUniqueTypes = () => {
    const types = filteredPlaces.map((place) => place.type).filter(Boolean);
    return ["الكل", ...new Set(types)];
  };

  const handleSearch = (text) => {
    setSearchQuery(text.normalize()); // Normalize Arabic text
    if (text) {
      const filtered = places.filter(
        (item) =>
          item.name.includes(text) ||
          item.location.includes(text) ||
          item.type.includes(text)
      );
      setFilteredPlaces(filtered);
    } else {
      setFilteredPlaces(places);
    }
  };
  const scrollY = useRef(new Animated.Value(0)).current;
  // Animation for logo fade
  const logoOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });
  const stickyLogoOpacity = scrollY.interpolate({
    inputRange: [0, 50],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  const stickyHeaderTranslate = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [-100, 0],
    extrapolate: "clamp",
  });

  const renderItem = ({ item, index }) => (
    <MotiView
      from={{ opacity: 0, translateY: 50 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ delay: index * 50 }}
    >
      <TouchableOpacity
        style={[
          styles.destinationCard,
          {
            backgroundColor: isDarkMode ? theme.colors.surface : "white",
          },
        ]}
      >
        <MotiImage
          source={{ uri: item.image }}
          style={styles.destinationImage}
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 500 }}
        />

        <TouchableOpacity
          style={styles.heartIcon}
          onPress={() => toggleSave(item)}
        >
          <MotiView
            animate={{
              scale: savedPlaces.some((p) => p._id === item._id) ? 1.2 : 1,
            }}
            transition={{ type: "spring" }}
          >
            <FontAwesome
              name={
                savedPlaces.some((p) => p._id === item._id)
                  ? "heart"
                  : "heart-o"
              }
              size={25}
              color="#ff4757"
            />
          </MotiView>
        </TouchableOpacity>

        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.8)"]}
          style={styles.destinationGradient}
        >
          <View style={styles.destinationContent}>
            <View style={styles.destinationHeader}>
              <View style={styles.ratingContainer}>
                <Star size={14} color="#FFD700" />
                <Text style={styles.ratingText}>{item.rate}</Text>
              </View>
              <Text style={styles.destinationType}>{item.type}</Text>
            </View>
            <Text style={styles.destinationName}>{item.name}</Text>
            <View style={styles.destinationDetails}>
              <View style={styles.locationContainer}>
                <MapPin size={14} color="#fff" />
                <Text style={styles.locationText}>{item.city}</Text>
              </View>
              <Text style={styles.priceText}>جنيه {item.price}</Text>
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </MotiView>
  );

  return (
    <>
      {!myFinal && (
        <View
          style={[
            styles.container,
            {
              backgroundColor: theme.colors.background,
            },
          ]}
        >
          <Animated.View
            style={[
              styles.stickyHeader,
              {
                backgroundColor: isDarkMode
                  ? "rgba(45,50,80,0.97)"
                  : "rgba(255,255,255,0.97)",
                transform: [{ translateY: stickyHeaderTranslate }],
                paddingTop: hasScrolled ? 20 : 60,
              },
            ]}
          >
            <Animated.View style={{ opacity: stickyLogoOpacity }}>
              <MotiView
                from={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 500 }}
                style={styles.logoContainer}
              >
                <Image
                  source={
                    isDarkMode
                      ? require("../../assets/white_logo.png")
                      : require("../../assets/colored_logo.png")
                  }
                  style={styles.logo}
                />
              </MotiView>
            </Animated.View>
            <View style={styles.controlsContainer}>
              <MotiView
                from={{ opacity: 0, translateX: 50 }}
                animate={{ opacity: 1, translateX: 0 }}
                transition={{ delay: 200 }}
                style={[
                  styles.searchContainer,
                  {
                    backgroundColor: isDarkMode ? theme.colors.surface : "#fff",
                  },
                ]}
              >
                <TextInput
                  style={[
                    styles.searchInput,
                    {
                      color: theme.colors.text,
                    },
                  ]}
                  placeholder="ابحث عن وجهة..."
                  placeholderTextColor={isDarkMode ? "#999" : "#666"}
                  value={searchQuery}
                  onChangeText={handleSearch}
                />
                <Search
                  size={20}
                  color={isDarkMode ? theme.colors.primary : "#4a72ac"}
                  style={styles.searchIcon}
                />
              </MotiView>

              <MotiView
                from={{ opacity: 0, translateX: -50 }}
                animate={{ opacity: 1, translateX: 0 }}
                transition={{ delay: 400 }}
                style={styles.filterContainer}
              >
                <Pressable
                  style={[
                    styles.filterButton,
                    {
                      backgroundColor: isDarkMode
                        ? theme.colors.primary
                        : "#4a72ac",
                    },
                  ]}
                  onPress={() => setShowTypeDropdown(!showTypeDropdown)}
                >
                  <Text style={styles.filterButtonText}>
                    {selectedType || "جميع الانواع"}
                  </Text>
                  <MaterialIcons
                    name={showTypeDropdown ? "filter-list" : "filter-alt"}
                    size={24}
                    color="white"
                  />
                </Pressable>

                {showTypeDropdown && (
                  <MotiView
                    from={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    style={[
                      styles.dropdownList,
                      {
                        backgroundColor: isDarkMode
                          ? theme.colors.surface
                          : "white",
                      },
                    ]}
                  >
                    {getUniqueTypes().map((type, index) => (
                      <Pressable
                        key={index}
                        style={[
                          styles.dropdownItem,
                          {
                            borderBottomColor: isDarkMode
                              ? theme.colors.border
                              : "#f1f3f5",
                          },
                          type === selectedType && [
                            styles.selectedDropdownItem,
                            {
                              backgroundColor: isDarkMode
                                ? theme.colors.primary
                                : "#4a72ac",
                            },
                          ],
                        ]}
                        onPress={() => {
                          setSelectedType(type === "الكل" ? null : type);
                          setShowTypeDropdown(false);
                        }}
                      >
                        <Text
                          style={[
                            styles.dropdownItemText,
                            {
                              color: isDarkMode ? theme.colors.background : "#0b0b0c",
                            },
                            type === selectedType &&
                              styles.selectedDropdownItemText,
                          ]}
                        >
                          {type}
                        </Text>
                      </Pressable>
                    ))}
                  </MotiView>
                )}
              </MotiView>
            </View>
          </Animated.View>

          <AnimatedFlatList
            data={filteredPlaces}
            renderItem={renderItem}
            keyExtractor={(item) => item._id}
            contentContainerStyle={[
              styles.listContent,
              {
                paddingTop: 120,
              },
            ]}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { y: scrollY } } }],
              {
                useNativeDriver: true,
                listener: (event) => {
                  const offsetY = event.nativeEvent.contentOffset.y;
                  if (offsetY > 0 && !hasScrolled) {
                    setHasScrolled(true);
                  } else if (offsetY <= 0 && hasScrolled) {
                    setHasScrolled(false);
                  }
                },
              }
            )}
            // ListHeaderComponent={
            //   <Animated.View
            //     style={[styles.logoContainer, { opacity: logoOpacity }]}
            //   >
            //     <MotiView
            //       from={{ opacity: 0 }}
            //       animate={{ opacity: 1 }}
            //       transition={{ duration: 500 }}
            //     >
            //       <Image
            //         source={
            //           isDarkMode
            //             ? require("../../assets/white_logo.png")
            //             : require("../../assets/colored_logo.png")
            //         }
            //         style={styles.logo}
            //       />
            //     </MotiView>
            //   </Animated.View>
            // }
          />

          <MotiView
            from={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1000 }}
            style={[
              styles.footerButtons,
              {
                backgroundColor: isDarkMode ? theme.colors.surface : "white",
              },
            ]}
          >
            {/* Next button - now placed first */}
            <TouchableOpacity
              style={[
                styles.navButton,
                styles.nextButton,
                {
                  backgroundColor: isDarkMode
                    ? theme.colors.primary
                    : "#4a72ac",
                },
              ]}
              onPress={() => mySetFinal(true)}
            >
              <MaterialIcons name="arrow-forward-ios" size={20} color="white" />
              <Text style={styles.navButtonText}>التالي</Text>
            </TouchableOpacity>

            {/* Back button - now placed second */}
            <TouchableOpacity
              style={[
                styles.navButton,
                styles.backButton,
                {
                  backgroundColor: isDarkMode
                    ? "rgba(246,177,122,0.2)"
                    : "#f1f3f5",
                },
              ]}
              onPress={() => myHandle(false)}
            >
              <Text
                style={[
                  styles.navButtonText,
                  { color: isDarkMode ? theme.colors.primary : "#4a72ac" },
                ]}
              >
                رجوع
              </Text>
              <MaterialIcons
                name="arrow-back-ios"
                size={20}
                color={isDarkMode ? theme.colors.primary : "#4a72ac"}
              />
            </TouchableOpacity>
          </MotiView>
        </View>
      )}

      {myFinal && (
        <Suspense fallback={<Loading />}>
          <Final myHandle={mySetFinal} myFirst={myHandle} />
        </Suspense>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  stickyHeader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    backgroundColor: "rgba(255, 255, 255, 0.97)",
    paddingTop: 20,
    paddingBottom: 10,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  header: {
    backgroundColor: "white",
    paddingBottom: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    overflow: "visible", // Add this
    zIndex: 100,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  logoContainer: {
    alignItems: "center",
    padding: 20,
  },
  logo: {
    width: 180,
    height: 40,
    resizeMode: "contain",
  },
  headerText: {
    fontSize: 24,
    fontWeight: "700",
    color: "#2D3250",
    marginTop: 10,
    fontFamily: "Cairo-Bold",
  },
  controlsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginTop: 15,
  },
  searchContainer: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 20,
    flexDirection: "row-reverse",
    alignItems: "center",
    paddingHorizontal: 15,
    height: 45,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: "#2D3250",
    textAlign: "right",
  },
  searchIcon: {
    marginLeft: 10,
  },
  filterContainer: {
    position: "relative",
    marginLeft: 10,
    zIndex: 999, // Higher z-index to ensure dropdown visibility
  },
  filterButton: {
    backgroundColor: "#4a72ac",
    borderRadius: 12,
    padding: 10,
    flexDirection: "row-reverse",
    alignItems: "center",
  },
  filterButtonText: {
    color: "white",
    fontSize: 14,
    marginRight: 8,
    fontWeight: "600",
  },
  dropdownList: {
    position: "absolute",
    top: 50, // Increased from 45
    right: 0,
    backgroundColor: "white",
    borderRadius: 25,
    width: 110, // Slightly wider
    maxHeight: 200, // Scroll for many items
    zIndex: 20,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 }, // Larger shadow
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  dropdownItem: {
    padding: 14, // Increased padding
    borderBottomWidth: 1,
    borderBottomColor: "#f1f3f5",
    backgroundColor: "white",
  },
  dropdownItemText: {
    fontSize: 15, // Slightly larger text
    color: "#2D3250",
    textAlign: "right",
  },
  selectedDropdownItem: {
    backgroundColor: "#4a72ac",
    borderRadius: 12,
  },
  selectedDropdownItemText: {
    color: "white",
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 80,
  },
  destinationCard: {
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 20,
    backgroundColor: "white",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  destinationImage: {
    width: "100%",
    height: 200,
  },
  destinationGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 15,
  },
  destinationContent: {
    flex: 1,
    justifyContent: "flex-end",
  },
  destinationHeader: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: "row-reverse",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.3)",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  ratingText: {
    color: "#fff",
    fontSize: 12,
    marginLeft: 4,
  },
  destinationType: {
    color: "#fff",
    fontSize: 12,
    backgroundColor: "rgba(74,114,172,0.9)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  destinationName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 8,
    textAlign: "right",
  },
  destinationDetails: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
  },
  locationContainer: {
    flexDirection: "row-reverse",
    alignItems: "center",
  },
  locationText: {
    color: "#fff",
    fontSize: 12,
    marginLeft: 4,
  },
  priceText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  heartIcon: {
    position: "absolute",
    top: 15,
    left: 15,
    zIndex: 2,
  },
  footerButtons: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginBottom: 60,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  navButton: {
    flexDirection: "row-reverse",
    alignItems: "center",
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  backButton: {
    backgroundColor: "#f1f3f5",
  },
  nextButton: {
    backgroundColor: "#4a72ac",
  },
  navButtonText: {
    fontSize: 14,
    fontWeight: "600",
    marginHorizontal: 8,
    color: "white",
  },
});

export default Next;
