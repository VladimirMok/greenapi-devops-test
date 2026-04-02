// GREEN-API базовая URL
const API_BASE = 'https://api.green-api.com';

// DOM элементы
const idInstanceInput = document.getElementById('idInstance');
const apiTokenInput = document.getElementById('apiToken');
const phoneNumberInput = document.getElementById('phoneNumber');
const messageTextInput = document.getElementById('messageText');
const fileUrlInput = document.getElementById('fileUrl');
const resultOutput = document.getElementById('resultOutput');
const statusIndicator = document.getElementById('statusIndicator');
const statusText = document.getElementById('statusText');

// Кнопки
const btnGetSettings = document.getElementById('btnGetSettings');
const btnGetState = document.getElementById('btnGetState');
const btnSendMessage = document.getElementById('btnSendMessage');
const btnSendFile = document.getElementById('btnSendFile');

const btnTexts = {
    settings: btnGetSettings?.innerHTML || 'getSettings',
    state: btnGetState?.innerHTML || 'getStateInstance',
    message: btnSendMessage?.innerHTML || 'sendMessage',
    file: btnSendFile?.innerHTML || 'sendFileByUrl'
};

function setLoading(button, loading, originalText) {
    if (!button) return;
    if (loading) {
        button.disabled = true;
    } else {
        button.disabled = false;
        button.innerHTML = originalText;
    }
}

// Утилита для выполнения запросов
async function callApi(method, params = null) {
    const idInstance = idInstanceInput.value.trim();
    const apiToken = apiTokenInput.value.trim();

    if (!idInstance || !apiToken) {
        throw new Error('Пожалуйста, заполните idInstance и ApiTokenInstance');
    }

    let url = `${API_BASE}/waInstance${idInstance}/${method}/${apiToken}`;
    const getMethods = ['getSettings', 'getStateInstance', 'getWaSettings'];
    const httpMethod = getMethods.includes(method) ? 'GET' : 'POST';
    
    const options = {
        method: httpMethod,
        headers: {
            'Content-Type': 'application/json'
        }
    };

    // Параметры передаем только для POST-запросов
    if (params && httpMethod === 'POST') {
        options.body = JSON.stringify(params);
    }

    const response = await fetch(url, options);
    
    if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return await response.json();
}

// Обновление результата на странице
function updateResult(data, success = true) {
    const timestamp = new Date().toLocaleTimeString();
    const prefix = success ? `✅ [${timestamp}] Успешно:\n` : `❌ [${timestamp}] Ошибка:\n`;
    const output = prefix + JSON.stringify(data, null, 2);
    resultOutput.textContent = output;
}

// Обновление статуса
function updateStatus(online, message) {
    if (online) {
        statusIndicator.className = 'status-online';
        statusText.textContent = message || 'Инстанс активен';
    } else {
        statusIndicator.className = 'status-offline';
        statusText.textContent = message || 'Не подключено';
    }
}

// getSettings
async function getSettings() {
    try {
        setLoading(btnGetSettings, true, btnTexts.settings);	    
        const result = await callApi('getSettings');
        updateResult(result);
        return result;
    } catch (error) {
        updateResult({ error: error.message }, false);
        throw error;
    }
}

// getStateInstance
async function getStateInstance() {
    try {
        setLoading(btnGetState, true, btnTexts.state);	    
        const result = await callApi('getStateInstance');
        updateResult(result);
        
        // Обновляем статус на основе ответа
        if (result.stateInstance === 'authorized') {
            updateStatus(true, 'Инстанс авторизован (WhatsApp подключен)');
        } else if (result.stateInstance === 'notAuthorized') {
            updateStatus(false, 'Не авторизован. Просканируйте QR-код в личном кабинете GREEN-API');
        } else if (result.stateInstance === 'blocked') {
            updateStatus(false, 'Инстанс заблокирован');
        } else {
            updateStatus(false, `Состояние: ${result.stateInstance}`);
        }
        
        return result;
    } catch (error) {
        updateResult({ error: error.message }, false);
        updateStatus(false, 'Ошибка подключения к API');
        throw error;
    }
}

// sendMessage
async function sendMessage() {
    const phoneNumber = phoneNumberInput.value.trim();
    const message = messageTextInput.value.trim();

    if (!phoneNumber) {
        updateResult({ error: 'Введите номер телефона' }, false);
        return;
    }
    
    if (!message) {
        updateResult({ error: 'Введите текст сообщения' }, false);
        return;
    }

    // Форматируем номер (должен быть в формате 7XXXXXXXXXX)
    let formattedNumber = phoneNumber.replace(/[^0-9]/g, '');
    if (!formattedNumber.startsWith('7') && !formattedNumber.startsWith('8')) {
        formattedNumber = '7' + formattedNumber;
    }
    formattedNumber = formattedNumber.replace(/^8/, '7');

    try {
        const params = {
            chatId: `${formattedNumber}@c.us`,
            message: message
        };
        
        const result = await callApi('sendMessage', params);
        updateResult(result);
        
        if (result.idMessage) {
            // Дополнительно показываем успех
            resultOutput.textContent = `✅ [${new Date().toLocaleTimeString()}] Сообщение отправлено!\n` + JSON.stringify(result, null, 2);
        }
        
        return result;
    } catch (error) {
        updateResult({ error: error.message }, false);
        throw error;
    }
}

// sendFileByUrl
async function sendFileByUrl() {
    const phoneNumber = phoneNumberInput.value.trim();
    const fileUrl = fileUrlInput.value.trim();

    if (!phoneNumber) {
        updateResult({ error: 'Введите номер телефона' }, false);
        return;
    }
    
    if (!fileUrl) {
        updateResult({ error: 'Введите URL файла' }, false);
        return;
    }

    // Форматируем номер
    let formattedNumber = phoneNumber.replace(/[^0-9]/g, '');
    if (!formattedNumber.startsWith('7') && !formattedNumber.startsWith('8')) {
        formattedNumber = '7' + formattedNumber;
    }
    formattedNumber = formattedNumber.replace(/^8/, '7');

    try {
        const params = {
            chatId: `${formattedNumber}@c.us`,
            urlFile: fileUrl,
            fileName: fileUrl.split('/').pop() || 'file'
        };
        
        const result = await callApi('sendFileByUrl', params);
        updateResult(result);
        
        return result;
    } catch (error) {
        updateResult({ error: error.message }, false);
        throw error;
    }
}

// Автоматическая проверка статуса при вводе данных
let debounceTimer;
function autoCheckStatus() {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
        const idInstance = idInstanceInput.value.trim();
        const apiToken = apiTokenInput.value.trim();
        if (idInstance && apiToken) {
            getStateInstance().catch(() => {});
        } else {
            updateStatus(false, 'Введите параметры подключения');
        }
    }, 1000);
}

// Слушатели событий
btnGetSettings.addEventListener('click', getSettings);
btnGetState.addEventListener('click', getStateInstance);
btnSendMessage.addEventListener('click', sendMessage);
btnSendFile.addEventListener('click', sendFileByUrl);


// Проверка при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    // Проверяем, есть ли сохраненные данные в localStorage
    const savedId = localStorage.getItem('greenapi_idInstance');
    const savedToken = localStorage.getItem('greenapi_apiToken');
    
    if (savedId) idInstanceInput.value = savedId;
    if (savedToken) apiTokenInput.value = savedToken;
    
    // Сохраняем при изменении
    idInstanceInput.addEventListener('change', () => {
        localStorage.setItem('greenapi_idInstance', idInstanceInput.value);
    });
    apiTokenInput.addEventListener('change', () => {
        localStorage.setItem('greenapi_apiToken', apiTokenInput.value);
    });
});
