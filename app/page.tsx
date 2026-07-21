"use client";

import { useState } from "react";
import { useTasks } from "@/lib/useTasks";
import { CaptureScreen } from "@/components/CaptureScreen";
import { InboxScreen } from "@/components/InboxScreen";
import { TodayScreen } from "@/components/TodayScreen";
import { TabBar, type TabKey } from "@/components/TabBar";

export default function Home() {
  const [tab, setTab] = useState<TabKey>("capture");
  const { tasks, todayTasks, addTasks, toggleTask, updateTask, removeTask } =
    useTasks();

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
          tasks={tasks}
          onToggle={toggleTask}
          onUpdate={updateTask}
          onRemove={removeTask}
        />
      )}
      {tab === "today" && (
        <TodayScreen
          tasks={todayTasks}
          onToggle={toggleTask}
          onUpdate={updateTask}
          onRemove={removeTask}
        />
      )}

      <TabBar active={tab} onChange={setTab} />
    </div>
  );
}
