"use client";
import { useState } from "react";

export default function ChatBox({ companyId }) {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]); 
  const [loading, setLoading] = useState(false);

  const suggested = [
    "What is the latest change?",
    "Why is this company growing?",
    "Summarize this company",
    "Explain the momentum score"
  ];

  async function ask(q) {
    const finalQuestion = q || question;
    if (!finalQuestion.trim()) return;

    setMessages(m => [...m, { role: "user", text: finalQuestion }]);
    setQuestion("");
    setLoading(true);

    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: finalQuestion, companyId })
    });

    const data = await res.json();

    setMessages(m => [...m, { role: "assistant", text: data.answer || "No answer." }]);
    setLoading(false);
  }

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>💬 Company Intelligence Chat</h3>

      {/* Chat history */}
      <div style={styles.chatWindow}>
        {messages.length === 0 && (
          <p style={{ color: "#777", textAlign: "center" }}>
            Ask anything about this company’s changes, scores, or trends.
          </p>
        )}

        {messages.map((m, i) => (
          <div
            key={i}
            style={m.role === "user" ? styles.userBubble : styles.botBubble}
          >
            {m.text}
          </div>
        ))}

        {loading && (
          <div style={styles.botBubble}>
            ⏳ Analyzing company data…
          </div>
        )}
      </div>

      {/* Suggested questions */}
      <div style={styles.suggestions}>
        {suggested.map((s, i) => (
          <button key={i} style={styles.suggestionBtn} onClick={() => ask(s)}>
            {s}
          </button>
        ))}
      </div>

      {/* Input box */}
      <div style={styles.inputRow}>
        <input
          value={question}
          onChange={e => setQuestion(e.target.value)}
          placeholder="Ask about changes, growth, scores…"
          style={styles.input}
        />
        <button onClick={() => ask()} disabled={loading} style={styles.sendBtn}>
          {loading ? "…" : "Ask"}
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    marginTop: 30,
    border: "1px solid #ddd",
    borderRadius: 8,
    padding: 15,
    background: "#fafafa",
    maxWidth: 700
  },
  title: {
    marginBottom: 10
  },
  chatWindow: {
    minHeight: 200,
    maxHeight: 350,
    overflowY: "auto",
    padding: 10,
    background: "white",
    border: "1px solid #eee",
    borderRadius: 6
  },
  userBubble: {
    alignSelf: "flex-end",
    background: "#0070f3",
    color: "white",
    padding: "8px 12px",
    borderRadius: 12,
    margin: "6px 0",
    maxWidth: "80%",
    marginLeft: "auto"
  },
  botBubble: {
    alignSelf: "flex-start",
    background: "#f1f1f1",
    color: "black",
    padding: "8px 12px",
    borderRadius: 12,
    margin: "6px 0",
    maxWidth: "80%"
  },
  suggestions: {
    display: "flex",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 10
  },
  suggestionBtn: {
    background: "#e6f0ff",
    border: "1px solid #cce0ff",
    borderRadius: 6,
    padding: "4px 8px",
    cursor: "pointer",
    fontSize: 12
  },
  inputRow: {
    display: "flex",
    gap: 8,
    marginTop: 12
  },
  input: {
    flex: 1,
    padding: 8,
    borderRadius: 6,
    border: "1px solid #ccc"
  },
  sendBtn: {
    padding: "8px 14px",
    borderRadius: 6,
    border: "none",
    background: "#0070f3",
    color: "white",
    cursor: "pointer"
  }
};
