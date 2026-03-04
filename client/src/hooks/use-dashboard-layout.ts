import { useState, useCallback, useEffect } from "react";

export interface DashboardSection {
  id: string;
  label: string;
  visible: boolean;
}

const DEFAULT_SECTIONS: DashboardSection[] = [
  { id: "kpi-cards", label: "Key Metrics", visible: true },
  { id: "warnings", label: "System Alerts", visible: true },
  { id: "agent-volume", label: "Agent & Call Volume", visible: true },
  { id: "outcomes-evaluation", label: "Outcomes & Evaluation", visible: true },
  { id: "recent-calls", label: "Recent Calls", visible: true },
  { id: "conversation-flow", label: "Conversation Flow", visible: true },
  { id: "duration-distribution", label: "Duration Distribution", visible: true },
  { id: "peak-usage", label: "Peak Usage Heatmap", visible: true },
  { id: "conversation-outcomes", label: "Conversation Outcomes", visible: true },
];

const STORAGE_KEY = "dashboard_layout";

function loadLayout(): DashboardSection[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return DEFAULT_SECTIONS;

    const parsed: DashboardSection[] = JSON.parse(saved);
    // Merge saved layout with defaults to handle new sections added in the future
    const savedIds = new Set(parsed.map((s) => s.id));
    const merged = [
      ...parsed.filter((s) => DEFAULT_SECTIONS.some((d) => d.id === s.id)),
      ...DEFAULT_SECTIONS.filter((d) => !savedIds.has(d.id)),
    ];
    return merged;
  } catch {
    return DEFAULT_SECTIONS;
  }
}

function saveLayout(sections: DashboardSection[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sections));
}

export function useDashboardLayout() {
  const [sections, setSections] = useState<DashboardSection[]>(loadLayout);

  // Sync layout changes to localStorage via useEffect instead of inside state updaters
  // Side effects (like writing to localStorage) should not occur inside setState callbacks
  useEffect(() => {
    saveLayout(sections);
  }, [sections]);

  const reorder = useCallback((activeId: string, overId: string) => {
    setSections((prev) => {
      const oldIndex = prev.findIndex((s) => s.id === activeId);
      const newIndex = prev.findIndex((s) => s.id === overId);
      if (oldIndex === -1 || newIndex === -1) return prev;

      const updated = [...prev];
      const [removed] = updated.splice(oldIndex, 1);
      updated.splice(newIndex, 0, removed);
      return updated;
    });
  }, []);

  const toggleVisibility = useCallback((id: string) => {
    setSections((prev) => {
      const updated = prev.map((s) =>
        s.id === id ? { ...s, visible: !s.visible } : s
      );
      return updated;
    });
  }, []);

  const resetLayout = useCallback(() => {
    setSections(DEFAULT_SECTIONS);
  }, []);

  return { sections, reorder, toggleVisibility, resetLayout };
}
