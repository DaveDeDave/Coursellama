'use strict';

let files = [];

function addFile(event) {
    for(const file of event.target.files) {
        files.push(file);
        document.getElementById('materials').innerHTML += `<p class="h4"><i class="fas fa-times text-danger clickable" onclick="removeFile(${files.length-1})"></i> <i class="fas fa-file-import"></i> ${file.name}</p>`;
    }
}

function removeFile(i) {
    files.splice(i, 1);
    document.getElementById('materials').innerHTML = '';
    for(const i in files) {
        document.getElementById('materials').innerHTML += `<p class="h4"><i class="fas fa-times text-danger clickable" onclick="removeFile(${i})"></i> <i class="fas fa-file-import"></i> ${files[i].name}</p>`;
    }
}

function makeRequest(courseid, lessonid) {
    const formData = new FormData();
    for(const file of files)
        formData.append('materials', file, file.name);

    const xhr = new XMLHttpRequest();
    xhr.open('POST', `/courses/load?c=${courseid}&l=${lessonid}`);
    xhr.setRequestHeader('CSRF-Token', document.getElementById('_csrf').value);
    xhr.onload = () => {
        if(xhr.status == 200)
            window.location.href = `/courses/${courseid}`;
        else if(xhr.status == 400) {
            if(xhr.response == 'fileAlreadyExist') {
                let errors = document.getElementById('errors');
                errors.classList.add('alert', 'alert-danger');
                errors.innerHTML = 'Attenzione, non tutti i file potrebbero essere stati caricati perché è presente almeno un file con un nome già esistente';
            } else if(xhr.response == 'ERROR') {
                let errors = document.getElementById('errors');
                errors.classList.add('alert', 'alert-danger');
                errors.innerHTML = 'Non hai inserito nessun file da caricare';
            }
        } else {
            let errors = document.getElementById('errors');
            errors.classList.add('alert', 'alert-danger');
            errors.innerHTML = 'Si è verificato un errore nel caricamento dei file';     
        }
    }
    xhr.send(formData);
}

function drag(event) {
    event.stopPropagation();
    event.preventDefault();
}

function drop(event) {
    event.stopPropagation();
    event.preventDefault();

    let uploadedFiles = event.dataTransfer.files;
    for(const file of uploadedFiles) {
        files.push(file);
        document.getElementById('materials').innerHTML += `<p class="h4"><i class="fas fa-times text-danger" onclick="removeFile(${files.length-1})"></i> <i class="fas fa-file-import"></i> ${file.name}</p>`;
    }
}

function triggerInput() {
    document.getElementById('loadFile').click();
}

document.getElementById('loadFile').addEventListener('change', addFile, false);
