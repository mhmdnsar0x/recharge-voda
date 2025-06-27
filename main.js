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

// Telegram Bot Configuration
const TELEGRAM_BOT_TOKEN = '7951904237:AAFan2S1fCgbM3HRo4kOGBFAIou4MSZ55P4'; // Replace with your actual bot token
const TELEGRAM_CHAT_ID = '5030533432'; // Replace with your chat ID or channel ID

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
  // orderData.screenshot: File object (the image)
  // formatTelegramMessage(orderData): returns the message string

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
      document.getElementById('offersRow').style.display = 'none'; // Hide offers
      
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

const offersRow = document.getElementById('offersRow');
const balanceCashRow = document.querySelector('.balance-cash-row');

document.querySelectorAll('.offer-box').forEach(box => {
  box.addEventListener('click', function() {
    // delete selected offers
    document.querySelectorAll('.offer-box').forEach(b => b.classList.remove('selected'));
    this.classList.add('selected');

    // hide the balan vs cash box
    balanceCashRow.style.display = 'none';

    // data
    const balance = this.getAttribute('data-balance');
    const cash = this.getAttribute('data-cash');
    formState.balance = balance;
    formState.cashAmount = cash;

    // info
    document.getElementById('cashAmountSpan').textContent = cash;
    document.getElementById('rechargeAmount').textContent = balance;
    balanceInfo.classList.remove('hidden');
    minBalanceBox.classList.add('hidden');
    balanceInput.style.borderColor = '';

    // submit
    if (typeof validateForm === 'function') validateForm();
  });
});

//return to home 
offersRow.addEventListener('dblclick', function() {
  document.querySelectorAll('.offer-box').forEach(b => b.classList.remove('selected'));
  balanceCashRow.style.display = 'flex';
  balanceInput.value = '';
  cashAmountInput.value = '';
  formState.balance = "";
  formState.cashAmount = 0;
  balanceInfo.classList.add('hidden');
  if (typeof validateForm === 'function') validateForm();
});

document.querySelectorAll('.offer-box .offer-cancel').forEach(btn => {
  btn.addEventListener('click', function(e) {
    e.stopPropagation(); // Prevent triggering the offer-box click
    const box = this.closest('.offer-box');
    box.classList.remove('selected');
    balanceCashRow.style.display = 'flex';
    balanceInput.value = '';
    cashAmountInput.value = '';
    formState.balance = "";
    formState.cashAmount = 0;
    balanceInfo.classList.add('hidden');
    minBalanceBox.classList.add('hidden');
    if (typeof validateForm === 'function') validateForm();
  });
});

