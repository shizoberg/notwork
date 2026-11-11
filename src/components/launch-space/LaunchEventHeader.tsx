import type { LaunchFlow } from "@/lib/launch-flow";

export function LaunchEventHeader({ flow }: { flow: LaunchFlow }) {
  return (
    <div className="ls-event-header">
      <div className="ls-event-cover">
        <img src={flow.cover} alt="" />
      </div>
      <div className="ls-event-identity">
        <span className="ls-space-logo">
          <img src={flow.logo} alt={flow.organizerName} />
        </span>
        <div>
          <h1>{flow.organizerName}</h1>
          <p>14 Kasım · {flow.schedule[0].time.replace(":", ".")} · nodes by notwork</p>
        </div>
      </div>
    </div>
  );
}
