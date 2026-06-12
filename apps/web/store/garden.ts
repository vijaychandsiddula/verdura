import { create } from 'zustand'

export interface Plant { id:string; name:string; sci:string; price:number; emoji:string; slug:string; bg:string; waterDays:number; fertDays:number }
export interface GardenPlant { gid:string; plant:Plant; addedAt:string; health:number }
export interface Reminder { id:string; gid:string; plantName:string; plantEmoji:string; type:'watering'|'fertilising'; title:string; body:string; dueAt:string; done:boolean }

function daysFromNow(n:number) { const d=new Date(); d.setDate(d.getDate()+n); return d.toISOString() }
export function getTodayReminders(r:Reminder[]) { const e=new Date(); e.setHours(23,59,59,999); return r.filter(x=>!x.done&&new Date(x.dueAt)<=e) }

interface GardenStore {
  plants: GardenPlant[]; reminders: Reminder[]
  addPlant: (p:Plant) => void; removePlant: (gid:string) => void
  markDone: (id:string) => void; hasPlant: (id:string) => boolean
}
export const useGarden = create<GardenStore>((set,get) => ({
  plants:[], reminders:[],
  addPlant: (p) => { const gid=`${p.id}_${Date.now()}`; set(s=>({ plants:[...s.plants,{gid,plant:p,addedAt:new Date().toISOString(),health:95}], reminders:[...s.reminders, {id:`w_${gid}`,gid,plantName:p.name,plantEmoji:p.emoji,type:'watering',title:`Water your ${p.name}`,body:'Check soil — water if top 2cm is dry.',dueAt:daysFromNow(p.waterDays),done:false}, {id:`f_${gid}`,gid,plantName:p.name,plantEmoji:p.emoji,type:'fertilising',title:`Fertilise your ${p.name}`,body:'Apply diluted liquid fertiliser.',dueAt:daysFromNow(p.fertDays),done:false}] })) },
  removePlant: (gid) => set(s=>({ plants:s.plants.filter(p=>p.gid!==gid), reminders:s.reminders.filter(r=>r.gid!==gid) })),
  markDone: (id) => set(s=>({ reminders:s.reminders.map(r=>r.id===id?{...r,done:true}:r) })),
  hasPlant: (id) => get().plants.some(p=>p.plant.id===id),
}))
