export type { NotificationListItem } from '@unisat/wallet-shared'

export interface StoredNotification {
  id: string
  title: string
  content: string
  type: string
  link?: string
  priority: number
  publishTime: number
  readAt?: number // timestamp when marked as read; undefined means unread
}

export type NotificationStore = Record<string, StoredNotification>
