import { useCallback, useState } from "react";
import { useFocusEffect } from "expo-router";
import { Alert, View, Text, StyleSheet } from "react-native";
import { apiGet, apiPost, apiPatch, apiDelete } from "../../../lib/api";
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


type Task = {
  id: number;
  title: string;
  description?: string | null;
  subject: string;
  due_date: string;
  due_time?: string | null;
  priority: "Low" | "Medium" | "High";
  completed: boolean;
};

function localDate() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export default function TasksScreen() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState(localDate());
  const [dueTime, setDueTime] = useState("");
  const [priority, setPriority] = useState<"Low" | "Medium" | "High">("Medium");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const result = await apiGet<Task[]>("/tasks");
      setTasks(Array.isArray(result) ? result : []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load tasks.");
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load])
  );

  async function addTask() {
    if (!title.trim() || !subject.trim()) {
      setError("Enter a task title and subject.");
      return;
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(dueDate)) {
      setError("Use the date format YYYY-MM-DD.");
      return;
    }

    if (dueTime && !/^([01]\d|2[0-3]):[0-5]\d$/.test(dueTime)) {
      setError("Use the time format HH:mm, for example 14:30.");
      return;
    }

    setError("");

    try {
      await apiPost("/tasks", {
        title: title.trim(),
        subject: subject.trim(),
        description: description.trim() || null,
        due_date: dueDate,
        due_time: dueTime || null,
        priority,
        completed: false,
      });

      setTitle("");
      setSubject("");
      setDescription("");
      setDueTime("");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not create task.");
    }
  }

  async function toggleTask(task: Task) {
    try {
      await apiPatch(`/tasks/${task.id}/complete`, {
        completed: !task.completed,
      });
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not update task.");
    }
  }

  function confirmDelete(task: Task) {
    Alert.alert("Delete task?", `Delete "${task.title}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await apiDelete(`/tasks/${task.id}`);
            await load();
          } catch (e) {
            setError(e instanceof Error ? e.message : "Could not delete task.");
          }
        },
      },
    ]);
  }

  return (
    <Page title="Task Manager" subtitle="Plan your work and track completion.">
      <Card>
        <Heading>Create a task</Heading>

        <Label>Task title</Label>
        <Field
          placeholder="e.g. Complete physics questions"
          value={title}
          onChangeText={setTitle}
        />

        <Label>Subject</Label>
        <Field
          placeholder="e.g. Physics"
          value={subject}
          onChangeText={setSubject}
        />

        <Label>Description (optional)</Label>
        <Field
          placeholder="What do you need to finish?"
          value={description}
          onChangeText={setDescription}
          multiline
        />

        <Label>Due date (YYYY-MM-DD)</Label>
        <Field value={dueDate} onChangeText={setDueDate} />

        <Label>Due time (optional, HH:mm)</Label>
        <Field
          placeholder="18:30"
          value={dueTime}
          onChangeText={setDueTime}
        />

        <Label>Priority</Label>
        <View style={styles.priorityRow}>
          {(["Low", "Medium", "High"] as const).map((item) => (
            <View key={item} style={styles.priorityButton}>
              <Button
                title={item}
                secondary={priority !== item}
                onPress={() => setPriority(item)}
              />
            </View>
          ))}
        </View>

        <Button title="Add task" onPress={addTask} />
      </Card>

      {error ? <Notice message={error} /> : null}
      {loading ? <Loading /> : null}

      <Card>
        <Heading>Your tasks ({tasks.length})</Heading>

        {tasks.length === 0 && !loading ? (
          <Notice message="No tasks yet. Create your first task above." />
        ) : null}

        {tasks.map((task) => (
          <View key={task.id} style={styles.task}>
            <Text style={styles.taskTitle}>
              {task.completed ? "✓ " : "○ "}
              {task.title}
            </Text>

            <Text style={styles.muted}>
              {task.subject} · {task.priority}
            </Text>

            <Text style={styles.muted}>
              Due {task.due_date}
              {task.due_time ? ` at ${task.due_time}` : ""}
            </Text>

            <View style={styles.actions}>
              <View style={styles.actionButton}>
                <Button
                  title={task.completed ? "Undo" : "Complete"}
                  secondary
                  onPress={() => void toggleTask(task)}
                />
              </View>
              <View style={styles.actionButton}>
                <Button
                  title="Delete"
                  secondary
                  onPress={() => confirmDelete(task)}
                />
              </View>
            </View>
          </View>
        ))}
      </Card>
    </Page>
  );
}

const styles = StyleSheet.create({
  task: {
    paddingVertical: 12,
    gap: 7,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text,
  },
  muted: {
    color: colors.muted,
    fontSize: 13,
  },
  priorityRow: {
    flexDirection: "row",
    gap: 8,
  },
  priorityButton: {
    flex: 1,
  },
  actions: {
    flexDirection: "row",
    gap: 8,
    marginTop: 4,
  },
  actionButton: {
    flex: 1,
  },
});