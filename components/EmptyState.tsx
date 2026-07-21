export function EmptyState({
  emoji,
  title,
  text,
}: {
  emoji: string;
  title: string;
  text: string;
}) {
  return (
    <div className="empty">
      <div className="empty__emoji">{emoji}</div>
      <div className="empty__title">{title}</div>
      <p className="empty__text">{text}</p>
    </div>
  );
}
