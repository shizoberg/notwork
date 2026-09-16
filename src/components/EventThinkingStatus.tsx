type EventThinkingStatusProps = {
  title: string;
  phrases: [string, string, string];
  className?: string;
};

export function EventThinkingStatus({ title, phrases, className = "" }: EventThinkingStatusProps) {
  return (
    <div className={`event-thinking-status ${className}`.trim()}>
      <p>{title}</p>
      <span className="event-thinking-phrases" aria-hidden="true">
        {phrases.map((phrase, index) => (
          <i key={phrase} style={{ animationDelay: `${index * 0.7}s` }}>
            {phrase}
          </i>
        ))}
      </span>
      <span className="sr-only">{phrases[0]}</span>
    </div>
  );
}
