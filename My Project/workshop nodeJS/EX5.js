function encodeStringArray(arr) {
    return arr.map(word => 
        word.split('').map(char => {
            if (char === ' ') return char;
            if (char === 'z') return 'a'; 
            if (char === 'Z') return 'A'; 
            return String.fromCharCode(char.charCodeAt(0) + 1);
        }).join('')
    );
}

let plain_text = ["hello", "world", "I am", "zebra"];
let encoded_text = encodeStringArray(plain_text);

console.log(encoded_text);
