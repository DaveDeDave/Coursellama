'use strict';

let resultsPerBlock = document.getElementById('resultsPerBlock').innerHTML;
let actualResult = resultsPerBlock;
let length = document.getElementById('numResults').innerHTML;
let actualResultTeacher = resultsPerBlock;

if(actualResult < length)
        document.getElementById('otherButton').classList.remove('d-none');

function showOther() {
    let show = 0
    for(actualResult; actualResult < length && show < resultsPerBlock; actualResult++) {
        document.getElementById(`r${actualResult}`).classList.remove('d-none');
        show++;
    }
    if(actualResult >= length)
        document.getElementById('otherButton').classList.add('d-none');
}

function showOtherTeacher() {
    let show = 0
    lengthTeacher = document.getElementById('numResultsTeacher').innerHTML;
    for(actualResultTeacher; actualResultTeacher < lengthTeacher && show < resultsPerBlock; actualResultTeacher++) {
        document.getElementById(`rt${actualResultTeacher}`).classList.remove('d-none');
        show++;
    }
    if(actualResultTeacher >= lengthTeacher)
        document.getElementById('otherButtonTeacher').classList.add('d-none');
}
