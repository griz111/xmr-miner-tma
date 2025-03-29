// Инициализация Telegram Web App
const tg = window.Telegram.WebApp;
tg.expand();
tg.enableClosingConfirmation();

// Приватное состояние приложения
const _state = {
  wallet: localStorage.getItem('xmr_wallet') || '',
  throttle: Math.min(100, Math.max(1, parseInt(localStorage.getItem('throttle') || 50))), 
  balance: 0,
  hashrate: 0,
  isMining: false
};

// Геттеры состояния
export const getState = () => ({ ..._state });

// Мутаторы состояния
export const setWallet = (wallet) => {
  _state.wallet = wallet;
  localStorage.setItem('xmr_wallet', wallet);
};

export const setThrottle = (value) => {
  _state.throttle = Math.min(100, Math.max(1, parseInt(value) || 50));
  localStorage.setItem('throttle', _state.throttle);
};

export const setMiningStatus = (status) => {
  _state.isMining = status;
};

export const updateBalance = (value) => {
  _state.balance = Number(value);
};

export const updateHashrate = (value) => {
  _state.hashrate = Number(value);
};

// Базовые обработчики
export const initCore = () => {
  // Инициализация обработчиков Telegram
  tg.onEvent('viewportChanged', handleViewportChange);
  
  // Проверка первого запуска
  if (!localStorage.getItem('security_warned')) {
    tg.showAlert('Кошелёк сохраняется локально. Не используйте реальные кошельки!');
    localStorage.setItem('security_warned', 'true');
  }
};

// Сохранение состояния при закрытии
const handleViewportChange = (e) => {
  if (e.isStateStable) {
    localStorage.setItem('xmr_wallet', _state.wallet);
  }
};

// Экспорт только необходимых констант
export const TelegramWebApp = tg;