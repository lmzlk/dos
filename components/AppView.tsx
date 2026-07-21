"use client";

import { useState } from "react";
import { useTasks } from "@/lib/useTasks";
import { CaptureScreen } from "@/components/CaptureScreen";
import { InboxScreen } from "@/components/InboxScreen";
import { TodayScreen } from "@/components/TodayScreen";
import { WeekScreen, daysUntil } from "@/components/WeekScreen";
import { CompletedScreen } from "@/components/CompletedScreen";
import { TabBar, type TabKey } from "@/components/TabBar";

export function AppView({ room }: { room: string }) {
  const [tab, setTab] = useState<TabKey>("capture");
  const { tasks, todayTasks, addTasks, toggleTask, updateTask, removeTask } =
    useTasks(room);

  const active = tasks.filter((t) => t.status !== "done");
  const todayActive = todayTasks.filter((t) => t.status !== "done");
  const completed = tasks.filter((t) => t.status === "done");
  const upcoming = active.filter((t) => {
    const d = daysUntil(t.due);
    return d !== null && d >= 1 && d <= 7;
  });

  return (
    <div className="app">
      {tab === "capture" && (
        <CaptureScreen
          onCapture={(items) => {
            addTasks(items);
            setTab("inbox");
          }}
        />
      )}
      {tab === "inbox" && (
        <InboxScreen
          tasks={active}
          onToggle={toggleTask}
          onUpdate={updateTask}
          onRemove={removeTask}
        />
      )}
      {tab === "today" && (
        <TodayScreen
          tasks={todayActive}
          onToggle={toggleTask}
          onUpdate={updateTask}
          onRemove={removeTask}
        />
      )}
      {tab === "week" && (
        <WeekScreen
          tasks={upcoming}
          onToggle={toggleTask}
          onUpdate={updateTask}
          onRemove={removeTask}
        />
      )}
      {tab === "done" && (
        <CompletedScreen
          tasks={completed}
          onToggle={toggleTask}
          onUpdate={updateTask}
          onRemove={removeTask}
        />
      )}

      <TabBar active={tab} onChange={setTab} />
    </div>
  );
}
