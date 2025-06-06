let text = ["hello", "world", "iam", "zebra"];

let result = text.map(word => word.replace(/[aeiou]/g, ''));

console.log(result);