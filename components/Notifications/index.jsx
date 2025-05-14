import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Platform,
} from "react-native";
import { FontAwesome, Entypo, MaterialIcons } from "@expo/vector-icons";
import { useTheme } from "../../context/ThemeContext";

const notifications = [
  {
    id: "1",
    title: "رحلة جديدة",
    text: "تم إضافة رحلة جديدة بنجاح",
    time: "منذ 5 دقائق",
    type: "success",
    isRead: false,
  },
  {
    id: "2",
    title: "اكتشف",
    text: "اطلع على أحدث الرحلات",
    time: "منذ ساعة",
    type: "info",
    isRead: false,
  },
  {
    id: "3",
    title: "تقييم",
    text: "يرجى تقييم آخر الرحلات",
    time: "أمس",
    type: "warning",
    isRead: true,
  },
  {
    id: "4",
    title: "تحديث",
    text: "تم تحديث معلومات رحلتك",
    time: "منذ ساعتين",
    type: "info",
    isRead: false,
  },
  {
    id: "5",
    title: "تذكير",
    text: "موعد رحلتك القادمة غداً",
    time: "منذ 3 ساعات",
    type: "reminder",
    isRead: true,
  },
];

const NotificationItem = ({ item, onDelete, theme, isDarkMode }) => {
  const [fadeAnim] = useState(new Animated.Value(1));

  const handleDelete = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => onDelete(item.id));
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case "success":
        return isDarkMode ? "#66BB6A" : "#4CAF50";
      case "warning":
        return isDarkMode ? "#FFCA28" : "#FFC107";
      case "info":
        return isDarkMode ? "#42A5F5" : "#2196F3";
      case "reminder":
        return isDarkMode ? "#BA68C8" : "#9C27B0";
      default:
        return isDarkMode ? "#9E9E9E" : "#757575";
    }
  };

  return (
    <Animated.View
      style={[
        styles.notificationCard,
        {
          opacity: fadeAnim,
          backgroundColor: theme.colors.surface,
          borderColor: isDarkMode
            ? "rgba(255,255,255,0.1)"
            : theme.colors.border,
          ...(isDarkMode && {
            shadowColor: "#000",
            shadowOpacity: 0.3,
            shadowRadius: 8,
          }),
        },
        !item.isRead && {
          borderLeftWidth: 4,
          borderLeftColor: getNotificationColor("info"),
        },
      ]}
    >
      <View style={styles.notificationHeader}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={handleDelete}>
            <Entypo
              name="cross"
              size={20}
              color={isDarkMode ? "#AAB2D5" : "#888"}
            />
          </TouchableOpacity>
          {!item.isRead && (
            <View
              style={[
                styles.unreadDot,
                { backgroundColor: getNotificationColor("info") },
              ]}
            />
          )}
        </View>
        <View style={styles.headerRight}>
          <Text
            style={[styles.notificationTitle, { color: theme.colors.text }]}
          >
            {item.title}
          </Text>
          <View
            style={[
              styles.typeBadge,
              { backgroundColor: getNotificationColor(item.type) },
            ]}
          >
            <Text
              style={[
                styles.typeText,
                {
                  color:
                    isDarkMode && item.type === "warning" ? "#2D3250" : "#FFF",
                },
              ]}
            >
              {item.type}
            </Text>
          </View>
        </View>
      </View>
      <View style={styles.notificationContent}>
        <Text
          style={[
            styles.notificationText,
            { color: theme.colors.textSecondary },
          ]}
        >
          {item.text}
        </Text>
        <View style={styles.timeContainer}>
          <FontAwesome
            name="clock-o"
            size={14}
            color={isDarkMode ? "#AAB2D5" : "#888"}
          />
          <Text
            style={[
              styles.notificationTime,
              { color: isDarkMode ? "#AAB2D5" : "#888" },
            ]}
          >
            {item.time}
          </Text>
        </View>
      </View>
    </Animated.View>
  );
};

export default function Notifications({ myHandle }) {
  const { theme, isDarkMode } = useTheme();
  const [localNotifications, setLocalNotifications] = useState(notifications);

  const handleDeleteNotification = (id) => {
    setLocalNotifications((prev) => prev.filter((note) => note.id !== id));
  };

  const unreadCount = localNotifications.filter((n) => !n.isRead).length;

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      {/* Standardized logo container */}
      <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
        <Image
          source={
            isDarkMode
              ? require("../../assets/white_logo.png")
              : require("../../assets/colored_logo.png")
          }
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      <View
        style={[
          styles.navigationBar,
          { backgroundColor: theme.colors.surface },
        ]}
      >
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
            color={theme.colors.accent}
          />
          <Text style={[styles.backButtonText, { color: theme.colors.accent }]}>
            رجوع
          </Text>
        </TouchableOpacity>
        <View style={styles.badgeContainer}>
          <Text style={[styles.badgeText, { color: theme.colors.accent }]}>
            الإشعارات ({localNotifications.length})
          </Text>
          {unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadBadgeText}>{unreadCount}</Text>
            </View>
          )}
        </View>
      </View>

      <FlatList
        data={localNotifications}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <NotificationItem
            item={item}
            onDelete={handleDeleteNotification}
            theme={theme}
            isDarkMode={isDarkMode}
          />
        )}
        showsVerticalScrollIndicator={true}
        contentContainerStyle={styles.listContainer}
        bounces={true}
        initialNumToRender={5}
        maxToRenderPerBatch={10}
        windowSize={10}
        ListFooterComponent={<View style={styles.listFooter} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === "ios" ? 50 : 30,
  },
  header: {
    height: 70,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 15,
  },
  logo: {
    height: 40,
    width: 175,
    objectFit: "contain",
  },
  navigationBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
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
    flexDirection: "row",
    alignItems: "center",
  },
  badgeText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#32568d",
  },
  unreadBadge: {
    backgroundColor: "#FF4B4B",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 8,
  },
  unreadBadgeText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "bold",
  },
  listContainer: {
    padding: 20,
    paddingBottom: 10, // Increased from 40 to 60
  },
  notificationCard: {
    backgroundColor: "#FFF",
    borderRadius: 15,
    padding: 15,
    marginBottom: 12,
    elevation: 5,
  },
  unreadCard: {
    borderLeftWidth: 4,
    borderLeftColor: "#2196F3",
  },
  notificationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#2196F3",
    marginLeft: 8,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginRight: 8,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  typeText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "500",
  },
  notificationContent: {
    marginTop: 5,
  },
  notificationText: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
    textAlign: "right",
  },
  timeContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  notificationTime: {
    fontSize: 12,
    color: "#888",
    marginLeft: 5,
  },
  listFooter: {
    height: 80, // Additional footer space
  },
});
