"use client"

import { useState, useEffect } from "react"
import { apiClient, MetricsSummary } from "@/lib/api-client"

export function MetricsDashboard() {
  const [metrics, setMetrics] = useState<MetricsSummary | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadMetrics()
    // Refresh every 30 seconds
    const interval = setInterval(loadMetrics, 30000)
    return () => clearInterval(interval)
  }, [])

  const loadMetrics = async () => {
    try {
      const data = await apiClient.getMetrics()
      setMetrics(data)
    } catch (error) {
      console.error('Failed to load metrics:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div style={{ padding: "1rem" }}>Loading metrics...</div>
  }

  if (!metrics) {
    return <div style={{ padding: "1rem" }}>No metrics available</div>
  }

  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
      gap: "1rem",
      padding: "1rem"
    }}>
      <MetricCard
        title="Avg Response Time"
        value={`${metrics.avg_response_time}s`}
        icon="⚡"
        color="#0ABABA"
      />
      <MetricCard
        title="Success Rate"
        value={`${metrics.success_rate}%`}
        icon="✓"
        color="#10b981"
      />
      <MetricCard
        title="Total Queries"
        value={metrics.total_queries.toString()}
        icon="💬"
        color="#6366f1"
      />
      <MetricCard
        title="Successful Responses"
        value={metrics.successful_responses.toString()}
        icon="✅"
        color="#8b5cf6"
      />
    </div>
  )
}

interface MetricCardProps {
  title: string
  value: string
  icon: string
  color: string
}

function MetricCard({ title, value, icon, color }: MetricCardProps) {
  return (
    <div style={{
      background: "white",
      borderRadius: "12px",
      padding: "1.5rem",
      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
      border: `2px solid ${color}20`
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
        <span style={{ fontSize: "1.5rem" }}>{icon}</span>
        <h3 style={{ margin: 0, fontSize: "0.875rem", color: "#6b7280" }}>{title}</h3>
      </div>
      <p style={{ 
        margin: 0, 
        fontSize: "2rem", 
        fontWeight: "700", 
        color: color 
      }}>
        {value}
      </p>
    </div>
  )
}
