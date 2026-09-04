import React from 'react';
import { MessageSquare, Files, Zap, CheckCircle2, HeartHandshake, Users } from 'lucide-react';
import StatCard from './StatCard';

export default function MetricGrid({ metrics, feedback }) {
  const m = metrics || {
    totalQueries: 0,
    totalDocuments: 5,
    indexedChunks: 22,
    averageLatencyMs: 380,
    resolutionRate: 95,
    satisfactionRate: 98,
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      <StatCard
        title="Total Inquiries"
        value={m.totalQueries}
        unit="queries"
        icon={MessageSquare}
        color="indigo"
        change="Live Audit Tracked"
      />
      <StatCard
        title="Indexed Chunks"
        value={m.indexedChunks}
        unit="vectors"
        icon={Files}
        color="cyan"
        change="1536-dim Embedding"
      />
      <StatCard
        title="Avg RAG Latency"
        value={m.averageLatencyMs}
        unit="ms"
        icon={Zap}
        color="amber"
        change="Hybrid Retrieval"
      />
      <StatCard
        title="Resolution Rate"
        value={`${m.resolutionRate}%`}
        icon={CheckCircle2}
        color="emerald"
        change="≥ 70% Confidence"
      />
      <StatCard
        title="User Satisfaction"
        value={`${m.satisfactionRate}%`}
        icon={HeartHandshake}
        color="purple"
        change={`${feedback?.upvotes || 0} 👍 / ${feedback?.downvotes || 0} 👎`}
      />
    </div>
  );
}
