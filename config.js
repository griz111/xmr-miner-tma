// Базовые настройки приложения
export const AppConfig = {
  POOL_WS_URL: 'wss://moneroocean.stream/ws/',
  POOL_API_URL: 'https://moneroocean.stream/api/miner/',
  WASM_URL: 'https://cdn.jsdelivr.net/npm/cryptonight-wasm@3.0.0/cryptonight.wasm',
  BALANCE_UPDATE_INTERVAL: 300000, // 5 минут
  UI_UPDATE_INTERVAL: 1000,
  MIN_WITHDRAW: 0.001,
  COMMISSION: 0.1,
  THROTTLE: {
    MIN: 1,
    MAX: 100,
    DEFAULT: 50
  }
};

// Валидационные константы
export const ValidationRules = {
  XMR_WALLET_REGEX: /^4[0-9AB][1-9A-HJ-NP-Za-km-z]{93}$/,
  WALLET_LENGTH: 95
};

// Сообщения для пользователя
export const UserMessages = {
  WALLET_WARNING: 'Кошелёк сохраняется локально. Не используйте реальные кошельки!',
  INVALID_WALLET: 'Неверный формат Monero кошелька!',
  MIN_WITHDRAW_ALERT: 'Минимальная сумма вывода 0.001 XMR!',
  CONNECTION_SUCCESS: 'Соединение с пулом установлено',
  MINER_LOAD_ERROR: 'Ошибка инициализации майнера!'
};

// Коды ошибок WebSocket
export const WSErrors = {
  NORMAL_CLOSURE: 1000,
  GOING_AWAY: 1001
};