import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { View, ActivityIndicator } from "react-native";
import { StatusBar } from "expo-status-bar";
import React, { lazy, Suspense } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { ThemeProvider, ThemeContext } from "./context/ThemeContext";

// Lazy load components
const Home = lazy(() => import("./screens/Home"));
const Login = lazy(() => import("./screens/Login"));
const Register = lazy(() => import("./screens/Register"));
const Create = lazy(() => import("./components/Create"));
const Explore = lazy(() => import("./components/Explore"));
const Reviews = lazy(() => import("./components/Review"));
const Setting = lazy(() => import("./components/Setting"));
const StartupScreen = lazy(() => import("./screens/StartupScreen"));

// Icons
const AntDesign = lazy(() => import("@expo/vector-icons/AntDesign"));
const MaterialIcons = lazy(() => import("@expo/vector-icons/MaterialIcons"));
const MaterialCommunityIcons = lazy(() =>
  import("@expo/vector-icons/MaterialCommunityIcons")
);

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Loading component
const Loader = () => (
  <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
    <ActivityIndicator size="large" color="#0984e3" />
  </View>
);

function HomeTabs() {
  // Get the complete theme object, not just isDarkMode
  const { isDarkMode, theme } = React.useContext(ThemeContext);

  // Define an even darker background for the tab bar in dark mode
  const tabBarBackgroundColor = isDarkMode ? "#1A1E30" : theme.colors.surface; // Darker than theme.colors.background

  return (
    <Tab.Navigator
      initialRouteName="الرئيسية"
      screenOptions={({ route }) => ({
        tabBarShowLabel: true,
        tabBarActiveTintColor: "#FFFFFF", // Changed from theme.colors.primary to white
        tabBarInactiveTintColor: isDarkMode
          ? theme.colors.textSecondary
          : "#666",
        tabBarStyle: {
          backgroundColor: tabBarBackgroundColor,
          borderTopWidth: 0,
          height: 60,
          position: "absolute",
          paddingBottom: 10,
          // Enhanced shadow for better visibility in dark mode
          shadowColor: isDarkMode ? "#000" : "#999",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: isDarkMode ? 0.5 : 0.25,
          shadowRadius: 5,
          elevation: 8,
        },
        tabBarLabelStyle: {
          fontSize: 14,
          marginTop: -5,
          // Removed fixed color to use the tabBarActiveTintColor/tabBarInactiveTintColor
        },
        tabBarIcon: ({ color, focused }) => {
          let iconName;
          let IconComponent = AntDesign;

          // Icon mapping remains the same
          if (route.name === "الرئيسية") {
            iconName = "home";
          } else if (route.name === "استكشف") {
            IconComponent = MaterialIcons;
            iconName = "explore";
          } else if (route.name === "إبدأ رحلتك") {
            IconComponent = MaterialIcons;
            iconName = "travel-explore";
          } else if (route.name === "تقييمات") {
            IconComponent = MaterialCommunityIcons;
            iconName = "comment-edit-outline";
          } else if (route.name === "الإعدادات") {
            iconName = "setting";
          }

          // Use theme appropriate colors
          const iconColor = focused
            ? "#FFFFFF"
            : isDarkMode
            ? theme.colors.textSecondary
            : theme.colors.textSecondary;

          const bgColor = focused ? theme.colors.primary : "transparent";

          return (
            <Suspense fallback={<Loader />}>
              <View
                style={{
                  backgroundColor: bgColor,
                  padding: focused ? 15 : 0,
                  borderRadius: 50,
                  position: "absolute",
                  top: focused ? -20 : 0,
                  width: focused ? 70 : "auto",
                  height: focused ? 70 : "auto",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <IconComponent
                  name={iconName}
                  size={focused ? 30 : 24}
                  color={iconColor}
                />
              </View>
            </Suspense>
          );
        },
      })}
    >
      <Tab.Screen name="إبدأ رحلتك" options={{ headerShown: false }}>
        {() => (
          <Suspense fallback={<Loader />}>
            <Create />
          </Suspense>
        )}
      </Tab.Screen>
      <Tab.Screen
        name="استكشف"
        options={{ tabBarBadge: 3, headerShown: false }}
      >
        {() => (
          <Suspense fallback={<Loader />}>
            <Explore />
          </Suspense>
        )}
      </Tab.Screen>
      <Tab.Screen name="الرئيسية" options={{ headerShown: false }}>
        {() => (
          <Suspense fallback={<Loader />}>
            <Home />
          </Suspense>
        )}
      </Tab.Screen>
      <Tab.Screen name="تقييمات" options={{ headerShown: false }}>
        {() => (
          <Suspense fallback={<Loader />}>
            <Reviews />
          </Suspense>
        )}
      </Tab.Screen>
      <Tab.Screen name="الإعدادات" options={{ headerShown: false }}>
        {() => (
          <Suspense fallback={<Loader />}>
            <Setting />
          </Suspense>
        )}
      </Tab.Screen>
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <Suspense fallback={<Loader />}>
          <StatusBar style="dark" animated={true} />
          <NavigationContainer>
            <Stack.Navigator
              initialRouteName="Startup"
              screenOptions={{
                headerStyle: { backgroundColor: "transparent" },
                headerTransparent: true,
              }}
            >
              <Stack.Screen name="Startup" options={{ headerShown: false }}>
                {(props) => (
                  <Suspense fallback={<Loader />}>
                    <StartupScreen {...props} />
                  </Suspense>
                )}
              </Stack.Screen>
              <Stack.Screen name="Login">
                {(props) => (
                  <Suspense fallback={<Loader />}>
                    <Login {...props} />
                  </Suspense>
                )}
              </Stack.Screen>
              <Stack.Screen name="Register">
                {(props) => (
                  <Suspense fallback={<Loader />}>
                    <Register {...props} />
                  </Suspense>
                )}
              </Stack.Screen>
              <Stack.Screen
                name="Home"
                component={HomeTabs}
                options={{ headerShown: false }}
              />
            </Stack.Navigator>
          </NavigationContainer>
        </Suspense>
      </GestureHandlerRootView>
    </ThemeProvider>
  );
}
