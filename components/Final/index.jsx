import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Image,
  StyleSheet,
  ScrollView,
  Animated,
  Dimensions,
  Modal,
  Platform,
  TouchableOpacity,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { Text } from "react-native-paper";
import { MaterialIcons, Ionicons, FontAwesome } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { MotiView } from "moti";
import Carousel from "react-native-reanimated-carousel";
import { useNavigation } from "@react-navigation/native";
import { useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useTheme } from "../../context/ThemeContext";

const { width } = Dimensions.get("window");

const Final = ({ myHandle, myFirst }) => {
  const { theme, isDarkMode } = useTheme();
  const navigation = useNavigation();

  // State management
  const [places, setPlaces] = useState([]);
  const [program, setProgram] = useState({});
  const [programNames, setProgramNames] = useState("");
  const [images, setImages] = useState([]);
  const [showAlert, setShowAlert] = useState(false);
  const [alertType, setAlertType] = useState("success");
  const [alertMessage, setAlertMessage] = useState("");

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const scrollY = useRef(new Animated.Value(0)).current;
  const hasScrolled = useRef(false);

  // Load data on focus
  useFocusEffect(
    React.useCallback(() => {
      const getData = async () => {
        try {
          const placesValue = await AsyncStorage.getItem("savedPlaces");
          const savedPlaces = placesValue ? JSON.parse(placesValue) : [];
          setPlaces(savedPlaces);

          const programValue = await AsyncStorage.getItem("programData");
          const savedProgram = programValue ? JSON.parse(programValue) : {};
          setProgram(savedProgram);

          // Join the program names with "--"
          const programNames = savedPlaces
            .map((place) => place.name)
            .join(" -- ");
          setProgramNames(programNames);

          // Store all images in state array
          const images = savedPlaces.map((place) => place.image);
          setImages(images);
        } catch (error) {
          console.error("Error loading data:", error);
        }
      };
      getData();
    }, [])
  );

  // Booking handler
  const handleBookingConfirm = async () => {
    try {
      // Show loading state
      setAlertType("loading");
      setAlertMessage("جاري إضافة البرنامج...");
      setShowAlert(true);

      // Retrieve required data from AsyncStorage
      const [token, savedPlaces, programData] = await Promise.all([
        AsyncStorage.getItem("token"),
        AsyncStorage.getItem("savedPlaces"),
        AsyncStorage.getItem("programData"),
      ]);

      // Validate data exists
      if (!token || !savedPlaces || !programData) {
        throw new Error("بيانات غير مكتملة");
      }

      const parsedPlaces = JSON.parse(savedPlaces);
      const parsedProgram = JSON.parse(programData);

      // Prepare payload
      const payload = {
        numberOfPersons: parsedProgram.people,
        locate: parsedProgram.destination,
        budget: parsedProgram.amount,
        typeOfProgram: parsedProgram.category,
        selectedTripPlaces: parsedPlaces.map((p) => p.name).join(" -- "),
        images: parsedPlaces.map((p) => p.image),
      };

      // Send POST request
      await axios.post(
        "https://iti-server-production.up.railway.app/api/createprogram",
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Show success alert
      setAlertType("success");
      setAlertMessage("تم إضافة البرنامج بنجاح ✅");
      setShowAlert(true);

      // Clear storage and navigate after delay
      setTimeout(async () => {
        try {
          await AsyncStorage.multiRemove(["savedPlaces", "programData"]);
          setShowAlert(false);
          myFirst(false);
          navigation.navigate("الرئيسية");
        } catch (error) {
          console.error("Error during cleanup:", error);
        }
      }, 2500); // Reduced from 3500ms to 2500ms for better UX
    } catch (error) {
      console.error("Error saving program:", error);
      setAlertType("error");
      setAlertMessage(error.message || "فشل في حفظ البرنامج");
      setShowAlert(true);
    }
  };

  // Animation on mount
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Carousel renderer
  const renderCarouselItem = ({ item }) => (
    <MotiView
      from={{ opacity: 0, translateX: 50 }}
      animate={{ opacity: 1, translateX: 0 }}
      transition={{ delay: 200 }}
      style={styles.carouselItem}
    >
      <Image source={{ uri: item }} style={styles.carouselImage} />
    </MotiView>
  );

  return (
    <Animated.View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      {/* Fixed Header Section - Modified to stay in place */}
      <View
        style={[
          styles.fixedHeader,
          {
            backgroundColor: isDarkMode ? theme.colors.surface : "white",
            paddingTop: Platform.OS === "ios" ? 50 :35,
          },
        ]}
      >
        <View style={styles.logoContainer}>
          <Image
            source={
              isDarkMode
                ? require("../../assets/white_logo.png")
                : require("../../assets/colored_logo.png")
            }
            style={styles.logo}
          />
          <Text style={[styles.headerText, { color: theme.colors.text }]}>
            الاماكن المقترحة
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContainer, { paddingTop: 155 }]} // Increased paddingTop to account for fixed header
        scrollEventThrottle={16}
      >
        {/* Image Carousel */}
        <MotiView
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 400 }}
          style={styles.carouselContainer}
        >
          {images && images.length > 0 ? (
            <Carousel
              loop={true}
              width={Math.floor(width - 40)}
              height={220}
              autoPlay={true}
              data={images}
              scrollAnimationDuration={500}
              renderItem={renderCarouselItem}
              mode="default"
              pagingEnabled={true}
              snapEnabled={true}
              defaultIndex={0}
            />
          ) : (
            <View
              style={{
                height: 220,
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: isDarkMode ? theme.colors.surface : "#f8f9fa",
              }}
            >
              <Text style={{ color: theme.colors.text }}>
                لا توجد صور متاحة
              </Text>
            </View>
          )}
        </MotiView>

        {/* Details Card */}
        <MotiView
          from={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 600 }}
          style={styles.detailsCard}
        >
          <LinearGradient
            colors={
              isDarkMode
                ? [theme.colors.surface, theme.colors.background]
                : ["#ffffff", "#f8f9fa"]
            }
            style={styles.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            {/* Details List */}
            <View
              style={{
                flexDirection: "column",
                backgroundColor: isDarkMode ? theme.colors.surface : "#f8f9fa",
                borderRadius: 12,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  padding: 10,
                }}
              >
                <View style={{ flexDirection: "row" }}>
                  <Text
                    style={[styles.detailText, { color: theme.colors.text }]}
                  >
                    الوجهة: {program.destination}
                  </Text>
                  <MaterialIcons
                    name="place"
                    size={24}
                    color={isDarkMode ? theme.colors.primary : "#e74c3c"}
                  />
                </View>
                <View style={{ flexDirection: "row" }}>
                  <Text
                    style={[styles.detailText, { color: theme.colors.text }]}
                  >
                    عدد المسافرين: {program.people}
                  </Text>
                  <Ionicons
                    name="people"
                    size={24}
                    color={isDarkMode ? theme.colors.primary : "#4a72ac"}
                  />
                </View>
              </View>

              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  padding: 10,
                }}
              >
                <View style={{ flexDirection: "row" }}>
                  <Text
                    style={[styles.detailText, { color: theme.colors.text }]}
                  >
                    الفئة: {program.category}
                  </Text>
                  <MaterialIcons
                    name="category"
                    size={24}
                    color={isDarkMode ? theme.colors.primary : "#2ecc71"}
                  />
                </View>
                <View style={{ flexDirection: "row" }}>
                  <Text
                    style={[styles.detailText, { color: theme.colors.text }]}
                  >
                    الميزانية: {program.amount} جنيه
                  </Text>
                  <FontAwesome
                    name="money"
                    size={24}
                    color={isDarkMode ? theme.colors.primary : "#f1c40f"}
                  />
                </View>
              </View>
            </View>

            {/* Program Timeline */}
            <MotiView
              from={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 800 }}
              style={styles.timelineContainer}
            >
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                خط سير الرحلة
              </Text>
              <View style={styles.timeline}>
                {programNames.split(" -- ").map((place, index) => (
                  <View key={index} style={styles.timelineItem}>
                    <View
                      style={[
                        styles.timelineDot,
                        {
                          backgroundColor: isDarkMode
                            ? theme.colors.primary
                            : "#4a72ac",
                        },
                      ]}
                    />
                    {index !== programNames.split(" -- ").length - 1 && (
                      <View
                        style={[
                          styles.timelineLine,
                          {
                            backgroundColor: isDarkMode
                              ? theme.colors.primary
                              : "#4a72ac",
                          },
                        ]}
                      />
                    )}
                    <Text
                      style={[
                        styles.timelineText,
                        { color: theme.colors.textSecondary },
                      ]}
                    >
                      {place}
                    </Text>
                  </View>
                ))}
              </View>
            </MotiView>
          </LinearGradient>
        </MotiView>
      </ScrollView>

      {/* Action Buttons */}
      <MotiView
        style={[
          styles.footerButtons,
          {
            backgroundColor: isDarkMode ? theme.colors.surface : "white",
          },
        ]}
        from={{ opacity: 0, translateY: 50 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: "timing", duration: 500 }}
      >
        {/* Confirm Button */}
        <TouchableOpacity
          style={[
            styles.navButton,
            styles.nextButton,
            {
              backgroundColor: isDarkMode ? theme.colors.primary : "#4a72ac",
            },
          ]}
          onPress={handleBookingConfirm}
        >
          <Text style={[styles.navButtonText, { color: "white" }]}>
            تأكيد الحجز
          </Text>
          <MaterialIcons name="check-circle" size={20} color="white" />
        </TouchableOpacity>

        {/* Back Button */}
        <TouchableOpacity
          style={[
            styles.navButton,
            styles.backButton,
            {
              backgroundColor: isDarkMode ? "rgba(246,177,122,0.2)" : "#f1f3f5",
            },
          ]}
          onPress={() => myHandle(false)}
        >
          <Text
            style={[
              styles.navButtonText,
              {
                color: isDarkMode ? theme.colors.primary : "#4a72ac",
              },
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

      {/* Alert Modal */}
      <Modal visible={showAlert} transparent animationType="fade">
        <Pressable
          style={[
            styles.alertModal,
            {
              backgroundColor: isDarkMode
                ? "rgba(0,0,0,0.8)"
                : "rgba(0,0,0,0.6)",
            },
          ]}
          onPress={() => alertType !== "loading" && setShowAlert(false)}
        >
          <Pressable
            style={[
              styles.alertContent,
              {
                backgroundColor: isDarkMode ? theme.colors.surface : "white",
              },
            ]}
            onPress={(e) => e.stopPropagation()}
          >
            <View
              style={[
                styles.alertIconContainer,
                {
                  backgroundColor:
                    alertType === "success"
                      ? isDarkMode
                        ? "rgba(46, 204, 113, 0.2)"
                        : "rgba(46, 204, 113, 0.1)"
                      : alertType === "error"
                      ? isDarkMode
                        ? "rgba(231, 76, 60, 0.2)"
                        : "rgba(231, 76, 60, 0.1)"
                      : isDarkMode
                      ? "rgba(70, 130, 180, 0.2)"
                      : "rgba(70, 130, 180, 0.1)",
                },
              ]}
            >
              {alertType === "loading" ? (
                <ActivityIndicator
                  size="large"
                  color={isDarkMode ? theme.colors.primary : "#4a72ac"}
                />
              ) : (
                <MaterialIcons
                  name={alertType === "success" ? "check-circle" : "error"}
                  size={36}
                  color={alertType === "success" ? "#2ecc71" : "#e74c3c"}
                />
              )}
            </View>
            <Text
              style={[
                styles.alertTitle,
                {
                  color: theme.colors.text,
                },
              ]}
            >
              {alertType === "success"
                ? "نجاح"
                : alertType === "error"
                ? "خطأ"
                : "انتظر..."}
            </Text>
            <Text
              style={[
                styles.alertMessage,
                {
                  color: theme.colors.textSecondary,
                },
              ]}
            >
              {alertMessage}
            </Text>
            {alertType !== "loading" && (
              <TouchableOpacity
                style={[
                  styles.alertButton,
                  {
                    backgroundColor:
                      alertType === "success"
                        ? isDarkMode
                          ? theme.colors.primary
                          : "#2ecc71"
                        : isDarkMode
                        ? theme.colors.primary
                        : "#e74c3c",
                  },
                ]}
                onPress={() => setShowAlert(false)}
              >
                <Text style={styles.alertButtonText}>حسناً</Text>
              </TouchableOpacity>
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </Animated.View>
  );
};

// Styles with unused styles removed
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  scrollContainer: {
    paddingTop: 140, // Increased to account for fixed header height
    paddingBottom: 150,
  },
  fixedHeader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    backgroundColor: "white",
    paddingBottom: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
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
  logoContainer: {
    alignItems: "center",
    marginTop: 10, // Reduced from 35 to look better with fixed header
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
  carouselContainer: {
    marginHorizontal: 15,
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 15,
  },
  carouselItem: {
    flex: 1,
    borderRadius: 20,
    overflow: "hidden",
  },
  carouselImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  detailsCard: {
    backgroundColor: "white",
    borderRadius: 25,
    marginHorizontal: 15,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  gradient: {
    padding: 25,
    borderRadius: 25,
  },
  detailText: {
    fontSize: 16,
    color: "#2D3250",
    marginRight: 15,
    fontWeight: "600",
  },
  timelineContainer: {
    marginTop: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#2D3250",
    marginBottom: 20,
    textAlign: "right",
  },
  timeline: {
    marginLeft: 10,
  },
  timelineItem: {
    flexDirection: "row-reverse",
    alignItems: "center",
    marginBottom: 25,
  },
  timelineDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#4a72ac",
    marginLeft: 10,
  },
  timelineLine: {
    position: "absolute",
    left: 7,
    top: 24,
    width: 2,
    height: 30,
    backgroundColor: "#4a72ac",
    opacity: 0.3,
  },
  timelineText: {
    fontSize: 14,
    color: "#666",
    lineHeight: 22,
    flex: 1,
    textAlign: "right",
  },
  footerButtons: {
    position: "absolute",
    bottom: 50,
    left: 0,
    right: 0,
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    zIndex: 1000,
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
    paddingVertical: 12,
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
  },
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
});

export default Final;
