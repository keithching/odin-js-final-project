const showToastMessage = (message) => {
    const toast = document.createElement('div');
    toast.classList.add('toast-message');
    toast.textContent = message;

    const container = document.body; // append to body
    container.appendChild(toast);

    setTimeout(() => {
        clearToastMessage();
    }, 2000); // remove the toast after this amount of seconds
};

const clearToastMessage = () => {
    const existingMessage = document.querySelector('.toast-message');
    if (existingMessage) {
        existingMessage.remove(); // clear up existing message first if any
    }
};

export {
    showToastMessage,
    clearToastMessage
};