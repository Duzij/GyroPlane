export function getUniqueID() {
    function fromOneToNine() { 
        return Math.floor(Math.random() * (10));
    }
    return `${fromOneToNine(0,9)}${fromOneToNine(0,9)}${fromOneToNine(0,9)}${fromOneToNine(0,9)}`;
}