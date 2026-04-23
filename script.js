// Theme Toggle
(function initTheme() {
  const savedTheme = localStorage.getItem('formBuilderTheme');
  if (savedTheme === 'dark') {
    document.body.classList.add('dark-mode');
  }
})();

document.getElementById('theme-toggle').addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');
  const isDark = document.body.classList.contains('dark-mode');
  localStorage.setItem('formBuilderTheme', isDark ? 'dark' : 'light');
});

// Form Schema Definition
const formSchema = [
  {
    step: 1,
    title: "Personal Info",
    subtitle: "Please provide your basic details.",
    fields: [
      { name: "firstName", label: "First Name", type: "text", required: true },
      { name: "lastName", label: "Last Name", type: "text", required: true },
      { name: "email", label: "Email Address", type: "email", required: true },
      { name: "phone", label: "Phone Number", type: "tel", required: false }
    ]
  },
  {
    step: 2,
    title: "Education",
    subtitle: "Tell us about your educational background.",
    fields: [
      {
        name: "isStudent",
        label: "Are you currently a student?",
        type: "select",
        options: [
          { label: "Select an option", value: "" },
          { label: "yes", value: "yes" },
          { label: "no", value: "no" }
        ],
        required: true
      },
      {
        name: "college",
        label: "College/University Name",
        type: "text",
        required: true,
        condition: { field: "isStudent", value: "yes" },
        helperText: "This section is shown because you selected 'Yes'."
      },
      {
        name: "yearOfStudy",
        label: "Year of Study",
        type: "select",
        options: [
          { label: "Select year", value: "" },
          { label: "1st Year", value: "1" },
          { label: "2nd Year", value: "2" },
          { label: "3rd Year", value: "3" },
          { label: "4th Year", value: "4" },
          { label: "Other", value: "other" }
        ],
        required: true,
        condition: { field: "isStudent", value: "yes" }
      },
      {
        name: "highestDegree",
        label: "Highest Degree Earned",
        type: "text",
        required: true,
        condition: { field: "isStudent", value: "no" },
        helperText: "This section is shown because you selected 'No'."
      },
      {
        name: "certificate10th",
        label: "Upload 10th Certificate",
        type: "file",
        accept: ".pdf,.jpg,.jpeg,.png",
        required: false
      },
      {
        name: "certificate12th",
        label: "Upload 12th Certificate",
        type: "file",
        accept: ".pdf,.jpg,.jpeg,.png",
        required: false
      }
    ]
  },
  {
    step: 3,
    title: "Additional Info",
    subtitle: "A few more details to complete your profile.",
    fields: [
      { name: "bio", label: "Short Bio", type: "textarea", required: false },
      {
        name: "preferredContact",
        label: "Preferred Contact Method",
        type: "select",
        options: [
          { label: "Select an option", value: "" },
          { label: "Email", value: "email" },
          { label: "Phone", value: "phone" }
        ],
        required: true
      }
    ]
  },
  {
    step: 4,
    title: "Review & Submit",
    subtitle: "Please review your information before submitting.",
    fields: [] // No input fields, just review
  }
];

// State Management
let currentStepIndex = 0;
let formData = JSON.parse(localStorage.getItem('multiStepFormData')) || {};

// DOM Elements
const stepsIndicator = document.getElementById('steps-indicator');
const progressFill = document.getElementById('progress-fill');
const stepTitle = document.getElementById('step-title');
const stepSubtitle = document.getElementById('step-subtitle');
const fieldsContainer = document.getElementById('fields-container');
const btnPrev = document.getElementById('btn-prev');
const btnNext = document.getElementById('btn-next');
const btnSubmit = document.getElementById('btn-submit');
const summaryContent = document.getElementById('summary-content');
const dynamicForm = document.getElementById('dynamic-form');
const successMessage = document.getElementById('success-message');
const formHeader = document.getElementById('form-header');
const btnRestart = document.getElementById('btn-restart');
const btnResetTop = document.getElementById('btn-reset-top');

// Initialization
function init() {
  renderProgress();
  renderStep();
  renderSidebar();
  attachEventListeners();
}

// Render Progress Bar and Step Indicators
function renderProgress() {
  stepsIndicator.innerHTML = '';
  
  const totalSteps = formSchema.length;
  const progressPercentage = (currentStepIndex / (totalSteps - 1)) * 100;
  progressFill.style.width = `${progressPercentage}%`;
  
  // Update the simple progress indicator inside the form card
  const simpleProgressText = document.getElementById('simple-progress-text');
  const simpleProgressFill = document.getElementById('simple-progress-fill');
  if (simpleProgressText && simpleProgressFill) {
    const currentNum = currentStepIndex + 1;
    simpleProgressText.textContent = `Step ${currentNum} of ${totalSteps}`;
    const simplePercent = (currentNum / totalSteps) * 100;
    simpleProgressFill.style.width = `${simplePercent}%`;
  }

  formSchema.forEach((step, index) => {
    const isCompleted = index < currentStepIndex;
    const isActive = index === currentStepIndex;
    
    let content = index + 1;
    if (isCompleted) {
      content = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
    }

    const stepEl = document.createElement('div');
    stepEl.className = `step-item ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`;
    stepEl.innerHTML = `
      <div class="step-circle">${content}</div>
      <div class="step-label">${step.title}</div>
    `;
    stepsIndicator.appendChild(stepEl);
  });
}

// Check Conditional Logic
function checkCondition(condition) {
  if (!condition) return true;
  const val = formData[condition.field];
  return val === condition.value;
}

// Render Current Step Fields
function renderStep() {
  const step = formSchema[currentStepIndex];
  stepTitle.textContent = step.title;
  stepSubtitle.textContent = step.subtitle;
  
  fieldsContainer.innerHTML = '';

  if (step.fields.length === 0) {
    // Review step
    fieldsContainer.innerHTML = '<div class="helper-text" style="background-color: var(--success-bg); color: var(--success);"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>Please review your information in the sidebar before submitting.</div>';
  } else {
    step.fields.forEach(field => {
      // Check condition
      if (!checkCondition(field.condition)) return;

      const value = formData[field.name] || '';

      const fieldEl = document.createElement('div');
      fieldEl.className = 'field-group';
      fieldEl.id = `group-${field.name}`;

      let inputHTML = '';
      
      if (field.type === 'select') {
        const optionsHTML = field.options.map(opt => 
          `<option value="${opt.value}" ${value === opt.value ? 'selected' : ''}>${opt.label}</option>`
        ).join('');
        inputHTML = `<select id="${field.name}" name="${field.name}" class="field-input">${optionsHTML}</select>`;
      } else if (field.type === 'textarea') {
        inputHTML = `<textarea id="${field.name}" name="${field.name}" class="field-input" rows="3">${value}</textarea>`;
      } else if (field.type === 'file') {
        inputHTML = `
          <input type="${field.type}" id="${field.name}" name="${field.name}" class="field-input" ${field.accept ? `accept="${field.accept}"` : ''}>
          <div class="file-name-display" id="file-name-${field.name}" style="margin-top: 8px; font-size: 0.875rem; color: var(--text-secondary);">
            ${value ? `Selected file: ${value}` : ''}
          </div>
        `;
      } else {
        inputHTML = `<input type="${field.type}" id="${field.name}" name="${field.name}" class="field-input" value="${value}">`;
      }

      let helperHTML = field.helperText ? `
        <div class="helper-text">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
          ${field.helperText}
        </div>
      ` : '';

      fieldEl.innerHTML = `
        <label class="field-label" for="${field.name}">
          ${field.label} ${field.required ? '<span class="required-asterisk">*</span>' : ''}
        </label>
        ${inputHTML}
        <div id="error-${field.name}" class="error-message" style="display: none;"></div>
        ${helperHTML}
      `;
      
      fieldsContainer.appendChild(fieldEl);
      
      // Attach input event for live validation and conditional re-rendering
      const inputEl = document.getElementById(field.name);
      
      const handleInput = (e) => {
        let newValue = e.target.value;
        if (field.type === 'file') {
          newValue = e.target.files && e.target.files.length > 0 ? e.target.files[0].name : '';
          const fileNameDisplay = document.getElementById(`file-name-${field.name}`);
          if (fileNameDisplay) {
            fileNameDisplay.textContent = newValue ? `Selected file: ${newValue}` : '';
          }
        }
        
        formData[field.name] = newValue;
        saveData();
        validateField(field, newValue);
        renderSidebar();
        
        // Check if this field change affects any conditional fields in the current step
        const affectsCondition = step.fields.some(f => f.condition && f.condition.field === field.name);
        if (affectsCondition) {
          const focusedId = document.activeElement.id;
          renderStep();
          const toFocus = document.getElementById(focusedId);
          if (toFocus) {
             const len = toFocus.value ? toFocus.value.length : 0;
             if (toFocus.setSelectionRange && toFocus.type !== 'file') {
               try {
                 toFocus.setSelectionRange(len, len);
               } catch (err) {}
             }
             toFocus.focus();
          }
        }
      };

      inputEl.addEventListener('input', handleInput);
      if (field.type === 'file') {
        inputEl.addEventListener('change', handleInput);
      }
      
      // Also attach blur event for validation
      inputEl.addEventListener('blur', (e) => {
        let val = e.target.value;
        if (field.type === 'file') {
          val = e.target.files && e.target.files.length > 0 ? e.target.files[0].name : '';
        }
        validateField(field, val);
      });
    });
  }

  updateNavButtons();
}

// Update Navigation Buttons Visibility
function updateNavButtons() {
  btnPrev.style.display = currentStepIndex === 0 ? 'none' : 'inline-flex';
  
  if (currentStepIndex === formSchema.length - 1) {
    btnNext.style.display = 'none';
    btnSubmit.style.display = 'inline-flex';
  } else {
    btnNext.style.display = 'inline-flex';
    btnSubmit.style.display = 'none';
  }
}

// Validation Logic
function validateField(field, value) {
  const errorEl = document.getElementById(`error-${field.name}`);
  const inputEl = document.getElementById(field.name);
  if (!errorEl || !inputEl) return true;

  let isValid = true;
  let errorMsg = '';

  if (field.required && (!value || !value.trim())) {
    isValid = false;
    errorMsg = 'This field is required';
  } else if (field.type === 'email' && value) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      isValid = false;
      errorMsg = 'Please enter a valid email address';
    }
  } else if (field.type === 'file' && value) {
    const allowedExtensions = ['.pdf', '.jpg', '.jpeg', '.png'];
    const ext = value.substring(value.lastIndexOf('.')).toLowerCase();
    if (!allowedExtensions.includes(ext)) {
      isValid = false;
      errorMsg = 'Please upload a PDF, JPG, or PNG file';
    }
  }

  if (!isValid) {
    inputEl.classList.add('has-error');
    errorEl.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg> ${errorMsg}`;
    errorEl.style.display = 'flex';
  } else {
    inputEl.classList.remove('has-error');
    errorEl.style.display = 'none';
  }

  return isValid;
}

function validateStep() {
  const step = formSchema[currentStepIndex];
  let isStepValid = true;

  step.fields.forEach(field => {
    if (!checkCondition(field.condition)) return;
    
    const value = formData[field.name] || '';
    const isFieldValid = validateField(field, value);
    if (!isFieldValid) {
      isStepValid = false;
    }
  });

  return isStepValid;
}

// Save to LocalStorage
function saveData() {
  localStorage.setItem('multiStepFormData', JSON.stringify(formData));
}

// Render Sidebar Summary
function renderSidebar() {
  summaryContent.innerHTML = '';

  formSchema.forEach(step => {
    if (step.fields.length === 0) return;
    
    let hasVisibleFields = false;
    let sectionHTML = `<div class="summary-section">
      <div class="summary-section-title">${step.title}</div>`;
      
    step.fields.forEach(field => {
      if (!checkCondition(field.condition)) return;
      hasVisibleFields = true;

      let val = formData[field.name];
      if (field.type === 'select' && val) {
         const opt = field.options.find(o => o.value === val);
         if(opt) val = opt.label;
      }
      
      const displayVal = val ? val : '<span class="empty">-</span>';
      
      sectionHTML += `
        <div class="summary-item">
          <div class="summary-label">${field.label}</div>
          <div class="summary-value ${!val ? 'empty' : ''}">${displayVal}</div>
        </div>
      `;
    });

    sectionHTML += `</div>`;
    
    if (hasVisibleFields) {
      summaryContent.innerHTML += sectionHTML;
    }
  });
}

// Transition helper for smooth steps
function transitionStep(action) {
  const wrapper = document.getElementById('step-content-wrapper');
  if (!wrapper) {
    action();
    return;
  }
  
  wrapper.style.opacity = '0';
  wrapper.style.transform = 'translateY(10px)';
  
  setTimeout(() => {
    action();
    
    wrapper.style.transform = 'translateY(-10px)';
    // trigger reflow
    void wrapper.offsetWidth;
    
    wrapper.style.opacity = '1';
    wrapper.style.transform = 'translateY(0)';
  }, 300);
}

// Event Listeners
function attachEventListeners() {
  btnNext.addEventListener('click', () => {
    if (validateStep()) {
      transitionStep(() => {
        currentStepIndex++;
        renderProgress();
        renderStep();
      });
    }
  });

  btnPrev.addEventListener('click', () => {
    if (currentStepIndex > 0) {
      transitionStep(() => {
        currentStepIndex--;
        renderProgress();
        renderStep();
      });
    }
  });

  dynamicForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (validateStep()) {
      // Build summary for success screen
      const successDataContainer = document.getElementById('success-data');
      if (successDataContainer) {
        let html = '<div style="text-align: left; background: var(--secondary); padding: 1rem; border-radius: var(--radius-md); font-size: 0.875rem;">';
        
        const displayData = [
          { label: 'Name', value: `${formData.firstName || ''} ${formData.lastName || ''}`.trim() },
          { label: 'Email', value: formData.email },
          { label: 'Student', value: formData.isStudent ? (formData.isStudent === 'yes' ? 'Yes' : 'No') : null },
          { label: 'College', value: formData.college },
          { label: '10th Certificate', value: formData.certificate10th },
          { label: '12th Certificate', value: formData.certificate12th }
        ];

        displayData.forEach(item => {
          if (item.value) {
            html += `<div style="margin-bottom: 0.5rem;"><strong style="color: var(--text-main);">${item.label}:</strong> <span style="color: var(--text-muted);">${item.value}</span></div>`;
          }
        });
        
        html += '</div>';
        successDataContainer.innerHTML = html;
      }

      // Show success screen
      const wrapper = document.getElementById('step-content-wrapper');
      if (wrapper) wrapper.style.display = 'none';
      successMessage.style.display = 'block';
      
      // Clear data
      localStorage.removeItem('multiStepFormData');
      formData = {};
      renderSidebar();
    }
  });
  
  const handleReset = () => {
    currentStepIndex = 0;
    formData = {};
    saveData();
    
    const wrapper = document.getElementById('step-content-wrapper');
    if (wrapper) wrapper.style.display = 'block';
    successMessage.style.display = 'none';
    
    renderProgress();
    renderStep();
    renderSidebar();
  };

  btnRestart.addEventListener('click', handleReset);
  
  if (btnResetTop) {
    btnResetTop.addEventListener('click', () => {
      if (currentStepIndex > 0 || Object.keys(formData).length > 0) {
        if (!confirm('Are you sure you want to start over? All your progress will be lost.')) {
          return;
        }
      }
      handleReset();
    });
  }
}

// Start the app
init();
