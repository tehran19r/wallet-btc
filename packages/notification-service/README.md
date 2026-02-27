# @unisat/notification-service

Cross-platform notification management service for UniSat Wallet. Handles fetching, storing, reading, and deleting in-app notifications with local persistence and automatic cleanup.

## Installation

```bash
pnpm add @unisat/notification-service
```

## Usage

```ts
import { NotificationService } from '@unisat/notification-service'

const notificationService = new NotificationService()

await notificationService.init({
  storage, // ProxyStorageAdapter
  api,     // WalletApiService
  logger,  // optional Logger
})
```

## API

### `init(config)`

Initializes the service and loads persisted notifications from storage.

| Field     | Type                   | Required | Description              |
| --------- | ---------------------- | -------- | ------------------------ |
| `storage` | `ProxyStorageAdapter`  | Yes      | Storage adapter          |
| `api`     | `WalletApiService`     | Yes      | API client               |
| `logger`  | `Logger`               | No       | Custom logger            |

### `getNotifications()`

Fetches the latest notifications from the server, merges them with the local store, and returns a sorted list.

- Sorted by `priority` desc, then `publishTime` desc
- Caps the local store at **20 items** (lowest priority/oldest are dropped)
- Automatically purges read notifications older than **7 days**
- Falls back to the local store on network error

```ts
const notifications = await notificationService.getNotifications()
// => StoredNotification[]
```

### `markAsRead(id)`

Marks a notification as read on the server and records the read timestamp locally.

```ts
await notificationService.markAsRead('notification-id')
```

### `deleteNotification(id)`

Deletes a notification locally. If it has not been read yet, it is first marked as read on the server.

```ts
await notificationService.deleteNotification('notification-id')
```

### `getUnreadCount()`

Returns the number of unread notifications in the local store.

```ts
const count = notificationService.getUnreadCount()
// => number
```

### `resetAllData()`

Clears all notifications from both the local store and storage.

```ts
notificationService.resetAllData()
```

## Types

```ts
interface StoredNotification {
  id: string
  title: string
  content: string
  type: string
  link?: string
  priority: number
  publishTime: number
  readAt?: number  // timestamp when marked as read; undefined means unread
}

type NotificationStore = Record<string, StoredNotification>
```
