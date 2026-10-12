import { Tabs } from "expo-router";

const active = "#4F46E5";
const inactive = "#7A8496";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: active,
        tabBarInactiveTintColor: inactive,
        tabBarStyle: {
          height: 66,
          paddingTop: 8,
          paddingBottom: 8,
          backgroundColor: "#FFFFFF",
          borderTopColor: "#E4E8F0",
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: "Home", tabBarLabel: "Dashboard" }}
      />
      <Tabs.Screen
        name="tasks"
        options={{ title: "Tasks", tabBarLabel: "Tasks" }}
      />
      <Tabs.Screen
        name="exams"
        options={{ title: "Exams", tabBarLabel: "Exams" }}
      />
      <Tabs.Screen
        name="progress"
        options={{ title: "Progress", tabBarLabel: "Progress" }}
      />
      <Tabs.Screen
        name="focus"
        options={{ title: "Focus", tabBarLabel: "Focus" }}
      />
    </Tabs>
  );
}