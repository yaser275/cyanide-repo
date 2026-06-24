// كود أداة Cyanide لتخطي فلاتر الويب والقيود المدارة
if (ObjC.available) {
    try {
        var mcConnection = ObjC.classes.MCProfileConnection;

        if (mcConnection) {
            // 1. إجبار النظام على تعطيل فلترة الويب بالكامل
            Interceptor.attach(mcConnection['- isWebFilteringEnabled'].implementation, {
                onLeave: function (retval) {
                    retval.replace(ptr("0x0")); // إرجاع false
                }
            });

            // 2. فحص وتخطي المفاتيح المحددة في ملف تفضيلات المحتوى (com.apple.webcontentfilter)
            Interceptor.attach(mcConnection['- isRestrictionBoolValueSet:'].implementation, {
                onEnter: function (args) {
                    var currentKey = new ObjC.Object(args[2]).toString(); // قراءة المفتاح الممرر للنظام
                    
                    // مطابقة المفاتيح المكتوبة بملف الـ plist الخاص بك
                    this.isTargetKey = (currentKey === "restrictWeb" || 
                                        currentKey === "useContentFilter" || 
                                        currentKey === "whitelistEnabled" ||
                                        currentKey === "useContentFilterOverrides");
                },
                onLeave: function (retval) {
                    if (this.isTargetKey) {
                        retval.replace(ptr("0x0")); // إجبار القيمة أن تكون false دائماً لتخطي الحظر
                    }
                }
            });

            console.log("[Cyanide] تم تفعيل أداة تخطي قيود الويب والنظام بنجاح!");
        } else {
            console.log("[Cyanide] تعذر العثور على كلاس القيود MCProfileConnection");
        }
    } catch (err) {
        console.log("[Cyanide] خطأ أثناء تشغيل الأداة: " + err);
    }
} else {
    console.log("[Cyanide] بيئة عمل الـ Objective-C غير متاحة حالياً.");
}
