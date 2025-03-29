import { getState, setMiningStatus } from './core.js';
import { UserMessages, AppConfig, ValidationRules } from './config.js';

let _minerSocket = null;
const Telegram = window.Telegram?.WebApp || { showAlert: console.log };

// Геттер для защищённого доступа к сокету
export const getMinerSocket = () => _minerSocket;

// Подключение к пулу
export const connectToPool = () => {
  const { wallet } = getState();
  
  if (!ValidationRules.XMR_WALLET_REGEX.test(wallet)) {
    Telegram.showAlert(UserMessages.INVALID_WALLET);
    return;
  }

  _minerSocket = new WebSocket(`${AppConfig.POOL_WS_URL}${encodeURIComponent(wallet)}`);

  _minerSocket.onopen = () => {
    setMiningStatus(true);
    Telegram.showAlert(UserMessages.CONNECTION_SUCCESS);
  };

  _minerSocket.onmessage = handleSocketMessage;
  _minerSocket.onerror = handleSocketError;
  _minerSocket.onclose = handleSocketClose;
};

// Обработка сообщений WebSocket
const handleSocketMessage = (event) => {
  if (!_minerSocket) return; // Добавлена проверка
  try {
    const data = JSON.parse(event.data);
    if (data.method === 'job') processJob(data.params);
  } catch (e) {
    console.error('Ошибка обработки сообщения:', e);
  }
};

// Обработка новых заданий
const processJob = (job) => {
  if (!job?.blob || !job?.target) {
    Telegram.showAlert('Некорректное задание от пула');
    return;
  }

  window.dispatchEvent(new CustomEvent('newJob', {
    detail: {
      blob: job.blob,
      target: job.target,
      job_id: job.job_id
    }
  }));
};

// Обработка ошибок соединения
const handleSocketError = (error) => {
  console.error('Ошибка WebSocket:', error);
  setMiningStatus(false);
};

// Закрытие соединения
const handleSocketClose = () => {
  setMiningStatus(false);
  _minerSocket = null;
};

// Отключение от пула
export const disconnectPool = () => {
  if (_minerSocket) {
    _minerSocket.close();
    _minerSocket = null;
    setMiningStatus(false);
  }
};

// Автопереподключение при смене кошелька
window.addEventListener('walletChanged', () => {
  disconnectPool();
  if (getState().isMining) connectToPool();
});