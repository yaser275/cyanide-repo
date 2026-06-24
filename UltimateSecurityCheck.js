(() => {
  log("[*] بدء الفحص الشامل (حماية البنوك + كشف الـ Full Root)...");

  var isJailbroken = false;
  var isFullRoot = false;
  var bypassDetected = false;
  var findings = [];

  var fileManager = r_msg2(r_class("NSFileManager"), "defaultManager");

  // 1. فحص الـ Full Root: اختبار الكتابة في جذر النظام وتغيير الصلاحيات (Root Partition Write Test)
  try {
    // محاولة إنشاء ملف مباشرة في المجلدات الجذرية للـ Full Root
    var rootPaths = ["/private/test_root.txt", "/usr/bin/test_root.txt"];
    var testContent = r_nsstr("FullRootCheck");

    for (var r = 0; r < rootPaths.length; r++) {
      var nsRootPath = r_nsstr(rootPaths[r]);
      var writeRootSuccess = r_msg2(fileManager, "createFileAtPath:contents:attributes:", nsRootPath, testContent, "0x0");
      
      if (writeRootSuccess) {
        isJailbroken = true;
        isFullRoot = true;
        findings.push("تأكيد Full Root: تمكنت الأداة من الكتابة في جذر النظام المحمي: " + rootPaths[r]);
        // حذف ملف الفحص فوراً
        r_msg2(fileManager, "removeItemAtPath:error:", nsRootPath, "0x0");
      }
    }
  } catch (e) {
    log("[!] خطأ أثناء اختبار كتابة الـ Full Root: " + e);
  }

  // 2. فحص الـ Full Root: التحقق من وجود الروابط التشعبية للنظام (Symlinks Check)
  // في جيلبريك الـ Full Root، يتم عمل تحويل للمجلدات لتوفير مساحة، وتطبيقات البنوك تكشف هذا التغيير
  try {
    var symlinkPaths = ["/Applications", "/usr/include", "/usr/share"];
    for (var s = 0; s < symlinkPaths.length; s++) {
      var nsSymPath = r_nsstr(symlinkPaths[s]);
      // جلب الخصائص للتحقق مما إذا كان المجلد عبارة عن رابط تشعبي (Symbolic Link)
      var attributes = r_msg2(fileManager, "attributesOfItemAtPath:error:", nsSymPath, "0x0");
      if (attributes !== "0x0" && attributes !== "") {
        var fileType = r_msg2(attributes, "objectForKey:", r_nsstr("NSFileType"));
        if (r_msg2(fileType, "isEqualToString:", r_nsstr("NSFileTypeSymbolicLink"))) {
          isJailbroken = true;
          isFullRoot = true;
          findings.push("تأكيد Full Root: تم تعديل بنية النظام الأساسية وتحويل المسار إلى Symlink: " + symlinkPaths[s]);
        }
      }
    }
  } catch (e) {
    log("[!] خطأ أثناء فحص الـ Symlinks للـ Root: " + e);
  }

  // 3. فحص الـ Full Root: ملفات الـ Binaries ومنافذ الـ SSH التقليدية
  try {
    var fullRootBinaries = [
      "/bin/sh",
      "/usr/bin/ssh",
      "/usr/libexec/sftp-server",
      "/etc/apt",
      "/etc/ssh/sshd_config"
    ];

    for (var b = 0; b < fullRootBinaries.length; k++) {
      var nsBinPath = r_nsstr(fullRootBinaries[b]);
      if (r_msg2(fileManager, "fileExistsAtPath:", nsBinPath)) {
        isJailbroken = true;
        isFullRoot = true;
        findings.push("اكتشاف ملفات Full Root ونظام أوامر مدمج: " + fullRootBinaries[b]);
      }
    }
  } catch (e) {
    log("[!] خطأ أثناء فحص ملفات الـ Binaries: " + e);
  }

  // 4. فحص الـ Rootless وحقن المكتبات (المستمر من السكربت السابق)
  try {
    var processInfo = r_msg2(r_class("NSProcessInfo"), "processInfo");
    var environment = r_msg2(processInfo, "environment");
    var unsafeEnvVars = ["DYLD_INSERT_LIBRARIES", "_bypasser", "Substrate", "RootHide"];
    
    for (var i = 0; i < unsafeEnvVars.length; i++) {
      var nsKey = r_nsstr(unsafeEnvVars[i]);
      var hasVar = r_msg2(environment, "objectForKey:", nsKey);
      if (hasVar !== "0x0" && hasVar !== "") {
        isJailbroken = true;
        findings.push("اكتشاف حقن مكتبات ديناميكية: " + unsafeEnvVars[i]);
      }
    }
  } catch (e) {
    log("[!] خطأ أثناء فحص الـ Environment Variables: " + e);
  }

  // 5. فحص أدوات التخطي المتقدمة (Bypass Check)
  try {
    var bypassClasses = ["ShadowTweak", "Choicy", "libhide", "RootHideBootstrap", "FlyJB"];
    for (var j = 0; j < bypassClasses.length; j++) {
      var bClass = r_class(bypassClasses[j]);
      if (bClass !== "0x0" && bClass !== "") {
        bypassDetected = true;
        findings.push("تم العثور على أداة تخطي بنوك نشطة: " + bypassClasses[j]);
      }
    }
  } catch (e) {
    log("[!] خطأ أثناء فحص أدوات التخطي: " + e);
  }

  // 6. طباعة وتحليل التقرير الأمني النهائي الشامل
  log("=========================================");
  log("    📊 التقرير الأمني الشامل والأخير 📊    ");
  log("=========================================");
  
  if (isJailbroken || bypassDetected) {
    log("[⚠️] النتيجة: تم اكتشاف مؤشرات كسر حماية!");
    
    if (isFullRoot) {
      log("[🚨] نوع الجيلبريك: Full Root الجيلبريك التقليدي الكامل الصلاحيات.");
    } else {
      log("[🟧] نوع الجيلبريك: Rootless (جيلبريك حديث بدون جذر) أو بيئة حقن مقيدة.");
    }

    log("[*] تفاصيل المؤشرات المكتشفة:");
    for (var m = 0; m < findings.length; m++) {
      log("    🔴 " + findings[m]);
    }
  } else {
    log("[✅] النتيجة: بيئة النظام سليمة ونظيفة تماماً.");
    log("[*] تقييم أمني: الجهاز مغلق (Stock iOS) ومحمي من كشف البنوك.");
  }
  log("=========================================");
})();
