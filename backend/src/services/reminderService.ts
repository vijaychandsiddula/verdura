import { prisma } from '../lib/prisma'

type PlantSchedule = {
  wateringIntervalDays: number
  fertiliserIntervalDays: number
  pruningIntervalDays?: number | null
  repottingIntervalMonths?: number | null
  name: string
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

export async function scheduleRemindersForPlant(
  userId: string,
  gardenPlantId: string,
  plant: PlantSchedule
) {
  const now = new Date()
  const reminders = []

  // Watering reminder
  reminders.push({
    userId,
    gardenPlantId,
    type: 'watering' as const,
    title: `Water your ${plant.name}`,
    body: `Check soil moisture and water if the top 2cm feels dry.`,
    dueAt: addDays(now, plant.wateringIntervalDays),
  })

  // Fertiliser reminder
  reminders.push({
    userId,
    gardenPlantId,
    type: 'fertilising' as const,
    title: `Fertilise your ${plant.name}`,
    body: `Apply diluted liquid fertiliser to keep your plant well-nourished.`,
    dueAt: addDays(now, plant.fertiliserIntervalDays),
  })

  // Pruning reminder (optional)
  if (plant.pruningIntervalDays) {
    reminders.push({
      userId,
      gardenPlantId,
      type: 'pruning' as const,
      title: `Prune your ${plant.name}`,
      body: `Trim dead or yellowing leaves to encourage healthy new growth.`,
      dueAt: addDays(now, plant.pruningIntervalDays),
    })
  }

  // Repotting reminder (optional)
  if (plant.repottingIntervalMonths) {
    const repotDate = new Date(now)
    repotDate.setMonth(repotDate.getMonth() + plant.repottingIntervalMonths)
    reminders.push({
      userId,
      gardenPlantId,
      type: 'repotting' as const,
      title: `Repot your ${plant.name}`,
      body: `Check if roots are circling the base — it may be time to move up one pot size.`,
      dueAt: repotDate,
    })
  }

  await prisma.reminder.createMany({ data: reminders })
}

export async function rescheduleReminder(reminderId: string, intervalDays: number) {
  const reminder = await prisma.reminder.findUnique({ where: { id: reminderId } })
  if (!reminder) return

  // Mark current as done, create next occurrence
  await prisma.reminder.update({ where: { id: reminderId }, data: { status: 'done', completedAt: new Date() } })
  await prisma.reminder.create({
    data: {
      userId: reminder.userId,
      gardenPlantId: reminder.gardenPlantId,
      type: reminder.type,
      title: reminder.title,
      body: reminder.body,
      dueAt: addDays(new Date(), intervalDays),
    },
  })
}
