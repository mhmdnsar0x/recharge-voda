// DOM Elements
const form = document.getElementById('rechargeForm');
const balanceInput = document.getElementById('balanceInput');
const cashAmountInput = document.getElementById('cashAmount');
const balanceInfo = document.getElementById('balanceInfo');
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

// Trader code logic
const showTraderBtn = document.getElementById('showTraderBtn');
const traderRow = document.getElementById('traderRow');
const traderCodeInput = document.getElementById('traderCodeInput');
const applyTraderBtn = document.getElementById('applyTraderBtn');
const closeTraderRow = document.getElementById('closeTraderRow');
const traderError = document.getElementById('traderError');
let traderApplied = false;

// Telegram Bot Configuration
const TELEGRAM_BOT_TOKEN = '7951904237:AAFan2S1fCgbM3HRo4kOGBFAIou4MSZ55P4'; // 😢😢
const TELEGRAM_CHAT_ID = '5030533432'; // 😢😢

// Form state
let formState = {
  balance: "",
  cashAmount: 0,
  phone: "",
  paymentMethod: "",
  senderInfo: "",
  screenshot: null
};

// Initialize form validation
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

// Validation functions
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

// Telegram Bot Functions
async function sendToTelegram(orderData) {
  const formData = new FormData();
  formData.append('chat_id', TELEGRAM_CHAT_ID);
  formData.append('photo', orderData.screenshot, 'payment_screenshot.jpg');
  formData.append('caption', formatTelegramMessage(orderData));
  formData.append('parse_mode', 'HTML');

  const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendPhoto`, {
    method: 'POST',
    body: formData
  });

  if (!response.ok) throw new Error('Failed to send to Telegram');
  return true;
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

  const paymentMethodText = orderData.paymentMethod === 'cash' ? 'Cash Wallet ' : 'InstaPay';
  const senderLabel = orderData.paymentMethod === 'cash' ? 'Cash Number ' : 'Insta User ';

  return `
🔔 <b>New Order </b>
━━━━━━━━━━━━━━━━━━━━
📱 <b>Phone Number : </b> ${orderData.phone}
💰 <b>Blance Amount : </b> ${orderData.balance} EGP
____________________
💵 <b>Cash Amount : </b> ${orderData.cashAmount} EGP
💳 <b>Payment Method : </b> ${paymentMethodText}
👤 <b>${senderLabel} : n</b> ${orderData.senderInfo}
⏰ <b>Submit At : </b> ${timestamp}
━━━━━━━━━━━━━━━━━━━━
✅ <b>Statue :</b> Under Review...
  `.trim();
}

// Show loading state
function showLoading() {
  submitBtn.disabled = true;
  submitBtn.innerHTML = '<span class="loading-spinner"></span> جاري الإرسال...';
}

// Hide loading state
function hideLoading() {
  submitBtn.disabled = false;
  submitBtn.innerHTML = 'إرسال الطلب';
}

// Show error message
function showError(message) {
  alert(`خطأ في الإرسال: ${message}`);
}

// error msg
let minBalanceMsg = document.createElement('div');
minBalanceMsg.id = 'minBalanceMsg';
minBalanceMsg.style.color = '#f44336';
minBalanceMsg.style.fontSize = '0.95rem';
minBalanceMsg.style.marginTop = '4px';
minBalanceMsg.style.display = 'none';
balanceInput.parentNode.appendChild(minBalanceMsg);
const minBalanceBox = document.getElementById('minBalanceBox');

// Event listeners
balanceInput.addEventListener('input', function() {
  const enteredBalance = Number(this.value);
  if (enteredBalance >= 20) {
    cashAmountInput.value = Math.ceil(enteredBalance * 1.25);
    formState.balance = enteredBalance;
    formState.cashAmount = Math.ceil(enteredBalance * 1.25);
    document.getElementById('cashAmountSpan').textContent = formState.cashAmount;
    document.getElementById('rechargeAmount').textContent = enteredBalance;
    balanceInfo.classList.remove('hidden');
    minBalanceBox.classList.add('hidden');
    balanceInput.style.borderColor = '';
  } else if (enteredBalance > 0) {
    cashAmountInput.value = '';
    formState.balance = "";
    formState.cashAmount = 0;
    balanceInfo.classList.add('hidden');
    minBalanceBox.classList.remove('hidden');
    balanceInput.style.borderColor = '#f44336';
  } else {
    cashAmountInput.value = '';
    formState.balance = "";
    formState.cashAmount = 0;
    balanceInfo.classList.add('hidden');
    minBalanceBox.classList.add('hidden');
    balanceInput.style.borderColor = '';
  }
  if (typeof validateForm === 'function') validateForm();
});

phoneInput.addEventListener('input', function() {
  const phoneValue = this.value.trim();
  formState.phone = phoneValue;

  if (phoneValue && !isValidPhoneNumber(phoneValue)) {
    phoneError.classList.remove('hidden');
  } else {
    phoneError.classList.add('hidden');
  }

  validateForm();
});

// Payment method selection
cashMethod.addEventListener('click', function() {
  selectPaymentMethod('cash');
});

instaMethod.addEventListener('click', function() {
  selectPaymentMethod('instapay');
});

function selectPaymentMethod(method) {
  // Clear previous selection
  cashMethod.classList.remove('selected');
  instaMethod.classList.remove('selected');
  cashInstructions.classList.add('hidden');
  instaInstructions.classList.add('hidden');

  // Clear sender info
  formState.senderInfo = "";
  cashSenderInput.value = "";
  instaSenderInput.value = "";
  cashSenderError.classList.add('hidden');
  instaSenderError.classList.add('hidden');

  // Set new selection
  formState.paymentMethod = method;
  paymentMethodInput.value = method;

  if (method === 'cash') {
    cashMethod.classList.add('selected');
    cashInstructions.classList.remove('hidden');
  } else {
    instaMethod.classList.add('selected');
    instaInstructions.classList.remove('hidden');
  }

  // Show upload section
  uploadSection.classList.remove('hidden');

  validateForm();
}

// Sender info validation
cashSenderInput.addEventListener('input', function() {
  const value = this.value.trim();
  formState.senderInfo = value;

  if (value && !isValidCashSender(value)) {
    cashSenderError.classList.remove('hidden');
  } else {
    cashSenderError.classList.add('hidden');
  }

  validateForm();
});

instaSenderInput.addEventListener('input', function() {
  const value = this.value.trim();
  formState.senderInfo = value;

  if (value && !isValidInstaSender(value)) {
    instaSenderError.classList.remove('hidden');
  } else {
    instaSenderError.classList.add('hidden');
  }

  validateForm();
});

// File handling
dropArea.addEventListener('click', function() {
  screenshotInput.click();
});

screenshotInput.addEventListener('change', function(e) {
  const file = e.target.files[0];
  if (file) {
    handleFileSelect(file);
  }
});

// Drag and drop functionality
dropArea.addEventListener('dragover', function(e) {
  e.preventDefault();
  this.classList.add('drag-over');
});

dropArea.addEventListener('dragleave', function(e) {
  e.preventDefault();
  this.classList.remove('drag-over');
});

dropArea.addEventListener('drop', function(e) {
  this.classList.remove('drag-over');

  if (e.dataTransfer.files.length) {
    handleFileSelect(e.dataTransfer.files[0]);
  }
});

function handleFileSelect(file) {
  // Validate file type
  if (!file.type.match('image.*')) {
      alert('برجاء اختيار صورة فقط');
      return;
  }

  // Validate file size (5MB max)
  if (file.size > 5 * 1024 * 1024) {
      alert('حجم الصورة يجب أن يكون أقل من 5 ميجابايت');
      return;
  }

  // Store the file in form state
  formState.screenshot = file;

  // Create preview
  const reader = new FileReader();
  reader.onload = function (e) {
      // Set the uploaded image as the preview
      previewImage.src = e.target.result;
      previewContainer.classList.remove('hidden');

      // Hide the upload area
      dropArea.classList.add('hidden');
  };
  reader.readAsDataURL(file);

  validateForm();
}

// Event listener for the cancel button
removeImageBtn.addEventListener('click', function () {
  // Reset the preview and form state
  previewContainer.classList.add('hidden');
  previewImage.src = '';
  screenshotInput.value = '';
  formState.screenshot = null;

  // Show the upload area again
  dropArea.classList.remove('hidden');

  validateForm();
});
  
// Form submission with Telegram integration
form.addEventListener('submit', async function(e) {
  e.preventDefault(); // Prevent default form submission
  
  // Final validation
  if (!submitBtn.disabled) {
    // Show loading state
    showLoading();
    
    try {
      // Create order summary
      const orderSummary = {
        balance: formState.balance,
        cashAmount: formState.cashAmount,
        phone: formState.phone,
        paymentMethod: formState.paymentMethod,
        senderInfo: formState.senderInfo,
        screenshot: formState.screenshot
      };
      
      // Send to Telegram
      await sendToTelegram(orderSummary);
      
      // Display in success message
      summaryBalance.textContent = formatCurrency(parseInt(orderSummary.balance));
      summaryPhone.textContent = orderSummary.phone;
      summaryPaymentMethod.textContent = orderSummary.paymentMethod === 'cash' ? 'محفظة كاش' : 'انستا باي';
      summaryCashAmount.textContent = formatCurrency(orderSummary.cashAmount);
      
      // Show success message and hide form
      formContainer.classList.add('hidden');
      successContainer.classList.remove('hidden');
      document.getElementById('successContainer').classList.remove('hidden');
      document.getElementById('formContainer').classList.add('hidden');
      
    } catch (error) {
      // Hide loading and show error
      hideLoading();
      showError('فشل في إرسال الطلب. برجاء المحاولة مرة أخرى.');
      console.error('Submission error:', error);
    }
  }
});

// New request button
newRequestBtn.addEventListener("click", function () {
  // Redirect to the main page
  window.location.href = "/";
});

// Trader code logic
showTraderBtn.addEventListener('click', function() {
  showTraderBtn.classList.add('hide');
  traderRow.classList.add('active');
  traderCodeInput.value = '';
});

closeTraderRow.addEventListener('click', function() {
  traderRow.classList.remove('active');
  setTimeout(() => {
    showTraderBtn.classList.remove('hide');
    showTraderBtn.style.display = ''; // إظهار زر التجار من جديد
  }, 400);
  traderError.textContent = '';
  traderCodeInput.value = '';
  traderLogBox.className = '';
  applyTraderBtn.style.display = ''; 
  // Reset price 
  const enteredBalance = Number(balanceInput.value);
  if (enteredBalance >= 20) {
    const cashValue = Math.ceil(enteredBalance * 1.25);
    cashAmountInput.value = `${cashValue}`;
    formState.cashAmount = cashValue;
    document.getElementById('cashAmountSpan').textContent = cashValue;
  }
});

const elements = {
  form: document.getElementById('rechargeForm'),
  balanceInput: document.getElementById('balanceInput'),
  cashAmountInput: document.getElementById('cashAmount'),
  balanceInfo: document.getElementById('balanceInfo'),
  rechargeAmountSpan: document.getElementById('rechargeAmount'),
  phoneInput: document.getElementById('phone'),
  phoneError: document.getElementById('phoneError'),
  paymentMethodInput: document.getElementById('paymentMethod'),
  cashMethod: document.getElementById('cashMethod'),
  instaMethod: document.getElementById('instaMethod'),
  cashInstructions: document.getElementById('cashInstructions'),
  instaInstructions: document.getElementById('instaInstructions'),
  cashSenderInput: document.getElementById('cashSender'),
  cashSenderError: document.getElementById('cashSenderError'),
  instaSenderInput: document.getElementById('instaSender'),
  instaSenderError: document.getElementById('instaSenderError'),
  uploadSection: document.getElementById('uploadSection'),
  dropArea: document.getElementById('dropArea'),
  screenshotInput: document.getElementById('screenshot'),
  previewContainer: document.getElementById('previewContainer'),
  previewImage: document.getElementById('previewImage'),
  removeImageBtn: document.getElementById('removeImage'),
  submitBtn: document.getElementById('submitBtn'),
  formContainer: document.getElementById('formContainer'),
  successContainer: document.getElementById('successContainer'),
  summaryBalance: document.getElementById('summaryBalance'),
  summaryPhone: document.getElementById('summaryPhone'),
  summaryPaymentMethod: document.getElementById('summaryPaymentMethod'),
  summaryCashAmount: document.getElementById('summaryCashAmount'),
  newRequestBtn: document.getElementById('newRequestBtn'),
  showTraderBtn: document.getElementById('showTraderBtn'),
  traderRow: document.getElementById('traderRow'),
  traderCodeInput: document.getElementById('traderCodeInput'),
  applyTraderBtn: document.getElementById('applyTraderBtn'),
  closeTraderRow: document.getElementById('closeTraderRow'),
  traderError: document.getElementById('traderError'),
  traderLogBox: document.getElementById('traderLogBox')
};

const TRADER_CODE_HASH = '8943e8c4b27790186b52e1f4c58a7f5264f158b5db95cdb5e637af9e53dae32f'; 
if (elements.applyTraderBtn) {
  elements.applyTraderBtn.addEventListener('click', async () => {
    if (
      !elements.traderCodeInput ||
      !elements.traderError ||
      !elements.balanceInfo ||
      !elements.showTraderBtn ||
      !elements.balanceInput
    ) {
      elements.traderLogBox.textContent = 'هناك خطأ في عناصر الصفحة المطلوبة';
      elements.traderLogBox.className = 'visible error';
      return;
    }

    const code = elements.traderCodeInput.value.trim().toUpperCase();
    const balance = Number(elements.balanceInput.value) || 0;
    elements.applyTraderBtn.disabled = true;

    // Already applied
    if (formState.isTrader) {
      elements.traderLogBox.textContent = 'تم تطبيق الكود بالفعل';
      elements.traderLogBox.className = 'visible error';
      elements.traderError.textContent = 'تم تطبيق الكود بالفعل';
      elements.traderError.style.color = '#f44336';
      elements.applyTraderBtn.disabled = false;
      return;
    }

    // No balance
    if (!balance) {
      elements.traderLogBox.textContent = 'ادخل كمية الرصيد أولاً';
      elements.traderLogBox.className = 'visible error';
      elements.traderError.textContent = 'ادخل كمية الرصيد أولاً';
      elements.traderError.style.color = '#f44336';
      elements.applyTraderBtn.disabled = false;
      return;
    }

    // Balance too low
    if (balance < 20) {
      elements.traderLogBox.textContent = 'كمية الرصيد يجب أن تكون 20 جنيه أو أكثر';
      elements.traderLogBox.className = 'visible error';
      elements.traderError.textContent = 'كمية الرصيد يجب أن تكون 20 جنيه أو أكثر';
      elements.traderError.style.color = '#f44336';
      elements.applyTraderBtn.disabled = false;
      return;
    }

    // hash function
    async function sha256(str) {
      const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
      return Array.from(new Uint8Array(buf)).map(x => x.toString(16).padStart(2, '0')).join('');
    }
    // hash compare
    const codeHash = await sha256(code);
    if (codeHash === TRADER_CODE_HASH) {
      // احسب السعر الجديد
      const newCashValue = Math.ceil(balance * 1.2);
      elements.cashAmountInput.value = newCashValue;
      formState.cashAmount = newCashValue;
      document.getElementById('cashAmountSpan').textContent = newCashValue;

      elements.traderLogBox.innerHTML =
        '<span style="font-size:1.1em;vertical-align:middle;">&#10004;</span> تم تطبيق الكود بنجاح!';
      elements.traderLogBox.className = 'visible success';
      elements.applyTraderBtn.style.display = 'none'; 
      elements.showTraderBtn.style.display = 'none';  
      formState.isTrader = true;
      elements.traderError.textContent = 'تم تطبيق الكود بنجاح!';
      elements.traderError.style.color = '#4CAF50';
      elements.traderCodeInput.value = '';
      elements.balanceInfo.classList.add('sheen-anim', 'zoom-anim');
      setTimeout(() => {
        elements.balanceInfo.classList.remove('sheen-anim', 'zoom-anim');
        elements.traderRow.classList.remove('active');
        elements.applyTraderBtn.disabled = false;
      }, 1000);
      return;
    }

    // INVALID CODE
    elements.traderLogBox.textContent = 'الكود غير صحيح. إذا كنت تاجر، تواصل معنا للحصول على الكود';
    elements.traderLogBox.className = 'visible error';
    elements.traderError.textContent = 'الكود غير صحيح. إذا كنت تاجر، تواصل معنا للحصول على الكود';
    elements.traderError.style.color = '#f44336';
    elements.applyTraderBtn.style.display = ''; // إظهار زر تطبيق مرة أخرى
    elements.showTraderBtn.style.display = 'none';  
    elements.applyTraderBtn.disabled = false;
  });
}
