// =============================================
// Service Worker - Offline Support for Well-being Survey v3.1
// รองรับการทำงานแบบ Offline และ Sync ข้อมูลเมื่อกลับมออนไลน์
// =============================================

const CACHE_NAME = 'wellbeing-survey-v3.1';
const STATIC_CACHE = 'static-v3.1';
const DATA_CACHE = 'data-v3.1';

// ไฟล์ที่ต้อง Cache สำหรับ Offline
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/ch1.html',
  '/admin.html',
  '/css/styles.css',
  '/css/ch1-form.css',
  '/js/app.js',
  '/js/components.js',
  '/js/ch1-form.js',
  '/js/supabase-config.js',
  '/js/loading-states.js',
  '/js/rate-limiter.js',
  // CDN Resources
  'https://cdn.tailwindcss.com',
  'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2',
  'https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Thai+Looped:wght@300;400;500;600;700&display=swap'
];

// =============================================
// Install Event - Cache Static Assets
// =============================================
self.addEventListener('install', (event) => {
  console.log('[SW] Installing Service Worker...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[SW] Caching static assets...');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('[SW] Static assets cached successfully');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[SW] Failed to cache static assets:', error);
      })
  );
});

// =============================================
// Activate Event - Cleanup Old Caches
// =============================================
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating Service Worker...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && cacheName !== DATA_CACHE) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('[SW] Service Worker activated');
        return self.clients.claim();
      })
  );
});

// =============================================
// Fetch Event - Cache Strategies
// =============================================
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // ข้าม requests ที่ไม่ใช่ GET
  if (request.method !== 'GET') {
    return;
  }
  
  // Strategy 1: Cache First สำหรับ Static Assets
  if (isStaticAsset(url)) {
    event.respondWith(cacheFirst(request));
    return;
  }
  
  // Strategy 2: Network First สำหรับ API Calls
  if (isAPIRequest(url)) {
    event.respondWith(networkFirst(request));
    return;
  }
  
  // Strategy 3: Stale While Revalidate สำหรับ HTML Pages
  if (isHTMLPage(request)) {
    event.respondWith(staleWhileRevalidate(request));
    return;
  }
  
  // Default: Network Only
  event.respondWith(fetch(request));
});

// =============================================
// Cache Strategies
// =============================================

// Cache First - ใช้ Cache ถ้ามี ถ้าไม่มีให้ Fetch
async function cacheFirst(request) {
  const cache = await caches.open(STATIC_CACHE);
  const cached = await cache.match(request);
  
  if (cached) {
    return cached;
  }
  
  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    console.error('[SW] Fetch failed:', error);
    return new Response('Offline - Resource not available', {
      status: 503,
      statusText: 'Service Unavailable',
      headers: { 'Content-Type': 'text/plain' }
    });
  }
}

// Network First - Fetch ก่อน ถ้า Fail ใช้ Cache
async function networkFirst(request) {
  const cache = await caches.open(DATA_CACHE);
  
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.log('[SW] Network failed, trying cache...');
    const cached = await cache.match(request);
    
    if (cached) {
      return cached;
    }
    
    throw error;
  }
}

// Stale While Revalidate - ใช้ Cache ทันที พร้อม Update Cache ใน background
async function staleWhileRevalidate(request) {
  const cache = await caches.open(STATIC_CACHE);
  const cached = await cache.match(request);
  
  const fetchPromise = fetch(request).then((response) => {
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  }).catch((error) => {
    console.log('[SW] Background fetch failed:', error);
  });
  
  // Return cached version immediately if available
  if (cached) {
    // Update cache in background
    fetchPromise;
    return cached;
  }
  
  // If not in cache, wait for network
  return fetchPromise;
}

// =============================================
// Background Sync - ส่งข้อมูลเมื่อกลับมออนไลน์
// =============================================
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-form-data') {
    console.log('[SW] Background sync triggered');
    event.waitUntil(syncFormData());
  }
});

// Supabase config (duplicated here because SW can't import modules)
const SB_URL = 'https://fgdommhiqhzvsedfzyrr.supabase.co';
const SB_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZnZG9tbWhpcWh6dnNlZGZ6eXJyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkzMzY2MzUsImV4cCI6MjA4NDkxMjYzNX0.GFMOeDArhq-9lPt39OizkBOFFgK4TDpVDJrk_HRQ6Xc';

// Sync ข้อมูลที่ค้างอยู่ — ส่งตรงไป Supabase REST API
async function syncFormData() {
  try {
    const offlineData = await getOfflineData();
    let syncedCount = 0;
    let failedCount = 0;
    
    for (const data of offlineData) {
      if (data.synced) continue;
      
      try {
        const { formType, formData, authToken } = data;
        // เลือกตารางตาม formType
        const tableName = formType === 'ch1' ? 'hrd_ch1_responses' : 'survey_responses';
        
        const headers = {
          'Content-Type': 'application/json',
          'apikey': SB_ANON_KEY,
          'Prefer': 'return=minimal'
        };
        // ใส่ auth token ถ้ามี (สำหรับ authenticated forms)
        if (authToken) {
          headers['Authorization'] = `Bearer ${authToken}`;
        } else {
          headers['Authorization'] = `Bearer ${SB_ANON_KEY}`;
        }
        
        const response = await fetch(`${SB_URL}/rest/v1/${tableName}`, {
          method: 'POST',
          headers,
          body: JSON.stringify(formData)
        });
        
        if (response.ok || response.status === 201) {
          data.synced = true;
          data.syncedAt = new Date().toISOString();
          syncedCount++;
          console.log('[SW] ✅ Synced:', formType, data.formData?.respondent_email || data.formData?.organization || '');
        } else {
          const errText = await response.text().catch(() => '');
          console.error('[SW] Sync HTTP error:', response.status, errText);
          data.lastError = `HTTP ${response.status}: ${errText}`;
          failedCount++;
        }
      } catch (error) {
        console.error('[SW] Failed to sync item:', error);
        data.lastError = error.message;
        failedCount++;
      }
    }
    
    // Save updated offline data (keep failed for retry)
    await saveOfflineData(offlineData.filter(d => !d.synced));
    
    // Notify clients
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
      client.postMessage({
        type: 'SYNC_COMPLETE',
        synced: syncedCount,
        failed: failedCount,
        remaining: offlineData.filter(d => !d.synced).length,
        message: failedCount === 0
          ? `✅ ซิงค์สำเร็จ ${syncedCount} รายการ`
          : `⚠️ ซิงค์สำเร็จ ${syncedCount} รายการ, ล้มเหลว ${failedCount} รายการ`
      });
    });
    
  } catch (error) {
    console.error('[SW] Sync failed:', error);
    // Notify clients of failure
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
      client.postMessage({
        type: 'SYNC_ERROR',
        message: '❌ การซิงค์ล้มเหลว: ' + error.message
      });
    });
  }
}

// =============================================
// Push Notifications (สำหรับการแจ้งเตือน)
// =============================================
self.addEventListener('push', (event) => {
  if (!event.data) return;
  
  const data = event.data.json();
  const options = {
    body: data.body || 'มีการอัพเดทใหม่',
    icon: '/assets/icon-192x192.png',
    badge: '/assets/badge-72x72.png',
    tag: data.tag || 'default',
    requireInteraction: true,
    actions: data.actions || []
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title || 'Well-being Survey', options)
  );
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  event.waitUntil(
    self.clients.openWindow(event.notification.data?.url || '/')
  );
});

// =============================================
// Message Handling - รับข้อความจาก Main Thread
// =============================================
self.addEventListener('message', (event) => {
  const { type, data } = event.data;
  
  switch (type) {
    case 'SAVE_OFFLINE_DATA':
      saveOfflineData(data);
      break;
      
    case 'GET_OFFLINE_DATA':
      getOfflineData().then(offlineData => {
        event.source.postMessage({
          type: 'OFFLINE_DATA',
          data: offlineData
        });
      });
      break;
      
    case 'CLEAR_OFFLINE_DATA':
      clearOfflineData();
      break;
      
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
      
    case 'GET_VERSION':
      event.source.postMessage({
        type: 'VERSION',
        version: CACHE_NAME
      });
      break;
  }
});

// =============================================
// Helper Functions
// =============================================

function isStaticAsset(url) {
  const staticExtensions = ['.js', '.css', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.woff', '.woff2', '.ttf'];
  return staticExtensions.some(ext => url.pathname.endsWith(ext));
}

function isAPIRequest(url) {
  return url.pathname.includes('/api/') || 
         url.hostname.includes('supabase.co');
}

function isHTMLPage(request) {
  return request.mode === 'navigate' || 
         request.headers.get('accept')?.includes('text/html');
}

// IndexedDB สำหรับเก็บข้อมูล Offline
async function getOfflineData() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('WellbeingSurveyDB', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(['offlineData'], 'readonly');
      const store = transaction.objectStore('offlineData');
      const getAll = store.getAll();
      
      getAll.onsuccess = () => resolve(getAll.result || []);
      getAll.onerror = () => reject(getAll.error);
    };
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('offlineData')) {
        db.createObjectStore('offlineData', { keyPath: 'id', autoIncrement: true });
      }
    };
  });
}

async function saveOfflineData(data) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('WellbeingSurveyDB', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(['offlineData'], 'readwrite');
      const store = transaction.objectStore('offlineData');
      
      // Clear and save new data
      const clear = store.clear();
      clear.onsuccess = () => {
        for (const item of data) {
          store.add(item);
        }
        resolve();
      };
    };
  });
}

async function clearOfflineData() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('WellbeingSurveyDB', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(['offlineData'], 'readwrite');
      const store = transaction.objectStore('offlineData');
      const clear = store.clear();
      clear.onsuccess = () => resolve();
      clear.onerror = () => reject(clear.error);
    };
  });
}

// =============================================
// Periodic Sync (ถ้า Browser รองรับ)
// =============================================
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'sync-form-data') {
    event.waitUntil(syncFormData());
  }
});
