import { createFileRoute } from "@tanstack/react-router";
import { createSeo } from "@/lib/seo";

export const Route = createFileRoute("/nodes")({
  head: () =>
    createSeo({
      title: "Nodes · Test görünümü",
      description:
        "Kendi node’unu oluştur, toplulukları keşfet ve etkinlikte eşleş. Nodes by notwork uygulamasını örnek profille webden dene.",
      path: "/nodes",
    }),
  component: () => (
    <main style={{ position: "fixed", inset: 0, background: "#0d0e10" }}>
      <iframe
        title="Nodes · örnek verilerle test görünümü"
        src="/nodes-app/index.html?v=20261021"
        sandbox="allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox"
        style={{ width: "100%", height: "100%", display: "block", border: 0 }}
      />
    </main>
  ),
});
