const title = document.getElementById('form-title');
const subtitle = document.getElementById('form-subtitle');
const toggleButton = document.getElementById('toggle-mode');
const submitButton = document.getElementById('submit-button');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const nameField = document.getElementById('name-field');
const surnameField = document.getElementById('surname-field');
const nameInput = document.getElementById('name');
const surnameInput = document.getElementById('surname');
const emailRules = document.getElementById('email-rules');
const nameRules = document.getElementById('name-rules');
const surnameRules = document.getElementById('surname-rules');
const passwordRules = document.getElementById('password-rules');
const form = document.querySelector('form');
const emailRuleRequired = document.getElementById('email-rule-required');
const emailRuleFormat = document.getElementById('email-rule-format');
const nameRuleRequired = document.getElementById('name-rule-required');
const surnameRuleRequired = document.getElementById('surname-rule-required');
const passwordRuleRequired = document.getElementById('password-rule-required');
const passwordRuleLength = document.getElementById('password-rule-length');
const passwordRuleUppercase = document.getElementById('password-rule-uppercase');
const modal = document.getElementById('result-modal');
const modalStatus = document.getElementById('modal-status');
const modalMessage = document.getElementById('modal-message');
const modalClose = document.getElementById('modal-close');

const clearFields = () => {
  emailInput.value = '';
  passwordInput.value = '';
  nameInput.value = '';
  surnameInput.value = '';
};

const setMode = (mode) => {
  if (mode === 'register') {
    title.textContent = 'Регистрация';
    subtitle.textContent = 'Заполните логин и пароль для регистрации.';
    toggleButton.textContent = 'Вход';
    submitButton.textContent = 'Регистрация';
    nameField.classList.add('visible');
    surnameField.classList.add('visible');
    if (formSubmitted) {
      emailRules.classList.add('visible');
      nameRules.classList.add('visible');
      surnameRules.classList.add('visible');
      passwordRules.classList.add('visible');
      updateEmailValidation();
      updateNameValidation();
      updateSurnameValidation();
      updatePasswordValidation();
    }
    return;
  }

  title.textContent = 'Вход';
  subtitle.textContent = 'Введите логин и пароль, чтобы продолжить.';
  toggleButton.textContent = 'Регистрация';
  submitButton.textContent = 'Войти';
  nameField.classList.remove('visible');
  surnameField.classList.remove('visible');
  emailRules.classList.remove('visible');
  nameRules.classList.remove('visible');
  surnameRules.classList.remove('visible');
  passwordRules.classList.remove('visible');
};

let currentMode = 'login';
let formSubmitted = false;

toggleButton.addEventListener('click', () => {
  currentMode = currentMode === 'login' ? 'register' : 'login';
  formSubmitted = false;
  clearFields();
  setMode(currentMode);
});

const setRuleState = (element, isValid) => {
  element.classList.toggle('valid', isValid);
};

const updateEmailValidation = () => {
  const emailValue = emailInput.value.trim();
  const isRegisterMode = currentMode === 'register';
  const shouldShowRules = (isRegisterMode && formSubmitted) || emailValue.length > 0;
  emailRules.classList.toggle('visible', shouldShowRules);
  setRuleState(emailRuleRequired, emailValue.length > 0);
  setRuleState(
    emailRuleFormat,
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue),
  );
};

const updateNameValidation = () => {
  const nameValue = nameInput.value.trim();
  const isRegisterMode = currentMode === 'register';
  nameRules.classList.toggle('visible', isRegisterMode && formSubmitted);
  setRuleState(nameRuleRequired, nameValue.length > 0);
};

const updateSurnameValidation = () => {
  const surnameValue = surnameInput.value.trim();
  const isRegisterMode = currentMode === 'register';
  surnameRules.classList.toggle('visible', isRegisterMode && formSubmitted);
  setRuleState(surnameRuleRequired, surnameValue.length > 0);
};

const updatePasswordValidation = () => {
  const passwordValue = passwordInput.value;
  const isRegisterMode = currentMode === 'register';
  const shouldShowRules = (isRegisterMode && formSubmitted) || passwordValue.length > 0;
  passwordRules.classList.toggle('visible', shouldShowRules);
  passwordRuleLength.style.display = isRegisterMode ? '' : 'none';
  passwordRuleUppercase.style.display = isRegisterMode ? '' : 'none';
  setRuleState(passwordRuleRequired, passwordValue.length > 0);
  setRuleState(
    passwordRuleLength,
    passwordValue.length >= 5 && passwordValue.length <= 30,
  );
  setRuleState(passwordRuleUppercase, /[A-Z]/.test(passwordValue));
};

emailInput.addEventListener('input', updateEmailValidation);
nameInput.addEventListener('input', updateNameValidation);
surnameInput.addEventListener('input', updateSurnameValidation);
passwordInput.addEventListener('input', updatePasswordValidation);

let modalAutoCloseTimer = null;

const showModal = (status, message, showCloseButton = true) => {
  modalStatus.textContent = status;
  modalMessage.textContent = message;
  modalClose.style.display = showCloseButton ? '' : 'none';
  modal.classList.add('visible');
  if (modalAutoCloseTimer) {
    clearTimeout(modalAutoCloseTimer);
  }
  modalAutoCloseTimer = setTimeout(() => {
    modal.classList.remove('visible');
    if (status === 'ok' && !showCloseButton) {
      window.location.href = '/index.html';
    }
  }, 2000);
};

modalClose.addEventListener('click', () => {
  if (modalAutoCloseTimer) {
    clearTimeout(modalAutoCloseTimer);
    modalAutoCloseTimer = null;
  }
  modal.classList.remove('visible');
});

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  formSubmitted = true;

  const emailValue = emailInput.value.trim();
  const passwordValue = passwordInput.value;
  const emailIsValid =
    emailValue.length > 0 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue);
  const passwordIsValid = passwordValue.length > 0;

  updateEmailValidation();
  updatePasswordValidation();

  if (currentMode === 'login') {
    if (!emailIsValid || !passwordIsValid) {
      showModal('error', 'Заполните email и пароль');
      return;
    }

    try {
      const response = await fetch('/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: emailValue,
          password: passwordValue,
        }),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok || !data) {
        showModal('error', 'Ошибка входа', false);
        return;
      }
      showModal(data.status, data.message, false);
    } catch (error) {
      showModal('error', 'Ошибка входа', false);
    }
    return;
  }

  if (!emailIsValid || !passwordIsValid) {
    showModal('error', 'Заполните обязательные поля', false);
    updateNameValidation();
    updateSurnameValidation();
    return;
  }

  const payload = {
    email: emailValue,
    name: nameInput.value.trim(),
    surname: surnameInput.value.trim(),
    password: passwordValue,
  };

  try {
    const response = await fetch('/auth/reg', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    const data = await response.json().catch(() => null);
    if (!response.ok || !data) {
      showModal('error', 'Ошибка регистрации', false);
      return;
    }
    showModal(data.status, data.message, false);
  } catch (error) {
    showModal('error', 'Ошибка регистрации', false);
  }
});
