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
    "الشهادات الرسمية وخطابات الشكر": "Official certificates and appreciation letters",
    "استعرض شهادات الاعتماد وخطابات التقدير الخاصة بخدمات نوهة بصيغة PDF.": "View Nooha's accreditation certificates and appreciation letters in PDF format.",
    "شهادة نظام HACCP لخدمات الإعاشة": "HACCP system certificate for catering services",
    "اعتماد HACCP صادر من Motan Al-Anzama Commercial لشركة Nooha Catering Services.": "HACCP certification issued by Motan Al-Anzama Commercial for Nooha Catering Services.",
    "شهادة شكر من مكتب شؤون حجاج إندونيسيا - المدينة المنورة": "Appreciation letter from the Indonesian Hajj Affairs Office - Madinah",
    "شهادة تقدير لمشاركة نوهة في تجهيز خدمات حجاج إندونيسيا لموسم 1446 هـ / 2025 م.": "An appreciation letter for Nooha's participation in serving Indonesian pilgrims during the 1446 AH / 2025 season.",
    "شهادة شكر وتقدير من مكتب شؤون حجاج إندونيسيا": "Appreciation certificate from the Indonesian Hajj Affairs Office",
    "شهادة شكر عربية تقديرًا لجهود نوهة في الخدمات الإعاشية لحجاج إندونيسيا.": "An Arabic appreciation certificate recognizing Nooha's catering efforts for Indonesian pilgrims.",
    "شهادة شكر من مجموعة كاهايا المدينة الماليزية": "Appreciation letter from Cahaya Madinah Group Malaysia",
    "تقدير لتجهيز وتموين ضيوف الرحمن وحسن التعاون خلال موسم حج 1438 هـ / 2017 م.": "Recognition for catering and supplying pilgrims and for good cooperation during the 1438 AH / 2017 Hajj season.",
    "شهادة شكر من مكتب شؤون حجاج إثيوبيا": "Appreciation letter from the Ethiopian Hajj Affairs Office",
    "شهادة تقدير لخدمات نوهة في إسكان وإعاشة الحجاج الإثيوبيين خلال موسم حج 1440 هـ.": "An appreciation letter for Nooha's accommodation and catering services for Ethiopian pilgrims during the 1440 AH Hajj season.",
    "فتح الشهادة": "Open certificate",
    "أرسل تفاصيل مشروعك وسنعود إليك بتصور أولي": "Send your project details and we will return with an initial concept",
    "نموذج مبدئي جاهز للربط لاحقًا بالبريد أو CRM أو لوحة تحكم.": "A starter form that can later be connected to email, CRM, or an admin dashboard.",
    "طلب خدمة": "Service request",
    "بيانات المشروع": "Project details",
    "أرسل الاحتياج الأساسي وسنرد عليك عبر الجوال أو البريد.": "Send the basic requirement and we will respond by mobile or email.",
    "الاسم الكامل": "Full name",
    "رقم الجوال": "Mobile number",
    "البريد الإلكتروني": "Email address",
    "نوع الخدمة": "Service type",
    "تفاصيل الطلب": "Request details",
    "إرسال الطلب": "Send request",
    "معلومات التواصل": "Contact information",
    "تواصل معنا عبر الجوال أو البريد الإلكتروني أو حسابات التواصل الرسمية.": "Contact us through mobile, email, or official social channels.",
    "الجوال الأول": "Primary mobile",
    "الجوال الثاني": "Secondary mobile",
    "الجوال 1: +966 57 000 0171": "Mobile 1: +966 57 000 0171",
    "الجوال 2: +966 55 532 3584": "Mobile 2: +966 55 532 3584",
    "البريد: nooha2040@gmail.com": "Email: nooha2040@gmail.com",
    "إنستقرام": "Instagram",
    "سناب شات": "Snapchat",
    "الموقع": "Location",
    "المدينة المنورة، المملكة العربية السعودية": "Madinah, Saudi Arabia",
    "ساعات العمل": "Working hours",
    "الأحد - الخميس، 9 صباحًا - 5 مساءً": "Sunday to Thursday, 9 AM to 5 PM",
    "الموقع: المدينة المنورة، المملكة العربية السعودية": "Location: Madinah, Saudi Arabia",
    "ساعات العمل: الأحد - الخميس، 9 صباحًا - 5 مساءً": "Working hours: Sunday to Thursday, 9 AM to 5 PM",
    "خريطة Placeholder": "Map placeholder",
    "فتح الموقع على خرائط Google": "Open location in Google Maps"
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
    "إنستقرام نوهة": "Nooha Instagram",
    "سناب شات نوهة": "Nooha Snapchat",
    "اكتب الاسم": "Enter your name",
    "عدد المستفيدين، المدينة، مدة العقد، وأي تفاصيل مهمة": "Beneficiary count, city, contract duration, and any important details",
    "شركة إعاشة وتوريد غذائي تقدم حلول تشغيل مطابخ وتغذية جماعية باحترافية.": "Nooha Catering provides professional catering, kitchen operations, food supply, and daily meal solutions for large facilities and projects.",
    "موقع شركة نوهة على خرائط Google": "Nooha location on Google Maps"
  },
  titles: {
    "index.html": ["نوهة للإعاشة | الرئيسية", "Nooha Catering | Home"],
    "about.html": ["نوهة للإعاشة | من نحن", "Nooha Catering | About"],
    "services.html": ["نوهة للإعاشة | خدماتنا", "Nooha Catering | Services"],
    "projects.html": ["نوهة للإعاشة | أعمالنا", "Nooha Catering | Projects"],
    "Gallery.html": ["نوهة للإعاشة | المعرض", "Nooha Catering | Gallery"],
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

const supplementalTranslations = {
  text: {
    "نوهة للإعاشة | الرئيسية": "Nooha Catering | Home",
    "نوهة للإعاشة | من نحن": "Nooha Catering | About",
    "نوهة للإعاشة | خدماتنا": "Nooha Catering | Services",
    "نوهة للإعاشة | الصور": "Nooha Catering | Gallery",
    "نوهة للإعاشة | الشهادات والوثائق": "Nooha Catering | Certificates and Documents",
    "نوهة للإعاشة | التوظيف": "Nooha Catering | Careers",
    "نوهة للإعاشة | تواصل معنا": "Nooha Catering | Contact",
    "نوهة للإعاشة | الملف التعريفي": "Nooha Catering | Company Profile",
    "نوهة للإعاشة | المطبخ المركزي في المدينة المنورة": "Nooha Catering | Madinah Central Kitchen",
    "نوهة للإعاشة | المطبخ المركزي في الرياض": "Nooha Catering | Riyadh Central Kitchen",
    "نوهة للإعاشة | المطبخ المركزي في تبوك ضباء": "Nooha Catering | Tabuk Duba Central Kitchen",
    "نوهة للإعاشة | فرع مكة": "Nooha Catering | Makkah Branch",
    "نوهة للإعاشة | فرع الاستيراد والتصدير في الرياض": "Nooha Catering | Riyadh Import and Export Branch",
    "اتصل بنا": "Contact us",
    "عن نوها": "About Nooha",
    "عن نوهة": "About Nooha",
    "نوها في سطور": "Nooha at a Glance",
    "نوهة في سطور": "Nooha at a Glance",
    "ما الذي نقدمه": "What We Offer",
    "الاعتمادات": "Accreditations",
    "الفئات والقطاعات المستهدفة": "Target Categories and Sectors",
    "خبرات فريق العمل": "Team Experience",
    "لماذا نوها؟": "Why Nooha?",
    "لماذا نوهة؟": "Why Nooha?",
    "الخدمات": "Services",
    "خدمات التموين والإعاشة من موقع العميل": "On-site Catering and Support Services",
    "خدمات التموين من مطابخنا المركزية": "Catering Services from Our Central Kitchens",
    "خدمات الإعاشة المساندة": "Supporting Catering Services",
    "المطبخ المركزي في المدينة المنورة": "Madinah Central Kitchen",
    "فرع مكة": "Makkah Branch",
    "فرع الاستيراد والتصدير في الرياض": "Riyadh Import and Export Branch",
    "المعرض": "Gallery",
    "الصور": "Photos",
    "مدونات": "Blog",
    "اليوم الوطني السعودي الـ 94": "Saudi National Day 94",
    "أهمية الاهتمام بالغذاء للعمالة": "The Importance of Food Care for Workers",
    "شهادة الآيزو وسلامة الغذاء": "ISO Certification and Food Safety",
    "اليوم العالمي لسلامة الأغذية": "World Food Safety Day",
    "يوم التأسيس: نغذي مسيرة العطاء": "Founding Day: Nourishing a Journey of Giving",
    "أفضل شركة تموين وإعاشة": "Best Catering and Support Services Company",
    "العربية": "Arabic",
    "الملف التعريفي": "Company Profile",
    "نغذي": "Nourishing",
    "طموحكم": "Your Ambition",
    "بخدمة تليق بثقتكم": "with Service Worthy of Your Trust",
    "نغذي طموحكم بخدمة تليق بثقتكم": "Nourishing Your Ambition with Service Worthy of Your Trust",
    "شركة نوهه": "Nooha Company",
    "نغذي طموحكم بخدمة تليق بثقتكم عبر دعم غذائي استراتيجي لمشاريع نيوم والمناطق المحيطة.": "Nourishing your ambition with service worthy of your trust through strategic food support for NEOM projects and surrounding areas.",
    "طلب عرض سعر": "Request a Quote",
    "لطلب عرض سعر": "Request a Quote",
    "الاسم *": "Name *",
    "رقم الجوال *": "Mobile Number *",
    "البريد الإلكتروني *": "Email *",
    "نوع الخدمة *": "Service Type *",
    "رسالة قصيرة *": "Short Message *",
    "إرسال": "Submit",
    "نؤمن بأن تقديم حلول التموين والإعاشة المناسبة يسهم بشكل مباشر في رفع كفاءة القوى العاملة في مختلف المواقع والقطاعات. من مطابخنا المركزية، ترسل آلاف الوجبات يوميًا إلى أماكن العمل في جميع أنحاء المملكة، لتلبية احتياجات بيئات العمل المتنوعة مع الحفاظ على أعلى مستويات الجودة والالتزام الصارم بالعمليات التشغيلية.": "We believe that providing the right catering and support solutions directly improves workforce efficiency across different sites and sectors. From our central kitchens, thousands of meals are delivered daily to workplaces across the Kingdom, serving diverse work environments while maintaining high quality and strict operational discipline.",
    "نعمل مع شركات رائدة ومشاريع كبرى في قطاعات الصناعة والبناء والضيافة والرعاية الصحية ومبادرات الرؤية، لنكون جزءًا لا يتجزأ من دورة تشغيلية تضمن استمرار القوى العاملة في تقديم أفضل أداء ممكن.": "We work with leading companies and major projects in industry, construction, hospitality, healthcare, and Vision initiatives, becoming part of an operating cycle that helps workforces continue performing at their best.",
    "خبرة في مجال القوى العاملة": "Workforce Sector Experience",
    "يتمتع فريق نوهة بخبرة تشغيلية واسعة في إدارة خدمات التموين والإعاشة في بيئات عمل متنوعة، مع سجل حافل بالحفاظ على الجودة والانضباط التشغيلي.": "Nooha's team has broad operating experience managing catering and support services in diverse work environments, with a strong record of quality and operational discipline.",
    "حاصلون على اعتماد مدن - الدرجة الأولى، ولدينا أكبر مطبخ في المدينة المنورة": "Certified by MODON - First Class, with the largest kitchen in Madinah",
    "ندير منظومة تموين وإعاشة متكاملة، تبدأ من إعداد المقادير وتنتهي بإدارة الميدان.": "We manage an integrated catering system, from ingredient preparation through field operations.",
    "اعرف أكثر": "Learn More",
    "تعرف أكثر": "Learn More",
    "عدد العملاء": "Clients",
    "الموظفين": "Employees",
    "قطاعات مختلفة": "Different Sectors",
    "عدد الوجبات يوميًا": "Meals per Day",
    "مطابخنا": "Our Kitchens",
    "المستفيدون يوميًا": "Daily Beneficiaries",
    "شركاء النجاح": "Success Partners",
    "شبكة مطابخ تخدم مواقع العمل في مختلف مناطق المملكة": "A kitchen network serving work sites across the Kingdom",
    "المدينة المنورة": "Madinah",
    "المطبخ المركزي": "Central Kitchen",
    "خدمة وتموين المواقع": "Site Catering and Service",
    "الرياض": "Riyadh",
    "فرع الاستيراد والتصدير": "Import and Export Branch",
    "نخدم قطاعات تحتاج إلى توريد غذائي منضبط ومستمر": "We serve sectors that need disciplined, continuous food supply",
    "المصانع والشركات": "Factories and Companies",
    "الفنادق": "Hotels",
    "شركات المقاولات": "Contracting Companies",
    "مشروعات رؤية 2030": "Vision 2030 Projects",
    "حقول ومنشآت النفط والغاز": "Oil and Gas Fields and Facilities",
    "الشركات في المناطق النائية": "Companies in Remote Areas",
    "المجمعات السكنية العمالية": "Worker Housing Compounds",
    "المستشفيات والمراكز الصحية": "Hospitals and Healthcare Centers",
    "القطاعات الأمنية والعقود الحكومية": "Security Sectors and Government Contracts",
    "خبرة تشغيلية واسعة في إدارة التغذية والإعاشة": "Extensive Operating Experience in Food and Catering Management",
    "يمتلك فريق نوهة خبرة تشغيلية واسعة في إدارة التغذية والإعاشة في بيئات عمل متنوعة، وبقدرة عالية على الحفاظ على الجودة والانضباط.": "Nooha's team has extensive operating experience managing food and catering in diverse work environments, with a strong ability to maintain quality and discipline.",
    "تقديم وجبات غذائية تناسب أكثر من عشر جنسيات مختلفة.": "Providing meals suitable for more than ten nationalities.",
    "إدارة وتشغيل مجمعات سكنية للعمالة تخدم آلاف المستفيدين.": "Managing and operating worker housing compounds serving thousands of beneficiaries.",
    "إدارة وتشغيل مطابخ مركزية تخدم مواقع متعددة.": "Managing and operating central kitchens that serve multiple sites.",
    "خبرة في العمل عبر مدن ومناطق مختلفة مع مرونة تشغيلية دون التأثير على الجودة.": "Experience working across different cities and regions with operational flexibility without compromising quality.",
    "لمزيد من المعلومات أو لطلب خدمة": "For more information or to request a service",
    "لا تتردد في التواصل معنا في أي وقت. فريقنا جاهز لدراسة احتياج موقعك وتجهيز نموذج خدمة مناسب.": "Contact us at any time. Our team is ready to review your site's needs and prepare a suitable service model.",
    "من مطابخنا المركزية ننطلق يوميًا لإعداد آلاف الوجبات إلى مواقع العمل في مختلف مناطق المملكة، بسرعة تنفيذ وضبط صحي ومعايير جودة وسلامة عالية وثابتة.": "From our central kitchens, we prepare thousands of meals daily for work sites across the Kingdom, with fast execution, health control, and consistent quality and safety standards.",
    "انضم إلى فريق نوهة في تشغيل الإعاشة والخدمات الغذائية": "Join Nooha's Catering and Food Services Team",
    "نستقبل طلبات المرشحين للوظائف التشغيلية والإدارية وسلاسل الإمداد، مع فرز مبدئي حسب الخبرة والمدينة والتخصص.": "We receive applications for operational, administrative, and supply chain roles, with initial screening by experience, city, and specialty.",
    "بيئة العمل": "Work Environment",
    "فريق يعتمد على الانضباط، سلامة الغذاء، وجودة الخدمة اليومية": "A team built on discipline, food safety, and daily service quality",
    "تحتاج مشاريع الإعاشة إلى فرق ملتزمة بالتفاصيل اليومية: التحضير، النظافة، الجداول، التوريد، والتعامل المهني مع مواقع العملاء. هذه الصفحة مخصصة لاستقبال طلبات الانضمام وفرزها مبدئيًا.": "Catering projects need teams committed to daily details: preparation, hygiene, schedules, supply, and professional interaction with client sites. This page is dedicated to receiving applications and initial screening.",
    "يمكن لاحقًا ربط النموذج بالبريد الإلكتروني أو نظام موارد بشرية، وإضافة وظائف مفتوحة حسب المدينة والموقع.": "The form can later be connected to email or an HR system, with open roles added by city and site.",
    "المسارات المتاحة": "Available Tracks",
    "مجالات عمل يمكن التقديم عليها": "Areas You Can Apply For",
    "طهاة، مساعدو طهاة، مشرفو تحضير، ومسؤولو نظافة وتشغيل.": "Chefs, assistant chefs, preparation supervisors, and hygiene and operations staff.",
    "الجودة والسلامة": "Quality and Safety",
    "متابعة تطبيق إجراءات سلامة الغذاء، الفحص اليومي، وتوثيق الملاحظات.": "Monitoring food safety procedures, daily inspections, and documentation of notes.",
    "التوريد والمستودعات": "Supply and Warehousing",
    "تنسيق الموردين، متابعة المخزون، التجهيز، وجدولة التسليم.": "Supplier coordination, inventory follow-up, preparation, and delivery scheduling.",
    "الإدارة والدعم": "Administration and Support",
    "إدارة المواقع، خدمة العملاء، الموارد البشرية، والمساندة الإدارية.": "Site management, customer service, human resources, and administrative support.",
    "المدينة": "City",
    "المجال الوظيفي": "Job Field",
    "سنوات الخبرة": "Years of Experience",
    "أقل من سنة": "Less than one year",
    "1 - 3 سنوات": "1 - 3 years",
    "4 - 7 سنوات": "4 - 7 years",
    "أكثر من 7 سنوات": "More than 7 years",
    "إرسال طلب التوظيف": "Submit Job Application",
    "آلية استقبال الطلبات": "Application Intake Process",
    "هذا نموذج مبدئي لجمع بيانات المرشحين، ويمكن تطويره لاحقًا لرفع السيرة الذاتية أو ربطه بالبريد.": "This is a starter form for collecting candidate information and can later be developed for CV upload or email integration.",
    "الفرز حسب المدينة والتخصص": "Screening by city and specialty",
    "التواصل مع المرشحين المناسبين": "Contacting suitable candidates",
    "تحديث الوظائف المفتوحة لاحقًا": "Updating open positions later",
    "إمكانية ربط النموذج بنظام موارد بشرية": "Potential HR system integration",
    "إرسال السيرة بالبريد": "Send CV by Email",
    "مركز تشغيل رئيسي لإعداد الوجبات وخدمة مواقع العمل والضيافة والقطاعات التي تحتاج إلى تموين يومي منظم.": "A main operating center for meal preparation and for serving work sites, hospitality, and sectors that need organized daily catering.",
    "تشغيل يومي يخدم احتياج المواقع بكفاءة": "Daily operations that efficiently serve site needs",
    "يمثل مطبخ المدينة المنورة نقطة التشغيل المركزية لدى نوهة، حيث يتم تجهيز الوجبات وفق مسارات عمل واضحة تشمل التخزين، التحضير، الطبخ، التغليف، والتسليم.": "The Madinah kitchen is Nooha's central operating point, where meals are prepared through clear workflows covering storage, preparation, cooking, packaging, and delivery.",
    "يركز الفرع على خدمة المشاريع والمواقع التي تحتاج إلى جودة ثابتة واستجابة مرنة، مع مراعاة متطلبات السلامة الغذائية وسرعة التوزيع.": "The branch focuses on serving projects and sites that require consistent quality and flexible response while meeting food safety requirements and fast distribution.",
    "مطبخ مركزي مجهز لخدمة التشغيل اليومي": "A central kitchen equipped for daily operations",
    "الأرقام التالية قابلة للتحديث عند اعتماد البيانات النهائية، لكنها تعرض هيكلًا مناسبًا لعرض الطاقة والمساحة والمستفيدين.": "The following figures can be updated when final data is approved, but they provide a suitable structure for presenting capacity, area, and beneficiaries.",
    "متر مربع": "square meters",
    "وجبة يوميًا": "meals per day",
    "مستفيد يوميًا": "beneficiaries per day",
    "خدمات تموين وإعاشة منضبطة": "Disciplined catering and support services",
    "تحضير يومي": "Daily Preparation",
    "إعداد الوجبات وفق قوائم تشغيل معتمدة.": "Meal preparation according to approved operating menus.",
    "تخزين وتبريد": "Storage and Cooling",
    "مناطق تخزين مخصصة للحفاظ على جودة المواد.": "Dedicated storage areas to preserve material quality.",
    "تغليف وتسليم": "Packaging and Delivery",
    "تنظيم مراحل التغليف والتسليم حسب احتياج الموقع.": "Organizing packaging and delivery stages according to site needs.",
    "سلامة غذائية": "Food Safety",
    "متابعة إجراءات النظافة وسلامة الغذاء في مراحل التشغيل.": "Monitoring hygiene and food safety procedures during operating stages.",
    "من مطبخنا المركزي وفروعنا ننطلق يوميًا لخدمة مواقع العمل بسرعة تنفيذ وضبط صحي ومعايير جودة ثابتة.": "From our central kitchen and branches, we serve work sites daily with fast execution, health control, and consistent quality standards.",
    "المملكة العربية السعودية": "Saudi Arabia",
    "المطبخ المركزي في الرياض، نموذج الكفاءة في تقديم خدمات الإعاشة للمشاريع الكبرى والجهات التي تحتاج إلى تموين يومي منتظم.": "The Riyadh Central Kitchen is a model of efficiency in providing catering services for major projects and organizations that need regular daily supply.",
    "المطبخ المركزي في الرياض": "Riyadh Central Kitchen",
    "نموذج الكفاءة في تقديم خدمات الإعاشة": "A model of efficiency in catering service delivery",
    "في ظل الطلب المتزايد على خدمات الإعاشة الجماعية عالية الجودة في مختلف قطاعات المملكة، تواصل نوهة التوسع بفعالية عبر تشغيل مطابخ مركزية مجهزة بالكامل.": "As demand grows for high-quality group catering across the Kingdom's sectors, Nooha continues to expand effectively through fully equipped central kitchens.",
    "يقع المطبخ المركزي في الرياض في منطقة السلي، ويتميز بطاقة استيعابية وإنتاجية عالية، مع التزام صارم بمعايير الجودة وسلامة الغذاء.": "The Riyadh Central Kitchen is located in Al Sulay and offers high capacity and productivity with strict commitment to quality and food safety standards.",
    "قدرة إنتاجية": "Production Capacity",
    "مطبخ مركزي بقدرة إنتاجية تلبي المشاريع الكبرى": "A central kitchen with production capacity for major projects",
    "مما يجعله حلًا مثاليًا للجهات التي تحتاج إلى تموين يومي منتظم، مثل الشركات الصناعية، المراكز الطبية، سكن العمال، والوزارات.": "This makes it an ideal solution for organizations that need regular daily catering, such as industrial companies, medical centers, worker housing, and ministries.",
    "التجهيزات": "Equipment",
    "تصميم هندسي وتجهيزات عالمية": "Engineered design and world-class equipment",
    "تم تصميم مطبخ الرياض المركزي وفق أعلى المواصفات العالمية، ما يجعله قادرًا على الاستجابة بسرعة ومرونة للطلبات اليومية والموسمية.": "The Riyadh Central Kitchen was designed to the highest international specifications, enabling fast and flexible response to daily and seasonal demands.",
    "خطوط إنتاج متعددة": "Multiple Production Lines",
    "لتقليل وقت التحضير ورفع كفاءة التشغيل اليومي.": "To reduce preparation time and improve daily operating efficiency.",
    "أجهزة حديثة": "Modern Equipment",
    "للطهي والتبريد والتغليف وفق متطلبات الإعاشة.": "For cooking, cooling, and packaging according to catering requirements.",
    "أنظمة تهوية ومراقبة حرارة": "Ventilation and Temperature Monitoring Systems",
    "لضمان البيئة المثالية في مراحل التحضير والتجهيز.": "To ensure an ideal environment during preparation and processing stages.",
    "مسارات عمل مخصصة": "Dedicated Workflows",
    "لفصل عمليات التحضير عن التعبئة والتسليم.": "To separate preparation from packaging and delivery operations.",
    "الجودة الغذائية": "Food Quality",
    "وجبات متوازنة بإشراف طهاة محترفين": "Balanced meals supervised by professional chefs",
    "تعد وجباتنا تحت إشراف نخبة من الطهاة المحترفين ممن يتمتعون بخبرة واسعة في إعداد وجبات العمال ووجبات الموظفين وفق المعايير الصحية والغذائية العالمية.": "Our meals are prepared under the supervision of professional chefs with extensive experience preparing worker and employee meals according to global health and nutrition standards.",
    "نأخذ في الاعتبار التنوع الثقافي في قوائم الطعام، مع الحرص على التوازن الغذائي والسعرات الحرارية. جميع مراحل الإعداد تتم وفق نظام HACCP لضمان سلامة الغذاء وجودة المخرجات.": "We consider cultural diversity in menus while maintaining nutritional balance and calorie needs. All preparation stages follow HACCP to ensure food safety and output quality.",
    "الوجبات الآسيوية والعربية والخليجية.": "Asian, Arabic, and Gulf meals.",
    "الأطباق الهندية والباكستانية حسب احتياج المواقع.": "Indian and Pakistani dishes according to site needs.",
    "خيارات نباتية ووجبات خاصة عند الطلب.": "Vegetarian options and special meals on request.",
    "طاقة إنتاجية يومية ضخمة": "Large daily production capacity",
    "مطبخ مركزي مجهز بالكامل": "Fully equipped central kitchen",
    "إشراف من طهاة محترفين وفريق جودة": "Supervision by professional chefs and a quality team",
    "تنوع في القوائم ومرونة في التقديم": "Menu diversity and flexible service",
    "التزام بمعايير السلامة والنظافة": "Commitment to safety and hygiene standards",
    "إذا كانت منشأتك تبحث عن حلول تموين تدار بانضباط تشغيلي وجودة ثابتة": "If your organization is looking for catering solutions managed with operational discipline and consistent quality",
    "فإن فريق نوهة جاهز لدراسة متطلباتك وبناء نموذج تموين يناسب طبيعة موقعك وحجم التشغيل.": "Nooha's team is ready to study your requirements and build a catering model suited to your site and operating scale.",
    "تبوك ضباء": "Tabuk Duba",
    "المطبخ المركزي في تبوك ضباء": "Tabuk Duba Central Kitchen",
    "دعم غذائي استراتيجي لمشاريع نيوم والمناطق المحيطة": "Strategic food support for NEOM projects and surrounding areas",
    "في قلب منطقة تبوك، وتحديدًا في مدينة ضباء، يقع أحد أهم مراكز عمليات نوهة للتموين والإعاشة. تم تأسيس هذا المطبخ ليكون محطة استراتيجية متقدمة تدعم مشاريع نيوم والمشاريع التنموية المحيطة بها.": "In the heart of Tabuk, specifically in Duba, one of Nooha's most important catering operation centers is located. This kitchen was established as an advanced strategic hub supporting NEOM projects and surrounding development projects.",
    "يعتمد مطبخ ضباء على أسطول من الشاحنات المبردة لضمان إيصال الوجبات في الوقت المحدد إلى مواقع العمل والمرافق السكنية ومقرات الشركات، مع أنظمة تتبع ومراقبة حرارية للحفاظ على جودة الطعام حتى لحظة التسليم.": "The Duba kitchen relies on a fleet of refrigerated trucks to deliver meals on time to work sites, residential facilities, and company locations, with tracking and temperature monitoring systems to preserve food quality until delivery.",
    "موقع استراتيجي": "Strategic Location",
    "طاقة تشغيلية عالية وموقع استراتيجي": "High Operating Capacity and Strategic Location",
    "تم اختيار الموقع بعناية ليكون قريبًا من مواقع المشاريع الكبرى، مما يقلل زمن التوصيل ويزيد من كفاءة سلسلة الإمداد الغذائي، خصوصًا في مشاريع تتطلب استجابة فورية وسعة إنتاج ضخمة.": "The location was carefully selected near major project sites, reducing delivery times and improving food supply chain efficiency, especially for projects requiring immediate response and large production capacity.",
    "خدمة تموين متكاملة لمشاريع نيوم": "Integrated Catering Service for NEOM Projects",
    "من خلال مطبخ ضباء، تقدم نوهة خدمات تموين يومية لعدد من المشاريع الحيوية، ضمن أنظمة غذائية متوازنة وتحت إشراف طهاة محترفين وفريق جودة وسلامة متخصص.": "Through the Duba kitchen, Nooha provides daily catering for vital projects within balanced meal systems supervised by professional chefs and a specialized quality and safety team.",
    "العاملة في مشاريع نيوم ومواقع الإنشاء.": "working on NEOM projects and construction sites.",
    "معسكرات العمال": "Worker Camps",
    "في مواقع الإنشاء والتطوير والمرافق السكنية.": "at construction, development, and residential facilities.",
    "المرافق الإدارية": "Administrative Facilities",
    "والخدمية التي تحتاج إلى وجبات منتظمة.": "and service facilities that need regular meals.",
    "الفنادق المؤقتة": "Temporary Hotels",
    "ومساكن الموظفين داخل نطاق المشاريع.": "and staff housing within project areas.",
    "مشاريع البنية التحتية": "Infrastructure Projects",
    "والمرافق الصناعية ذات التشغيل اليومي.": "and industrial facilities with daily operations.",
    "القوائم الغذائية": "Menus",
    "تنوع في القوائم وتخصيص حسب الحاجة": "Menu diversity and customization as needed",
    "ندرك أن العاملين في مشاريع مثل نيوم يمثلون خلفيات متعددة وثقافات متنوعة، لذلك نوفر قوائم طعام مخصصة يتم إعدادها بالتعاون مع أخصائيي تغذية وطهاة محترفين لضمان التوازن بين المذاق والجودة الغذائية.": "We understand that workers on projects such as NEOM represent different backgrounds and cultures, so we provide customized menus prepared with nutrition specialists and professional chefs to balance taste and nutritional quality.",
    "الوجبات الآسيوية.": "Asian meals.",
    "المأكولات العربية والخليجية.": "Arabic and Gulf dishes.",
    "الأطباق الهندية والباكستانية.": "Indian and Pakistani dishes.",
    "خيارات نباتية ووجبات طبية خاصة عند الطلب.": "Vegetarian options and special medical meals on request.",
    "موقع استراتيجي يخدم مشاريع نيوم": "Strategic location serving NEOM projects",
    "إنتاج يومي يصل إلى 12,000 وجبة": "Daily production up to 12,000 meals",
    "خبرة في تموين العمالة والمشاريع الصناعية": "Experience catering for labor and industrial projects",
    "تنوع في قوائم الطعام": "Diverse menus",
    "التزام صارم بمعايير HACCP وسلامة الغذاء": "Strict commitment to HACCP and food safety standards",
    "خدمات توصيل موثوقة وسريعة": "Reliable and fast delivery services",
    "مكة المكرمة": "Makkah",
    "فرع مخصص لخدمة احتياج مواقع مكة والمناطق المحيطة بخدمات تموين وإعاشة مرنة.": "A dedicated branch serving Makkah and surrounding sites with flexible catering and support services.",
    "خدمة قريبة من مواقع التشغيل": "Service close to operating sites",
    "يدعم فرع مكة أعمال التموين للمواقع التي تحتاج إلى سرعة استجابة وتنظيم في تجهيز الطلبات، خصوصًا في المواسم وفترات كثافة الطلب.": "The Makkah branch supports catering operations for sites that need fast response and organized order preparation, especially during seasons and high-demand periods.",
    "يركز الفرع على تنسيق الطلبات اليومية، متابعة الاحتياج، وتجهيز نموذج خدمة يناسب طبيعة الموقع وعدد المستفيدين.": "The branch focuses on coordinating daily orders, following up on needs, and preparing a service model suited to each site's nature and beneficiary count.",
    "نطاق فرع مكة": "Makkah Branch Scope",
    "حلول تشغيلية للمواقع والضيافة": "Operational solutions for sites and hospitality",
    "تموين يومي": "Daily Catering",
    "خدمة وجبات مخصصة حسب طبيعة الموقع.": "Customized meal service according to site needs.",
    "ضيافة موسمية": "Seasonal Hospitality",
    "مرونة في خدمة المواسم وفترات الطلب العالي.": "Flexibility during seasons and high-demand periods.",
    "تجهيز وتسليم": "Preparation and Delivery",
    "تنظيم التحضير والتعبئة والتسليم.": "Organizing preparation, packaging, and delivery.",
    "متابعة تشغيل": "Operations Follow-up",
    "متابعة يومية لضمان استقرار الخدمة.": "Daily follow-up to ensure service stability.",
    "خدمات تموين وإعاشة قابلة للتخصيص حسب طبيعة كل موقع.": "Catering and support services customizable to each site.",
    "فرع داعم لسلاسل الإمداد والتوريد والتجهيز اللوجستي لخدمات نوهة.": "A branch supporting supply chains, procurement, and logistics for Nooha services.",
    "الاستيراد والتصدير": "Import and Export",
    "دعم لوجستي وسلاسل إمداد منظمة": "Logistics support and organized supply chains",
    "يدعم فرع الرياض أعمال الاستيراد والتصدير والتوريد، بما يساعد على توفير المواد والاحتياجات التشغيلية لخدمات التموين والإعاشة.": "The Riyadh branch supports import, export, and supply activities, helping provide materials and operating needs for catering services.",
    "يعزز الفرع قدرة نوهة على تنسيق الإمداد، متابعة الموردين، وخدمة المواقع عبر نموذج تشغيل واضح وقابل للتوسع.": "The branch strengthens Nooha's ability to coordinate supply, follow up with suppliers, and serve sites through a clear, scalable operating model.",
    "دور الفرع": "Branch Role",
    "حلقة إمداد تخدم عمليات التموين": "A supply link supporting catering operations",
    "يركز فرع الرياض على دعم الجاهزية التشغيلية عبر التوريد، التنسيق، والمتابعة اللوجستية.": "The Riyadh branch focuses on operational readiness through supply, coordination, and logistics follow-up.",
    "مواد واحتياجات تشغيل": "Materials and Operating Needs",
    "تنسيق": "Coordination",
    "متابعة موردين": "Supplier Follow-up",
    "توصيل": "Delivery",
    "دعم حركة الإمداد": "Supply Movement Support",
    "خدمات الفرع": "Branch Services",
    "استيراد وتصدير وتنسيق لوجستي": "Import, export, and logistics coordination",
    "استيراد": "Import",
    "متابعة احتياجات المواد والتوريد.": "Following up on material and supply needs.",
    "تصدير": "Export",
    "تنظيم العمليات المرتبطة بحركة المنتجات.": "Organizing operations related to product movement.",
    "إمداد": "Supply",
    "دعم تجهيزات الفروع والمواقع.": "Supporting branch and site readiness.",
    "متابعة": "Follow-up",
    "تنسيق الموردين وجدولة الاحتياج.": "Coordinating suppliers and scheduling requirements.",
    "فرع الرياض يدعم سلاسل الإمداد والتوريد لخدمات نوهة.": "The Riyadh branch supports supply chains and procurement for Nooha services.",
    "لقطات من المطابخ المركزية، تجهيز الوجبات، التخزين، النقل، وخدمات الإعاشة.": "Scenes from central kitchens, meal preparation, storage, transport, and catering services.",
    "نوهة للإعاشة وخدمات التموين": "Nooha Catering and Food Services",
    "نظرة منظمة على خبراتنا التشغيلية، خدماتنا، مطابخنا المركزية، والقطاعات التي نخدمها يوميًا.": "An organized overview of our operating experience, services, central kitchens, and sectors we serve daily.",
    "نوهة للإعاشة | Catering Service": "Nooha Catering | Catering Service",
    "جاهز للعرض": "Ready to Present",
    "ملف تعريفي مختصر يشرح قدرات نوهة التشغيلية": "A concise profile explaining Nooha's operating capabilities",
    "يعرض هذا الملف نموذج عمل نوهة في خدمات التموين والإعاشة، من تشغيل المطابخ المركزية وإعداد الوجبات اليومية إلى إدارة الإمداد والتوصيل وخدمة مواقع العمل في مختلف القطاعات.": "This profile presents Nooha's operating model in catering services, from central kitchen operations and daily meal preparation to supply, delivery, and service for work sites across sectors.",
    "تم ترتيبه ليكون قريبًا من المرجع الذي أرسلته: زر واضح في الهيدر، صفحة تعريفية مباشرة، وإحصائيات مختصرة يمكن ربطها لاحقًا بملف PDF رسمي عند توفره.": "It is arranged to match the reference you shared: a clear header button, a direct profile page, and concise statistics that can later link to an official PDF when available.",
    "مطابخ مركزية": "Central Kitchens",
    "لا يوجد ملف PDF داخل المشروع حاليًا، لذلك تم تجهيز صفحة الملف التعريفي كرابط صحيح بدل رابط الشهادات السابق.": "There is no PDF file in the project currently, so the company profile page has been prepared as the correct destination instead of the previous certificates link.",
    "طلب نسخة الملف التعريفي": "Request a Copy of the Company Profile",
    "تشغيل ميداني منظم يناسب مواقع العمل والسكن والمشاريع طويلة المدى.": "Organized field operations suitable for work sites, housing, and long-term projects.",
    "إعداد يومي للوجبات من مطابخ مركزية مجهزة مع ضبط الجودة والتوصيل.": "Daily meal preparation from equipped central kitchens with quality control and delivery.",
    "حلول مساندة تشمل التشغيل، الضيافة، الإمداد، ومتابعة احتياج الموقع.": "Supporting solutions covering operations, hospitality, supply, and site needs follow-up.",
    "سجل الشركة": "Company Record",
    "أحدث الأخبار والإنجازات": "Latest News and Achievements",
    "مساحة داخل الملف التعريفي لتوثيق أي تحديث جديد، إنجاز سابق، اعتماد، توسع تشغيلي، أو خبر مهم بنفس طريقة السيرة الذاتية للشركة.": "A section within the profile for documenting any new update, past achievement, accreditation, operational expansion, or important news in the style of a company resume.",
    "أفضل شركات تموين الرياض للشركات والمؤسسات | نوهة 2026": "Best Catering Companies in Riyadh for Companies and Institutions | Nooha 2026",
    "المطبخ المركزي في المدينة المنورة | تجهيز يومي وخدمة تشغيلية موثوقة": "Madinah Central Kitchen | Daily Preparation and Reliable Operations",
    "خدمات الإعاشة في السعودية 2026 | حلول مخصصة من نوهة": "Catering Services in Saudi Arabia 2026 | Customized Solutions from Nooha",
    "خدمات الإعاشة والتموين 2026 | شراكة تصنع موثوقية مع العميل": "Catering and Food Supply Services 2026 | A Partnership Built on Reliability",
    "لماذا تختار نوهة كأفضل شركة إعاشة وتموين للمشروعات؟": "Why Choose Nooha as the Best Catering Company for Projects?",
    "كيف تدير نوهة التموين والإعاشة بنجاح؟ حلول للمشاريع الكبرى": "How Does Nooha Manage Catering Successfully? Solutions for Major Projects"
  },
  attrs: {
    "نوها للإعاشة": "Nooha Catering",
    "القائمة الرئيسية": "Main navigation",
    "واتساب": "WhatsApp",
    "إحصائيات نوهة": "Nooha statistics",
    "عملاء وشركاء": "Clients and partners",
    "فريق نوها داخل مطبخ احترافي": "Nooha team inside a professional kitchen",
    "فريق نوهة داخل مطبخ احترافي": "Nooha team inside a professional kitchen",
    "خدمات التموين": "Catering services",
    "مطابخ وتجهيزات نوهة": "Nooha kitchens and equipment",
    "مطبخ مركزي": "Central kitchen",
    "مطابخ مركزية أخرى": "Other central kitchens",
    "فروع نوهة": "Nooha branches",
    "فريق نوهة داخل مطبخ مركزي": "Nooha team inside a central kitchen",
    "غرفة تبريد وتخزين في المطبخ المركزي": "Cooling and storage room in the central kitchen",
    "شاحنة نوهة لخدمات التموين": "Nooha catering truck",
    "غرفة تخزين وتبريد داخل مطبخ مركزي": "Storage and cooling room inside a central kitchen",
    "فريق تشغيل داخل مطبخ مركزي": "Operations team inside a central kitchen",
    "شاحنة نوهة المجهزة لخدمات التموين والتوصيل": "Nooha truck equipped for catering and delivery",
    "تجهيز طلبات التموين في فرع مكة": "Preparing catering orders at the Makkah branch",
    "مطبخ نوهة المركزي": "Nooha central kitchen",
    "شاحنة نوهة لخدمات النقل والإمداد": "Nooha transport and supply truck",
    "تجهيزات نوهة التشغيلية": "Nooha operating equipment",
    "معرض صور نوهة": "Nooha photo gallery",
    "خط طهي داخل مطبخ مركزي": "Cooking line inside a central kitchen",
    "طهاة داخل مطبخ احترافي": "Chefs inside a professional kitchen",
    "تجهيز وجبات يومية للتوصيل": "Preparing daily meals for delivery",
    "وجبات معبأة في صواني": "Meals packed in trays",
    "فريق مطبخ يجهز الأطباق": "Kitchen team preparing dishes",
    "شاحنة توصيل مبردة لخدمات التموين": "Refrigerated delivery truck for catering services",
    "بوفيه تقديم متنوع": "Varied buffet service",
    "غرفة تخزين مبردة": "Chilled storage room",
    "تحضير أطباق داخل مطبخ تجاري": "Preparing dishes inside a commercial kitchen",
    "أرز مجهز في صواني مطبخ": "Rice prepared in kitchen trays",
    "تجهيزات مطبخ مركزي": "Central kitchen equipment",
    "خدمة بوفيه فندقي": "Hotel buffet service",
    "ثلاجات تخزين للمواد الغذائية": "Food storage refrigerators",
    "اختيارات طعام داخل صواني معدنية": "Food selections in metal trays",
    "بوفيه أطعمة متنوع": "Varied food buffet",
    "تجهيز وتعبئة في فرع الاستيراد والتصدير": "Preparation and packing at the import and export branch",
    "محطة بوفيه في قاعة طعام": "Buffet station in a dining hall",
    "فرع مكة وتجهيزات التموين": "Makkah branch and catering equipment",
    "شركة أمثال": "Amthal Company",
    "مجموعة العالمية": "Alalameya Group",
    "وزارة الحج - جمهورية إندونيسيا": "Ministry of Hajj - Republic of Indonesia",
    "أمجاد الفلاح": "Amjad Al Falah",
    "شركة إعلاء جدة التجارية": "Ielaa Jeddah Trading Company",
    "خط الطبخ الساخن في المطبخ المركزي": "Hot cooking line in the central kitchen",
    "تجهيز وتحضير طلبات التموين": "Preparing catering orders",
    "تجهيز وتحضير طلبات التموين قبل التسليم": "Preparing catering orders before delivery",
    "شاحنة نوهة للاستيراد والتصدير والتوصيل": "Nooha import, export, and delivery truck",
    "طاقم عمل نوهة أثناء تقديم الخدمات في أحد المشاريع الكبرى": "Nooha team delivering services at a major project",
    "الاسم": "Name",
    "رقم الجوال": "Mobile number",
    "البريد الإلكتروني": "Email",
    "اكتب احتياجك باختصار": "Briefly describe your request",
    "فريق عمل داخل مطبخ احترافي": "Team working inside a professional kitchen",
    "مثال: جدة": "Example: Jeddah",
    "اكتب خبرتك، المدينة المناسبة، وأقرب موعد للانضمام": "Write your experience, preferred city, and earliest joining date",
    "غلاف الملف التعريفي": "Company profile cover",
    "ملخص الملف التعريفي": "Company profile summary",
    "أفضل شركات تموين الرياض": "Best catering companies in Riyadh",
    "المطبخ المركزي في المدينة المنورة": "Madinah Central Kitchen",
    "خدمات الإعاشة في السعودية": "Catering services in Saudi Arabia",
    "خدمات الإعاشة والتموين": "Catering and food supply services",
    "أفضل شركة إعاشة": "Best catering company",
    "إدارة التموين والإعاشة": "Catering management",
    "تصفح أخبار الملف التعريفي": "Browse company profile news",
    "التالي": "Next",
    "طاه يعمل داخل مطبخ احترافي": "Chef working inside a professional kitchen",
    "طاه محترف في المطبخ": "Professional chef in the kitchen",
    "طهي وجبات في مطبخ احترافي": "Cooking meals in a professional kitchen",
    "ترتيب موائد ضيافة": "Arranging hospitality tables",
    "الملف التعريفي لشركة نوهة للإعاشة وخدمات التموين والمطابخ المركزية.": "Company profile for Nooha Catering, food services, and central kitchens."
  },
  titles: {
    "projects.html": ["نوهة للإعاشة | الصور", "Nooha Catering | Gallery"],
    "Gallery.html": ["نوهة للإعاشة | المعرض", "Nooha Catering | Gallery"],
    "central-kitchen-riyadh.html": ["نوهة للإعاشة | المطبخ المركزي في الرياض", "Nooha Catering | Riyadh Central Kitchen"],
    "central-kitchen-tabuk-duba.html": ["نوهة للإعاشة | المطبخ المركزي في تبوك ضباء", "Nooha Catering | Tabuk Duba Central Kitchen"]
  }
};

Object.assign(translations.text, supplementalTranslations.text);
Object.assign(translations.attrs, supplementalTranslations.attrs);
Object.assign(translations.titles, supplementalTranslations.titles);

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
  document.querySelectorAll("[aria-label], [alt], [placeholder], [title], meta[name='description']").forEach((element) => {
    ["aria-label", "alt", "placeholder", "title", "content"].forEach((attr) => {
      const value = element.getAttribute(attr);
      if (value && dictionary[value]) {
        element.setAttribute(attr, dictionary[value]);
      }
    });
  });
}

function updateLanguageSwitch(language) {
  document.querySelectorAll("[data-language-switch]").forEach((switcher) => {
    const options = switcher.querySelectorAll("span:not(.nav-caret)");

    if (!options.length) {
      const textNode = Array.from(switcher.childNodes).find((node) => node.nodeType === Node.TEXT_NODE);
      const label = language === "ar" ? "English" : "العربية";

      if (textNode) {
        textNode.nodeValue = label;
      } else {
        switcher.prepend(document.createTextNode(label));
      }

      return;
    }

    options.forEach((option) => {
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

const mobileReferenceNavQuery = window.matchMedia("(max-width: 960px)");
const hoverReferenceNavQuery = window.matchMedia("(hover: hover) and (pointer: fine)");

function setNavOpen(isOpen) {
  nav?.classList.toggle("is-open", isOpen);
  navToggle?.setAttribute("aria-expanded", String(isOpen));
  document.body.classList.toggle("is-nav-open", Boolean(nav && isOpen));

  if (!isOpen) {
    closeReferenceMenus();
  }
}

function isMobileReferenceTrigger(trigger) {
  const item = trigger.closest(".reference-nav-item");
  const panel = item?.querySelector(".reference-mega, .reference-simple-menu");
  const firstControl = item ? Array.from(item.children).find((child) => child.matches("a, button")) : null;
  return Boolean(mobileReferenceNavQuery.matches && panel && firstControl === trigger);
}

navToggle?.setAttribute("aria-expanded", "false");

navToggle?.addEventListener("click", () => {
  setNavOpen(!nav?.classList.contains("is-open"));
});

document.querySelectorAll(".reference-language").forEach((switcher) => {
  switcher.setAttribute("data-language-switch", "");
  switcher.closest(".reference-nav-item")?.classList.add("language-item");
});

document.querySelectorAll(".main-nav a").forEach((link) => {
  link.addEventListener("click", () => {
    if (isMobileReferenceTrigger(link)) return;
    setNavOpen(false);
  });
});

const referenceMenuItems = document.querySelectorAll(".reference-nav-item.has-mega, .reference-nav-item.has-simple:not(.language-item)");
let referenceMenuTimer;

function getReferenceTrigger(item) {
  return Array.from(item.children).find((child) => child.matches("a, button"));
}

function setReferenceMenuOpen(item, isOpen) {
  item.classList.toggle("is-menu-open", isOpen);
  getReferenceTrigger(item)?.setAttribute("aria-expanded", String(isOpen));
}

function closeReferenceMenus(exceptItem = null) {
  referenceMenuItems.forEach((item) => {
    if (item !== exceptItem) {
      setReferenceMenuOpen(item, false);
    }
  });
}

function openReferenceMenu(item) {
  clearTimeout(referenceMenuTimer);
  closeReferenceMenus(item);
  setReferenceMenuOpen(item, true);
}

function scheduleReferenceMenuClose(item) {
  clearTimeout(referenceMenuTimer);
  referenceMenuTimer = setTimeout(() => {
    setReferenceMenuOpen(item, false);
  }, 700);
}

referenceMenuItems.forEach((item) => {
  const trigger = getReferenceTrigger(item);
  const panel = item.querySelector(".reference-mega, .reference-simple-menu");

  if (!trigger || !panel) return;

  if (!trigger.querySelector(".nav-caret")) {
    const caret = document.createElement("span");
    caret.className = "nav-caret";
    caret.setAttribute("aria-hidden", "true");
    trigger.append(caret);
  }

  trigger.setAttribute("aria-expanded", "false");

  trigger.addEventListener("click", (event) => {
    if (!mobileReferenceNavQuery.matches) return;

    event.preventDefault();
    event.stopImmediatePropagation();
    const shouldOpen = !item.classList.contains("is-menu-open");
    closeReferenceMenus(shouldOpen ? item : null);
    setReferenceMenuOpen(item, shouldOpen);
  });

  item.addEventListener("mouseenter", () => {
    if (mobileReferenceNavQuery.matches && !hoverReferenceNavQuery.matches) return;
    openReferenceMenu(item);
  });

  item.addEventListener("mouseleave", () => {
    if (mobileReferenceNavQuery.matches && !hoverReferenceNavQuery.matches) return;
    scheduleReferenceMenuClose(item);
  });

  item.addEventListener("focusin", () => {
    if (mobileReferenceNavQuery.matches && !hoverReferenceNavQuery.matches) return;
    openReferenceMenu(item);
  });

  item.addEventListener("focusout", () => {
    if (mobileReferenceNavQuery.matches && !hoverReferenceNavQuery.matches) return;
    setTimeout(() => {
      if (!item.contains(document.activeElement)) {
        scheduleReferenceMenuClose(item);
      }
    }, 0);
  });
});

document.querySelectorAll(".reference-nav-item:not(.has-mega):not(.has-simple), .reference-nav-item.language-item").forEach((item) => {
  item.addEventListener("mouseenter", () => {
    if (mobileReferenceNavQuery.matches && !hoverReferenceNavQuery.matches) return;
    closeReferenceMenus();
  });
  item.addEventListener("focusin", () => closeReferenceMenus());
});

document.addEventListener("click", (event) => {
  if (!event.target.closest(".reference-nav")) {
    closeReferenceMenus();
  }

  if (nav?.classList.contains("is-open") && !event.target.closest(".reference-header")) {
    setNavOpen(false);
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    setNavOpen(false);
  }
});

document.querySelectorAll("[data-language-switch]").forEach((switcher) => {
  switcher.addEventListener("click", (event) => {
    event.preventDefault();
    const currentLanguage = document.documentElement.lang === "en" ? "en" : "ar";
    setLanguageChoice(currentLanguage === "ar" ? "en" : "ar");
    setNavOpen(false);
  });
});

document.querySelectorAll(".language-menu button").forEach((button) => {
  button.addEventListener("click", () => {
    const language = button.textContent.trim().toLowerCase() === "english" ? "en" : "ar";
    setLanguageChoice(language);
    setNavOpen(false);
  });
});

function handleReferenceNavViewportChange(event) {
  if (!event.matches) {
    setNavOpen(false);
  }
}

if (typeof mobileReferenceNavQuery.addEventListener === "function") {
  mobileReferenceNavQuery.addEventListener("change", handleReferenceNavViewportChange);
} else if (typeof mobileReferenceNavQuery.addListener === "function") {
  mobileReferenceNavQuery.addListener(handleReferenceNavViewportChange);
}

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

const whatsappNumber = "966570000171";

const formFieldLabels = {
  ar: {
    name: "الاسم",
    phone: "رقم الجوال",
    email: "البريد الإلكتروني",
    service: "نوع الخدمة",
    city: "المدينة",
    department: "المجال الوظيفي",
    experience: "سنوات الخبرة",
    message: "التفاصيل"
  },
  en: {
    name: "Name",
    phone: "Mobile number",
    email: "Email",
    service: "Service type",
    city: "City",
    department: "Job field",
    experience: "Years of experience",
    message: "Details"
  }
};

function getFormTitle(form, language) {
  const isCareerForm = form.querySelector("[name='department'], [name='experience']");
  const isQuoteForm = form.classList.contains("home-quote-form");

  if (language === "en") {
    if (isCareerForm) return "New job application";
    if (isQuoteForm) return "New quotation request";
    return "New contact request";
  }

  if (isCareerForm) return "طلب توظيف جديد";
  if (isQuoteForm) return "طلب عرض سعر جديد";
  return "طلب تواصل جديد";
}

function buildWhatsAppMessage(form, language) {
  const labels = formFieldLabels[language];
  const formData = new FormData(form);
  const lines = [getFormTitle(form, language), ""];

  Object.keys(labels).forEach((key) => {
    const value = String(formData.get(key) || "").trim();
    if (value) {
      lines.push(`${labels[key]}: ${value}`);
    }
  });

  return lines.join("\n");
}

document.querySelectorAll(".contact-form").forEach((form) => {
  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const language = document.documentElement.lang === "en" ? "en" : "ar";
    const button = form.querySelector("button[type='submit']");
    const originalText = button?.textContent;
    const message = buildWhatsAppMessage(form, language);
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;

    if (button) {
      button.textContent = language === "en" ? "Opening WhatsApp..." : "جاري فتح واتساب...";
    }

    window.location.href = whatsappUrl;

    setTimeout(() => {
      if (button && originalText) {
        button.textContent = originalText;
      }
    }, 1800);
  });
});
