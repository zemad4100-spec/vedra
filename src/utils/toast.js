import toast from 'react-hot-toast';

export const showSuccess = (message) => {
  toast.success(message, {
    style: {
      background: '#153826',
      color: '#fff',
      fontWeight: 'bold',
    },
  });
};

export const showError = (message) => {
  toast.error(message, {
    style: {
      background: '#c0392b',
      color: '#fff',
      fontWeight: 'bold',
    },
  });
};

export const showInfo = (message) => {
  toast(message, {
    icon: 'ℹ️',
    style: {
      background: '#153826',
      color: '#fff',
      fontWeight: 'bold',
    },
  });
};