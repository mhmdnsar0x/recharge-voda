const balanceMapping = {
  "20": 25,
  "30": 38,
  "40": 50,
  "50": 63,
  "60": 75,
  "70": 88,
  "80": 100,
  "90": 113,
  "100": 125,
  "200": 250,
  "300": 370,
  "400": 490,
  "500": 610,
  "1000": 1210
};

// DOM Elements
const form = document.getElementById('rechargeForm');
const balanceSelect = document.getElementById('balance');
const balanceInfo = document.getElementById('balanceInfo');
const cashAmountSpan = document.getElementById('cashAmount');
const rechargeAmountSpan = document.getElementById('rechargeAmount');
const phoneInput = document.getElementById('phone');
const phoneError = document.getElementById('phoneError');
const paymentMethodInput = document.getElementById('paymentMethod');
const cashMethod = document.getElementById('cashMethod');
const instaMethod = document.getElementById('instaMethod');
const cashInstructions = document.getElementById('cashInstructions');
const instaInstructions = document.getElementById('instaInstructions');
const cashSenderInput = document.getElementById('cashSender');
const cashSenderError = document.getElementById('cashSenderError');
const instaSenderInput = document.getElementById('instaSender');
const instaSenderError = document.getElementById('instaSenderError');
const uploadSection = document.getElementById('uploadSection');
const dropArea = document.getElementById('dropArea');
const screenshotInput = document.getElementById('screenshot');
const previewContainer = document.getElementById('previewContainer');
const previewImage = document.getElementById('previewImage');
const removeImageBtn = document.getElementById('removeImage');
const submitBtn = document.getElementById('submitBtn');

// Success elements
const formContainer = document.getElementById('formContainer');
const successContainer = document.getElementById('successContainer');
const summaryBalance = document.getElementById('summaryBalance');
const summaryPhone = document.getElementById('summaryPhone');
const summaryPaymentMethod = document.getElementById('summaryPaymentMethod');
const summaryCashAmount = document.getElementById('summaryCashAmount');
const newRequestBtn = document.getElementById('newRequestBtn');

// Telegram Bot Configuration
const TELEGRAM_BOT_TOKEN = '7951904237:AAFan2S1fCgbM3HRo4kOGBFAIou4MSZ55P4';
const TELEGRAM_CHAT_ID = '5030533432';

let formState = {
  balance: "",
  cashAmount: 0,
  phone: "",
  paymentMethod: "",
  senderInfo: "",
  screenshot: null
};

function validateForm() {
  const isPhoneValid = isValidPhoneNumber(formState.phone);
  const isBalanceSelected = formState.balance !== "";
  const isPaymentMethodSelected = formState.paymentMethod !== "";

  let isSenderInfoValid = false;
  if (formState.paymentMethod === "cash") {
    isSenderInfoValid = isValidCashSender(formState.senderInfo);
  } else if (formState.paymentMethod === "instapay") {
    isSenderInfoValid = isValidInstaSender(formState.senderInfo);
  }

  const isScreenshotSelected = formState.screenshot !== null;

  submitBtn.disabled = !(
    isPhoneValid &&
    isBalanceSelected &&
    isPaymentMethodSelected &&
    isSenderInfoValid &&
    isScreenshotSelected
  );
}

function isValidPhoneNumber(phone) {
  return /^010\d{8}$/.test(phone);
}

function isValidCashSender(sender) {
  return /^\d{11}$/.test(sender);
}

function isValidInstaSender(sender) {
  return /^[a-zA-Z0-9]+$/.test(sender) && sender.length > 0;
}

function formatCurrency(amount) {
  return `${amount} جنيه`;
}

async function sendToTelegram(orderData) {
  try {
    if (orderData.screenshot) {
      const caption = formatTelegramMessage(orderData);
      await sendScreenshotWithCaption(orderData.screenshot, caption);
    } else {
      const message = formatTelegramMessage(orderData);
      await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text: message,
          parse_mode: 'HTML'
        })
      });
    }
    return true;
  } catch (error) {
    console.error('Error sending to Telegram:', error);
    throw error;
  }
}

async function sendScreenshotWithCaption(screenshot, caption) {
  try {
    const formData = new FormData();
    formData.append('chat_id', TELEGRAM_CHAT_ID);
    formData.append('photo', screenshot, 'payment_screenshot.jpg');
    formData.append('caption', caption);
    formData.append('parse_mode', 'HTML');

    const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendPhoto`, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error('Telegram Photo Error: ' + errorText);
    }

    return true;
  } catch (error) {
    console.error('Error sending screenshot to Telegram:', error);
    throw error;
  }
}

function formatTelegramMessage(orderData) {
  const timestamp = new Date().toLocaleString('ar-EG', {
    timeZone: 'Africa/Cairo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });

  const paymentMethodText = orderData.paymentMethod === 'cash' ? 'محفظة كاش' : 'انستا باي';
  const senderLabel = orderData.paymentMethod === 'cash' ? 'رقم المرسل' : 'اسم المستخدم';

  return `🔔 <b>New Order</b>\n━━━━━━━━━━━━━━━━━━━━\n📱 <b>Phone Number:</b> ${orderData.phone}\n💰 <b>Balance:</b> ${orderData.balance} EGP\n💵 <b>Cash:</b> ${orderData.cashAmount} EGP\n💳 <b>Payment Method:</b> ${paymentMethodText}\n👤 <b>${senderLabel}:</b> ${orderData.senderInfo}\n⏰ <b>Time:</b> ${timestamp}\n━━━━━━━━━━━━━━━━━━━━\n✅ <b>Status:</b> Waiting...`;
}

function showLoading() {
  submitBtn.disabled = true;
  submitBtn.innerHTML = '<span class="loading-spinner"></span> جاري الإرسال...';
}

function hideLoading() {
  submitBtn.disabled = false;
  submitBtn.innerHTML = 'إرسال الطلب';
}

function showError(message) {
  alert(`Error sending your data: ${message}`);
}

balanceSelect.addEventListener('change', function () {
  const selectedBalance = this.value;
  if (selectedBalance) {
    formState.balance = selectedBalance;
    formState.cashAmount = balanceMapping[selectedBalance];

    cashAmountSpan.textContent = formState.cashAmount;
    rechargeAmountSpan.textContent = selectedBalance;
    balanceInfo.classList.remove('hidden');
  } else {
    balanceInfo.classList.add('hidden');
    formState.balance = "";
    formState.cashAmount = 0;
  }
  validateForm();
});

phoneInput.addEventListener('input', function () {
  const phoneValue = this.value.trim();
  formState.phone = phoneValue;

  if (phoneValue && !isValidPhoneNumber(phoneValue)) {
    phoneError.classList.remove('hidden');
  } else {
    phoneError.classList.add('hidden');
  }
  validateForm();
});

cashMethod.addEventListener('click', function () {
  selectPaymentMethod('cash');
});

instaMethod.addEventListener('click', function () {
  selectPaymentMethod('instapay');
});

function selectPaymentMethod(method) {
  cashMethod.classList.remove('selected');
  instaMethod.classList.remove('selected');
  cashInstructions.classList.add('hidden');
  instaInstructions.classList.add('hidden');

  formState.senderInfo = "";
  cashSenderInput.value = "";
  instaSenderInput.value = "";
  cashSenderError.classList.add('hidden');
  instaSenderError.classList.add('hidden');

  formState.paymentMethod = method;
  paymentMethodInput.value = method;

  if (method === 'cash') {
    cashMethod.classList.add('selected');
    cashInstructions.classList.remove('hidden');
  } else {
    instaMethod.classList.add('selected');
    instaInstructions.classList.remove('hidden');
  }

  uploadSection.classList.remove('hidden');
  validateForm();
}

cashSenderInput.addEventListener('input', function () {
  const value = this.value.trim();
  formState.senderInfo = value;

  if (value && !isValidCashSender(value)) {
    cashSenderError.classList.remove('hidden');
  } else {
    cashSenderError.classList.add('hidden');
  }
  validateForm();
});

instaSenderInput.addEventListener('input', function () {
  const value = this.value.trim();
  formState.senderInfo = value;

  if (value && !isValidInstaSender(value)) {
    instaSenderError.classList.remove('hidden');
  } else {
    instaSenderError.classList.add('hidden');
  }
  validateForm();
});

dropArea.addEventListener('click', function () {
  screenshotInput.click();
});

screenshotInput.addEventListener('change', function (e) {
  const file = e.target.files[0];
  if (file) {
    handleFileSelect(file);
  }
});

dropArea.addEventListener('dragover', function (e) {
  e.preventDefault();
  this.classList.add('drag-over');
});

dropArea.addEventListener('dragleave', function (e) {
  e.preventDefault();
  this.classList.remove('drag-over');
});

dropArea.addEventListener('drop', function (e) {
  e.preventDefault();
  this.classList.remove('drag-over');
  if (e.dataTransfer.files.length) {
    handleFileSelect(e.dataTransfer.files[0]);
  }
});

function handleFileSelect(file) {
  if (!file.type.match('image.*')) {
    alert('برجاء اختيار صورة فقط');
    return;
  }

  if (file.size > 5 * 1024 * 1024) {
    alert('حجم الصورة يجب أن يكون أقل من 5 ميجابايت');
    return;
  }

  formState.screenshot = file;

  const reader = new FileReader();
  reader.onload = function (e) {
    previewImage.src = e.target.result;
    previewContainer.classList.remove('hidden');
    dropArea.classList.add('hidden');
  };
  reader.readAsDataURL(file);

  validateForm();
}

removeImageBtn.addEventListener('click', function () {
  previewContainer.classList.add('hidden');
  previewImage.src = '';
  screenshotInput.value = '';
  formState.screenshot = null;
  dropArea.classList.remove('hidden');
  validateForm();
});

form.addEventListener('submit', async function (e) {
  e.preventDefault();
  if (!submitBtn.disabled) {
    showLoading();
    try {
      const orderSummary = {
        balance: formState.balance,
        cashAmount: formState.cashAmount,
        phone: formState.phone,
        paymentMethod: formState.paymentMethod,
        senderInfo: formState.senderInfo,
        screenshot: formState.screenshot
      };

      await sendToTelegram(orderSummary);

      summaryBalance.textContent = formatCurrency(parseInt(orderSummary.balance));
      summaryPhone.textContent = orderSummary.phone;
      summaryPaymentMethod.textContent = orderSummary.paymentMethod === 'cash' ? 'محفظة كاش' : 'انستا باي';
      summaryCashAmount.textContent = formatCurrency(orderSummary.cashAmount);

      formContainer.classList.add('hidden');
      successContainer.classList.remove('hidden');
    } catch (error) {
      hideLoading();
      showError('Error sending your data, please try again later.');
      console.error('Submission error:', error);
    }
  }
});


