import {createFileRoute} from "@tanstack/react-router";
import {LaunchAdminPanel} from "./adminlaunch";
import {ExperienceContext,notworkExperience} from "@/lib/event-experience";
export const Route=createFileRoute("/adminnotwork")({head:()=>({meta:[{title:"notwork · etkinlik deneyimi"},{name:"robots",content:"noindex,nofollow"}]}),component:()=> <ExperienceContext.Provider value={notworkExperience}><LaunchAdminPanel/></ExperienceContext.Provider>});
