import React, { lazy, Suspense, useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Switch,
  ScrollView,
  Platform,
  Alert,
  Modal,
  Pressable,
  Animated,
} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { Globe, Moon, LogOut, Camera } from "lucide-react-native";
import createStyles from "./ProfileStyle"; // Change this to import createStyles instead of styles
import Loading from "../Loading";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { useTheme } from "../../context/ThemeContext";

const Notifications = lazy(() => import("../Notifications"));
const Trips = lazy(() => import("../Trips"));
const PersonalInfo = lazy(() => import("../PersonalInfo"));

const ProfileScreen = () => {
  const navigation = useNavigation();
  const { theme, toggleTheme, isDarkMode } = useTheme();

  // Create styles with current theme
  const styles = createStyles(isDarkMode, theme.colors);

  const [Notify, setNotify] = useState(false);
  const [language, setLanguage] = useState("ar");
  const [profileData, setProfileData] = useState({
    firstname: "",
    lastname: "",
    email: "",
  });
  const [trips, setTrips] = useState(false);
  const [logoutAlertVisible, setLogoutAlertVisible] = useState(false);
  const [personalInfo, setPersonalInfo] = useState(false);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const firstname = await AsyncStorage.getItem("firstname");
        const lastname = await AsyncStorage.getItem("lastname");
        const email = await AsyncStorage.getItem("email");
        if (firstname && lastname && email) {
          setProfileData({ firstname, lastname, email });
        }
      } catch (error) {
        console.error("Error fetching profile data:", error);
      }
    };

    fetchProfileData();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      // Reset state whenever the screen is focused
      setNotify(false);
      setTrips(false);
      setPersonalInfo(false);
    }, [])
  );
  const handleLogout = () => {
    setLogoutAlertVisible(true);
  };

  const confirmLogout = async () => {
    try {
      // Clear all user data from AsyncStorage
      await AsyncStorage.removeItem("user");
      await AsyncStorage.removeItem("token");
      await AsyncStorage.removeItem("firstname");
      await AsyncStorage.removeItem("lastname");
      await AsyncStorage.removeItem("email");

      // Navigate to Login screen
      navigation.reset({
        index: 0,
        routes: [{ name: "Login" }],
      });
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  return (
    <>
      {!Notify && !trips && !personalInfo && (
        <View
          style={[
            styles.container,
            { backgroundColor: theme.colors.background },
          ]}
        >
          {/* Header Section - Navy surface color */}
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

          <ScrollView
            showsVerticalScrollIndicator={false}
            style={{ backgroundColor: theme.colors.background }}
          >
            {/* Profile Section */}
            <View
              style={[
                styles.profileSection,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.border,
                  // Add subtle shadow in light mode and subtle highlight in dark mode
                  ...(isDarkMode
                    ? { borderWidth: 1, borderColor: "rgba(255,255,255,0.1)" }
                    : {
                        elevation: 2,
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.1,
                        shadowRadius: 3,
                      }),
                },
              ]}
            >
              <View style={styles.profileImageContainer}>
                <Image
                  source={{
                    uri: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8YXZhdGFyfGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60",
                  }}
                  style={[
                    styles.profileImage,
                    {
                      borderColor: theme.colors.accent,
                      borderWidth: isDarkMode ? 2 : 0, // Add border in dark mode
                    },
                  ]}
                />
                <TouchableOpacity
                  style={[
                    styles.cameraButton,
                    {
                      backgroundColor: theme.colors.accent,
                    },
                  ]}
                >
                  <Camera size={18} color="#fff" />
                </TouchableOpacity>
              </View>
              <Text style={[styles.profileName, { color: theme.colors.text }]}>
                {profileData.firstname} {profileData.lastname}
              </Text>
              <Text
                style={[
                  styles.profileEmail,
                  { color: theme.colors.textSecondary },
                ]}
              >
                {profileData.email}
              </Text>
              <TouchableOpacity
                style={[
                  styles.editProfileButton,
                  {
                    backgroundColor: theme.colors.accent,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.editProfileText,
                    {
                      color: isDarkMode ? "#2D3250" : "#ffffff",
                    },
                  ]}
                >
                  تعديل الملف الشخصي
                </Text>
              </TouchableOpacity>
            </View>

            {/* Menu Section */}
            <View
              style={[
                styles.menuContainer,
                { backgroundColor: theme.colors.background },
              ]}
            >
              <>
                {/* Account Settings */}
                <View style={styles.settingsSection}>
                  <Text
                    style={[
                      styles.sectionTitle,
                      {
                        color: theme.colors.text,
                        // Add subtle accent for dark mode section titles
                        ...(isDarkMode && {
                          textShadowColor: theme.colors.accent,
                          textShadowOffset: { width: 0, height: 0 },
                          textShadowRadius: 3,
                          opacity: 0.9,
                        }),
                      },
                    ]}
                  >
                    إعدادات الحساب
                  </Text>
                  {/* Update MenuItem component calls to pass theme */}
                  <MenuItem
                    icon="person-outline"
                    text="المعلومات الشخصية"
                    iconColor={theme.colors.accent}
                    textColor={theme.colors.text}
                    backgroundColor={theme.colors.surface}
                    styles={styles}
                    onPress={() => {
                      setPersonalInfo(true);
                      setNotify(false);
                      setTrips(false);
                    }}
                  />
                  <MenuItem
                    icon="notifications-outline"
                    text="الإشعارات"
                    iconColor={theme.colors.accent}
                    textColor={theme.colors.text}
                    backgroundColor={theme.colors.surface}
                    onPress={() => {
                      setNotify(true);
                      setTrips(false);
                    }}
                    styles={styles} // Pass the styles object
                  />
                  <MenuItem
                    icon="heart"
                    text="رحلاتي"
                    iconColor={isDarkMode ? theme.colors.accent : "red"}
                    textColor={theme.colors.text}
                    backgroundColor={theme.colors.surface}
                    onPress={() => {
                      setTrips(true);
                      setNotify(false);
                    }}
                    styles={styles} // Pass the styles object
                  />
                </View>

                {/* Appearance Settings */}
                <View style={styles.settingsSection}>
                  <Text
                    style={[styles.sectionTitle, { color: theme.colors.text }]}
                  >
                    المظهر
                  </Text>
                  <View
                    style={[
                      styles.settingsItem,
                      {
                        backgroundColor: theme.colors.surface,
                        borderColor: theme.colors.border,
                      },
                    ]}
                  >
                    <View style={styles.settingsItemLeft}>
                      <Switch
                        value={isDarkMode}
                        onValueChange={toggleTheme}
                        trackColor={{
                          false: "#D1D1D6",
                          true: theme.colors.accent,
                        }}
                        thumbColor={
                          Platform.OS === "ios"
                            ? "#fff"
                            : isDarkMode
                            ? "#fff"
                            : "#f4f3f4"
                        }
                        ios_backgroundColor="#D1D1D6"
                      />
                    </View>
                    <View style={styles.settingsItemContent}>
                      <Text
                        style={[
                          styles.settingsItemTitle,
                          { color: theme.colors.text },
                        ]}
                      >
                        الوضع الليلي
                      </Text>
                    </View>
                    <View style={styles.settingsItemIcon}>
                      <Moon size={20} color={theme.colors.accent} />
                    </View>
                  </View>

                  {/* Language selector with themed colors */}
                  <TouchableOpacity
                    style={[
                      styles.settingsItem,
                      {
                        backgroundColor: theme.colors.surface,
                        borderColor: theme.colors.border,
                      },
                    ]}
                  >
                    <View style={styles.settingsItemLeft}>
                      <View
                        style={[
                          styles.languageSelector,
                          {
                            backgroundColor: isDarkMode
                              ? "rgba(255,255,255,0.08)"
                              : "rgba(0,0,0,0.03)",
                          },
                        ]}
                      >
                        <TouchableOpacity
                          style={[
                            styles.languageOption,
                            language === "ar" && [
                              styles.selectedLanguage,
                              { backgroundColor: theme.colors.accent },
                            ],
                            // Add subtle styling for unselected options
                            language !== "ar" && {
                              backgroundColor: isDarkMode
                                ? "rgba(255,255,255,0.1)"
                                : "rgba(0,0,0,0.03)",
                            },
                          ]}
                          onPress={() => setLanguage("ar")}
                        >
                          <Text
                            style={[
                              styles.languageText,
                              {
                                color:
                                  language === "ar"
                                    ? isDarkMode
                                      ? "#2D3250"
                                      : "#FFFFFF"
                                    : theme.colors.text,
                              },
                            ]}
                          >
                            العربية
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[
                            styles.languageOption,
                            language === "en" && [
                              styles.selectedLanguage,
                              { backgroundColor: theme.colors.accent },
                            ],
                          ]}
                          onPress={() => setLanguage("en")}
                        >
                          <Text
                            style={[
                              styles.languageText,
                              {
                                color:
                                  language === "en"
                                    ? isDarkMode
                                      ? "#2D3250"
                                      : "#FFFFFF"
                                    : theme.colors.text,
                              },
                            ]}
                          >
                            English
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                    <View style={styles.settingsItemContent}>
                      <Text
                        style={[
                          styles.settingsItemTitle,
                          { color: theme.colors.text },
                        ]}
                      >
                        اللغة
                      </Text>
                    </View>
                    <View style={styles.settingsItemIcon}>
                      <Globe size={20} color={theme.colors.accent} />
                    </View>
                  </TouchableOpacity>
                </View>

                {/* Privacy & Security with themed colors */}
                <View style={styles.settingsSection}>
                  <Text
                    style={[styles.sectionTitle, { color: theme.colors.text }]}
                  >
                    الخصوصية والأمان
                  </Text>
                  <MenuItem
                    icon="shield-outline"
                    text="الخصوصية"
                    iconColor={theme.colors.accent}
                    textColor={theme.colors.text}
                    backgroundColor={theme.colors.surface}
                    styles={styles} // Pass the styles object
                  />
                  <MenuItem
                    icon="call-outline"
                    text="تواصل معنا"
                    iconColor={theme.colors.accent}
                    textColor={theme.colors.text}
                    backgroundColor={theme.colors.surface}
                    styles={styles} // Pass the styles object
                  />
                  <MenuItem
                    icon="help-circle-outline"
                    text="مساعدة ودعم"
                    iconColor={theme.colors.accent}
                    textColor={theme.colors.text}
                    backgroundColor={theme.colors.surface}
                    styles={styles} // Pass the styles object
                  />
                </View>

                {/* Logout button with accent color */}
                <TouchableOpacity
                  style={[
                    styles.logoutButton,
                    {
                      backgroundColor: theme.colors.accent,
                    },
                  ]}
                  onPress={handleLogout}
                >
                  <LogOut size={20} color="#fff" style={{ marginRight: 10 }} />
                  <Text
                    style={[
                      styles.logoutText,
                      {
                        color: isDarkMode ? "#2D3250" : "#FFFFFF",
                      },
                    ]}
                  >
                    تسجيل الخروج
                  </Text>
                </TouchableOpacity>

                <Text
                  style={[
                    styles.versionText,
                    { color: theme.colors.textSecondary },
                  ]}
                >
                  الإصدار 1.0.0
                </Text>
              </>
            </View>
          </ScrollView>

          {/* Logout Alert Modal */}
          <Modal visible={logoutAlertVisible} transparent animationType="fade">
            <Pressable
              style={[
                styles.alertModal,
                {
                  backgroundColor: isDarkMode
                    ? "rgba(0,0,0,0.8)"
                    : "rgba(0,0,0,0.6)",
                },
              ]}
              onPress={() => setLogoutAlertVisible(false)}
            >
              <Animated.View
                style={[
                  styles.alertContent,
                  {
                    backgroundColor: isDarkMode
                      ? theme.colors.surface
                      : "white",
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
                  <LogOut size={36} color="#e74c3c" />
                </View>
                <Text
                  style={[
                    styles.alertTitle,
                    {
                      color: theme.colors.text,
                    },
                  ]}
                >
                  تسجيل الخروج
                </Text>
                <Text
                  style={[
                    styles.alertMessage,
                    {
                      color: theme.colors.textSecondary,
                    },
                  ]}
                >
                  هل أنت متأكد من تسجيل الخروج؟
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
                    onPress={() => setLogoutAlertVisible(false)}
                  >
                    <Text
                      style={[
                        styles.alertButtonText,
                        { color: theme.colors.text },
                      ]}
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
                    onPress={confirmLogout}
                  >
                    <Text style={styles.alertButtonText}>تأكيد</Text>
                  </TouchableOpacity>
                </View>
              </Animated.View>
            </Pressable>
          </Modal>
        </View>
      )}

      {Notify && (
        <Suspense fallback={<Loading />}>
          <Notifications myHandle={setNotify} />
        </Suspense>
      )}

      {trips && (
        <Suspense fallback={<Loading />}>
          <Trips myHandle={setTrips} />
        </Suspense>
      )}

      {personalInfo && (
        <Suspense fallback={<Loading />}>
          <PersonalInfo myHandle={setPersonalInfo} />
        </Suspense>
      )}
    </>
  );
};

const MenuItem = ({
  icon,
  text = "",
  iconColor = "black",
  textColor = "black",
  backgroundColor = "white",
  hasNotification = false,
  onPress,
  styles, // Receive styles as prop
}) => {
  const { isDarkMode } = useTheme();

  return (
    <TouchableOpacity
      style={[
        styles.menuItem,
        {
          backgroundColor,
          // Add subtle elevation in light mode, dark border in dark mode
          ...(!isDarkMode
            ? {
                elevation: 1,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.1,
                shadowRadius: 1,
              }
            : {
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.1)",
              }),
        },
      ]}
      onPress={onPress}
    >
      <View style={styles.iconContainer}>
        <Ionicons name={icon} size={24} color={iconColor} />
        {hasNotification && (
          <View
            style={[
              styles.notificationDot,
              { backgroundColor: isDarkMode ? "#F4C724" : "#FF3B30" },
            ]}
          />
        )}
      </View>
      <Text style={[styles.menuText, { color: textColor }]}>{text}</Text>
    </TouchableOpacity>
  );
};

export default ProfileScreen;
