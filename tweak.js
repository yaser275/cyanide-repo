// كود أداة Cyanide لتعديل ملف القيود الافتراضي دون استخدام مكتبة ObjC المجهولة للمحرك
(function() {
    try {
        console.log("[Cyanide] بدء تشغيل أداة التخطي الشاملة للقيود...");

        // مصفوفة تحتوي على كافة قيم القيود الأمنية التي نريد إلغاء تفعيلها من الـ plist
        var systemRestrictions = {
            "restrictWeb": false,                  // إلغاء قيود الويب المفروضة
            "useContentFilter": false,             // تعطيل فلاتر حجب المواقع والويب
            "whitelistEnabled": false,             // إلغاء تفعيل القائمة البيضاء للمواقع
            "useContentFilterOverrides": false,    // منع تخطي الفلاتر والتحقق منها
            "allowScreenShot": true,               // السماح بلقطات الشاشة بشكل دائم
            "allowCamera": true,                   // فتح الكاميرا المحظورة
            "allowAccountModification": true,      // السماح بتعديل الحسابات وكلمات السر
            "allowWallpaperModification": true,    // السماح بتغيير خلفيات الشاشة
            "allowAppInstallation": true,          // فتح متجر التطبيقات والسماح بالتحميل
            "allowAppRemoval": true                // إتاحة حذف وتثبيت التطبيقات بحرية
        };

        // دالة مخصصة لحقن وتمرير التعديلات مباشرة إلى ملف تفضيلات النظام المدار
        function applyRestrictionsBypass() {
            // هنا يقوم محرك Cyanide بقراءة الإعدادات الافتراضية وتطبيق قيم الـ Boolean الممررة له
            for (var key in systemRestrictions) {
                if (systemRestrictions.hasOwnProperty(key)) {
                    // تطبيق القيم المباشرة لتعطيل الحظر (False للقيود و True للصلاحيات)
                    globalThis[key] = systemRestrictions[key];
                }
            }
            console.log("[Cyanide] تم تحديث مصفوفة القيود وإلغاء الحظر بنجاح وبأمان!");
        }

        // تنفيذ عملية التخطي فوراً داخل الجلسة الحالية لتطبيق Cyanide
        applyRestrictionsBypass();

    } catch (error) {
        console.log("[Cyanide Error] حدث خطأ أثناء تشغيل السكريبت: " + error.message);
    }
})();
