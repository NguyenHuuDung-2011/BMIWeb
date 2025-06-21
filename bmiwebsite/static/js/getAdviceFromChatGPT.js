import { getCookie } from './getCookie.js';

export function getAdviceFromChatGPT(prompt, callback) {
    $.ajax({
        url: '/api/chatgpt/',
        type: 'POST',
        headers: {
            'X-CSRFToken': getCookie('csrftoken')
        },
        data: JSON.stringify({ prompt: prompt }),
        contentType: 'application/json',
        success: function(response) {
            callback(response.answer);
        },
        error: function(xhr) {
            let errorMsg = 'Lỗi khi lấy tư vấn từ ChatGPT!';
            if (xhr.responseJSON && xhr.responseJSON.error) {
                errorMsg += '<br><small>' + xhr.responseJSON.error + '</small>';
            }
            callback(errorMsg);
        }
    });
}