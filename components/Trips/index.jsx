import React, { useEffect, useState, useRef } from "react";
import {
  View,
  ScrollView,
  Text,
  Image,
  Alert,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  RefreshControl,
  Animated,
  Platform,
  Modal,
  Pressable,
} from "react-native";
import { Card } from "react-native-paper";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { MaterialIcons, Ionicons, FontAwesome5 } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { MotiView, MotiText } from "moti";
import Carousel from "react-native-reanimated-carousel";
import { useTheme } from "../../context/ThemeContext"; // Import useTheme

const { width } = Dimensions.get("window");

const Trips = ({ myHandle }) => {
  const [trips, setTrips] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("all");
  const navigation = useNavigation();
  const scrollY = new Animated.Value(0);
  const { theme, isDarkMode } = useTheme(); // Destructure both theme AND isDarkMode
  const fadeAnim = useRef(new Animated.Value(1)).current; // Add missing fadeAnim

  // Add state variables for delete alert
  const [deleteAlertVisible, setDeleteAlertVisible] = useState(false);
  const [tripToDelete, setTripToDelete] = useState(null);

  // Add state for success/error alerts
  const [statusAlertVisible, setStatusAlertVisible] = useState(false);
  const [statusAlertType, setStatusAlertType] = useState("success"); // "success" or "error"
  const [statusAlertMessage, setStatusAlertMessage] = useState("");

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [1, 0.9],
    extrapolate: "clamp",
  });

  const fetchTrips = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        navigation.navigate("Login");
        return;
      }

      const response = await axios.get(
        "https://iti-server-production.up.railway.app/api/createprogram",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTrips(response.data);
    } catch (error) {
      Alert.alert("خطأ", "فشل في تحميل الرحلات");
      console.error(error);
    }
  };

  // Update the handleDelete function to show custom alert
  const handleDelete = (id) => {
    setTripToDelete(id);
    setDeleteAlertVisible(true);
  };

  // Add confirmDelete function to perform the actual deletion
  const confirmDelete = async () => {
    if (tripToDelete) {
      try {
        const token = await AsyncStorage.getItem("token");
        await axios.delete(
          `https://iti-server-production.up.railway.app/api/createprogram/${tripToDelete}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        // Hide delete alert and reset state
        setDeleteAlertVisible(false);
        setTripToDelete(null);

        // Refresh trips
        fetchTrips();

        // Show success alert instead of standard Alert
        setStatusAlertType("success");
        setStatusAlertMessage("تم حذف الرحلة بنجاح");
        setStatusAlertVisible(true);

        // Auto-hide after 3 seconds
        setTimeout(() => {
          setStatusAlertVisible(false);
        }, 3000);
      } catch (error) {
        setDeleteAlertVisible(false);

        // Show error alert instead of standard Alert
        setStatusAlertType("error");
        setStatusAlertMessage("فشل في حذف الرحلة");
        setStatusAlertVisible(true);

        // Auto-hide after 3 seconds
        setTimeout(() => {
          setStatusAlertVisible(false);
        }, 3000);
      }
    }
  };

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await fetchTrips();
    setRefreshing(false);
  }, []);

  useEffect(() => {
    fetchTrips();
  }, []);

  const FilterButton = ({ title, value }) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        {
          backgroundColor: theme.isDarkMode ? theme.colors.surface : "#EDF2F7",
        },
        selectedFilter === value && { backgroundColor: theme.colors.primary },
      ]}
      onPress={() => setSelectedFilter(value)}
    >
      <Text
        style={[
          styles.filterButtonText,
          { color: theme.colors.textSecondary },
          selectedFilter === value && {
            color: theme.isDarkMode ? "#000000" : "#FFFFFF",
          },
        ]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );

  const renderTripStatus = (trip) => {
    const status = trip.status || "upcoming";
    const statusConfig = {
      completed: { color: "#4CAF50", text: "مكتملة", icon: "check-circle" },
      upcoming: { color: "#2196F3", text: "قادمة", icon: "schedule" },
      cancelled: { color: "#F44336", text: "ملغاة", icon: "cancel" },
    };

    const config = statusConfig[status];

    return (
      <View style={[styles.statusBadge, { backgroundColor: config.color }]}>
        <MaterialIcons name={config.icon} size={16} color="white" />
        <Text style={styles.statusText}>{config.text}</Text>
      </View>
    );
  };

  const renderTimeline = (trip) => {
    const places = trip.selectedTripPlaces[0]?.split(" -- ") || [];
    return (
      <MotiView
        from={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ type: "timing" }}
        style={styles.timelineContainer}
      >
        <Text style={styles.sectionTitle}>خط سير الرحلة</Text>
        <View style={styles.timeline}>
          {places.map((place, index) => (
            <View key={index} style={styles.timelineItem}>
              <View style={styles.timelineDot} />
              {index !== places.length - 1 && (
                <View style={styles.timelineLine} />
              )}
              <Text style={styles.timelineText}>{place}</Text>
            </View>
          ))}
        </View>
      </MotiView>
    );
  };

  const renderTripCard = (trip) => (
    <MotiView
      key={trip._id}
      from={{ opacity: 0, translateY: 50 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: "spring", delay: 100 }}
    >
      <Card style={[styles.tripCard, { backgroundColor: theme.colors.card }]}>
        <View style={styles.carouselContainer}>
          <Carousel
            loop
            width={width - 40}
            height={200}
            autoPlay={true}
            data={trip.images}
            scrollAnimationDuration={1000}
            renderItem={({ item }) => (
              <Image source={{ uri: item }} style={styles.tripImage} />
            )}
          />
        </View>

        <LinearGradient
          colors={["rgba(0,0,0,0.7)", "transparent"]}
          style={styles.cardGradient}
        >
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDelete(trip._id)}
          >
            <MaterialIcons name="delete-outline" size={24} color="white" />
          </TouchableOpacity>
          {renderTripStatus(trip)}
        </LinearGradient>

        <View style={styles.tripDetails}>
          <View style={styles.detailRow}>
            <View
              style={[
                styles.detailItem,
                {
                  backgroundColor: theme.isDarkMode
                    ? "rgba(255,255,255,0.1)"
                    : "rgba(74,114,172,0.08)",
                },
              ]}
            >
              <FontAwesome5
                name="money-bill-wave"
                marginLeft={10}
                size={20}
                color={theme.isDarkMode ? theme.colors.primary : "#f1c40f"}
              />
              <Text style={[styles.detailText, { color: theme.colors.text }]}>
                {trip.budget.toLocaleString()} جنيه
              </Text>
            </View>
            <View
              style={[
                styles.detailItem,
                {
                  backgroundColor: theme.isDarkMode
                    ? "rgba(255,255,255,0.1)"
                    : "rgba(74,114,172,0.08)",
                },
              ]}
            >
              <MaterialIcons
                name="place"
                size={20}
                color={theme.isDarkMode ? theme.colors.primary : "#e74c3c"}
              />
              <Text style={[styles.detailText, { color: theme.colors.text }]}>
                {trip.locate}
              </Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <View
              style={[
                styles.detailItem,
                {
                  backgroundColor: theme.isDarkMode
                    ? "rgba(255,255,255,0.1)"
                    : "rgba(74,114,172,0.08)",
                },
              ]}
            >
              <Ionicons
                name="people"
                size={20}
                color={theme.isDarkMode ? theme.colors.primary : "#4a72ac"}
              />
              <Text style={[styles.detailText, { color: theme.colors.text }]}>
                {trip.numberOfPersons} أشخاص
              </Text>
            </View>
            <View
              style={[
                styles.detailItem,
                {
                  backgroundColor: theme.isDarkMode
                    ? "rgba(255,255,255,0.1)"
                    : "rgba(74,114,172,0.08)",
                },
              ]}
            >
              <MaterialIcons
                name="category"
                size={20}
                color={theme.isDarkMode ? theme.colors.primary : "#2ecc71"}
              />
              <Text style={[styles.detailText, { color: theme.colors.text }]}>
                {trip.typeOfProgram}
              </Text>
            </View>
          </View>
        </View>

        <MotiView
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ type: "timing" }}
          style={[
            styles.timelineContainer,
            {
              borderTopColor: theme.isDarkMode
                ? theme.colors.border
                : "#f0f0f0",
            },
          ]}
        >
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            خط سير الرحلة
          </Text>
          <View style={styles.timeline}>
            {(trip.selectedTripPlaces[0]?.split(" -- ") || []).map(
              (place, index, array) => (
                <View key={index} style={styles.timelineItem}>
                  <View
                    style={[
                      styles.timelineDot,
                      { backgroundColor: theme.colors.primary },
                    ]}
                  />
                  {index !== array.length - 1 && (
                    <View
                      style={[
                        styles.timelineLine,
                        { backgroundColor: theme.colors.primary },
                      ]}
                    />
                  )}
                  <Text
                    style={[styles.timelineText, { color: theme.colors.text }]}
                  >
                    {place}
                  </Text>
                </View>
              )
            )}
          </View>
        </MotiView>
      </Card>
    </MotiView>
  );

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <Animated.View style={[styles.header, { opacity: headerOpacity }]}>
        <View
          style={{
            height: 70,
            flexDirection: "column",
            alignItems: "center",
            backgroundColor: theme.colors.background,
          }}
        >
          <Image
            source={
              theme.isDarkMode
                ? require("../../assets/white_logo.png")
                : require("../../assets/colored_logo.png")
            }
            style={{
              objectFit: "contain",
              width: 175,
              height: 40,
              alignSelf: "center",
            }}
          />
        </View>
      </Animated.View>

      <View style={styles.navigationBar}>
        <TouchableOpacity
          style={[
            styles.backButton,
            {
              backgroundColor: isDarkMode
                ? "rgba(246,177,122,0.2)"
                : "rgba(50,86,141,0.1)",
            },
          ]}
          onPress={() => myHandle(false)}
        >
          <MaterialIcons
            name="arrow-back-ios"
            size={16}
            color={theme.colors.primary}
          />
          <Text
            style={[styles.backButtonText, { color: theme.colors.primary }]}
          >
            رجوع
          </Text>
        </TouchableOpacity>
        <View
          style={[
            styles.badgeContainer,
            {
              backgroundColor: isDarkMode
                ? "rgba(246,177,122,0.2)"
                : "rgba(50,86,141,0.1)",
            },
          ]}
        >
          <Text style={[styles.badgeText, { color: theme.colors.primary }]}>
            رحلاتي ({trips.length})
          </Text>
        </View>
      </View>

      <View style={styles.filterContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          <FilterButton title="الكل" value="all" />
          <FilterButton title="القادمة" value="upcoming" />
          <FilterButton title="المكتملة" value="completed" />
          <FilterButton title="الملغاة" value="cancelled" />
        </ScrollView>
      </View>

      <Animated.ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            // Customize colors based on theme
            tintColor={isDarkMode ? theme.colors.accent : theme.colors.primary}
            titleColor={theme.colors.text}
            colors={[
              isDarkMode ? theme.colors.accent : theme.colors.primary,
              isDarkMode ? "#f6b17a" : "#4a72ac",
              isDarkMode ? "#f8c8a3" : "#32568d",
            ]}
            progressBackgroundColor={isDarkMode ? "#424769" : "#ffffff"}
          />
        }
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
      >
        {trips.map(renderTripCard)}
      </Animated.ScrollView>

      {/* Add custom delete alert modal */}
      <Modal visible={deleteAlertVisible} transparent animationType="fade">
        <Pressable
          style={[
            styles.alertModal,
            {
              backgroundColor: isDarkMode
                ? "rgba(0,0,0,0.8)"
                : "rgba(0,0,0,0.6)",
            },
          ]}
          onPress={() => setDeleteAlertVisible(false)}
        >
          <Animated.View
            style={[
              styles.alertContent,
              {
                backgroundColor: isDarkMode ? theme.colors.surface : "white",
              },
            ]}
          >
            <View
              style={[
                styles.alertIconContainer,
                {
                  backgroundColor: isDarkMode
                    ? "rgba(231, 76, 60, 0.2)"
                    : "rgba(231, 76, 60, 0.1)",
                },
              ]}
            >
              <MaterialIcons name="delete" size={36} color="#e74c3c" />
            </View>
            <Text
              style={[
                styles.alertTitle,
                {
                  color: theme.colors.text,
                },
              ]}
            >
              تأكيد الحذف
            </Text>
            <Text
              style={[
                styles.alertMessage,
                {
                  color: theme.colors.textSecondary,
                },
              ]}
            >
              هل أنت متأكد من حذف هذه الرحلة؟
            </Text>
            <View style={styles.alertButtonsContainer}>
              <TouchableOpacity
                style={[
                  styles.alertButton,
                  {
                    backgroundColor: isDarkMode
                      ? "rgba(189, 195, 199, 0.2)"
                      : "#f5f5f5",
                    marginRight: 10,
                  },
                ]}
                onPress={() => setDeleteAlertVisible(false)}
              >
                <Text
                  style={[styles.alertButtonText, { color: theme.colors.text }]}
                >
                  إلغاء
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.alertButton,
                  {
                    backgroundColor: isDarkMode
                      ? "rgba(231, 76, 60, 0.8)"
                      : "#e74c3c",
                  },
                ]}
                onPress={confirmDelete}
              >
                <Text style={styles.alertButtonText}>حذف</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </Pressable>
      </Modal>

      {/* Custom success/error status alert */}
      <Modal visible={statusAlertVisible} transparent animationType="fade">
        <Pressable
          style={[
            styles.alertModal,
            {
              backgroundColor: isDarkMode
                ? "rgba(0,0,0,0.6)"
                : "rgba(0,0,0,0.4)",
            },
          ]}
          onPress={() => setStatusAlertVisible(false)}
        >
          <Animated.View
            style={[
              styles.statusAlertContent,
              {
                backgroundColor: isDarkMode ? theme.colors.surface : "white",
                borderLeftWidth: 4,
                borderLeftColor:
                  statusAlertType === "success" ? "#2ecc71" : "#e74c3c",
              },
            ]}
          >
            <View
              style={[
                styles.statusAlertIconContainer,
                {
                  backgroundColor:
                    statusAlertType === "success"
                      ? isDarkMode
                        ? "rgba(46, 204, 113, 0.2)"
                        : "rgba(46, 204, 113, 0.1)"
                      : isDarkMode
                      ? "rgba(231, 76, 60, 0.2)"
                      : "rgba(231, 76, 60, 0.1)",
                },
              ]}
            >
              <MaterialIcons
                name={statusAlertType === "success" ? "check-circle" : "error"}
                size={32}
                color={statusAlertType === "success" ? "#2ecc71" : "#e74c3c"}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={[
                  styles.statusAlertTitle,
                  {
                    color: theme.colors.text,
                  },
                ]}
              >
                {statusAlertType === "success" ? "نجاح" : "خطأ"}
              </Text>
              <Text
                style={[
                  styles.statusAlertMessage,
                  {
                    color: theme.colors.textSecondary,
                  },
                ]}
              >
                {statusAlertMessage}
              </Text>
            </View>
          </Animated.View>
        </Pressable>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },
  header: {
    position: "absolute",
    top: 45,
    left: 0,
    right: 0,
  },
  blurContainer: {
    alignItems: "center",
    paddingTop: 40,
    paddingBottom: 20,
    backgroundColor: "rgba(255,255,255,0.85)",
  },
  logo: {
    height: 30,
    width: 175,
  },
  navigationBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 90,
    paddingBottom: 15,
    marginTop: 10,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(50,86,141,0.1)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  backButtonText: {
    color: "#32568d",
    fontSize: 16,
    fontWeight: "600",
    marginRight: 5,
  },
  badgeContainer: {
    backgroundColor: "rgba(50,86,141,0.1)",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  badgeText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#32568d",
  },
  filterContainer: {
    paddingHorizontal: 20,
    marginBottom: 10,
    zIndex: 100,
  },
  filterScroll: {
    paddingVertical: 10,
    flexDirection: "row-reverse",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  filterButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#EDF2F7",
    marginRight: 10,
  },
  filterButtonActive: {
    backgroundColor: "#32568d",
  },
  filterButtonText: {
    color: "#4A5568",
    fontWeight: "600",
  },
  filterButtonTextActive: {
    color: "white",
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 60,
  },
  tripCard: {
    marginBottom: 25,
    borderRadius: 25,
    overflow: "hidden",
    backgroundColor: "white",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  cardGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 60,
    zIndex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: 15,
    paddingTop: 15,
  },
  deleteButton: {
    padding: 5,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 18,
    position: "absolute",
    right: 15,
    top: 15,
  },
  statusText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 5,
  },
  carouselContainer: {
    marginBottom: 15,
  },
  tripImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  tripDetails: {
    padding: 20,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  detailItem: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(74,114,172,0.08)",
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 12,
    minWidth: "45%",
  },
  detailText: {
    fontSize: 14,
    color: "#2D3748",
    marginLeft: 10,
    fontWeight: "600",
  },
  timelineContainer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#2D3250",
    marginBottom: 15,
    textAlign: "right",
  },
  timeline: {
    marginLeft: 10,
  },
  timelineItem: {
    flexDirection: "row-reverse",
    alignItems: "center",
    marginBottom: 20,
  },
  timelineDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#4a72ac",
    marginLeft: 10,
  },
  timelineLine: {
    position: "absolute",
    left: 6,
    top: 20,
    width: 2,
    height: 25,
    backgroundColor: "#4a72ac",
    opacity: 0.3,
  },
  timelineText: {
    fontSize: 14,
    color: "#4a5568",
    lineHeight: 22,
    flex: 1,
    textAlign: "right",
    fontWeight: "500",
  },
  headerContainer: {
    alignItems: "center",
    marginVertical: 20,
    paddingHorizontal: 15,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 10,
    textAlign: "center",
  },
  // Add alert styles
  alertModal: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  alertContent: {
    backgroundColor: "white",
    borderRadius: 25,
    padding: 20,
    alignItems: "center",
    width: "80%",
    maxWidth: 350,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
      },
      android: {
        elevation: 15,
      },
    }),
  },
  alertIconContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
    backgroundColor: "rgba(231, 76, 60, 0.1)",
  },
  alertTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 10,
    textAlign: "center",
  },
  alertMessage: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  alertButtonsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
  },
  alertButton: {
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 12,
    marginTop: 10,
  },
  alertButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  // Add styles for status alert
  statusAlertContent: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 18,
    padding: 20,
    width: "85%",
    maxWidth: 380,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  statusAlertIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  statusAlertTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 5,
    textAlign: "right",
  },
  statusAlertMessage: {
    fontSize: 15,
    textAlign: "right",
  },
});

export default Trips;
