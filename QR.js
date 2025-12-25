document.addEventListener('DOMContentLoaded', function() {
    // الحصول على العناصر
    const contentType = document.getElementById('contentType');
    const inputText = document.getElementById('inputText');
    const qrSize = document.getElementById('qrSize');
    const generateBtn = document.getElementById('generateBtn');
    const downloadBtn = document.getElementById('downloadBtn');
    const resetBtn = document.getElementById('resetBtn');
    const shareBtn = document.getElementById('shareBtn');
    const qrcodeDiv = document.getElementById('qrcode');
    const qrPlaceholder = document.getElementById('qrPlaceholder');
    const colorOptions = document.querySelectorAll('.color-option');
    
    // متغيرات التطبيق
    let currentQRCode = null;
    let selectedColor = '#000000';
    
    // إعدادات اختيار الألوان
    colorOptions.forEach(option => {
        option.addEventListener('click', function() {
            colorOptions.forEach(opt => opt.classList.remove('selected'));
            this.classList.add('selected');
            selectedColor = this.getAttribute('data-color');
        });
    });
    
    // تحديث النص التوجيهي بناءً على نوع المحتوى
    contentType.addEventListener('change', function() {
        updatePlaceholder();
    });
    
    function updatePlaceholder() {
        const type = contentType.value;
        let placeholder = '';
        
        switch(type) {
            case 'url':
                placeholder = 'Enter website URL here... Example: https://www.example.com';
                break;
            case 'text':
                placeholder = 'Enter text here... Example: Hello World!';
                break;
            case 'email':
                placeholder = 'Enter email address... Example: user@example.com';
                break;
            case 'phone':
                placeholder = 'Enter phone number... Example: +1234567890';
                break;
            case 'sms':
                placeholder = 'Enter phone number and message... Example: +1234567890:Hello, this is a test message';
                break;
            case 'wifi':
                placeholder = 'Enter WiFi details: SSID:Password:Type (WPA/WEP/nopass)';
                break;
        }
        
        inputText.placeholder = placeholder;
        
        // تعيين قيم افتراضية بناءً على النوع
        if (type === 'url') {
            inputText.value = 'https://www.example.com';
        } else if (type === 'text') {
            inputText.value = 'Hello! This is an example text that can be converted to a QR Code';
        } else if (type === 'email') {
            inputText.value = 'user@example.com';
        } else if (type === 'phone') {
            inputText.value = '+1234567890';
        } else if (type === 'sms') {
            inputText.value = '+1234567890:Hello, this is a test message';
        } else if (type === 'wifi') {
            inputText.value = 'MyWiFi:MyPassword:WPA';
        }
    }
    
    // توليد رمز QR
    generateBtn.addEventListener('click', function() {
        const content = inputText.value.trim();
        const type = contentType.value;
        const size = parseInt(qrSize.value);
        
        if (!content) {
            alert('Please enter some text or a link first!');
            inputText.focus();
            return;
        }
        
        // تنسيق المحتوى بناءً على النوع
        let formattedContent = content;
        
        switch(type) {
            case 'url':
                // التأكد من أن الرابط يحتوي على بروتوكول
                if (!content.startsWith('http://') && !content.startsWith('https://')) {
                    formattedContent = 'https://' + content;
                }
                break;
            case 'email':
                formattedContent = 'mailto:' + content;
                break;
            case 'phone':
                formattedContent = 'tel:' + content;
                break;
            case 'sms':
                // تنسيق رسالة SMS
                const parts = content.split(':');
                if (parts.length >= 2) {
                    const phone = parts[0];
                    const message = parts.slice(1).join(':');
                    formattedContent = 'sms:' + phone + '?body=' + encodeURIComponent(message);
                } else {
                    formattedContent = 'sms:' + content;
                }
                break;
            case 'wifi':
                // تنسيق معلومات WiFi
                const wifiParts = content.split(':');
                if (wifiParts.length >= 3) {
                    const ssid = wifiParts[0];
                    const password = wifiParts[1];
                    const encryption = wifiParts[2];
                    formattedContent = `WIFI:S:${ssid};T:${encryption};P:${password};;`;
                }
                break;
            // للحالات الأخرى، نستخدم المحتوى كما هو
        }
        
        // مسح رمز QR السابق إذا كان موجودًا
        if (currentQRCode) {
            currentQRCode.clear();
            qrcodeDiv.innerHTML = '';
        }
        
        // إظهار منطقة رمز QR وإخفاء النص التوجيهي
        qrPlaceholder.classList.add('hidden');
        qrcodeDiv.classList.remove('hidden');
        
        // توليد رمز QR جديد
        currentQRCode = new QRCode(qrcodeDiv, {
            text: formattedContent,
            width: size,
            height: size,
            colorDark: selectedColor,
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel.H
        });
        
        // إظهار أزرار التنزيل والمشاركة
        downloadBtn.classList.remove('hidden');
        shareBtn.classList.remove('hidden');
        
        // تأثير بسيط عند التوليد
        qrcodeDiv.style.transform = 'scale(0.9)';
        setTimeout(() => {
            qrcodeDiv.style.transform = 'scale(1)';
            qrcodeDiv.style.transition = 'transform 0.3s ease';
        }, 10);
    });
    
    // تنزيل رمز QR
    downloadBtn.addEventListener('click', function() {
        if (!currentQRCode) {
            alert('No QR Code to download!');
            return;
        }
        
        const canvas = qrcodeDiv.querySelector('canvas');
        if (!canvas) {
            alert('Unable to find QR Code!');
            return;
        }
        
        // إنشاء رابط تنزيل
        const link = document.createElement('a');
        link.download = 'qrcode-' + Date.now() + '.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
        
        // إشعار المستخدم
        alert('QR Code download started!');
    });
    
    // مشاركة رمز QR
    shareBtn.addEventListener('click', async function() {
        if (!currentQRCode) {
            alert('No QR Code to share!');
            return;
        }
        
        const canvas = qrcodeDiv.querySelector('canvas');
        if (!canvas) {
            alert('Unable to find QR Code!');
            return;
        }
        
        // تحويل Canvas إلى صورة
        canvas.toBlob(async function(blob) {
            if (navigator.share && navigator.canShare) {
                try {
                    const file = new File([blob], 'qrcode.png', { type: 'image/png' });
                    
                    if (navigator.canShare({ files: [file] })) {
                        await navigator.share({
                            title: 'My QR Code',
                            text: 'Check out this QR Code I created!',
                            files: [file]
                        });
                    } else {
                        // إذا لم يكن بالإمكان مشاركة الملفات، استخدم الطريقة الاحتياطية
                        shareFallback(canvas);
                    }
                } catch (err) {
                    console.error('Error sharing:', err);
                    shareFallback(canvas);
                }
            } else {
                shareFallback(canvas);
            }
        }, 'image/png');
    });
    
    function shareFallback(canvas) {
        // نسخ الصورة إلى الحافظة
        canvas.toBlob(function(blob) {
            const item = new ClipboardItem({ 'image/png': blob });
            navigator.clipboard.write([item]).then(function() {
                alert('QR Code copied to clipboard! You can paste it anywhere.');
            }).catch(function(err) {
                console.error('Could not copy to clipboard: ', err);
                alert('To share this QR Code, please download it first and then share the image file.');
            });
        });
    }
    
    // إعادة تعيين النموذج
    resetBtn.addEventListener('click', function() {
        inputText.value = '';
        contentType.value = 'url';
        qrSize.value = '256';
        
        // إعادة تعيين الألوان
        colorOptions.forEach(opt => opt.classList.remove('selected'));
        colorOptions[0].classList.add('selected');
        selectedColor = '#000000';
        
        // مسح رمز QR الحالي
        if (currentQRCode) {
            currentQRCode.clear();
            currentQRCode = null;
        }
        
        // إعادة تعيين واجهة المستخدم
        qrcodeDiv.innerHTML = '';
        qrcodeDiv.classList.add('hidden');
        qrPlaceholder.classList.remove('hidden');
        downloadBtn.classList.add('hidden');
        shareBtn.classList.add('hidden');
        
        updatePlaceholder();
        inputText.focus();
    });
    
    // تهيئة التطبيق
    updatePlaceholder();
    
    // توليد رمز QR افتراضي عند التحميل
    setTimeout(() => {
        generateBtn.click();
    }, 500);
});