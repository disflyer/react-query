import { noop } from '../core/utils'
import { PersistedClient, Persistor } from '../persistQueryClient-experimental'

interface CreateWebStoragePersistorOptions {
  /** The storage client used for setting an retrieving items from cache */
  storage: Storage
  /** The key to use when storing the cache */
  key?: string
  /** To avoid spamming,
   * pass a time in ms to debounce saving the cache to disk */
  debounceTime?: number
}

export function createWebStoragePersistor({
  storage,
  key = `REACT_QUERY_OFFLINE_CACHE`,
  debounceTime = 1000,
}: CreateWebStoragePersistorOptions): Persistor {
  if (typeof storage !== 'undefined') {
    return {
      persistClient: debounce(persistedClient => {
        storage.setItem(key, JSON.stringify(persistedClient))
      }, debounceTime),
      restoreClient: () => {
        const cacheString = storage.getItem(key)

        if (!cacheString) {
          return
        }

        return JSON.parse(cacheString) as PersistedClient
      },
      removeClient: () => {
        storage.removeItem(key)
      },
    }
  }

  return {
    persistClient: noop,
    restoreClient: noop,
    removeClient: noop,
  }
}

function debounce<TArgs extends any[]>(
  func: (...args: TArgs) => any,
  wait = 100
) {
  let timer: number | null = null

  return function (...args: TArgs) {
    if (timer !== null) {
      clearTimeout(timer)
    }
    timer = setTimeout(() => {
      func(...args)
      timer = null
    }, wait)
  }
}
