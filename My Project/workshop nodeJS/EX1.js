function factorialWithSteps(n) {
    if (n === 0) return "0! = 1";

    const steps = [];
    let result = 1;

    for (let i = n; i > 0; i--) {
        steps.push(i);
        result *= i;
    }

    const stepsString = steps.join("×");
    return `${n}! = ${stepsString} = ${result}`;
}

console.log(factorialWithSteps(10));
