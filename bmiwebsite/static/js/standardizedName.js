export function standardizedName(name){
    return name
        .trim()
        .toLowerCase()
        .split(/\s+/)
        .map(tu => tu.charAt(0).toUpperCase() + tu.slice(1))
        .join(' ');
}