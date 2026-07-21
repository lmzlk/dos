"use client";

import { CaptureIcon, InboxIcon, TodayIcon } from "./icons";

export type TabKey = "capture" | "inbox" | "today";

const TABS: { key: TabKey; label: string; Icon: () => React.ReactElement }[] = [
  { key: "capture", label: "Capture", Icon: CaptureIcon },
  { key: "inbox", label: "Inbox", Icon: InboxIcon },
  { key: "today", label: "Today", Icon: TodayIcon },
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
