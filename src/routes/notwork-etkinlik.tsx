import {createFileRoute} from "@tanstack/react-router";
import {LaunchSpace} from "./launch-space";
import {ExperienceContext,notworkExperience} from "@/lib/event-experience";
export const Route=createFileRoute("/notwork-etkinlik")({head:()=>({meta:[{title:"notwork · etkinlik deneyimi"},{name:"robots",content:"noindex,nofollow"}]}),component:()=> <ExperienceContext.Provider value={notworkExperience}><LaunchSpace/></ExperienceContext.Provider>});
