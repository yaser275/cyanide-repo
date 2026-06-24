// أداة التخطي الشاملة لجميع قيود نظام iOS - مطورة لـ Cyanide
if (ObjC.available) {
    try {
        var mcConnection = ObjC.classes.MCProfileConnection;

        if (mcConnection) {

            // =========================================================================
            // أولاً: تخطي جميع قيود الـ Boolean (أكثر من 40 قيد نظام معرّف رسميًا)
            // =========================================================================
            Interceptor.attach(mcConnection['- isRestrictionBoolValueSet:'].implementation, {
                onEnter: function (args) {
                    var key = new ObjC.Object(args).toString();
                    this.isSystemRestriction = false;

                    // مصفوفة فحص مطابقة كافة القيود المدعومة في نظام iOS
                    if (
                        // قيود الوسائط والأمان
                        key === "allowScreenShot" ||               // لقطات وتسجيل الشاشة
                        key === "allowCamera" ||                   // تشغيل الكاميرا بالكامل
                        key === "allowVoiceDialing" ||             // الاتصال الصوتي عبر القفل
                        key === "allowInAppPurchases" ||           // الشراء من داخل التطبيقات
                        key === "allowAssistant" ||                // تشغيل Siri
                        key === "allowAssistantWhileLocked" ||     // تشغيل Siri أثناء قفل الشاشة

                        // قيود تعديلات الواجهة والإعدادات
                        key === "allowWallpaperModification" ||    // تعديل خلفية الشاشة
                        key === "allowDeviceNameModification" ||   // تعديل اسم الجهاز
                        key === "allowPasscodeModification" ||     // تعديل أو إزالة رمز القفل
                        key === "allowFingerprintModification" ||  // تعديل بصمة الإصبع والوجه FaceID
                        key === "allowBluetoothModification" ||    // تعديل إعدادات البلوتوث
                        key === "allowCellularPlanModification" || // تعديل الخطوط والـ eSIM

                        // قيود الحسابات والخصوصية 
                        key === "allowAccountModification" ||      // تعديل الحسابات (iCloud, Mail)
                        key === "allowFindMyDevice" ||             // العثور على الآيفون
                        key === "allowHostPairing" ||              // الاقتران بحواسيب غير موثوقة
                        key === "allowAppCellularDataModification" || // التحكم ببيانات الخلوي للتطبيقات
                        key === "allowFindMyFriends" ||            // ميزة تحديد موقع الأصدقاء

                        // قيود تطبيقات النظام والويب
                        key === "restrictWeb" ||                   // قيود تصفح الويب
                        key === "useContentFilter" ||              // فلاتر حجب المواقع
                        key === "whitelistEnabled" ||              // وضع القائمة البيضاء للموقع
                        key === "allowBookstore" ||                // متجر الكتب
                        key === "allowSharedStream" ||             // البث المشترك للصور iCloud
                        key === "allowChat" ||                     // ميزات الدردشة المدمجة
                        key === "allowAutomaticAppDownloads" ||    // التحميل التلقائي للتطبيقات
                        
                        // قيود وميزات الأمان المتقدمة للمؤسسات (MDM)
                        key === "allowAirDrop" ||                  // تشغيل ميزة AirDrop
                        key === "allowAperture" ||                 // استخدام فتحات العدسة المتقدمة
                        key === "allowActivityContinuation" ||     // ميزة الـ Handoff بين الأجهزة
                        key === "allowBackup" ||                   // النسخ الاحتياطي لـ iCloud
                        key === "allowEraseContentAndSettings" ||  // مسح جميع المحتويات والإعدادات
                        key === "allowDiagnosticSubmission" ||     // إرسال البيانات التشخيصية لآبل
                        key === "allowUntrustedTLSCertificates"    // قبول شهادات الاتصال غير الموثوقة
                    ) {
                        this.isSystemRestriction = true;
                    }
                },
                onLeave: function (retval) {
                    if (this.isSystemRestriction) {
                        // إرجاع قيمة 1 (YES) دائمًا للسماح بكافة هذه الميزات وكسر الحظر
                        retval.replace(ptr("0x1")); 
                    }
                }
            });


            // =========================================================================
            // ثانياً: تخطي قيود الصلاحيات الرقمية والفعالة (Effective Values)
            // =========================================================================
            Interceptor.attach(mcConnection['- effectiveBoolValueForSetting:'].implementation, {
                onEnter: function (args) {
                    var setting = new ObjC.Object(args).toString();
                    this.isTargetSetting = false;

                    if (
                        setting === "allowAppInstallation" ||     // حظر الـ App Store ومنع التحميل
                        setting === "allowAppRemoval" ||          // حظر حذف التطبيقات من الشاشة
                        setting === "allowNotificationsModification" || // قفل التحكم بالإشعارات
                        setting === "allowUIConfigurationProfileInstallation" || // منع تثبيت ملفات التعريف والشهادات خارجيًا
                        setting === "allowVPNCreation"            // منع إنشاء أو تعديل شبكات الـ VPN
                    ) {
                        this.isTargetSetting = true;
                    }
                },
                onLeave: function (retval) {
                    if (this.isTargetSetting) {
                        // استبدال النتيجة بـ 1 لإعطاء الصلاحية الكاملة فوراً
                        retval.replace(ptr("0x1")); 
                    }
                }
            });

            // =========================================================================
            // ثالثاً: تخطي قيود الويب المباشرة وفلاتر التصفح
            // =========================================================================
            Interceptor.attach(mcConnection['- isWebFilteringEnabled'].implementation, {
                onLeave: function (retval) {
                    // إرجاع 0 (False) لتعطيل الفلترة نهائياً في النظام وسفاري
                    retval.replace(ptr("0x0")); 
                }
            });

            console.log("[Cyanide Expert] تم حقن الأداة وإلغاء كافة القيود الأمنية والنظامية بنجاح!");
        } else {
            console.log("[Cyanide Expert] تعذر العثور على كلاس MCProfileConnection");
        }
    } catch (err) {
        console.log("[Cyanide Expert] حدث خطأ أثناء تنفيذ التخطي الشامل: " + err);
    }
}
