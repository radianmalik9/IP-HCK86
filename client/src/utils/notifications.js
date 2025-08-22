import Swal from 'sweetalert2';

// Custom SweetAlert2 configuration
const customSwal = Swal.mixin({
  customClass: {
    confirmButton: 'bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg mr-2',
    cancelButton: 'bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium py-2 px-4 rounded-lg',
    popup: 'rounded-lg shadow-xl',
    title: 'text-gray-800 font-semibold',
    content: 'text-gray-600'
  },
  buttonsStyling: false,
  reverseButtons: true
});

// Success notifications
export const showSuccess = (title, text = '') => {
  return customSwal.fire({
    icon: 'success',
    title,
    text,
    timer: 3000,
    timerProgressBar: true,
    showConfirmButton: false,
    toast: true,
    position: 'top-end'
  });
};

// Success dialog (modal) - non-toast variant
export const showSuccessDialog = (title, text = '') => {
  return customSwal.fire({
    icon: 'success',
    title,
    text,
    confirmButtonText: 'OK'
  });
};

// Error notifications
export const showError = (title, text = '') => {
  return customSwal.fire({
    icon: 'error',
    title,
    text,
    confirmButtonText: 'OK'
  });
};

// Warning notifications
export const showWarning = (title, text = '') => {
  return customSwal.fire({
    icon: 'warning',
    title,
    text,
    confirmButtonText: 'OK'
  });
};

// Info notifications
export const showInfo = (title, text = '') => {
  return customSwal.fire({
    icon: 'info',
    title,
    text,
    confirmButtonText: 'OK'
  });
};

// Confirmation dialogs
export const showConfirm = (title, text = '', confirmText = 'Yes', cancelText = 'Cancel') => {
  return customSwal.fire({
    icon: 'question',
    title,
    text,
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: cancelText
  });
};

// Loading notifications
export const showLoading = (title = 'Loading...', text = 'Please wait') => {
  return Swal.fire({
    title,
    text,
    allowOutsideClick: false,
    allowEscapeKey: false,
    showConfirmButton: false,
    didOpen: () => {
      Swal.showLoading();
    }
  });
};

// Close loading
export const closeLoading = () => {
  Swal.close();
};

// Toast notifications (small notifications in corner)
export const showToast = (type, message) => {
  const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.addEventListener('mouseenter', Swal.stopTimer);
      toast.addEventListener('mouseleave', Swal.resumeTimer);
    }
  });

  return Toast.fire({
    icon: type,
    title: message
  });
};

// Login specific notifications
export const loginSuccess = (userName = '') => {
  return showToast('success', `Welcome back${userName ? `, ${userName}` : ''}!`);
};

export const loginError = (message = 'Invalid email or password') => {
  return showError('Login Failed', message);
};

// Registration specific notifications
export const registerSuccess = (message = 'Account created successfully! Please check your email for verification.') => {
  return showSuccess('Registration Successful', message);
};

export const registerError = (message = 'Registration failed. Please try again.') => {
  return showError('Registration Failed', message);
};

// Logout notification
export const logoutSuccess = () => {
  return showToast('success', 'Logged out successfully');
};

// Email verification notifications
export const emailVerificationSent = () => {
  return showInfo('Verification Email Sent', 'Please check your email and click the verification link.');
};

export const emailVerificationSuccess = () => {
  return showSuccess('Email Verified', 'Your email has been successfully verified!');
};

export const emailVerificationError = (message = 'Email verification failed') => {
  return showError('Verification Failed', message);
};

// Course enrollment notifications
export const enrollmentSuccess = (courseName) => {
  return showSuccess('Enrolled Successfully', `You have been enrolled in "${courseName}"`);
};

export const enrollmentError = (message = 'Enrollment failed') => {
  return showError('Enrollment Failed', message);
};

// Profile update notifications
export const profileUpdateSuccess = () => {
  return showToast('success', 'Profile updated successfully');
};

export const profileUpdateError = (message = 'Failed to update profile') => {
  return showError('Update Failed', message);
};

// Network error notifications
export const networkError = () => {
  return showError('Network Error', 'Please check your internet connection and try again.');
};

// Generic API error handler
export const handleApiError = (error) => {
  const message = error?.response?.data?.message || error?.message || 'An unexpected error occurred';
  
  if (error?.response?.status === 401) {
    return showError('Unauthorized', 'Please login again to continue.');
  } else if (error?.response?.status === 403) {
    return showError('Forbidden', 'You do not have permission to perform this action.');
  } else if (error?.response?.status === 404) {
    return showError('Not Found', 'The requested resource was not found.');
  } else if (error?.response?.status >= 500) {
    return showError('Server Error', 'Something went wrong on our end. Please try again later.');
  } else {
    return showError('Error', message);
  }
};

// Account deleted notification (modal)
export const accountDeletedSuccess = () => {
  return showSuccessDialog('Akun telah dihapus', 'Sampai jumpa lagi.');
};
