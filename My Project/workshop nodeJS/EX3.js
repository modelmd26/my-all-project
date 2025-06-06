var n = 'desc';

function stepSequence(row) {
    switch (n) { 
        case 'asc':
            for (let i = 1; i <= row; i++) {
                let step = '';
                for (let j = 1; j <= i; j++) {
                    step += j;
                }
                console.log(step);
            }
            break;
        case 'desc':
            for (let i = row; i >= 1; i--) {
                let step = '';
                for (let j = i; j >= 1; j--) {
                    step += j;
                }
                console.log(step);
            }
            break;
        default:
            console.log('Invalid value of i. Use "a" or "b".');
    }
}
console.log(`orderBy = ${n}`);
stepSequence(5);