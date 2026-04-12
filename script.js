/* --- كود متجر أ. منيرة - النسخة الاحترافية الشاملة --- */

const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwRLkCCuZMS7Vy_aM9vr-2Ld6LenqOGFy1rNKuPphf3qxURxg0BoB3J8WJC0xPcvhGSJw/exec'; 

let dynamicAppData = {}; 

// 1. جلب البيانات من الجدول (الأسعار والحد الأدنى)
async function loadPricesFromSheet() {
    try {
        const response = await fetch(`${SCRIPT_URL}?action=getPrices&t=${new Date().getTime()}`);
        const data = await response.json();
        
        data.forEach(item => {
            const appName = (item['التطبيق'] || item['تطبيق'] || "").trim();
            if (appName) {
                let rawPrice = item['السعر'] ? item['السعر'].toString().replace(/[']/g, '') : "0";
                let rawMin = item['الحد الأدنى'] || item['الحد_الأدنى'] || "0";

                dynamicAppData[appName] = {
                    price: parseFloat(rawPrice) || 0,
                    minAmount: parseFloat(rawMin) || 0
                };
            }
        });
        console.log("تمت مزامنة الأسعار بنجاح ✅");
    } catch (error) {
        console.error("خطأ في جلب البيانات:", error);
    }
}

window.addEventListener('load', loadPricesFromSheet);

// 2. وظيفة الحساب والتقريب (0، 5، 10)
window.calculatePrice = function() {
    const coinInput = document.getElementById('coinAmount');
    const display = document.getElementById('totalPriceDisplay');
    const currentAppName = document.getElementById('appTitle').innerText.trim();
    
    let quantity = parseFloat(coinInput.value) || 0;
    let appData = dynamicAppData[currentAppName];

    if (appData && appData.price > 0) {
        let total = Math.round(quantity * appData.price); 
        let lastDigit = total % 10; 
        let base = Math.floor(total / 10) * 10; 

        let finalPrice;
        if (lastDigit === 1 || lastDigit === 2) {
            finalPrice = base;
        } else if (lastDigit >= 3 && lastDigit <= 7) {
            finalPrice = base + 5;
        } else if (lastDigit >= 8) {
            finalPrice = base + 10;
        } else {
            finalPrice = total;
        }

        display.innerText = finalPrice.toLocaleString('ar-SY') + " ل.س";
        
        const minAlert = document.getElementById('minAlert');
        if (quantity > 0 && quantity < appData.minAmount) {
            minAlert.innerText = `عذراً، أقل كمية هي ${appData.minAmount.toLocaleString()}`;
            minAlert.classList.remove('d-none');
        } else {
            minAlert.classList.add('d-none');
        }
    } else {
        display.innerText = "0 ل.س";
    }
}

// 3. وظيفة تتبع الطلب
async function trackMyOrder() {
    const idInput = document.getElementById('trackIdInput').value;
    const resultDiv = document.getElementById('trackResult');
    
    if (!idInput) {
        alert("يرجى إدخال الآيدي أولاً");
        return;
    }

    resultDiv.innerHTML = `<div class="text-center mt-4"><div class="spinner-border text-primary"></div><p>جاري البحث عن طلبك...</p></div>`;
    resultDiv.classList.remove('d-none');

    try {
        const response = await fetch(`${SCRIPT_URL}?action=trackOrder&id=${encodeURIComponent(idInput)}`);
        const status = await response.text();

        let icon, color, message;

        if (status === "تم بنجاح" || status === "تم") {
            icon = "bi-check-circle-fill"; color = "text-success"; message = "تم شحن طلبك بنجاح ✅";
        } else if (status === "غير موجود") {
            icon = "bi-exclamation-triangle"; color = "text-danger"; message = "لم نجد طلب بهذا الآيدي";
        } else {
            icon = "bi-hourglass-split"; color = "text-warning"; message = status || "طلبك قيد المراجعة";
        }

        resultDiv.innerHTML = `
            <div class="status-box border mt-4 ${color === 'text-success' ? 'bg-success-subtle' : 'bg-light'}">
                <i class="bi ${icon} ${color}" style="font-size: 3rem;"></i>
                <h5 class="fw-bold mt-2">${message}</h5>
                <small class="text-muted">الآيدي: ${idInput}</small>
            </div>`;
    } catch (error) {
        resultDiv.innerHTML = `<p class="text-danger mt-3">خطأ في الاتصال، حاول لاحقاً</p>`;
    }
}

// 4. إدارة التنقل بين الصفحات
function showPage(id) {
    document.querySelectorAll('.page').forEach(p => p.style.display = 'none');
    document.getElementById(id).style.display = 'block';
    
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    if (id === 'homePage') document.getElementById('navHome').classList.add('active');
    if (id === 'trackPage') document.getElementById('navTrack').classList.add('active');
}

// 5. فتح صفحة الطلب لتطبيق معين
const appConfigs = {
    'Bigo Live': { color: '#00c3ff', hint: 'ID بيجو المكون من أرقام', img: 'bijo.jpeg' },
    'Hami Party': { color: '#e67e22', hint: 'ID حسابك في هامي بارتي', img: 'hami.jpeg' },
    'Amar': { color: '#f1c40f', hint: 'ID تطبيق قمر', img: 'amar.jpeg' },
    'Honey Jar': { color: '#eb3b5a', hint: 'ID هونيغار', img: 'honijar.jpeg' },
    'Taka': { color: '#27ae60', hint: 'ID تطبيق تاكا', img: 'taka.jpeg' },
    'Yoki': { color: '#c548b4', hint: 'ID تطبيق يوكي', img: 'yoki.png' },
    'YooY CHAT': { color: '#e49f45', hint: 'ID تطبيق يوي', img: 'YooY CHAT.jpg' },
    'MEYOLiIVE': { color: 'rgb(206, 245, 98)', hint: 'ID تطبيق مياو', img: 'MEYOLiIVE.png' },
    'SOYO CHAT': { color: '#34cee9', hint: 'ID تطبيق سويو', img: 'SOYO CHAT.png' },
    'YOHO WAKA': { color: '#37dd31', hint: 'ID تطبيق ياهو', img: 'YOHO WAKA.png' },
    'AHLAN CHAT': { color: '#b68d08', hint: 'ID تطبيق الان', img: 'AHLAN CHAT.png' },
    'JUNKO': { color: '#e7ba27', hint: 'ID تطبيق جانكو', img: 'JUNKO.jpg' },
   
};

function openOrder(name) {
    const config = appConfigs[name];
    if (!config) return;

    document.getElementById('appTitle').innerText = name;
    document.getElementById('appTitle').style.color = config.color;
    document.getElementById('selectedIconBox').innerHTML = `<img src="${config.img}" style="width:100%;height:100%;object-fit:cover;">`;
    document.getElementById('idHint').innerText = config.hint;
    document.getElementById('submitBtn').style.backgroundColor = config.color;

    document.getElementById('coinAmount').value = "";
    document.getElementById('totalPriceDisplay').innerText = "0 ل.س";
    document.getElementById('minAlert').classList.add('d-none');
    
    showPage('orderPage');
}

// 6. عرض أرقام الدفع والنسخ
window.showPaymentNumber = function() {
    const method = document.getElementById('paymentMethod').value;
    const box = document.getElementById('paymentNumberBox');
    const display = document.getElementById('displayNumber');
    box.classList.remove('d-none');
    display.innerText = (method === "سيريتل كاش") ? "0937324635" : "8dde9ef5e9f6a0f478595f600f2e2459";
}

window.copyNumber = function() {
    const num = document.getElementById('displayNumber').innerText;
    navigator.clipboard.writeText(num).then(() => alert("تم نسخ الرقم بنجاح: " + num));
}

// 7. معالجة إرسال النموذج (منع الخروج + ضغط الصورة + الرفع)
document.getElementById('shapingForm').addEventListener('submit', async function(e) {
    e.preventDefault(); 

    const name = document.getElementById('custName').value.trim();
    const playerId = document.getElementById('playerId').value.trim();
    const coinAmount = document.getElementById('coinAmount').value;
    const fileInput = document.getElementById('paymentImg');

    if (!name || !playerId || !coinAmount || fileInput.files.length === 0) {
        alert("يرجى ملء جميع الحقول ورفع صورة الإيصال ⚠️");
        return;
    }

    const btn = document.getElementById('submitBtn');
    const originalText = btn.innerHTML;
    
    btn.disabled = true;
    btn.innerHTML = `<span class="spinner-border spinner-border-sm"></span> جاري إرسال طلبك...`;

    try {
        const file = fileInput.files[0];
        
        // تحجيم وضغط الصورة لضمان سرعة الرفع
        const base64Image = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                let img = new Image();
                img.onload = () => {
                    let canvas = document.createElement('canvas');
                    let ctx = canvas.getContext('2d');
                    let scale = 800 / img.width;
                    canvas.width = 800;
                    canvas.height = img.height * scale;
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                    resolve(canvas.toDataURL('image/jpeg', 0.7).split(',')[1]); 
                };
                img.src = reader.result;
            };
            reader.onerror = error => reject(error);
            reader.readAsDataURL(file);
        });

        const formData = new URLSearchParams();
        formData.append('الاسم', name);
        formData.append('التطبيق', document.getElementById('appTitle').innerText);
        formData.append('الآيدي', playerId);
        formData.append('الكمية', coinAmount);
        formData.append('طريقة_الدفع', document.getElementById('paymentMethod').value);
        formData.append('التاريخ', new Date().toLocaleString('ar-SY'));
        formData.append('الصورة', base64Image);

        await fetch(SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors', 
            body: formData
        });

        alert(`تم استلام طلبك بنجاح يا ${name}! ✅\nسيتم شحن طلبك قريباً، يمكنك متابعته من قسم التتبع.`);
        
        this.reset();
        document.getElementById('totalPriceDisplay').innerText = "0 ل.س";
        showPage('homePage');

    } catch (error) {
        console.error("خطأ:", error);
        alert("حدث خطأ في الاتصال، يرجى المحاولة مرة أخرى.");
    } finally {
        btn.disabled = false;
        btn.innerHTML = originalText;
    }
});
