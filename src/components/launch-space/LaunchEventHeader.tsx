import type { LaunchFlow } from "@/lib/launch-flow";

export function LaunchEventHeader({
  flow, avatar, initials,
}: { flow: LaunchFlow; avatar?: string; initials?: string }) {
  return (
    <div className="ls-event-header">
      <div className="ls-event-cover">
        <img src={flow.cover} alt="" />
        {initials && (
          <span className="ls-cover-avatar">
            {avatar ? <img src={avatar} alt="" /> : initials.toLocaleUpperCase("tr-TR")}
          </span>
        )}
        <div className="ls-event-identity">
          <span className="ls-space-logo">
            <img src={flow.logo} alt="" />
          </span>
          <div>
            <h1>{flow.organizerName}</h1>
            <p>14 Kasım · {flow.schedule[0].time.replace(":", ".")} · nodes by notwork</p>
          </div>
        </div>
      </div>
    </div>
  );
}
