import { getState, setWallet, setThrottle, setMiningStatus } from './core.js';
import { connectToPool, disconnectPool } from './pool.js';
import { startMining, stopMining, adjustThrottle } from './miner.js';
import { UserMessages, AppConfig } from './config.js';

// Инициализация интерфейса
export const initUI = () => {
  renderInterface();
  applyTheme();
  setupEventListeners();
  startUIUpdates();
};

// Рендеринг основной структуры
const renderInterface = () => {
  const { wallet, throttle, balance, isMining } = getState();
  
  const markup = `
    <div class="container">
      <div class="balance-box">
        <span class="label">Баланс:</span>
        <span id="balance" class="value">${balance.toFixed(6)} XMR</span>
      </div>

      <input type="text" 
             id="wallet" 
             class="tg-input"
             placeholder="XMR кошелёк"
             value="${wallet}"
             maxlength="${AppConfig.WALLET_LENGTH}">

      <div class="throttle-control">
        <input type="range" 
               id="throttle" 
               class="tg-slider"
               min="${AppConfig.THROTTLE.MIN}"
               max="${AppConfig.THROTTLE.MAX}"
               value="${throttle}">
        <span id="throttle-value">${throttle}%</span>
      </div>

      <div class="hashrate-box">
        <span class="label">Хешрейт:</span>
        <span id="hashrate" class="value">0 H/s</span>
      </div>

      <button id="start" class="tg-button ${isMining ? 'active' : ''}">
        ${isMining ? 'СТОП' : 'СТАРТ'}
      </button>

      <button id="withdraw" class="tg-button">
        Вывод (мин. ${AppConfig.MIN_WITHDRAW} XMR)
      </button>
    </div>
  `;

  document.getElementById('app').innerHTML = markup;
};

// Настройка обработчиков событий
const setupEventListeners = () => {
  document.getElementById('wallet').addEventListener('input', handleWalletChange);
  document.getElementById('throttle').addEventListener('input', handleThrottleChange);
  document.getElementById('start').addEventListener('click', handleMiningToggle);
  document.getElementById('withdraw').addEventListener('click', handleWithdraw);
};

// Обновление данных интерфейса
export const updateUI = () => {
  const { balance, hashrate, throttle, isMining } = getState();
  
  document.getElementById('balance').textContent = `${balance.toFixed(6)} XMR`;
  document.getElementById('hashrate').textContent = `${hashrate.toFixed(2)} H/s`;
  document.getElementById('throttle-value').textContent = `${throttle}%`;
  document.getElementById('start').textContent = isMining ? 'СТОП' : 'СТАРТ';
  document.getElementById('start').classList.toggle('active', isMining);
};

// Обработчики действий
const handleWalletChange = (e) => {
  const wallet = e.target.value.trim();
  setWallet(wallet);
  window.dispatchEvent(new CustomEvent('walletChanged'));
};

const handleThrottleChange = (e) => {
  const value = parseInt(e.target.value);
  setThrottle(value);
  adjustThrottle(value);
  updateUI();
};

const handleMiningToggle = () => {
  const { isMining } = getState();
  isMining ? stopMiningProcess() : startMiningProcess();
};

const handleWithdraw = () => {
  const { balance, wallet } = getState();
  if (balance < AppConfig.MIN_WITHDRAW) {
    window.Telegram.WebApp.showAlert(UserMessages.MIN_WITHDRAW_ALERT);
    return;
  }
  const amount = (balance * (1 - AppConfig.COMMISSION)).toFixed(6);
  window.Telegram.WebApp.sendData(JSON.stringify({
    action: 'withdraw',
    amount: amount,
    wallet: wallet
  }));
};

// Управление майнингом
const startMiningProcess = () => {
  connectToPool();
  updateUI();
};

const stopMiningProcess = () => {
  disconnectPool();
  stopMining();
  updateUI();
};

// Интеграция с темой Telegram
const applyTheme = () => {
  const root = document.documentElement;
  const theme = window.Telegram.WebApp.themeParams;
  
  root.style.setProperty('--bg-color', theme.bg_color || '#ffffff');
  root.style.setProperty('--text-color', theme.text_color || '#000000');
  root.style.setProperty('--button-color', theme.button_color || '#2481cc');
  root.style.setProperty('--secondary-bg', theme.secondary_bg_color || '#f4f4f5');
};

// Автоматическое обновление
let uiUpdateInterval;
const startUIUpdates = () => {
  uiUpdateInterval = setInterval(updateUI, AppConfig.UI_UPDATE_INTERVAL);
};

// Очистка при закрытии
window.addEventListener('beforeunload', () => {
  clearInterval(uiUpdateInterval);
});

// Инициализация
document.addEventListener('DOMContentLoaded', initUI);