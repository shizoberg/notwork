import { createFileRoute } from "@tanstack/react-router";
import { createSeo } from "@/lib/seo";

export const Route = createFileRoute("/demo2")({
  head: () =>
    createSeo({
      title: "Nodes by notwork · interaktif demo",
      description:
        "Community, Nodes ve Match deneyimini örnek kişilerle keşfet. Profilde NTW2026 koduyla örnek etkinliğe katıl.",
      path: "/demo2",
    }),
  component: NodesDemo,
});

function NodesDemo() {
  return (
    <main style={{ position: "fixed", inset: 0, background: "#0d0e10" }}>
      <iframe
        title="Nodes by notwork · örnek uygulama"
        src="/nodes-demo/index.html?v=20261013"
        sandbox="allow-scripts allow-forms"
        style={{ width: "100%", height: "100%", display: "block", border: 0 }}
      />
    </main>
  );
}
