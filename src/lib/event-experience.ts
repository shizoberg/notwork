import { createContext, useContext } from "react";
export const ExperienceContext = createContext({event:"14-kasim-2026", path:"/launch-space", admin:"/adminalaunch", notwork:false});
export const notworkExperience = {event:"22-kasim-2026", path:"/notwork-etkinlik", admin:"/adminnotwork", notwork:true};
export const useExperience = () => useContext(ExperienceContext);
