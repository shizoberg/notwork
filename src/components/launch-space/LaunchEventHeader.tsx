import type { LaunchFlow } from "@/lib/launch-flow";

export function LaunchEventHeader({ schedule }: { schedule: LaunchFlow["schedule"] }) {
  return (
    <div className="ls-event-header">
      <div className="ls-event-cover">
        <img src="/nodes-app/assets/community-cover.jpg" alt="" />
      </div>
      <div className="ls-event-identity">
        <span className="ls-space-logo">
          <img src="/brand/notwork-logo.png" alt="notwork" />
        </span>
        <div>
          <h1>Launch Space</h1>
          <p>14 Kasım · {schedule[0].time.replace(":", ".")} · nodes by notwork</p>
        </div>
      </div>
    </div>
  );
}
