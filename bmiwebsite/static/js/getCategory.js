export function getCategory(height, weight) {
    const bmi = height > 0 ? weight / (height * height) : 0;
    if (bmi < 18.5) return "Gầy";
    else if (bmi < 23) return "Bình thường";
    else if (bmi < 25) return "Tiền béo phì";
    else if (bmi < 30) return "Béo phì I";
    else return "Béo phì II trở lên";
}