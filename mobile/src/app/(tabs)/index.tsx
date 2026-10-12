
import { useCallback, useState } from "react";
import { useFocusEffect } from "expo-router";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { apiGet } from "../../../lib/api";

type DashboardData = {
  todayTasks?: {
    total: number;
    completed: number;
    pending: number;
  };
  todayStudyMinutes?: number;
  overallStudyHours?: number;
  todayTasksPreview?: Array<{
    id: number;
    title: string;
    completed: boolean;
    subject?: string;
    priority?: string;
  }>;
  upcomingEvents?: Array<{
    id: number;
    title: string;
    subject?: string;
    category: string;
    event_date: string;
    event_time?: string | null;
  }>;
};

export default function DashboardScreen() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadDashboard = useCallback(async (refresh = false) => {
    if (refresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError("");

    try {
      const result = await apiGet<DashboardData>("/dashboard");
      setData(result);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load your dashboard."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadDashboard();
    }, [loadDashboard])
  );

  const tasks = data?.todayTasks;

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => void loadDashboard(true)}
        />
      }
    >
   

<View style={styles.hero}>
  <Text style={styles.heroEyebrow}>STUDENT COMMAND CENTER</Text>

  <Text style={styles.heading}>Dashboard</Text>

  <Text style={styles.subtitle}>
    Plan smarter. Stay focused. Make progress.
  </Text>

 
</View>




      {loading && !data ? (
        <ActivityIndicator
          size="large"
          color="#4F46E5"
          style={styles.loader}
        />
      ) : null}

      {error ? (
        <View style={styles.errorCard}>
          <Text style={styles.errorTitle}>
            Couldn't load your data
          </Text>

          <Text style={styles.errorText}>{error}</Text>

          <Text
            style={styles.retry}
            onPress={() => void loadDashboard()}
          >
            Tap here to retry
          </Text>
        </View>
      ) : null}

      {data ? (
        <>
          <Text style={styles.sectionTitle}>
            Today's overview
          </Text>

          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Total tasks</Text>
              <Text style={styles.statValue}>
                {tasks?.total ?? 0}
              </Text>
            </View>

            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Completed</Text>
              <Text style={styles.statValue}>
                {tasks?.completed ?? 0}
              </Text>
            </View>

            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Pending</Text>
              <Text style={styles.statValue}>
                {tasks?.pending ?? 0}
              </Text>
            </View>

            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Study today</Text>
              <Text style={styles.statValue}>
                {Math.round(data.todayStudyMinutes ?? 0)}
                <Text style={styles.unit}> min</Text>
              </Text>
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Today's tasks</Text>

            {data.todayTasksPreview?.length ? (
              data.todayTasksPreview.map((task) => (
                <View key={task.id} style={styles.listItem}>
                  <View
                    style={[
                      styles.statusDot,
                      task.completed && styles.completedDot,
                    ]}
                  />

                  <View style={styles.itemContent}>
                    <Text
                      style={[
                        styles.itemTitle,
                        task.completed && styles.completedText,
                      ]}
                    >
                      {task.title}
                    </Text>

                    {task.subject ? (
                      <Text style={styles.itemMeta}>
                        {task.subject}
                        {task.priority
                          ? ` · ${task.priority} priority`
                          : ""}
                      </Text>
                    ) : null}
                  </View>

                  <Text style={styles.statusText}>
                    {task.completed ? "Done" : "Pending"}
                  </Text>
                </View>
              ))
            ) : (
              <Text style={styles.emptyText}>
                No tasks to preview. Add tasks in Task Manager.
              </Text>
            )}
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>
              Upcoming exams & deadlines
            </Text>

            {data.upcomingEvents?.length ? (
              data.upcomingEvents.map((event) => (
                <View key={event.id} style={styles.eventItem}>
                  <View style={styles.eventDate}>
                    <Text style={styles.eventDateText}>
                      {event.event_date.slice(8, 10)}
                    </Text>

                    <Text style={styles.eventMonth}>
                      {event.event_date.slice(5, 7)}
                    </Text>
                  </View>

                  <View style={styles.itemContent}>
                    <Text style={styles.itemTitle}>
                      {event.title}
                    </Text>

                    <Text style={styles.itemMeta}>
                      {event.category}
                      {event.subject ? ` · ${event.subject}` : ""}
                    </Text>

                    {event.event_time ? (
                      <Text style={styles.itemMeta}>
                        {event.event_time}
                      </Text>
                    ) : null}
                  </View>
                </View>
              ))
            ) : (
              <Text style={styles.emptyText}>
                No upcoming events. Add an exam or deadline.
              </Text>
            )}
          </View>

          <View style={styles.studyCard}>
            <Text style={styles.studyLabel}>
              Overall study time
            </Text>

            <Text style={styles.studyValue}>
              {Number(data.overallStudyHours ?? 0).toFixed(1)} hours
            </Text>

            <Text style={styles.studyDescription}>
              Keep building your study consistency, one session at a time.
            </Text>
          </View>
        </>
      ) : null}

      <Text style={styles.footer}>
        Stay consistent. Keep progressing.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F5F7FB",
  },
 container: {
  padding: 22,
  paddingTop: 24,
  paddingBottom: 36,
},
  eyebrow: {
    color: "#4F46E5",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.5,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: "700",
    color: "#172033",
    marginBottom: 13,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 22,
  },
  statCard: {
    width: "47%",
    flexGrow: 1,
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E8EBF3",
  },
  statLabel: {
    fontSize: 13,
    color: "#667085",
    marginBottom: 9,
  },
  statValue: {
    fontSize: 26,
    fontWeight: "800",
    color: "#4F46E5",
  },
  unit: {
    fontSize: 13,
    fontWeight: "600",
  },
  card: {
    backgroundColor: "#FFFFFF",
    padding: 18,
    borderRadius: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E8EBF3",
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#172033",
    marginBottom: 12,
  },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#F0F2F7",
    gap: 10,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#F59E0B",
  },
  completedDot: {
    backgroundColor: "#16A34A",
  },
  itemContent: {
    flex: 1,
    gap: 4,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#172033",
  },
  completedText: {
    textDecorationLine: "line-through",
    color: "#98A2B3",
  },
  itemMeta: {
    fontSize: 12,
    color: "#667085",
  },
  statusText: {
    fontSize: 11,
    color: "#667085",
  },
  emptyText: {
    fontSize: 14,
    lineHeight: 21,
    color: "#667085",
  },
  eventItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#F0F2F7",
  },
  eventDate: {
    width: 48,
    height: 52,
    borderRadius: 12,
    backgroundColor: "#EEF0FF",
    alignItems: "center",
    justifyContent: "center",
  },
  eventDateText: {
    fontSize: 19,
    fontWeight: "800",
    color: "#4F46E5",
  },
  eventMonth: {
    fontSize: 10,
    fontWeight: "700",
    color: "#4F46E5",
  },
  studyCard: {
    backgroundColor: "#172033",
    padding: 20,
    borderRadius: 18,
    marginBottom: 16,
  },
  studyLabel: {
    fontSize: 13,
    color: "#CBD5E1",
  },
  studyValue: {
    fontSize: 32,
    fontWeight: "800",
    color: "#FFFFFF",
    marginVertical: 8,
  },
  studyDescription: {
    fontSize: 13,
    color: "#CBD5E1",
    lineHeight: 20,
  },
  errorCard: {
    backgroundColor: "#FFF1F0",
    borderRadius: 14,
    padding: 16,
    marginBottom: 18,
  },
  errorTitle: {
    color: "#B42318",
    fontWeight: "700",
    marginBottom: 6,
  },
  errorText: {
    color: "#B42318",
    fontSize: 13,
  },
  retry: {
    color: "#4F46E5",
    fontWeight: "700",
    marginTop: 12,
  },
  loader: {
    marginVertical: 30,
  },
  footer: {
    textAlign: "center",
    fontSize: 12,
    color: "#98A2B3",
    marginTop: 6,
  },

hero: {
  backgroundColor: "#FFFFFF",
  padding: 22,
  borderRadius: 22,
  marginBottom: 26,
  borderWidth: 1,
  borderColor: "#E8EBF3",
},
heroBadge: {
  alignSelf: "flex-start",
  backgroundColor: "#EEF0FF",
  paddingHorizontal: 11,
  paddingVertical: 7,
  borderRadius: 20,
  marginBottom: 16,
},
heroBadgeText: {
  color: "#4F46E5",
  fontSize: 10,
  fontWeight: "800",
  letterSpacing: 1.2,
},

heroEyebrow: {
  color: "#4F46E5",
  fontSize: 10,
  fontWeight: "800",
  letterSpacing: 2,
  marginBottom: 12,
},
heading: {
  fontSize: 34,
  fontWeight: "800",
  color: "#172033",
  letterSpacing: -1,
},
subtitle: {
  marginTop: 10,
  fontSize: 14,
  lineHeight: 22,
  color: "#667085",
},
heroDivider: {
  height: 1,
  backgroundColor: "#EEF0F6",
  marginVertical: 18,
},
heroFooter: {
  fontSize: 12,
  lineHeight: 19,
  color: "#7B8497",
},


});
