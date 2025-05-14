import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Animated,
  Platform,
  KeyboardAvoidingView,
  Alert,
  Modal,
  Pressable,
  ActivityIndicator,
} from "react-native";
import {
  FontAwesome,
  Entypo,
  AntDesign,
  MaterialIcons,
} from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "../../context/ThemeContext";

// Original reviews data
const initialReviews = [
  {
    id: "1",
    user: "عميل 1",
    date: "يناير , 2025",
    rating: 5,
    review:
      "بصفتي مسافرًا خبيرًا، يمكنني أن أقول بثقة إن فسحة هي واحدة من أفضل وكالات السفر التي كان لي الشرف في التعامل معها.",
    image: require("../../assets/1.jpg"),
  },
  // ... other initial reviews
];

// Updated Custom Alert Component that matches the Final component style
const CustomAlert = ({ visible, type, message, onClose }) => {
  const { theme, isDarkMode } = useTheme();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();

      // Auto hide after 2.5 seconds if not loading type
      if (type !== "loading") {
        const timer = setTimeout(() => {
          hideAlert();
        }, 2500);
        return () => clearTimeout(timer);
      }
    }
  }, [visible]);

  const hideAlert = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      if (onClose) onClose();
    });
  };

  // Get the title based on alert type
  const getAlertTitle = () => {
    switch (type) {
      case "success":
        return "نجاح";
      case "error":
        return "خطأ";
      case "loading":
        return "انتظر...";
      default:
        return "تنبيه";
    }
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <Pressable
        style={[
          styles.alertModal,
          {
            backgroundColor: isDarkMode ? "rgba(0,0,0,0.8)" : "rgba(0,0,0,0.6)",
          },
        ]}
        onPress={() => type !== "loading" && hideAlert()}
      >
        <Animated.View
          style={[
            styles.alertContent,
            {
              backgroundColor: isDarkMode ? theme.colors.surface : "white",
              opacity: fadeAnim,
              transform: [
                {
                  scale: fadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.9, 1],
                  }),
                },
              ],
            },
          ]}
        >
          <View
            style={[
              styles.alertIconContainer,
              {
                backgroundColor:
                  type === "success"
                    ? isDarkMode
                      ? "rgba(46, 204, 113, 0.2)"
                      : "rgba(46, 204, 113, 0.1)"
                    : type === "error"
                    ? isDarkMode
                      ? "rgba(231, 76, 60, 0.2)"
                      : "rgba(231, 76, 60, 0.1)"
                    : isDarkMode
                    ? "rgba(70, 130, 180, 0.2)"
                    : "rgba(70, 130, 180, 0.1)",
              },
            ]}
          >
            {type === "loading" ? (
              <ActivityIndicator
                size="large"
                color={isDarkMode ? theme.colors.primary : "#4a72ac"}
              />
            ) : (
              <MaterialIcons
                name={type === "success" ? "check-circle" : "error"}
                size={36}
                color={type === "success" ? "#2ecc71" : "#e74c3c"}
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
            {getAlertTitle()}
          </Text>
          <Text
            style={[
              styles.alertMessage,
              {
                color: theme.colors.textSecondary,
              },
            ]}
          >
            {message}
          </Text>
          {type !== "loading" && (
            <TouchableOpacity
              style={[
                styles.alertButton,
                {
                  backgroundColor:
                    type === "success"
                      ? isDarkMode
                        ? theme.colors.primary
                        : "#2ecc71"
                      : isDarkMode
                      ? theme.colors.primary
                      : "#e74c3c",
                },
              ]}
              onPress={hideAlert}
            >
              <Text style={styles.alertButtonText}>حسناً</Text>
            </TouchableOpacity>
          )}
        </Animated.View>
      </Pressable>
    </Modal>
  );
};

export default function Review() {
  const { theme, isDarkMode } = useTheme();

  // Track all reviews (including new ones)
  const [reviews, setReviews] = useState(initialReviews);
  const [newReview, setNewReview] = useState("");
  const [newRating, setNewRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentUser, setCurrentUser] = useState({
    name: "المستخدم", // Default fallback name
    avatar: {
      uri: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8YXZhdGFyfGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60",
    },
  });
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const flatListRef = useRef(null);

  // Add these state variables for the delete confirmation alert
  const [deleteAlertVisible, setDeleteAlertVisible] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState(null);

  // Fetch user data from AsyncStorage when component mounts
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const firstname = await AsyncStorage.getItem("firstname");

        setCurrentUser({
          name: `${firstname}`,
          avatar: {
            uri: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8YXZhdGFyfGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60",
          },
        });
      } catch (error) {
        console.error("AsyncStorage Error: ", error);
      }
    };

    fetchUserData();
  }, []);

  // Helper function to format current date in Arabic
  const getCurrentArabicDate = () => {
    const months = [
      "يناير",
      "فبراير",
      "مارس",
      "إبريل",
      "مايو",
      "يونيو",
      "يوليو",
      "أغسطس",
      "سبتمبر",
      "أكتوبر",
      "نوفمبر",
      "ديسمبر",
    ];
    const now = new Date();
    const month = months[now.getMonth()];
    const year = now.getFullYear();
    return `${month} , ${year}`;
  };

  const renderStars = (rating, isInput = false) => {
    return [...Array(5)].map((_, i) => (
      <TouchableOpacity
        key={i}
        onPress={() => isInput && setNewRating(i + 1)}
        style={styles.starContainer}
      >
        <FontAwesome
          name={i < rating ? "star" : "star-o"}
          size={20}
          color={i < rating ? "#FFC107" : "#BDC3C7"}
          style={styles.star}
        />
      </TouchableOpacity>
    ));
  };

  const handleSubmitReview = () => {
    if (!newReview.trim() || newRating === 0) {
      // Animate the input to show error
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 0.3,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
      return;
    }

    setIsSubmitting(true);

    // Create new review object with user data
    const userReview = {
      id: Date.now().toString(), // Generate unique ID based on timestamp
      user: currentUser.name, // Use the user's name from our state
      date: getCurrentArabicDate(),
      rating: newRating,
      review: newReview.trim(),
      image: currentUser.avatar, // Use the user's avatar
    };

    // Add new review to the list
    setReviews([userReview, ...reviews]);

    // Reset form
    setTimeout(() => {
      setNewReview("");
      setNewRating(0);
      setIsSubmitting(false);

      // Scroll to the top to show the new review
      if (flatListRef.current) {
        flatListRef.current.scrollToOffset({ animated: true, offset: 0 });
      }
    }, 500);
  };

  // Update the handleDeleteReview function
  const handleDeleteReview = (reviewId) => {
    setReviewToDelete(reviewId);
    setDeleteAlertVisible(true);
  };

  const confirmDeleteReview = () => {
    if (reviewToDelete) {
      // Filter out the review with the given ID
      setReviews((prevReviews) =>
        prevReviews.filter((review) => review.id !== reviewToDelete)
      );
      // Reset and hide alert
      setReviewToDelete(null);
      setDeleteAlertVisible(false);
    }
  };

  const renderReviewItem = ({ item }) => {
    return (
      <Animated.View
        style={[
          styles.card,
          {
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.border,
            opacity: fadeAnim,
            // Add subtle shadow in light mode, border in dark mode
            ...(isDarkMode
              ? {
                  borderWidth: 1,
                  borderColor: "rgba(255,255,255,0.1)",
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                }
              : {
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 3,
                }),
          },
          item.id === reviews[0].id &&
            reviews[0].id !== initialReviews[0].id && {
              ...styles.newReviewCard,
              backgroundColor: isDarkMode
                ? "rgba(255,255,255,0.0)" // Dark mode highlight
                : "#EBF5FB", // Light mode highlight
              borderLeftColor: theme.colors.accent,
            },
        ]}
      >
        <TouchableOpacity
          style={[
            styles.deleteButton,
            { backgroundColor: isDarkMode ? "#a5a2a2" : "#F0F0F0" },
          ]}
          onPress={() => handleDeleteReview(item.id)}
        >
          <Entypo
            name="cross"
            size={18}
            color={isDarkMode ? "#2D3250" : "#838383"}
          />
        </TouchableOpacity>

        <View style={styles.cardHeader}>
          <View style={styles.userInfo}>
            <Text style={[styles.userName, { color: theme.colors.text }]}>
              {item.user}
            </Text>
            <Text style={[styles.date, { color: theme.colors.textSecondary }]}>
              {item.date}
            </Text>
          </View>
          <View style={styles.userImageContainer}>
            <Image source={item.image} style={styles.userImage} />
          </View>
        </View>
        <View style={styles.ratingContainer}>{renderStars(item.rating)}</View>
        <Text style={[styles.reviewText, { color: theme.colors.text }]}>
          {item.review}
        </Text>
      </Animated.View>
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <View
        style={[
          {
            height: 70,
            marginTop: 45,
            flexDirection: "column",
            alignItems: "center",
          },
          { backgroundColor: theme.colors.background },
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
        />
      </View>

      <View style={{ alignItems: "flex-end", marginHorizontal: 20, margin: 0 }}>
        <View style={[styles.badge, { backgroundColor: theme.colors.accent }]}>
          <Text
            style={[styles.badgeText, { color: isDarkMode ? "#000" : "#FFF" }]}
          >
            تقييمات ({reviews.length})
          </Text>
        </View>
      </View>

      <FlatList
        ref={flatListRef}
        data={reviews}
        renderItem={renderReviewItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />

      <View
        style={[
          styles.inputContainer,
          {
            backgroundColor: theme.colors.surface,
            borderTopColor: theme.colors.border,
            borderTopWidth: 1,
            shadowColor: isDarkMode ? "#000" : "#000",
            shadowOpacity: isDarkMode ? 0.3 : 0.1,
          },
        ]}
      >
        <View style={styles.ratingInput}>{renderStars(newRating, true)}</View>
        <View style={styles.textInputContainer}>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: isDarkMode
                  ? "rgba(255,255,255,0.08)"
                  : "#F5F7FA",
                color: theme.colors.text,
              },
            ]}
            placeholder="اكتب تقييمك هنا..."
            value={newReview}
            onChangeText={setNewReview}
            multiline
            textAlign="right"
            placeholderTextColor={isDarkMode ? "#ffffff" : "#95A5A6"} // Adjusted for dark mode
          />
          <TouchableOpacity
            style={[
              styles.submitButton,
              isSubmitting && styles.submitButtonDisabled,
              {
                backgroundColor: isSubmitting ? "#BDC3C7" : theme.colors.accent,
              },
            ]}
            onPress={handleSubmitReview}
            disabled={isSubmitting}
          >
            <Text
              style={[
                styles.submitButtonText,
                { color: isDarkMode ? "#2D3250" : "#FFFFFF" },
              ]}
            >
              {isSubmitting ? "جاري الإرسال..." : "إرسال"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Add the custom delete alert */}
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
              هل أنت متأكد من حذف هذا التعليق؟
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
                onPress={confirmDeleteReview}
              >
                <Text style={styles.alertButtonText}>حذف</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </Pressable>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: Platform.OS === "ios" ? 50 : 20,
    paddingHorizontal: 20,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
    alignItems: "center",
  },
  logo: {
    height: 30,
    width: 175,
    marginBottom: 10,
  },
  badge: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 10,
    width: 120,
    direction: "rtl",
  },
  badgeText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "bold",
  },
  listContainer: {
    padding: 20,
    paddingBottom: 100,
  },
  card: {
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    position: "relative",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  userInfo: {
    alignItems: "flex-end",
  },
  userName: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  date: {
    fontSize: 12,
  },
  userImageContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  userImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  deleteButton: {
    position: "absolute",
    top: 5,
    right: 5,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
  ratingContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: 10,
  },
  starContainer: {
    padding: 2,
  },
  star: {
    marginLeft: 2,
  },
  reviewText: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: "right",
  },
  inputContainer: {
    position: "absolute",
    bottom: 60,
    left: 0,
    right: 0,
    padding: 15,
    shadowOffset: { width: 0, height: -2 },
    shadowRadius: 4,
    elevation: 5,
  },
  ratingInput: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 10,
  },
  textInputContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  input: {
    flex: 1,
    borderRadius: 10,
    padding: 12,
    marginRight: 10,
    fontSize: 14,
    maxHeight: 100,
  },
  submitButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    justifyContent: "center",
  },
  submitButtonDisabled: {
    backgroundColor: "#BDC3C7",
  },
  submitButtonText: {
    fontSize: 14,
    fontWeight: "bold",
  },
  newReviewCard: {
    borderLeftWidth: 3,
  },
  // Updated alert styles to match Final component
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
  alertButtonsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
  },
});
