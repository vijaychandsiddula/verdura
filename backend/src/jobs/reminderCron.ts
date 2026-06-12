import cron from 'node-cron'
import { prisma } from '../lib/prisma'

export function startCronJobs() {
  // Run every day at 8:00 AM IST (UTC+5:30 = 02:30 UTC)
  cron.schedule('30 2 * * *', async () => {
    console.info('🔔 Running daily reminder notification job...')
    await sendDueReminders()
  })

  // Run every hour to catch snoozed reminders
  cron.schedule('0 * * * *', async () => {
    await unsnoozePastReminders()
  })

  console.info('⏰ Cron jobs scheduled')
}

async function sendDueReminders() {
  const now = new Date()
  const endOfDay = new Date()
  endOfDay.setHours(23, 59, 59, 999)

  const dueReminders = await prisma.reminder.findMany({
    where: {
      status: 'pending',
      dueAt: { gte: now, lte: endOfDay },
    },
    include: {
      user: { include: { pushTokens: true } },
      gardenPlant: { include: { plant: true } },
    },
  })

  for (const reminder of dueReminders) {
    for (const pushToken of reminder.user.pushTokens) {
      await sendPushNotification(pushToken.token, {
        title: reminder.title,
        body: reminder.body,
        data: {
          reminderId: reminder.id,
          type: reminder.type,
          plantName: reminder.gardenPlant.plant.name,
        },
      })
    }
  }

  console.info(`✅ Sent notifications for ${dueReminders.length} reminders`)
}

async function unsnoozePastReminders() {
  await prisma.reminder.updateMany({
    where: { status: 'snoozed', snoozedUntil: { lte: new Date() } },
    data: { status: 'pending', snoozedUntil: null },
  })
}

async function sendPushNotification(
  token: string,
  payload: { title: string; body: string; data?: Record<string, string> }
) {
  // Using Expo Push Notifications API — works for both iOS and Android
  try {
    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        to: token,
        title: payload.title,
        body: payload.body,
        data: payload.data ?? {},
        sound: 'default',
        badge: 1,
      }),
    })
    if (!response.ok) console.warn(`Push notification failed for token ${token}`)
  } catch (err) {
    console.error('Push notification error:', err)
  }
}
