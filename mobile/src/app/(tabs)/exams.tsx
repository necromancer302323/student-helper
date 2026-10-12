import { useCallback, useState } from "react";
import { useFocusEffect } from "expo-router";
import { View, Text, StyleSheet } from "react-native";
import { apiGet, apiPost, apiDelete }   from "../../../lib/api";
import {
  Page,
  Card,
  Heading,
  Field,
  Label,
  Button,
  Notice,
  Loading,
  colors,
}  from "../../../components/ui";

type EventItem = {
  id: number;
  title: string;
  subject: string;
  category: "Exam" | "Test" | "Assignment" | "Other";
  event_date: string;
  event_time?: string | null;
  description?: string | null;
};

function today() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function ExamsScreen() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [date, setDate] = useState(today());
  const [time, setTime] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] =
    useState<EventItem["category"]>("Exam");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const result = await apiGet<EventItem[]>("/events");
      setEvents(Array.isArray(result) ? result : []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load events.");
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load])
  );

  async function addEvent() {
    if (!title.trim() || !subject.trim()) {
      setError("Enter the event title and subject.");
      return;
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      setError("Use the date format YYYY-MM-DD.");
      return;
    }

    if (time && !/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) {
      setError("Use the time format HH:mm, for example 09:30.");
      return;
    }

    setError("");

    try {
      await apiPost("/events", {
        title: title.trim(),
        subject: subject.trim(),
        category,
        event_date: date,
        event_time: time || null,
        description: description.trim() || null,
      });

      setTitle("");
      setSubject("");
      setTime("");
      setDescription("");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not create event.");
    }
  }

  async function deleteEvent(id: number) {
    try {
      await apiDelete(`/events/${id}`);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not delete event.");
    }
  }

  return (
    <Page
      title="Exams & Deadlines"
      subtitle="Keep exams, tests and assignments in one place."
    >
      <Card>
        <Heading>Add an event</Heading>

        <Label>Title</Label>
        <Field
          placeholder="e.g. Chemistry chapter test"
          value={title}
          onChangeText={setTitle}
        />

        <Label>Subject</Label>
        <Field
          placeholder="e.g. Chemistry"
          value={subject}
          onChangeText={setSubject}
        />

        <Label>Date (YYYY-MM-DD)</Label>
        <Field value={date} onChangeText={setDate} />

        <Label>Time (optional, HH:mm)</Label>
        <Field
          placeholder="09:30"
          value={time}
          onChangeText={setTime}
        />

        <Label>Description (optional)</Label>
        <Field
          placeholder="Chapters to prepare"
          value={description}
          onChangeText={setDescription}
          multiline
        />

        <Label>Category</Label>
        <View style={styles.categories}>
          {(["Exam", "Test", "Assignment", "Other"] as const).map((item) => (
            <View key={item} style={styles.category}>
              <Button
                title={item}
                secondary={category !== item}
                onPress={() => setCategory(item)}
              />
            </View>
          ))}
        </View>

        <Button title="Save event" onPress={addEvent} />
      </Card>

      {error ? <Notice message={error} /> : null}
      {loading ? <Loading /> : null}

      <Card>
        <Heading>Your events ({events.length})</Heading>

        {events.length === 0 && !loading ? (
          <Notice message="No events yet. Add an exam or deadline above." />
        ) : null}

        {events.map((event) => (
          <View key={event.id} style={styles.event}>
            <Text style={styles.eventTitle}>{event.title}</Text>
            <Text style={styles.muted}>
              {event.category} · {event.subject}
            </Text>
            <Text style={styles.muted}>
              {event.event_date}
              {event.event_time ? ` · ${event.event_time}` : ""}
            </Text>
            {event.description ? (
              <Text style={styles.muted}>{event.description}</Text>
            ) : null}
            <Button
              title="Delete event"
              secondary
              onPress={() => void deleteEvent(event.id)}
            />
          </View>
        ))}
      </Card>
    </Page>
  );
}

const styles = StyleSheet.create({
  categories: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  category: {
    minWidth: "45%",
    flexGrow: 1,
  },
  event: {
    gap: 8,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text,
  },
  muted: {
    fontSize: 13,
    color: colors.muted,
  },
});