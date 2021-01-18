export let NUMBER_CODES = [];
for (let key of ["Digit", "Numpad"]) {
    for (let i = 0; i < 10; i++) NUMBER_CODES.push(`${key}${i}`);
}
