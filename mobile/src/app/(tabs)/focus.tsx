import { useEffect, useRef, useState } from "react";
import { Alert, Text, View, StyleSheet } from "react-native";
import { apiPost } from "../../../lib/api";
import {
  Page,
  Card,
  Heading,
  Field,
  Label,
  Button,
  Notice,
  colors,
} from "../../../components/ui";

const FOCUS_SECONDS = 25 * 60;

function today() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function FocusScreen() {
  const [subject, setSubject] = useState("");
  const [secondsLeft, setSecondsLeft] = useState(FOCUS_SECONDS);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const elapsedRef = useRef(0);

  useEffect(() => {
    if (!running) return;

    const interval = setInterval(() => {
      setSecondsLeft((previous) => {
        if (previous <= 1) {
          setRunning(false);
          return 0;
        }

        return previous - 1;
      });

      elapsedRef.current += 1;
    }, 1000);

    return () => clearInterval(interval);
  }, [running]);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;

  function resetTimer() {
    setRunning(false);
    setSecondsLeft(FOCUS_SECONDS);
    elapsedRef.current = 0;
    setError("");
  }

  async function saveSession() {
    if (!subject.trim()) {
      setError("Enter the subject before saving your session.");
      return;
    }

    const durationMinutes = Math.floor(elapsedRef.current / 60);

    if (durationMinutes < 1) {
      setError("Study for at least one minute before saving a session.");
      return;
    }

    setRunning(false);
    setSaving(true);
    setError("");

    try {
      await apiPost("/study-sessions", {
        subject: subject.trim(),
        study_date: today(),
        duration_minutes: durationMinutes,
        description: "Focus timer session",
        source: "focus",
      });

      Alert.alert(
        "Session saved",
        `${durationMinutes} minute(s) recorded for ${subject.trim()}.`
      );

      setSecondsLeft(FOCUS_SECONDS);
      elapsedRef.current = 0;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save session.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Page
      title="Focus Mode"
      subtitle="Put distractions aside and focus on one subject."
    >
      <Card>
        <Heading>What are you studying?</Heading>
        <Label>Subject</Label>
        <Field
          placeholder="e.g. Mathematics"
          value={subject}
          onChangeText={setSubject}
        />
      </Card>

      <Card>
        <Text style={styles.eyebrow}>FOCUS SESSION</Text>

        <View style={styles.timerContainer}>
          <Text style={styles.timer}>
            {String(minutes).padStart(2, "0")}:
            {String(seconds).padStart(2, "0")}
          </Text>
          <Text style={styles.caption}>
            {running
              ? "Stay focused. You're doing great."
              : secondsLeft === 0
                ? "Time is up. Save your session."
                : "Ready when you are."}
          </Text>
        </View>

        <Button
          title={running ? "Pause timer" : "Start timer"}
          onPress={() => {
            if (secondsLeft === 0) {
              setError("Reset the timer to start a new session.");
              return;
            }

            setError("");
            setRunning((value) => !value);
          }}
          disabled={saving}
        />

        <Button
          title="Reset timer"
          secondary
          onPress={resetTimer}
          disabled={saving}
        />

        {error ? <Notice message={error} /> : null}
      </Card>

      <Card>
        <Heading>Finish your session</Heading>
        <Text style={styles.caption}>
          Save the time you've actually spent in this focus timer. The session
          will appear in your study statistics.
        </Text>

        <Button
          title={saving ? "Saving..." : "Finish & save session"}
          onPress={() => void saveSession()}
          disabled={saving}
        />
      </Card>
    </Page>
  );
}

const styles = StyleSheet.create({
  eyebrow: {
    textAlign: "center",
    color: colors.primary,
    fontWeight: "800",
    letterSpacing: 2,
  },
  timerContainer: {
    alignItems: "center",
    paddingVertical: 18,
    gap: 10,
  },
  timer: {
    fontSize: 64,
    fontWeight: "800",
    color: colors.text,
    fontVariant: ["tabular-nums"],
  },
  caption: {
    fontSize: 14,
    color: colors.muted,
    textAlign: "center",
    lineHeight: 21,
  },
});