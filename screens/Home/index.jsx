import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  TouchableWithoutFeedback,
  Animated,
  RefreshControl,
  Platform,
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import { BlurView } from "expo-blur";
import axios from "axios";
import { MotiView } from "moti";
import { useTheme } from "../../context/ThemeContext";

const trips = [
  {
    id: "1",
    image:
      "https://images.pexels.com/photos/3185480/pexels-photo-3185480.jpeg?auto=compress&cs=tinysrgb&w=600",
    title: "رحلة إلى الأهرامات",
    description: "استكشف عجائب العالم القديم في الجيزة مع مرشدين خبراء",
    rating: 4.9,
    price: "٥٠٠ ج.م",
    location: "الجيزة، مصر",
    duration: "يوم واحد",
  },
  {
    id: "2",
    image:
      "https://images.pexels.com/photos/15131485/pexels-photo-15131485/free-photo-of-sailboat-in-water-in-mountains-landscape.jpeg?auto=compress&cs=tinysrgb&w=600",
    title: "رحلات نيلية في أسوان",
    description: "استمتع بجولة نيلية فريدة بين معالم أسوان التاريخية",
    rating: 4.7,
    price: "٧٥٠ ج.م",
    location: "أسوان، مصر",
    duration: "٣ أيام",
  },
  {
    id: "3",
    image:
      "https://images.unsplash.com/photo-1575408264798-b50b252663e6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8c2hhcm0lMjBlbCUyMHNoZWlraHxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=500&q=60",
    title: "غوص في البحر الأحمر",
    description: "اكتشف العالم الساحر تحت الماء في شرم الشيخ",
    rating: 4.8,
    price: "١٢٠٠ ج.م",
    location: "شرم الشيخ، مصر",
    duration: "٥ أيام",
  },
];

const upcomingEvents = [
  {
    id: "1",
    image:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTBm4QPGTThFCvN5gFiS5NHXC6ucYLmjfEvJAEwjlrO6UTD0LHYa7KpFgVSMEYxITo1lHI",
    title: "مهرجان القاهرة السينمائي",
    date: "١٥ نوفمبر ٢٠٢٤",
    location: "القاهرة",
  },
  {
    id: "2",
    image:
      "https://images.pexels.com/photos/30404378/pexels-photo-30404378/free-photo-of-hot-air-balloons-over-luxor-at-sunrise.jpeg?auto=compress&cs=tinysrgb&w=600",
    title: "مهرجان الأقصر للفنون",
    date: "١ مارس ٢٠٢٥",
    location: "الأقصر",
  },
  {
    id: "3",
    image:
      "https://images.pexels.com/photos/6957662/pexels-photo-6957662.jpeg?auto=compress&cs=tinysrgb&w=600",
    title: "شم النسيم",
    date: "٢٠ أبريل ٢٠٢٥",
    location: "مصر كلها",
  },
];

const App = () => {
  // Existing state and theme
  const { theme, isDarkMode } = useTheme();
  const [categories, setCategories] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);

  // Animation values
  const scrollY = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;
  const logoScale = useRef(new Animated.Value(0.9)).current;

  // Create sections array for the main FlatList
  const sections = [
    { type: "trips", data: trips },
    { type: "categories", data: categories },
    { type: "events", data: upcomingEvents },
  ];

  // Run entry animations when component mounts
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(logoScale, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Header animations
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  const fetchData = async () => {
    try {
      const response = await axios.get(
        "https://iti-server-production.up.railway.app/api/home"
      );
      setCategories(response.data.categories);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchData().then(() => setRefreshing(false));
  }, []);

  const handleCategoryPress = (category) => {
    setSelectedCategory(category);
    setCategoryModalVisible(true);
  };

  const renderEventItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.eventCard,
        {
          backgroundColor: isDarkMode ? theme.colors.surface : "#fff",
          ...(isDarkMode && {
            borderWidth: 1,
            borderColor: "rgba(255,255,255,0.1)",
          }),
        },
      ]}
      activeOpacity={0.9}
    >
      <Image source={{ uri: item.image }} style={styles.eventImage} />
      <View style={styles.eventContent}>
        <Text style={[styles.eventTitle, { color: theme.colors.text }]}>
          {item.title}
        </Text>
        <View style={styles.eventDetails}>
          <View style={styles.eventDetail}>
            <Text
              style={[
                styles.eventDetailText,
                { color: theme.colors.textSecondary },
              ]}
            >
              {item.date}
            </Text>
            <Icon name="calendar" size={14} color={theme.colors.accent} />
          </View>
          <View style={styles.eventDetail}>
            <Text
              style={[
                styles.eventDetailText,
                { color: theme.colors.textSecondary },
              ]}
            >
              {item.location}
            </Text>
            <Icon name="map-marker" size={14} color={theme.colors.accent} />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  // Modified renderSection to include animations
  const renderSection = ({ item, index }) => {
    // Calculate staggered animation delay
    const delay = index * 150;

    // Render the appropriate section with animation
    switch (item.type) {
      case "trips":
        return (
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: "timing", duration: 500, delay }}
          >
            <View>
              <FlatList
                horizontal
                data={item.data}
                keyExtractor={(item) => item.id}
                showsHorizontalScrollIndicator={false}
                renderItem={({ item }) => (
                  <View
                    style={[
                      styles.card,
                      {
                        backgroundColor: isDarkMode
                          ? theme.colors.surface
                          : "#fff",
                        ...(isDarkMode
                          ? {
                              shadowColor: "#000",
                              shadowOpacity: 0.5,
                              shadowRadius: 10,
                              elevation: 10,
                              borderWidth: 1,
                              borderColor: "rgba(255,255,255,0.1)",
                            }
                          : {
                              elevation: 8,
                              shadowColor: "#000",
                              shadowOffset: { width: 0, height: 5 },
                              shadowOpacity: 0.3,
                              shadowRadius: 6,
                            }),
                      },
                    ]}
                  >
                    <Image source={{ uri: item.image }} style={styles.image} />
                    <View style={styles.ribbon}>
                      <Text style={styles.ribbonText}>احجز رحلتك الآن</Text>
                    </View>
                    <TouchableOpacity style={styles.heart}>
                      <Icon name="heart-o" size={22} color="#fff" />
                    </TouchableOpacity>
                    <View
                      style={[
                        styles.cardText,
                        {
                          backgroundColor: isDarkMode
                            ? "rgba(0, 0, 0, 0.4)"
                            : "rgba(0, 0, 0, 0.5)",
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.title,
                          {
                            color: "#fff",
                            textShadowColor: "rgba(0,0,0,0.7)",
                            textShadowOffset: { width: 1, height: 1 },
                            textShadowRadius: 2,
                          },
                        ]}
                      >
                        {item.title}
                      </Text>
                      <Text
                        style={[
                          styles.description,
                          {
                            color: isDarkMode ? "#eee" : "#ddd",
                          },
                        ]}
                      >
                        {item.description}
                      </Text>
                      <TouchableOpacity
                        style={[
                          styles.button,
                          {
                            backgroundColor: theme.colors.accent,
                            ...(isDarkMode && {
                              shadowColor: theme.colors.accent,
                              shadowOffset: { width: 0, height: 2 },
                              shadowOpacity: 0.4,
                              shadowRadius: 4,
                            }),
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.buttonText,
                            { color: isDarkMode ? "#2D3250" : "#ffffff" },
                          ]}
                        >
                          ابدأ رحلتك الآن
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              />
            </View>
          </MotiView>
        );

      case "categories":
        return (
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: "timing", duration: 500, delay }}
          >
            <View style={{ marginTop: 10 }}>
              <View style={styles.header}>
                <TouchableOpacity onPress={() => setModalVisible(true)}>
                  <Text
                    style={[styles.more, { color: theme.colors.textSecondary }]}
                  >
                    مشاهدة المزيد ›
                  </Text>
                </TouchableOpacity>
                <Text style={[styles.title2, { color: theme.colors.text }]}>
                  أماكن هتفرحك وعمرك ما تنساها
                </Text>
              </View>
              <FlatList
                horizontal
                data={item.data}
                keyExtractor={(item, index) => item._id || index.toString()}
                showsHorizontalScrollIndicator={false}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.card2,
                      {
                        backgroundColor: isDarkMode
                          ? "rgba(255,255,255,0.05)"
                          : "#eee",
                        ...(isDarkMode && {
                          borderWidth: 1,
                          borderColor: "rgba(255,255,255,0.05)",
                          shadowColor: "#000",
                          shadowOffset: { width: 0, height: 4 },
                          shadowOpacity: 0.3,
                          shadowRadius: 5,
                          elevation: 6,
                        }),
                      },
                    ]}
                    activeOpacity={0.8}
                    onPress={() => handleCategoryPress(item)}
                  >
                    <Image source={{ uri: item.image }} style={styles.image} />
                    <View
                      style={[
                        styles.overlay,
                        {
                          backgroundColor: isDarkMode
                            ? "rgba(0,0,0,0.3)"
                            : "rgba(0,0,0,0.5)",
                          borderWidth: isDarkMode ? 1 : 0,
                          borderColor: isDarkMode
                            ? "rgba(255,255,255,0.1)"
                            : "transparent",
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.text,
                          {
                            color: "#fff",
                            fontSize: 14,
                            fontWeight: "bold",
                            textShadowColor: "rgba(0,0,0,0.8)",
                            textShadowOffset: { width: 1, height: 1 },
                            textShadowRadius: 3,
                          },
                        ]}
                      >
                        {item.title}
                      </Text>
                    </View>
                  </TouchableOpacity>
                )}
              />
            </View>
          </MotiView>
        );

      case "events":
        return (
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: "timing", duration: 500, delay }}
          >
            <View
              style={[styles.section, { marginBottom: 100, marginTop: 10 }]}
            >
              <View style={styles.sectionHeader}>
                <TouchableOpacity>
                  <Text
                    style={[
                      styles.viewMoreText,
                      { color: theme.colors.textSecondary },
                    ]}
                  >
                    عرض الكل ›
                  </Text>
                </TouchableOpacity>
                <Text
                  style={[styles.sectionTitle, { color: theme.colors.text }]}
                >
                  فعاليات قادمة
                </Text>
              </View>
              <FlatList
                data={item.data}
                keyExtractor={(item) => item.id}
                renderItem={renderEventItem}
                contentContainerStyle={{ paddingHorizontal: 1 }}
              />
            </View>
          </MotiView>
        );

      default:
        return null;
    }
  };

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      {/* Animated Header */}
      <Animated.View
        style={[styles.animatedHeader, { opacity: headerOpacity }]}
      >
        {/* {Platform.OS === "ios" ? (
          <BlurView
            intensity={80}
            tint={isDarkMode ? "dark" : "light"}
            style={styles.blurView}
          >
            <View
              style={[
                styles.headerContent,
                {
                  backgroundColor: isDarkMode
                    ? "rgba(30,30,30,0.7)"
                    : "rgba(255,255,255,0.7)",
                },
              ]}
            >
              <View style={styles.headerActions}>
                <TouchableOpacity style={styles.iconButton}>
                  <Icon name="bell" size={24} color={theme.colors.accent} />
                  <View style={styles.notificationBadge}>
                    <Text style={styles.badgeText}>3</Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity style={styles.iconButton}>
                  <Icon name="search" size={24} color={theme.colors.accent} />
                </TouchableOpacity>
              </View>
              <Image
                source={
                  isDarkMode
                    ? require("../../assets/white_logo.png")
                    : require("../../assets/colored_logo.png")
                }
                style={styles.headerLogo}
                resizeMode="contain"
              />
            </View>
          </BlurView>
        ) : ( */}
        <View
          style={[
            styles.headerContent,
            { backgroundColor: isDarkMode ? theme.colors.surface : "#fff" },
          ]}
        >
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.iconButton}>
              <Icon name="bell" size={24} color={theme.colors.accent} />
              <View style={styles.notificationBadge}>
                <Text style={styles.badgeText}>3</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton}>
              <Icon name="search" size={24} color={theme.colors.accent} />
            </TouchableOpacity>
          </View>
          <Image
            source={
              isDarkMode
                ? require("../../assets/white_logo.png")
                : require("../../assets/colored_logo.png")
            }
            style={styles.headerLogo}
            resizeMode="contain"
          />
        </View>
        {/* )} */}
      </Animated.View>
      <Animated.FlatList
        data={sections}
        keyExtractor={(item) => item.type}
        renderItem={renderSection}
        ListHeaderComponent={
          <Animated.View
            style={[
              styles.logoContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: translateY }, { scale: logoScale }],
              },
            ]}
          >
            <Image
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
              }}
              resizeMode="contain"
            />
          </Animated.View>
        }
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.accent]}
            tintColor={theme.colors.accent}
            progressViewOffset={30}
            progressBackgroundColor={isDarkMode ? "#2D3250" : "#fff"}
            titleColor={theme.colors.accent}
          />
        }
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      />

      {/* Category Selection Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.centeredView}>
          <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
            <Animated.View
              style={[
                styles.modalOverlay,
                {
                  opacity: modalVisible ? 1 : 0,
                  backgroundColor: "rgba(0, 0, 0, 0.5)",
                },
              ]}
            />
          </TouchableWithoutFeedback>
          <MotiView
            from={{ opacity: 0, scale: 0.8, translateY: 50 }}
            animate={{ opacity: 1, scale: 1, translateY: 0 }}
            exit={{ opacity: 0, scale: 0.8, translateY: 50 }}
            transition={{ type: "timing", duration: 300 }}
            style={[
              styles.modalView,
              {
                backgroundColor: theme.colors.surface,
                borderColor: isDarkMode
                  ? "rgba(255,255,255,0.1)"
                  : "transparent",
                borderWidth: isDarkMode ? 1 : 0,
              },
            ]}
          >
            <FlatList
              data={categories}
              keyExtractor={(item, index) => item._id || index.toString()}
              contentContainerStyle={styles.modalContent}
              renderItem={({ item }) => (
                <View
                  style={[
                    styles.modalCard,
                    {
                      backgroundColor: isDarkMode
                        ? "rgba(255,255,255,0.05)"
                        : "#f5f5f5",
                      borderColor: isDarkMode
                        ? "rgba(255,255,255,0.1)"
                        : "#eee",
                    },
                  ]}
                >
                  {item.image && (
                    <Image
                      source={{ uri: item.image }}
                      style={styles.modalImage}
                    />
                  )}
                  <View style={styles.modalTextContainer}>
                    {item.title && (
                      <Text
                        style={[
                          styles.modalTitle,
                          { color: theme.colors.text },
                        ]}
                      >
                        {item.title}
                      </Text>
                    )}
                    {item.description && (
                      <Text
                        style={[
                          styles.modalDescription,
                          { color: theme.colors.textSecondary },
                        ]}
                      >
                        {item.description}
                      </Text>
                    )}
                  </View>
                </View>
              )}
            />
          </MotiView>
        </View>
      </Modal>

      {/* Category Detail Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={categoryModalVisible}
        onRequestClose={() => setCategoryModalVisible(false)}
      >
        <View style={styles.centeredView}>
          <TouchableWithoutFeedback
            onPress={() => setCategoryModalVisible(false)}
          >
            <View style={styles.modalOverlay} />
          </TouchableWithoutFeedback>

          <MotiView
            from={{ opacity: 0, scale: 0.9, translateY: 30 }}
            animate={{ opacity: 1, scale: 1, translateY: 0 }}
            transition={{ type: "timing", duration: 250 }}
            style={[
              styles.categoryModalView,
              {
                backgroundColor: theme.colors.surface,
                borderColor: isDarkMode
                  ? "rgba(255,255,255,0.1)"
                  : "transparent",
                borderWidth: isDarkMode ? 1 : 0,
                shadowColor: isDarkMode ? "#000" : "#000",
                shadowOffset: { width: 0, height: isDarkMode ? 8 : 2 },
                shadowOpacity: isDarkMode ? 0.5 : 0.25,
                shadowRadius: isDarkMode ? 12 : 4,
                elevation: isDarkMode ? 10 : 5,
              },
            ]}
          >
            {selectedCategory && (
              <>
                <TouchableOpacity
                  style={[
                    styles.closeButton,
                    {
                      backgroundColor: isDarkMode
                        ? "rgba(0,0,0,0.7)"
                        : "rgba(0,0,0,0.4)",
                    },
                  ]}
                  onPress={() => setCategoryModalVisible(false)}
                >
                  <Icon
                    name="times"
                    size={20}
                    color={isDarkMode ? theme.colors.accent : "#fff"}
                  />
                </TouchableOpacity>

                <Image
                  source={{ uri: selectedCategory.image }}
                  style={[
                    styles.categoryModalImage,
                    isDarkMode && { opacity: 0.9 }, // Slightly dim image in dark mode
                  ]}
                  resizeMode="cover"
                />

                <View style={styles.categoryModalContent}>
                  <Text
                    style={[
                      styles.categoryModalTitle,
                      {
                        color: theme.colors.text,
                        ...(isDarkMode && {
                          textShadowColor: theme.colors.accent,
                          textShadowOffset: { width: 0, height: 0 },
                          textShadowRadius: 3,
                          opacity: 0.95,
                        }),
                      },
                    ]}
                  >
                    {selectedCategory.title}
                  </Text>

                  {selectedCategory.description && (
                    <Text
                      style={[
                        styles.categoryModalDescription,
                        { color: theme.colors.textSecondary },
                      ]}
                    >
                      {selectedCategory.description}
                    </Text>
                  )}

                  <TouchableOpacity
                    style={[
                      styles.categoryModalButton,
                      { backgroundColor: theme.colors.accent },
                    ]}
                  >
                    <Text
                      style={[
                        styles.categoryModalButtonText,
                        { color: isDarkMode ? "#2D3250" : "#FFFFFF" },
                      ]}
                    >
                      استكشف المزيد
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </MotiView>
        </View>
      </Modal>
    </View>
  );
};

// Add this animation utility function to enhance button presses
const TouchableScale = ({ children, onPress, style }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 4,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  return (
    <TouchableOpacity
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <Animated.View style={[style, { transform: [{ scale: scaleAnim }] }]}>
        {children}
      </Animated.View>
    </TouchableOpacity>
  );
};

export default App;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor will be applied dynamically
  },
  scrollContent: {
    paddingBottom: 30,
  },

  card: {
    width: 250,
    height: 300,
    // backgroundColor applied dynamically
    borderRadius: 15,
    overflow: "hidden",
    marginHorizontal: 10,
    alignItems: "flex-end",
    // Shadow styles applied dynamically
  },
  image: {
    width: "100%",
    height: "100%",
    position: "absolute",
  },
  priceText: {
    marginVertical: 5,
    fontSize: 18,
    fontWeight: "normal",
    // Color applied dynamically
  },

  ribbon: {
    position: "absolute",
    top: 15,
    right: -40,
    backgroundColor: "#D72638",
    paddingVertical: 5,
    paddingHorizontal: 50,
    transform: [{ rotate: "30deg" }],
  },
  ribbonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 12,
  },

  heart: {
    position: "absolute",
    top: 10,
    left: 10,
    padding: 5,
  },

  cardText: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    padding: 10,
    alignItems: "flex-end",
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
  },

  title: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },
  description: {
    fontSize: 12,
    color: "#ddd",
    marginBottom: 5,
    textAlign: "right",
  },

  button: {
    // backgroundColor applied dynamically
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignSelf: "flex-end",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  buttonText: {
    // color applied dynamically
    fontSize: 12,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
    marginTop: 15,
  },

  marginHorizontal: 10,
  title2: {
    fontSize: 16,
    fontWeight: "bold",
    // color applied dynamically
    marginHorizontal: 20,
  },

  more: {
    fontSize: 14,
    // color applied dynamically
    marginHorizontal: 10,
  },

  overlay: {
    position: "absolute",
    width: "100%",
    height: "100%",
    // backgroundColor applied dynamically
    justifyContent: "center",
    alignItems: "center",
  },
  card2: {
    width: 150,
    height: 120,
    borderRadius: 20,
    overflow: "hidden",
    marginHorizontal: 10,
    // backgroundColor applied dynamically
  },
  text: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },

  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.6)", // Increase opacity for better dark mode visibility
  },
  modalView: {
    width: "90%",
    height: "70%",
    // backgroundColor applied dynamically
    borderRadius: 20,
    padding: 15,
    // Shadow styles applied dynamically
  },
  modalContent: {
    paddingBottom: 15,
  },
  modalCard: {
    width: "100%",
    marginBottom: 15,
    borderRadius: 10,
    overflow: "hidden",
    // backgroundColor applied dynamically
    // Shadow styles applied dynamically
  },
  modalImage: {
    width: "100%",
    height: 140,
    resizeMode: "cover",
  },
  modalTextContainer: {
    padding: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    // color applied dynamically
    textAlign: "center",
    marginBottom: 8,
  },
  modalDescription: {
    fontSize: 14,
    // color applied dynamically
    textAlign: "center",
    lineHeight: 20,
  },
  section: {
    marginBottom: 25,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    // color applied dynamically
    textAlign: "right",
    marginHorizontal: 5,
    marginTop: 5,
  },
  viewMoreText: {
    fontSize: 14,
    // color applied dynamically
    fontFamily: "ArabicRegular",
  },
  eventCard: {
    flexDirection: "row",
    // backgroundColor applied dynamically
    borderRadius: 15,
    overflow: "hidden",
    marginHorizontal: 20,
    marginBottom: 15,
    // Shadow styles applied dynamically
    height: 100,
  },
  eventImage: {
    width: "41%",
    height: "100%",
  },
  eventContent: {
    flex: 1,
    padding: 15,
    justifyContent: "center",
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: "bold",
    // color applied dynamically
    marginBottom: 10,
    textAlign: "right",
    fontFamily: "ArabicBold",
  },
  eventDetails: {
    alignItems: "flex-end",
  },
  eventDetail: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  eventDetailText: {
    fontSize: 12,
    // color applied dynamically
    marginRight: 5,
    fontFamily: "ArabicRegular",
  },
  animatedHeader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
  },
  blurView: {
    overflow: "hidden",
    paddingTop: 50,
    paddingBottom: 10,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "ios" ? 50 : 40,
    paddingBottom: 10,
  },
  headerLogo: {
    height: 30,
    width: 120,
  },
  headerActions: {
    flexDirection: "row",
  },
  iconButton: {
    marginLeft: 15,
    position: "relative",
  },
  notificationBadge: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: "#D72638",
    borderRadius: 10,
    width: 18,
    height: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  badgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
  },
  scrollContent: {
    paddingTop: 45,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  categoryModalView: {
    width: "85%",
    // backgroundColor applied dynamically
    borderRadius: 15,
    overflow: "hidden",
    // Shadow styles applied dynamically
  },
  closeButton: {
    position: "absolute",
    top: 10,
    right: 10,
    zIndex: 10,
    backgroundColor: "rgba(0, 0, 0, 0.6)", // Darker for better visibility
    padding: 8,
    borderRadius: 20,
  },
  categoryModalImage: {
    width: "100%",
    height: 180,
  },
  categoryModalContent: {
    padding: 20,
    alignItems: "center",
  },
  categoryModalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    // color applied dynamically
    marginBottom: 10,
    textAlign: "center",
  },
  categoryModalDescription: {
    fontSize: 16,
    // color applied dynamically
    marginBottom: 20,
    textAlign: "center",
    lineHeight: 24,
  },
  categoryModalButton: {
    // backgroundColor applied dynamically
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 10,
    marginTop: 10,
  },
  categoryModalButtonText: {
    // color applied dynamically
    fontSize: 16,
    fontWeight: "bold",
  },
});
