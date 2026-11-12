import { createFileRoute } from "@tanstack/react-router";
import { createSeo } from "@/lib/seo";
import { HomeLanding } from "@/components/HomeLanding";

export const Route = createFileRoute("/")({
  head: () =>
    createSeo({
      title: "notwork | Network Club ve Başarısızlık Hikâyeleri",
      description:
        "notwork, İzmir’de başarısızlık hikâyelerinin anlatıldığı bir network club. Gerçek deneyimleri dinle, doğru dersleri çıkar ve yeni bağlantılar kur.",
      path: "/",
      keywords: [
        "İzmir network etkinliği",
        "İzmir networking event",
        "networking club İzmir",
        "girişimcilik hikâyeleri",
        "notwork Sahne İzmir",
      ],
    }),
  component: HomeLanding,
});
