import { getState, updateBalance } from './core.js';

const API_BASE = 'https://moneroocean.stream/api/miner/';
const UPDATE_INTERVAL = 300000; // 5 минут
let updateTimer = null;

// Основной запрос баланса
export const fetchBalance = async () => {
  const { wallet } = getState();
  if (!wallet || wallet.length !== 95) return 0;

  try {
    const response = await fetch(`${API_BASE}${wallet}/stats`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    
    const data = await response.json();
    return calculateTotalBalance(data);
  } catch (e) {
    console.error('Balance fetch failed:', e);
    return null;
  }
};

// Парсинг ответа пула
const calculateTotalBalance = (poolData) => {
  const confirmed = parseFloat(poolData?.paid || 0);
  const unconfirmed = parseFloat(poolData?.balance || 0);
  return confirmed + unconfirmed;
};

// Автообновление баланса
export const startBalanceAutoUpdate = () => {
  if (updateTimer) return;

  const update = async () => {
    const balance = await fetchBalance();
    if (balance !== null) {
      updateBalance(balance);
    }
  };

  update();
  updateTimer = setInterval(update, UPDATE_INTERVAL);
};

export const stopBalanceAutoUpdate = () => {
  clearInterval(updateTimer);
  updateTimer = null;
};

// Интеграция с системой
export const initBalanceService = () => {
  const { wallet } = getState();
  if (wallet) startBalanceAutoUpdate();

  window.addEventListener('walletChanged', () => {
    stopBalanceAutoUpdate();
    if (getState().wallet) startBalanceAutoUpdate();
  });
};