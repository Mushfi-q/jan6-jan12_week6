import { BarChartBox, PieChartBox } from "../components/Charts";

async function getTrends() {
  const res = await fetch("http://localhost:3000/api/trends", {
    cache: "no-store",
  });
  return res.json();
}

export default async function AnalyticsPage() {
  const data = await getTrends();

  return (
    <main style={{ padding: 32, background: "#f7f9fc", minHeight: "100vh" }}>
      <h1 style={{ fontSize: 32, fontWeight: 700 }}>📊 Analytics & Trends Dashboard</h1>
      <p style={{ color: "#666", marginTop: 8 }}>
        YC ecosystem insights based on historical snapshots and change tracking
      </p>

      {/* ---- KPI SUMMARY ---- */}
      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 20,
          marginTop: 32,
        }}
      >
        <KpiCard title="Growing Tags" value={data.fastest_growing_tags.length} />
        <KpiCard title="Tracked Locations" value={data.top_locations.length} />
        <KpiCard title="Stage Transitions" value={data.stage_transitions.length} />
      </section>

      {/* ---- TAGS ---- */}
      <section style={sectionStyle}>
        <h2 style={sectionTitle}>🚀 Fastest Growing Tags</h2>
        <Card>
          <BarChartBox
            data={data.fastest_growing_tags}
            xKey="tag"
            yKey="count"
          />
        </Card>
      </section>

      {/* ---- LOCATIONS ---- */}
      <section style={sectionStyle}>
        <h2 style={sectionTitle}>🌍 Top Locations</h2>
        <Card>
          <BarChartBox
            data={data.top_locations}
            xKey="location"
            yKey="count"
          />
        </Card>
      </section>

      {/* ---- STAGE TRANSITIONS ---- */}
      <section style={sectionStyle}>
        <h2 style={sectionTitle}>🔁 Stage Transitions</h2>
        <Card>
          <PieChartBox
            data={data.stage_transitions}
            nameKey="change_type"
            valueKey="count"
          />
        </Card>
      </section>
    </main>
  );
}

// ---------------- UI COMPONENTS ----------------

function Card({ children }) {
  return (
    <div
      style={{
        background: "white",
        borderRadius: 16,
        padding: 20,
        boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
      }}
    >
      {children}
    </div>
  );
}

function KpiCard({ title, value }) {
  return (
    <div
      style={{
        background: "linear-gradient(135deg, #4f46e5, #6366f1)",
        color: "white",
        borderRadius: 16,
        padding: 20,
        boxShadow: "0 6px 16px rgba(0,0,0,0.15)",
      }}
    >
      <h3 style={{ fontSize: 14, opacity: 0.8 }}>{title}</h3>
      <p style={{ fontSize: 32, fontWeight: 700, marginTop: 8 }}>{value}</p>
    </div>
  );
}


const sectionStyle = {
  marginTop: 50,
};

const sectionTitle = {
  fontSize: 22,
  fontWeight: 600,
  marginBottom: 16,
};
