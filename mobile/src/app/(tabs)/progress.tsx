import { useCallback, useState } from "react";
import { useFocusEffect } from "expo-router";
import { View, Text, StyleSheet } from "react-native";
import { apiGet }  from "../../../lib/api";
import {
  Page,
  Card,
  Heading,
  Notice,
  Loading,
  colors,
}  from "../../../components/ui";

type WeeklyItem = {
  date: string;
  hours: number;
};

type SubjectItem = {
  subject: string;
  minutes: number;
  hours: number;
  sessions: number;
};

export default function ProgressScreen() {
  const [weekly, setWeekly] = useState<WeeklyItem[]>([]);
  const [subjects, setSubjects] = useState<SubjectItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [weekResult, subjectResult] = await Promise.all([
        apiGet<WeeklyItem[]>("/stats/weekly"),
        apiGet<SubjectItem[]>("/stats/subjects"),
      ]);

      setWeekly(Array.isArray(weekResult) ? weekResult : []);
      setSubjects(Array.isArray(subjectResult) ? subjectResult : []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load progress.");
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load])
  );

  const totalMinutes = subjects.reduce(
    (sum, item) => sum + Number(item.minutes || 0),
    0
  );

  const maxHours = Math.max(
    1,
    ...weekly.map((item) => Number(item.hours || 0))
  );

  return (
    <Page
      title="Study Progress"
      subtitle="See how consistently you are studying."
    >
      {loading ? <Loading /> : null}
      {error ? <Notice message={error} /> : null}

      <Card>
        <Heading>Total recorded study time</Heading>
        <Text style={styles.big}>
          {(totalMinutes / 60).toFixed(1)} hours
        </Text>
        <Text style={styles.muted}>
          Calculated from the subject statistics returned by your backend.
        </Text>
      </Card>

      <Card>
        <Heading>Weekly study hours</Heading>

        {weekly.length === 0 && !loading ? (
          <Notice message="No weekly study data is available yet." />
        ) : null}

        {weekly.map((item, index) => {
          const hours = Number(item.hours || 0);
          const width = `${Math.max(0, Math.min(100, (hours / maxHours) * 100))}%` as `${number}%`;

          return (
            <View key={`${item.date}-${index}`} style={styles.chartRow}>
              <Text style={styles.date}>{item.date}</Text>
              <View style={styles.track}>
                <View style={[styles.bar, { width }]} />
              </View>
              <Text style={styles.hours}>{hours.toFixed(1)} h</Text>
            </View>
          );
        })}
      </Card>

      <Card>
        <Heading>Time by subject</Heading>

        {subjects.length === 0 && !loading ? (
          <Notice message="Record a study session to see subject statistics." />
        ) : null}

        {subjects.map((item) => (
          <View key={item.subject} style={styles.subjectRow}>
            <View style={styles.subjectInfo}>
              <Text style={styles.subject}>{item.subject}</Text>
              <Text style={styles.muted}>
                {item.sessions} sessions
              </Text>
            </View>
            <Text style={styles.subjectHours}>
              {Number(item.hours || 0).toFixed(1)} h
            </Text>
          </View>
        ))}
      </Card>
    </Page>
  );
}

const styles = StyleSheet.create({
  big: {
    fontSize: 32,
    fontWeight: "800",
    color: colors.primary,
  },
  muted: {
    color: colors.muted,
    fontSize: 13,
  },
  chartRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginVertical: 6,
  },
  date: {
    width: 88,
    fontSize: 11,
    color: colors.muted,
  },
  track: {
    flex: 1,
    height: 12,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#E8EAF2",
  },
  bar: {
    height: 12,
    borderRadius: 8,
    backgroundColor: colors.primary,
  },
  hours: {
    width: 44,
    fontSize: 11,
    textAlign: "right",
    color: colors.text,
  },
  subjectRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  subjectInfo: {
    gap: 4,
  },
  subject: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "600",
  },
  subjectHours: {
    color: colors.primary,
    fontWeight: "800",
  },
});