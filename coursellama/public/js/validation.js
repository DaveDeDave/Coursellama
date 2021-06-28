'use strict';

function setLesson() {
    let nLessons = document.getElementById("numberOfLessons").value;
    if(nLessons > 10)
        nLessons = 10;
    else if(nLessons < 1)
        nLessons = 1;
    let sample = `<div class="form-floating mb-3">
                <input type="text" name="titles" class="form-control" placeholder="title" required>
                <label for="floatingTitle">Titolo</label>
            </div>`;
    let divContent = "";
    for(let i = 0; i < nLessons; i++)
        divContent += sample;
    document.getElementById("lessons").innerHTML = divContent;
}

function increase() {
    let nLessons = document.getElementById("numberOfLessons");
    if(nLessons.value < 10)
        nLessons.value = Number(nLessons.value) + 1
}

function decrease() {
    let nLessons = document.getElementById("numberOfLessons");
    if(nLessons.value > 1)
        nLessons.value = Number(nLessons.value) - 1
}

function validate(event) {
    let nLessons = document.getElementById("numberOfLessons");
    if(event.key >= 0 && event.key <= 9 & nLessons.value + event.key <= 10 && nLessons.value + event.key >= 1)
        return true;
    return false;
}
