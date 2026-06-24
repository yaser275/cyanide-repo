// كود Cyanide لتخطي فلاتر الويب والقيود المدارة للحساب yaser275
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

            // 2. تخطي المفاتيح المحددة في ملف تفضيلات المحتوى
            Interceptor.attach(mcConnection['- isRestrictionBoolValueSet:'].implementation, {
                onEnter: function (args) {
                    var currentKey = new ObjC.Object(args).toString();
                    this.isTargetKey = (currentKey === "restrictWeb" || 
                                        currentKey === "useContentFilter" || 
                                        currentKey === "whitelistEnabled" ||
                                        currentKey === "useContentFilterOverrides");
                },
                onLeave: function (retval) {
                    if (this.isTargetKey) {
                        retval.replace(ptr("0x0")); // إرجاع false وتعطيل الحظر
                    }
                }
            });

            console.log("[Cyanide] تم تفعيل أداة تخطي قيود الويب بنجاح لمستودع yaser275!");
        } else {
            console.log("[Cyanide] تعذر العثور على كلاس القيود MCProfileConnection");
        }
    } catch (err) {
        console.log("[Cyanide] خطأ أثناء تشغيل الأداة: " + err);
    }
}
