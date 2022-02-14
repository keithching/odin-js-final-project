const showToastMessage = (message) => {
    const toast = document.createElement('div');
    toast.classList.add('toast-message');
    toast.textContent = message;

    const container = document.body;
    container.appendChild(toast);

    setTimeout(() => {
        const toastDiv = document.querySelector('.toast-message');
        toastDiv.remove();
    }, 2000);
};

export {
    showToastMessage
};