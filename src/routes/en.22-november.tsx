import {createFileRoute} from "@tanstack/react-router";
import {PastEventPage} from "@/components/PastEventPage";
import {novemberEventPhotos} from "@/lib/november-event-photos";
export const Route=createFileRoute("/en/22-november")({head:()=>({meta:[{title:"22 November notwork Stage · Past event"}]}),component:()=> <PastEventPage english title="notwork stage" date="22 November 2026" venue="Rene Lokal · İzmir" photos={novemberEventPhotos}/>});
