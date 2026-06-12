/**
 * BullMQ job queue for async order processing.
 * Falls back to direct processing if Redis is unavailable.
 */

import { Queue, Worker, Job } from 'bullmq'
import { prisma } from './prisma'
import { invalidatePrefix } from './cache'

const connection = process.env.REDIS_URL && !process.env.REDIS_URL.includes('localhost')
  ? { url: process.env.REDIS_URL }
  : null

// ── Order Queue ───────────────────────────────────────────────────────────────

export let orderQueue: Queue | null = null

export interface OrderJob {
  orderId: string
  userId: string
  type: 'confirm' | 'stock_deduct' | 'partner_credit' | 'send_confirmation'
}

if (connection) {
  orderQueue = new Queue('orders', { connection, defaultJobOptions: { attempts: 3, backoff: { type: 'exponential', delay: 2000 } } })

  const worker = new Worker<OrderJob>('orders', async (job: Job<OrderJob>) => {
    const { orderId, type } = job.data

    if (type === 'stock_deduct') {
      // Deduct stock for all items in the order
      const items = await prisma.orderItem.findMany({ where: { orderId } })
      await Promise.all(items.map(item => {
        if (item.plantId)  return prisma.plant.update({ where: { id: item.plantId },  data: { stock: { decrement: item.quantity } } })
        if (item.supplyId) return prisma.supply.update({ where: { id: item.supplyId }, data: { stock: { decrement: item.quantity } } })
        if (item.seedId)   return prisma.seed.update({ where: { id: item.seedId },   data: { stock: { decrement: item.quantity } } })
        return Promise.resolve()
      }))
    }

    if (type === 'partner_credit') {
      // Credit partner earnings for each order item with a partnerId
      const items = await prisma.orderItem.findMany({ where: { orderId, partnerId: { not: null } } })
      await Promise.all(items.map(item =>
        prisma.partner.update({
          where: { id: item.partnerId! },
          data: {
            pendingPayout: { increment: item.partnerEarning },
            totalEarnings: { increment: item.partnerEarning },
          },
        })
      ))
    }

    if (type === 'confirm') {
      await prisma.order.update({ where: { id: orderId }, data: { status: 'confirmed' } })
      await invalidatePrefix(`orders:${job.data.userId}`)
    }
  }, { connection, concurrency: 10 })

  worker.on('failed', (job, err) => console.error(`[Queue] Job ${job?.id} failed:`, err.message))
  console.log('✅ Order queue worker started')
}

// ── Enqueue or run directly ───────────────────────────────────────────────────

export async function enqueueOrderJob(data: OrderJob) {
  if (orderQueue) {
    await orderQueue.add(data.type, data, { delay: data.type === 'confirm' ? 2000 : 0 })
  } else {
    // Direct processing if no Redis (dev mode)
    await processOrderJobDirect(data)
  }
}

async function processOrderJobDirect(data: OrderJob) {
  const { orderId, type } = data
  if (type === 'stock_deduct') {
    const items = await prisma.orderItem.findMany({ where: { orderId } })
    await Promise.all(items.map(item => {
      if (item.plantId)  return prisma.plant.update({ where: { id: item.plantId },  data: { stock: { decrement: item.quantity } } })
      if (item.supplyId) return prisma.supply.update({ where: { id: item.supplyId }, data: { stock: { decrement: item.quantity } } })
      if (item.seedId)   return prisma.seed.update({ where: { id: item.seedId },   data: { stock: { decrement: item.quantity } } })
      return Promise.resolve()
    }))
  }
  if (type === 'partner_credit') {
    const items = await prisma.orderItem.findMany({ where: { orderId, partnerId: { not: null } } })
    await Promise.all(items.map(item =>
      prisma.partner.update({
        where: { id: item.partnerId! },
        data: { pendingPayout: { increment: item.partnerEarning }, totalEarnings: { increment: item.partnerEarning } },
      })
    ))
  }
}
