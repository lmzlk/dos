"use client";

import {
  CaptureIcon,
  InboxIcon,
  TodayIcon,
  WeekIcon,
  DoneIcon,
} from "./icons";

export type TabKey = "capture" | "inbox" | "today" | "week" | "done";

const TABS: { key: TabKey; label: string; Icon: () => React.ReactElement }[] = [
  { key: "capture", label: "Capture", Icon: CaptureIcon },
  { key: "inbox", label: "Inbox", Icon: InboxIcon },
  { key: "today", label: "Today", Icon: TodayIcon },
  { key: "week", label: "Week", Icon: WeekIcon },
  { key: "done", label: "Done", Icon: DoneIcon },
];

export function TabBar({
  active,
  onChange,
}: {
  active: TabKey;
  onChange: (key: TabKey) => void;
}) {
  return (
    <nav className="tabbar">
      <div className="tabbar__inner">
        {TABS.map(({ key, label, Icon }) => (
          <button
            key={key}
            className={`tab${active === key ? " tab--active" : ""}`}
            onClick={() => onChange(key)}
            aria-current={active === key ? "page" : undefined}
          >
            <Icon />
            {label}
          </button>
        ))}
      </div>
    </nav>
  );
}
