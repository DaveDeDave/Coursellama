'use strict';

const deletePassphrase = document.getElementById('deletePassphrase');
const deletePassphraseCheck = document.getElementById('deletePassphraseCheck');
const confirmDelete = document.getElementById('confirmDelete');
const deleteAccountModal = document.getElementById('deleteAccount');

deleteAccountModal.addEventListener('hidden.bs.modal', resetDelete);

function validate(event) {
    if(deletePassphraseCheck.value == deletePassphrase.value)
        confirmDelete.disabled = false;
    else
        confirmDelete.disabled = true;
    return true;
}

function resetDelete() {
    deletePassphraseCheck.value = '';
}
