const fs = require('fs');

function updateJson(file, updater) {
    let json = JSON.parse(fs.readFileSync(file, 'utf8'));
    updater(json);
    fs.writeFileSync(file, JSON.stringify(json, null, 4));
}

updateJson('messages/en.json', (json) => {
    json.Tour.login_tour_title = "Account Access";
    json.Tour.login_tour_desc = "Please log in (or register) to continue the tour to your Profile Settings page!";
});

updateJson('messages/ar.json', (json) => {
    json.Tour.login_tour_title = "الوصول إلى الحساب";
    json.Tour.login_tour_desc = "يرجى تسجيل الدخول (أو التسجيل) لمتابعة الجولة إلى صفحة إعدادات ملفك الشخصي!";
});

console.log('Added login tour translations');
