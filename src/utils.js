export function getUniqueID(existingUserIds) {
    function fromOneToNine() {
        return Math.floor(Math.random() * (10));
    }

    const result = `${fromOneToNine(0,9)}${fromOneToNine(0,9)}${fromOneToNine(0,9)}${fromOneToNine(0,9)}`;

    if (existingUserIds.includes(result)) {
        return getUniqueID();
    } else {
        return result
    }
}