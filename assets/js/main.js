const header = document.querySelector("[data-header]");
const nav = document.querySelector("[data-nav]");
const navToggle = document.querySelector("[data-nav-toggle]");

const translations = {
  text: {
    "نوهة للإعاشة": "Nooha Catering",
    "حلول الغذاء والتوريد": "Food and supply solutions",
    "الرئيسية": "Home",
    "من نحن": "About",
    "خدماتنا": "Services",
    "أعمالنا": "Projects",
    "الشهادات": "Certificates",
    "التوظيف": "Careers",
    "مطابخنا المركزية": "Central kitchens",
    "تواصل معنا": "Contact us",
    "شركة إعاشة وتوريد غذائي": "Catering and food supply company",
    "حلول غذائية متكاملة للمواقع والمنشآت الكبرى": "Integrated food solutions for major sites and facilities",
    "نقدم خدمات الإعاشة، تشغيل المطابخ، توريد المواد الغذائية، وتجهيز الوجبات اليومية بمعايير تشغيل موثوقة وقابلة للتوسع.": "We provide catering services, kitchen operations, food supply, and daily meal preparation through reliable and scalable operating standards.",
    "اطلب عرضًا مبدئيًا": "Request an initial quote",
    "استعرض الخدمات": "Explore services",
    "نبذة مختصرة": "Company snapshot",
    "بنية تشغيل مصممة لخدمة آلاف الوجبات يوميًا": "An operating structure built to serve thousands of meals every day",
    "هذا النص مبدئي قابل للاستبدال لاحقًا. تركز الشركة على تقديم حلول غذائية مستقرة للقطاعات الحكومية، الصناعية، التعليمية، والمشاريع بعيدة المدى، مع متابعة جودة يومية وسلاسل توريد واضحة.": "This starter content can be replaced later. Nooha focuses on stable food solutions for government, industrial, education, and long-term project sectors, supported by daily quality follow-up and clear supply chains.",
    "تعرف أكثر على الشركة": "Learn more about the company",
    "تشغيل موثوق": "Reliable operations",
    "إدارة توريد وتحضير وتوزيع من نقطة واحدة.": "Supply, preparation, and distribution managed from one coordinated point.",
    "الخدمات الرئيسية": "Core services",
    "كل ما تحتاجه المنشأة لتشغيل الإعاشة بثقة": "Everything a facility needs to run catering with confidence",
    "الإعاشة اليومية": "Daily catering",
    "تخطيط وتحضير وتقديم وجبات يومية للمواقع السكنية والتشغيلية.": "Planning, preparing, and serving daily meals for residential and operational sites.",
    "تشغيل المطابخ": "Kitchen operations",
    "إدارة المطابخ المركزية ومطابخ المواقع وفق إجراءات تشغيل واضحة.": "Managing central and on-site kitchens through clear operating procedures.",
    "توريد المواد الغذائية": "Food supply",
    "سلاسل توريد مرنة للمواد الجافة، المبردة، والمجمدة حسب احتياج العميل.": "Flexible supply chains for dry, chilled, and frozen food materials based on client needs.",
    "قدرة تشغيلية": "Operating capacity",
    "أرقام مختصرة تعكس جاهزية التشغيل على نطاق واسع": "Concise indicators that reflect readiness at scale",
    "مؤشرات مبدئية قابلة للتحديث لاحقًا عند إضافة بيانات العقود الفعلية، مصممة لإظهار الثقة والحجم بدون ازدحام بصري.": "Starter indicators can be updated later with actual contract data. They are designed to communicate reliability and capacity without visual clutter.",
    "قطاعًا نخدمه": "Sectors served",
    "وجبة قابلة للتجهيز شهريًا": "Meals ready for monthly preparation",
    "متابعة تشغيلية": "Operational follow-up",
    "جاهزية للاعتمادات": "Certification-ready processes",
    "معرض مبدئي": "Starter gallery",
    "صور Placeholder قابلة للاستبدال لاحقًا": "Placeholder images ready to be replaced later",
    "ابدأ الآن": "Start now",
    "هل تحتاج إلى شريك إعاشة لمشروعك القادم؟": "Do you need a catering partner for your next project?",
    "أرسل لنا تفاصيل الموقع وعدد المستفيدين ونوع الخدمة المطلوبة، وسنجهز تصورًا أوليًا قابلًا للتطوير.": "Send us the site details, number of beneficiaries, and required service type. We will prepare an initial concept that can be developed further.",
    "محتوى تعريفي مبدئي لشركة إعاشة وتوريد غذائي، قابل للتخصيص بعد اعتماد الهوية والمحتوى النهائي.": "Starter company profile content for a catering and food supply business, ready to be customized after finalizing the identity and official copy.",
    "روابط سريعة": "Quick links",
    "تواصل": "Contact",
    "الرياض، المملكة العربية السعودية": "Riyadh, Saudi Arabia",
    "© 2026 نوهة للإعاشة. جميع الحقوق محفوظة.": "Copyright 2026 Nooha Catering. All rights reserved.",
    "تصميم مبدئي قابل للتطوير.": "Starter design ready for development.",
    "شركة تبني الثقة عبر الانضباط التشغيلي وجودة الغذاء": "A company built on operational discipline and food quality",
    "صفحة تعريفية مبدئية تشرح قصة الشركة ورؤيتها وقيمها، مع مساحة جاهزة لتطوير المحتوى لاحقًا.": "A starter profile page that presents the company story, vision, and values, with room to develop the content later.",
    "قصة الشركة": "Company story",
    "من احتياج تشغيل يومي إلى منظومة إعاشة متكاملة": "From daily operating needs to an integrated catering system",
    "بدأت الشركة لتلبية احتياج المنشآت إلى شريك غذائي يعتمد عليه. هذا النص Placeholder يوضح مسار الشركة، خبرتها، نطاق عملها، وقدرتها على إدارة عقود متنوعة بأحجام مختلفة.": "Nooha was shaped around the need for a dependable food partner for facilities and projects. This placeholder copy outlines the company path, experience, scope, and ability to manage contracts of different sizes.",
    "يمكن لاحقًا استبدال هذا النص بتفاصيل التأسيس، المدن المخدومة، نوع العملاء، وحجم العمليات الفعلي.": "It can later be replaced with foundation details, served cities, client types, and actual operating volume.",
    "الرؤية": "Vision",
    "أن نكون شريكًا موثوقًا في حلول الإعاشة والتوريد الغذائي، مع نموذج تشغيل مرن يواكب توسع العملاء.": "To be a trusted partner in catering and food supply solutions, with a flexible operating model that keeps pace with client growth.",
    "الرسالة": "Mission",
    "تقديم وجبات وخدمات غذائية آمنة ومنظمة، مدعومة بفريق مؤهل وسلاسل توريد واضحة ومعايير جودة قابلة للقياس.": "To deliver safe, organized food services supported by qualified teams, clear supply chains, and measurable quality standards.",
    "القيم": "Values",
    "مبادئ تحكم طريقة العمل": "Principles that guide the way we work",
    "الجودة": "Quality",
    "التزام مستمر بمعايير سلامة الغذاء وجودة الخدمة.": "Continuous commitment to food safety and service quality standards.",
    "الانضباط": "Discipline",
    "تشغيل يومي واضح ومواعيد تسليم دقيقة.": "Clear daily operations and accurate delivery schedules.",
    "المرونة": "Flexibility",
    "نماذج خدمة قابلة للتعديل حسب حجم الموقع.": "Service models that can adapt to the size and nature of each site.",
    "الشفافية": "Transparency",
    "تقارير ومتابعة تساعد العميل على اتخاذ القرار.": "Reporting and follow-up that help clients make confident decisions.",
    "فريق العمل": "Team",
    "طاقم تشغيلي وإداري Placeholder": "Starter operations and management team",
    "م": "O",
    "ج": "Q",
    "ت": "S",
    "مدير العمليات": "Operations Manager",
    "إدارة العقود ومتابعة مواقع التشغيل.": "Contract management and operating site follow-up.",
    "مسؤول الجودة": "Quality Officer",
    "تطبيق إجراءات سلامة الغذاء والتدقيق.": "Food safety procedures, inspections, and audits.",
    "مشرف التوريد": "Supply Supervisor",
    "تنسيق الموردين والمخزون والتسليم.": "Supplier coordination, inventory, and delivery management.",
    "لماذا نحن": "Why us",
    "تجربة مصممة للمنشآت التي تحتاج استقرارًا يوميًا": "An experience designed for facilities that need daily stability",
    "هيكل واضح لإدارة العقود والمواقع.": "A clear structure for contract and site management.",
    "قابلية للتوسع من موقع واحد إلى عدة مواقع.": "Scalability from one location to multiple operating sites.",
    "تجهيزات تشغيل ومحتوى قابل للتخصيص حسب العميل.": "Operating setups and content that can be customized for each client.",
    "صفحات جاهزة لاحقًا لإضافة الاعتمادات والصور الحقيقية.": "Pages ready to add certifications, official documents, and real photos later.",
    "© 2026 نوهة للإعاشة": "Copyright 2026 Nooha Catering",
    "خدمات إعاشة وتوريد قابلة للتوسع حسب طبيعة العقد": "Scalable catering and supply services for every contract type",
    "بطاقات خدمات منظمة تسهل إضافة تفاصيل وأسعار ونطاقات خدمة لاحقًا.": "Organized service cards make it easy to add details, pricing, and service scopes later.",
    "نطاق الخدمة": "Service scope",
    "يمكن تخصيص هذه القائمة حسب القطاعات المستهدفة: مواقع عمالة، مستشفيات، مدارس، مصانع، فعاليات، أو مشاريع حكومية.": "This list can be customized for target sectors such as labor sites, hospitals, schools, factories, events, and government projects.",
    "طلب استشارة": "Request consultation",
    "الإعاشة الكاملة": "Complete catering",
    "إعاشة كاملة": "Full catering",
    "وجبات يومية متكاملة تشمل الإفطار والغداء والعشاء حسب خطة غذائية معتمدة.": "Integrated daily meals including breakfast, lunch, and dinner based on an approved meal plan.",
    "تشغيل المطابخ المركزية": "Central kitchen operations",
    "إدارة الطاقم، الجداول، التحضير، النظافة، ومراقبة الجودة داخل المطبخ.": "Managing staff, schedules, preparation, hygiene, and quality control inside the kitchen.",
    "توريد الأغذية": "Food provisioning",
    "توريد مواد غذائية": "Food material supply",
    "توريد مواد غذائية جافة ومبردة ومجمدة مع تنسيق التخزين والتسليم.": "Supplying dry, chilled, and frozen food materials with storage and delivery coordination.",
    "تشغيل مطبخ": "Kitchen operation",
    "ضيافة وفعاليات": "Hospitality and events",
    "تموين المواقع البعيدة": "Remote site provisioning",
    "حلول لوجستية للمشاريع خارج المدن مع خطط إمداد مستمرة.": "Logistics solutions for projects outside city centers with continuous supply plans.",
    "ضيافة الشركات": "Corporate hospitality",
    "تجهيز بوفيهات واجتماعات وضيافة يومية للمكاتب والمنشآت.": "Buffets, meetings, and daily hospitality services for offices and facilities.",
    "إدارة المقاصف": "Canteen management",
    "تشغيل نقاط بيع ومقاصف داخلية للمدارس والجامعات والمرافق.": "Operating internal points of sale and canteens for schools, universities, and facilities.",
    "نماذج مشاريع وعقود قابلة للتحديث بالصور الحقيقية": "Project and contract samples ready for real updates",
    "قسم Portfolio منظم لعرض العقود السابقة، القطاعات، ونطاق الخدمة.": "An organized portfolio section for previous contracts, sectors, and service scopes.",
    "الكل": "All",
    "مواقع صناعية": "Industrial sites",
    "تعليم": "Education",
    "فعاليات": "Events",
    "عقد إعاشة لمجمع تشغيلي": "Catering contract for an operating complex",
    "Placeholder لوصف حجم العقد وعدد الوجبات ونطاق التشغيل.": "Placeholder description for contract size, meal volume, and operating scope.",
    "تشغيل مقصف تعليمي": "Educational canteen operation",
    "عرض مبدئي لنموذج إدارة مقصف وخدمات تغذية للطلاب.": "Starter model for canteen management and student food services.",
    "تموين فعالية مؤسسية": "Corporate event catering",
    "خدمة ضيافة وتقديم للفعاليات والاجتماعات الكبيرة.": "Hospitality and serving support for large events and meetings.",
    "توريد": "Supply",
    "سلسلة توريد مواد غذائية": "Food material supply chain",
    "تنسيق توريد منتظم لمواقع متعددة مع قابلية للتتبع.": "Regular supply coordination for multiple sites with traceability support.",
    "الشهادات والوثائق": "Certificates and documents",
    "مساحة جاهزة لعرض الاعتمادات والتراخيص": "A ready space for approvals, certifications, and licenses",
    "يمكن ربط كل بطاقة لاحقًا بملف PDF للعرض أو التحميل.": "Each card can later be connected to a PDF for viewing or downloading.",
    "شهادة جودة": "Quality certificate",
    "وصف مختصر للشهادة أو الاعتماد وتاريخ الإصدار.": "Short description of the certificate, approval, and issue date.",
    "فتح لاحقًا": "Open later",
    "ترخيص بلدي": "Municipal license",
    "بيانات الترخيص ونطاقه يمكن إضافتها في المرحلة التالية.": "License details and scope can be added in the next phase.",
    "تحميل لاحقًا": "Download later",
    "اعتماد سلامة الغذاء": "Food safety approval",
    "مساحة مخصصة لاعتمادات HACCP أو ISO أو ما يعادلها.": "Dedicated space for HACCP, ISO, or equivalent approvals.",
    "ملف الشركة": "Company profile",
    "رابط مستقبلي للبروفايل الرسمي ونطاق الخدمات.": "Future link for the official profile and service scope.",
    "أرسل تفاصيل مشروعك وسنعود إليك بتصور أولي": "Send your project details and we will return with an initial concept",
    "نموذج مبدئي جاهز للربط لاحقًا بالبريد أو CRM أو لوحة تحكم.": "A starter form that can later be connected to email, CRM, or an admin dashboard.",
    "الاسم الكامل": "Full name",
    "رقم الجوال": "Mobile number",
    "البريد الإلكتروني": "Email address",
    "نوع الخدمة": "Service type",
    "تفاصيل الطلب": "Request details",
    "إرسال الطلب": "Send request",
    "معلومات التواصل": "Contact information",
    "هذه البيانات Placeholder وسيتم استبدالها بالبيانات الرسمية.": "These starter details can be replaced with the official company information.",
    "الهاتف: +966 50 000 0000": "Phone: +966 50 000 0000",
    "البريد: info@example.com": "Email: info@example.com",
    "الموقع: الرياض، المملكة العربية السعودية": "Location: Riyadh, Saudi Arabia",
    "ساعات العمل: الأحد - الخميس، 9 صباحًا - 5 مساءً": "Working hours: Sunday to Thursday, 9 AM to 5 PM",
    "خريطة Placeholder": "Map placeholder"
  },
  attrs: {
    "نوهة للإعاشة": "Nooha Catering",
    "فتح القائمة": "Open menu",
    "تغيير اللغة": "Switch language",
    "إحصائيات الشركة": "Company statistics",
    "فريق تجهيز الطعام داخل مطبخ احترافي": "Food preparation team inside a professional kitchen",
    "وجبة غذائية متوازنة": "Balanced meal presentation",
    "طهاة داخل مطبخ": "Chefs working inside a kitchen",
    "تحضير الطعام": "Food preparation station",
    "مواد غذائية طازجة": "Fresh food supplies",
    "فريق عمل في مطبخ احترافي": "Team working in a professional kitchen",
    "موقع صناعي": "Industrial operating site",
    "منشأة تعليمية": "Education facility",
    "بوفيه فعاليات": "Event buffet",
    "خدمات لوجستية": "Logistics services",
    "لينكدإن": "LinkedIn",
    "إكس": "X",
    "إنستغرام": "Instagram",
    "اكتب الاسم": "Enter your name",
    "عدد المستفيدين، المدينة، مدة العقد، وأي تفاصيل مهمة": "Beneficiary count, city, contract duration, and any important details",
    "شركة إعاشة وتوريد غذائي تقدم حلول تشغيل مطابخ وتغذية جماعية باحترافية.": "Nooha Catering provides professional catering, kitchen operations, food supply, and daily meal solutions for large facilities and projects."
  },
  titles: {
    "index.html": ["نوهة للإعاشة | الرئيسية", "Nooha Catering | Home"],
    "about.html": ["نوهة للإعاشة | من نحن", "Nooha Catering | About"],
    "services.html": ["نوهة للإعاشة | خدماتنا", "Nooha Catering | Services"],
    "projects.html": ["نوهة للإعاشة | أعمالنا", "Nooha Catering | Projects"],
    "certificates.html": ["نوهة للإعاشة | الشهادات والوثائق", "Nooha Catering | Certificates"],
    "company-profile.html": ["نوهة للإعاشة | الملف التعريفي", "Nooha Catering | Company Profile"],
    "careers.html": ["نوهة للإعاشة | التوظيف", "Nooha Catering | Careers"],
    "central-kitchen-madinah.html": ["نوهة للإعاشة | المطبخ المركزي في المدينة المنورة", "Nooha Catering | Madinah Central Kitchen"],
    "makkah-branch.html": ["نوهة للإعاشة | فرع مكة", "Nooha Catering | Makkah Branch"],
    "riyadh-import-export.html": ["نوهة للإعاشة | فرع الاستيراد والتصدير في الرياض", "Nooha Catering | Riyadh Import and Export Branch"],
    "contact.html": ["نوهة للإعاشة | تواصل معنا", "Nooha Catering | Contact"]
  },
  messages: {
    ar: "تم تجهيز الطلب مبدئيًا",
    en: "Request prepared"
  }
};

const reverseText = Object.fromEntries(Object.entries(translations.text).map(([ar, en]) => [en, ar]));
const reverseAttrs = Object.fromEntries(Object.entries(translations.attrs).map(([ar, en]) => [en, ar]));

function updateHeader() {
  if (!header) return;
  header.classList.toggle("is-scrolled", window.scrollY > 12);
}

function translateTextNodes(root, dictionary) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);

  nodes.forEach((node) => {
    const value = node.nodeValue;
    const trimmed = value.trim();
    if (!trimmed || !dictionary[trimmed]) return;
    node.nodeValue = value.replace(trimmed, dictionary[trimmed]);
  });
}

function translateAttributes(dictionary) {
  document.querySelectorAll("[aria-label], [alt], [placeholder], meta[name='description']").forEach((element) => {
    ["aria-label", "alt", "placeholder", "content"].forEach((attr) => {
      const value = element.getAttribute(attr);
      if (value && dictionary[value]) {
        element.setAttribute(attr, dictionary[value]);
      }
    });
  });
}

function updateLanguageSwitch(language) {
  document.querySelectorAll("[data-language-switch]").forEach((switcher) => {
    switcher.querySelectorAll("span").forEach((option) => {
      option.classList.toggle("active", option.textContent.toLowerCase() === language);
    });
  });
}

function updateTitle(language) {
  const page = window.location.pathname.split("/").pop() || "index.html";
  const titles = translations.titles[page];
  if (titles) {
    document.title = language === "ar" ? titles[0] : titles[1];
  }
}

function setLanguageChoice(language, save = true) {
  const toEnglish = language === "en";
  const textDictionary = toEnglish ? translations.text : reverseText;
  const attrDictionary = toEnglish ? translations.attrs : reverseAttrs;

  translateTextNodes(document.body, textDictionary);
  translateAttributes(attrDictionary);
  updateTitle(language);
  updateLanguageSwitch(language);

  document.documentElement.lang = language;
  document.documentElement.dir = language === "ar" ? "rtl" : "ltr";

  if (save) {
    localStorage.setItem("noohaLanguage", language);
  }
}

navToggle?.addEventListener("click", () => {
  nav?.classList.toggle("is-open");
});

document.querySelectorAll(".main-nav a").forEach((link) => {
  link.addEventListener("click", () => nav?.classList.remove("is-open"));
});

const referenceMenuItems = document.querySelectorAll(".reference-nav-item.has-mega, .reference-nav-item.has-simple");
let referenceMenuTimer;

function closeReferenceMenus(exceptItem = null) {
  referenceMenuItems.forEach((item) => {
    if (item !== exceptItem) {
      item.classList.remove("is-menu-open");
    }
  });
}

function openReferenceMenu(item) {
  clearTimeout(referenceMenuTimer);
  closeReferenceMenus(item);
  item.classList.add("is-menu-open");
}

function scheduleReferenceMenuClose(item) {
  clearTimeout(referenceMenuTimer);
  referenceMenuTimer = setTimeout(() => {
    item.classList.remove("is-menu-open");
  }, 700);
}

referenceMenuItems.forEach((item) => {
  const trigger = Array.from(item.children).find((child) => child.matches("a, button"));
  const panel = item.querySelector(".reference-mega, .reference-simple-menu");

  if (!trigger || !panel) return;

  [trigger, panel].forEach((element) => {
    element.addEventListener("mouseenter", () => openReferenceMenu(item));
    element.addEventListener("mouseleave", () => scheduleReferenceMenuClose(item));
    element.addEventListener("focusin", () => openReferenceMenu(item));
    element.addEventListener("focusout", () => {
      setTimeout(() => {
        if (!item.contains(document.activeElement)) {
          scheduleReferenceMenuClose(item);
        }
      }, 0);
    });
  });
});

document.addEventListener("click", (event) => {
  if (!event.target.closest(".reference-nav")) {
    closeReferenceMenus();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeReferenceMenus();
  }
});

document.querySelectorAll("[data-language-switch]").forEach((switcher) => {
  switcher.addEventListener("click", () => {
    const currentLanguage = document.documentElement.lang === "en" ? "en" : "ar";
    setLanguageChoice(currentLanguage === "ar" ? "en" : "ar");
    nav?.classList.remove("is-open");
  });
});

const savedLanguage = localStorage.getItem("noohaLanguage");
setLanguageChoice(savedLanguage === "en" ? "en" : "ar", false);

window.addEventListener("scroll", updateHeader, { passive: true });
updateHeader();

const revealItems = document.querySelectorAll(".reveal");

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.14 }
  );

  revealItems.forEach((item) => observer.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}

const filterGroup = document.querySelector("[data-filter-group]");
const projectCards = document.querySelectorAll("[data-category]");

filterGroup?.addEventListener("click", (event) => {
  const button = event.target.closest("[data-filter]");
  if (!button) return;

  const filter = button.dataset.filter;
  filterGroup.querySelectorAll(".filter-btn").forEach((item) => item.classList.remove("active"));
  button.classList.add("active");

  projectCards.forEach((card) => {
    const shouldShow = filter === "all" || card.dataset.category === filter;
    card.classList.toggle("is-hidden", !shouldShow);
  });
});

document.querySelector(".contact-form")?.addEventListener("submit", (event) => {
  event.preventDefault();
  const button = event.currentTarget.querySelector("button[type='submit']");
  const originalText = button.textContent;
  const language = document.documentElement.lang === "en" ? "en" : "ar";
  button.textContent = translations.messages[language];
  setTimeout(() => {
    button.textContent = originalText;
  }, 2200);
});
