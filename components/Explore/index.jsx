import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Image,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  ActivityIndicator,
} from "react-native";

const { width, height } = Dimensions.get("window");
import Foundation from "@expo/vector-icons/Foundation";
import { Card, Text, Avatar } from "react-native-paper";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import axios from "axios";
import { useTheme } from "../../context/ThemeContext";
import Loading from "./Loading"; // Import the Loading component

// Filter Button Component
const FilterButton = React.memo(
  ({ title, icon, onPress, buttonScale, isSelected }) => {
    const { theme, isDarkMode } = useTheme();

    return (
      <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
        <TouchableOpacity onPress={onPress} activeOpacity={0.85}>
          <Animated.View
            style={[
              styles.headerButton,
              {
                backgroundColor: isSelected
                  ? isDarkMode
                    ? "#f19b54"
                    : "#1b51a1" // Different color for selected button
                  : theme.colors.accent,
                transform: [{ scale: buttonScale }],
                ...(isDarkMode && {
                  shadowColor: isSelected ? "#AAB2D5" : theme.colors.accent,
                  shadowOffset: { width: 0, height: 3 },
                  shadowOpacity: 0.3,
                  shadowRadius: 3,
                }),
              },
            ]}
          >
            {icon && (
              <FontAwesome
                name={icon}
                size={20}
                color={isDarkMode ? "#2D3250" : "white"}
                style={{ marginRight: 5 }}
              />
            )}
            <Text
              style={{
                color: isDarkMode ? "#2D3250" : "white",
                fontSize: 17,
                fontWeight: isSelected ? "bold" : "normal",
                marginLeft: icon ? 5 : 0,
              }}
            >
              {title}
            </Text>
          </Animated.View>
        </TouchableOpacity>
      </Animated.View>
    );
  }
);

const Explore = () => {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showLoadingScreen, setShowLoadingScreen] = useState(true); // Add this for initial loading screen
  const { theme, isDarkMode } = useTheme();
  const [selectedFilter, setSelectedFilter] = useState("popular"); // Default to popular

  // Animation values
  const scrollY = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(50)).current;

  // Button scale animations
  const filterButtonScale = useRef(new Animated.Value(1)).current;
  const recentButtonScale = useRef(new Animated.Value(1)).current;
  const popularButtonScale = useRef(new Animated.Value(1)).current;

  // Header animations
  const headerTranslateY = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [0, -120], // Increase this value to move header completely off-screen
    extrapolate: "clamp",
  });

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 60, 100],
    outputRange: [1, 0.5, 0], // Fade out completely
    extrapolate: "clamp",
  });

  // Add this for the "show header on scroll up" effect
  const headerVisible = scrollY.interpolate({
    inputRange: [-20, 0, 100, 101],
    outputRange: [1, 1, 0, 0],
    extrapolate: "clamp",
  });

  // Card animation offsets (pre-calculated to avoid creating in render)
  const cardOffsets = useRef([...Array(20)].map((_, i) => i * 20)).current;

  useEffect(() => {
    fetchData();

    // Show loading screen for 2 seconds
    const timer = setTimeout(() => {
      setShowLoadingScreen(false);
    }, 2000);

    // Clean up timer on unmount
    return () => clearTimeout(timer);
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        "https://iti-server-production.up.railway.app/api/readyprogram"
      );
      setPrograms(response.data);

      // Start page entry animations
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 700,
          useNativeDriver: true,
        }),
      ]).start();
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Button press animations
  const animateButtonPress = (buttonAnim) => {
    Animated.sequence([
      Animated.timing(buttonAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(buttonAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Card entry animations - optimized to avoid creating new Animated.Value in render
  const getCardAnimation = (index) => ({
    opacity: fadeAnim.interpolate({
      inputRange: [0, 0.7, 1],
      outputRange: [0, 0.3, 1],
    }),
    transform: [
      {
        translateY: Animated.add(
          translateY,
          new Animated.Value(cardOffsets[index] || 0)
        ).interpolate({
          inputRange: [0, 50],
          outputRange: [0, 50],
          extrapolate: "clamp",
        }),
      },
      {
        scale: fadeAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0.97, 1],
        }),
      },
    ],
  });

  // Render program card
  const renderProgramCard = (program, index) => (
    <Animated.View key={program._id} style={getCardAnimation(index)}>
      <Card
        style={[
          styles.card,
          {
            backgroundColor: theme.colors.surface,
            ...(isDarkMode && {
              borderWidth: 1,
              borderColor: "rgba(255,255,255,0.1)",
              shadowColor: "#000",
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 5,
            }),
          },
        ]}
      >
        {/* Image Gallery */}
        <View style={styles.imageGallery}>
          <View style={styles.imageGallery2}>
            <Image
              source={{ uri: program.images.src1 }}
              style={styles.smallImage}
            />
            <Image
              source={{ uri: program.images.src2 }}
              style={styles.smallImage}
            />
            <View style={styles.moreImages}>
              <Text style={styles.moreText}>+40</Text>
            </View>
            <Image
              source={{ uri: program.images.src3 }}
              style={styles.smallImage}
            />
          </View>
          <Image
            source={{ uri: program.images.src4 }}
            style={styles.tallImage}
          />
        </View>

        {/* Card Content */}
        <Card.Content>
          <View style={[styles.row, { justifyContent: "space-between" }]}>
            <View style={styles.row}>
              {[...Array(5)].map((_, index) => {
                const starValue = index + 1;
                let iconName = "star-border";

                if (program.rate >= starValue) {
                  iconName = "star";
                } else if (program.rate >= starValue - 0.5) {
                  iconName = "star-half";
                }

                return (
                  <MaterialIcons
                    key={index}
                    name={iconName}
                    size={16}
                    color="#FFD700"
                  />
                );
              })}
            </View>
            <View style={styles.row}>
              <Text
                style={[
                  styles.peopleCount,
                  {
                    marginRight: 10,
                    color: theme.colors.text,
                  },
                ]}
              >
                عدد الأشخاص: {program.person_num}
              </Text>
              <Avatar.Icon
                size={24}
                icon="account-group"
                style={{
                  backgroundColor: isDarkMode
                    ? "rgba(255,255,255,0.1)"
                    : "#E3F2FD",
                }}
              />
            </View>
          </View>

          <View style={[styles.row, { justifyContent: "flex-end" }]}>
            <Text
              style={[
                styles.location,
                {
                  marginRight: 13,
                  color: theme.colors.text,
                },
              ]}
            >
              البرنامج :
            </Text>
            <MaterialIcons
              marginRight={3}
              name="date-range"
              size={18}
              color={theme.colors.accent}
            />
          </View>
          <View
            style={[styles.row, { marginTop: 10, justifyContent: "center" }]}
          >
            <Text style={[styles.bolded, { color: theme.colors.text }]}>
              {program.program}
            </Text>
          </View>

          <View style={[styles.row, { justifyContent: "space-between" }]}>
            <View style={styles.row}>
              <Text
                style={[
                  styles.bolded,
                  {
                    marginRight: 8,
                    color: theme.colors.textSecondary,
                  },
                ]}
              >
                {program.location}
              </Text>
              <Ionicons name="location-sharp" size={18} color="red" />
            </View>
            <View style={styles.row}>
              <Text
                style={[
                  styles.tripType,
                  {
                    marginRight: 10,
                    marginLeft: 10,
                    color: theme.colors.text,
                  },
                ]}
              >
                {program.type_trip}
              </Text>
              <Foundation
                name="sheriff-badge"
                size={24}
                color={isDarkMode ? theme.colors.accent : "lightblue"}
              />
            </View>
          </View>

          <View style={styles.footer}>
            <View style={styles.row}>
              <Text
                style={[
                  styles.priceText,
                  {
                    color: theme.colors.accent,
                    fontWeight: "bold",
                  },
                ]}
              >
                {program.budget} جنيه
              </Text>
            </View>

            <TouchableOpacity activeOpacity={0.7} onPress={() => {}}>
              <View
                style={[
                  styles.button,
                  {
                    backgroundColor: theme.colors.accent,
                    paddingVertical: 7,
                    paddingHorizontal: 12,
                    ...(isDarkMode && {
                      shadowColor: theme.colors.accent,
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.3,
                      shadowRadius: 4,
                    }),
                  },
                ]}
              >
                <Text style={{ color: isDarkMode ? "#2D3250" : "white" }}>
                  احجز الآن
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </Card.Content>
      </Card>
    </Animated.View>
  );

  // If showing loading screen, return the custom Loading component
  if (showLoadingScreen) {
    return <Loading />;
  }

  return (
    <Animated.View
      style={{
        flex: 1,
        backgroundColor: theme.colors.background,
        opacity: fadeAnim,
      }}
    >
      <StatusBar
        barStyle={isDarkMode ? "light-content" : "dark-content"}
        backgroundColor={theme.colors.background}
      />

      {/* Animated Header */}
      <Animated.View
        style={{
          zIndex: 100,
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          transform: [{ translateY: headerTranslateY }],
          opacity: headerVisible, // Use headerVisible for smoother appearance/disappearance
          backgroundColor: theme.colors.background,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 5,
          elevation: 5,
          borderBottomLeftRadius: 15,
          borderBottomRightRadius: 15,
        }}
      >
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
            أفضل برامج فسح ورحلات بإختيار العملاء
          </Animated.Text>
        </View>

        {/* Filter Buttons */}
        <View
          style={[
            styles.buttonContainer,
            { backgroundColor: theme.colors.background },
          ]}
        >
          <FilterButton
            title="اختر"
            icon="filter"
            isSelected={selectedFilter === "filter"}
            onPress={() => {
              animateButtonPress(filterButtonScale);
              setSelectedFilter("filter");
              // Your filter logic here
            }}
            buttonScale={filterButtonScale}
          />
          <FilterButton
            title="المضاف مؤخرا"
            isSelected={selectedFilter === "recent"}
            onPress={() => {
              animateButtonPress(recentButtonScale);
              setSelectedFilter("recent");
              // Your recent sorting logic here
            }}
            buttonScale={recentButtonScale}
          />
          <FilterButton
            title="الأكثر اختيارا"
            isSelected={selectedFilter === "popular"}
            onPress={() => {
              animateButtonPress(popularButtonScale);
              setSelectedFilter("popular");
              // Your popularity sorting logic here
            }}
            buttonScale={popularButtonScale}
          />
        </View>
      </Animated.View>

      {/* Loading or Content */}
      {loading ? (
        <Animated.View
          style={[
            styles.loadingContainer,
            {
              opacity: fadeAnim,
              transform: [{ scale: fadeAnim }],
            },
          ]}
        >
          <ActivityIndicator size="large" color={theme.colors.accent} />
          <Animated.Text
            style={{
              marginTop: 15,
              color: theme.colors.text,
              opacity: fadeAnim,
            }}
          >
            جاري تحميل البرامج...
          </Animated.Text>
        </Animated.View>
      ) : (
        <Animated.ScrollView
          style={[
            styles.scrollView,
            { backgroundColor: theme.colors.background },
          ]}
          contentContainerStyle={{ paddingTop: 180, paddingBottom: 50 }} // Add paddingTop for header space
          showsVerticalScrollIndicator={false}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: true }
          )}
          scrollEventThrottle={16}
        >
          {programs.map(renderProgramCard)}
        </Animated.ScrollView>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    paddingTop: 15,
    paddingBottom: 5,
    marginTop: 30,
    flexDirection: "column",
    alignItems: "center",
  },
  headerTitle: {
    textAlign: "center",
    marginTop: 10,
    marginHorizontal: 15,
    marginBottom: 5,
    fontSize: 18,
    fontWeight: "bold",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: height * 0.025,
    paddingHorizontal: width * 0.02,
  },
  scrollView: {
    marginBottom: height * 0.075,
  },
  card: {
    borderRadius: width * 0.04,
    overflow: "hidden",
    margin: width * 0.015,
    paddingBottom: height * 0.012,
    elevation: 5,
  },
  imageGallery: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 10,
    gap: 5,
  },
  imageGallery2: {
    width: "63%",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 5,
  },
  smallImage: {
    marginVertical: height * 0.004,
    marginHorizontal: width * 0.002,
    width: "48%",
    height: height * 0.11,
    borderRadius: width * 0.02,
  },
  moreImages: {
    marginVertical: height * 0.004,
    marginHorizontal: width * 0.002,
    width: "48%",
    height: height * 0.11,
    borderRadius: width * 0.02,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  tallImage: {
    marginVertical: height * 0.004,
    width: "35%",
    height: height * 0.23,
    borderRadius: width * 0.02,
  },
  moreText: {
    color: "white",
    fontSize: width * 0.035,
    fontWeight: "bold",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: height * 0.006,
  },
  peopleCount: {
    marginLeft: width * 0.012,
    fontSize: width * 0.035,
  },
  location: {
    fontSize: width * 0.035,
  },
  tripType: {
    fontSize: width * 0.035,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
  },
  priceText: {
    marginVertical: height * 0.006,
    fontSize: width * 0.045,
    fontWeight: "normal",
  },
  bolded: {
    fontSize: width * 0.037,
    marginRight: height * 0.006,
  },
  button: {
    borderRadius: 8,
  },
  headerButton: {
    borderRadius: 15,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 8,
  },
});

export default Explore;
