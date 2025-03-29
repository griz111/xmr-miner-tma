import { getState, updateBalance, updateHashrate, setMiningStatus } from './core.js';
import { getMinerSocket } from './pool.js';

let minerInstance = null;
let currentJob = null;
const WASM_URL = 'https://cdn.jsdelivr.net/npm/cryptonight-wasm@3.0.0/cryptonight.wasm';

// Инициализация WASM-майнера
export const initMiner = async () => {
  try {
    const response = await fetch(WASM_URL);
    const wasmModule = await WebAssembly.compile(await response.arrayBuffer());
    
    minerInstance = new CryptoNightWasm.Miner({
      module: wasmModule,
      threads: calculateOptimalThreads(),
      throttle: getState().throttle / 100
    });

    setupEventHandlers();
  } catch (e) {
    window.Telegram.WebApp.showAlert('Ошибка инициализации майнера!');
    console.error('WASM Error:', e);
  }
};

// Обработчики событий майнера
const setupEventHandlers = () => {
  minerInstance.on('found', handleFoundSolution);
  minerInstance.on('accepted', updateMiningStats);
  minerInstance.on('update', handleHashrateUpdate);
};

// Запуск майнинга
export const startMining = (job) => {
  if (!minerInstance || !job) return;
  
  currentJob = job;
  minerInstance.start(job.blob, job.target);
  setMiningStatus(true);
};

// Остановка майнинга
export const stopMining = () => {
  if (!minerInstance) return;
  
  minerInstance.stop();
  currentJob = null;
  setMiningStatus(false);
};

// Отправка решения в пул
const handleFoundSolution = () => {
  const minerSocket = getMinerSocket(); // Актуальное соединение
  if (!currentJob || !minerSocket) return;

  minerSocket.send(JSON.stringify({
    method: "submit",
    params: {
      id: currentJob.job_id,
      nonce: minerInstance.getNonce(),
      result: minerInstance.getHash()
    }
  }));
};

// Обновление статистики
const updateMiningStats = () => {
  const reward = calculateReward();
  updateBalance(getState().balance + reward);
};

const handleHashrateUpdate = (data) => {
  updateHashrate(data.hashesPerSecond);
};

// Расчет награды и потоков
const calculateReward = () => {
  const { hashrate, throttle } = getState();
  return (hashrate * throttle * 0.00000001) / 100;
};

const calculateOptimalThreads = () => {
  return Math.max(1, Math.floor(navigator.hardwareConcurrency * (getState().throttle / 100)));
};

// Регулировка нагрузки
export const adjustThrottle = (value) => {
  if (minerInstance) {
    minerInstance.setThrottle(value / 100);
    minerInstance.setNumThreads(calculateOptimalThreads());
  }
};

// Обработка новых заданий
window.addEventListener('newJob', (e) => {
  if (getState().isMining) startMining(e.detail);
});

// Автоматическая остановка при закрытии
window.addEventListener('beforeunload', stopMining);