import React, { createContext, useContext, useState, useEffect } from 'react';

export const translations = {
    fr: {
        title: "🚨 ALERTO",
        subtitle: "Système de réponse rapide",
        take_photo: "Prendre une photo",
        description_label: "Description du sinistre",
        description_placeholder: "Décrivez les dégâts...",
        damage_label: "Niveau de dégâts",
        infrastructure_label: "Type d'infrastructure",
        crisis_label: "Nature de la crise",
        location_label: "Localisation exacte",
        submit_btn: "ENVOYER",
        gps_active: "GPS Actif",
        gps_searching: "Recherche GPS...",
        online_success: "✅ Rapport envoyé en ligne !",
        offline_success: "📡 Hors-ligne : Rapport sauvegardé localement.",
        select_placeholder: "Sélectionner...",
        electricity: "État de l'électricité",
        health: "Services de Santé",
        needs: "Besoins les plus urgents",
        options: {
            damage: { minime: "MINIME", partiel: "PARTIEL", complet: "COMPLET" },
            infra: ["Résidentiel", "Commercial", "Gouvernemental", "Services publics", "Transport", "Communautaire", "Espaces publics", "Autre"],
            crisis: ["Tremblement de terre", "Inondation", "Ouragan", "Tsunami", "Feu de forêt", "Conflit", "Explosion"],
            elec: { 
                aucun: "Aucun dommage observé",
                mineur: "Dommages mineurs (interruptions rapidement réparables)",
                modere: "Dommages modérés (pannes partielles)",
                important: "Dommages importants (pannes prolongées)",
                detruit: "Complètement détruit",
                inconnu: "Inconnu/ne peut être évalué"
            },
            health: { 
                fonctionnel: "Entièrement fonctionnel",
                partiel: "Partiellement fonctionnel",
                perturbe: "Fortement perturbé",
                HS: "Ne fonctionne pas du tout",
                inconnu: "Inconnu"
            },
            urgent_needs: {
                food: "Aide alimentaire et eau potable",
                financial: "Aide financière ou en espèces",
                health: "Accès aux soins de santé et aux médicaments essentiels",
                shelter: "Abri, réparation de logement ou hébergement temporaire",
                livelihood: "Rétablissement des moyens de subsistance ou des sources de revenus",
                wash: "Eau, assainissement et hygiène (toilettes, installations sanitaires)",
                services: "Rétablissement des services et infrastructures de base",
                psycho: "Services de protection et soutien psychosocial",
                authorities: "Soutien des autorités locales et des organisations communautaires",
                other: "Autre, veuillez préciser"
            }
        }
    },
    en: {
        title: "🚨 ALERTO",
        subtitle: "Rapid Response System",
        take_photo: "Take a photo",
        description_label: "Damage Description",
        description_placeholder: "Describe the damage...",
        damage_label: "Damage Level",
        infrastructure_label: "Infrastructure Type",
        crisis_label: "Nature of Crisis",
        location_label: "Exact Location",
        submit_btn: "SEND",
        gps_active: "GPS Active",
        gps_searching: "Searching GPS...",
        online_success: "✅ Report sent online!",
        offline_success: "📡 Offline: Report saved locally.",
        select_placeholder: "Select...",
        electricity: "Electricity Status",
        health: "Health Services",
        needs: "Most urgent needs",
        options: {
            damage: { minime: "MINIMAL", partiel: "PARTIAL", complet: "COMPLETE" },
            infra: ["Residential", "Commercial", "Governmental", "Public Services", "Transport", "Community", "Public Spaces", "Other"],
            crisis: ["Earthquake", "Flood", "Hurricane", "Tsunami", "Wildfire", "Conflict", "Explosion"],
            elec: { 
                aucun: "No damage observed",
                mineur: "Minor damage (service interruptions but quickly repairable)",
                modere: "Moderate damage (partial outages requiring repairs)",
                important: "Major damage (major infrastructure damaged, prolonged outages)",
                detruit: "Completely destroyed",
                inconnu: "Unknown/cannot evaluate"
            },
            health: { 
                fonctionnel: "Fully functional",
                partiel: "Partially functional",
                perturbe: "Strongly disrupted",
                HS: "Not functioning at all",
                inconnu: "Unknown"
            },
            urgent_needs: {
                food: "Food and water assistance",
                financial: "Financial or cash assistance",
                health: "Access to healthcare and essential medicines",
                shelter: "Shelter, housing repairs or temporary accommodation",
                livelihood: "Restoring livelihoods or sources of income",
                wash: "Water, sanitation and hygiene (toilets, sanitary facilities)",
                services: "Restoration of basic services and infrastructure",
                psycho: "Protection services and psychosocial support",
                authorities: "Support from local authorities and community organizations",
                other: "Other, please specify"
            }
        }
    },
    es: {
        title: "🚨 ALERTO",
        subtitle: "Sistema de respuesta rápida",
        take_photo: "Tomar una foto",
        description_label: "Descripción del daño",
        description_placeholder: "Describa el daño...",
        damage_label: "Nivel de daño",
        infrastructure_label: "Tipo de infraestructura",
        crisis_label: "Naturaleza de la crisis",
        location_label: "Ubicación exacta",
        submit_btn: "ENVIAR",
        gps_active: "GPS Activo",
        gps_searching: "Buscando GPS...",
        online_success: "✅ ¡Informe enviado en línea!",
        offline_success: "📡 Desconectado: Informe guardado localmente.",
        select_placeholder: "Seleccionar...",
        electricity: "Estado de electricidad",
        health: "Servicios de salud",
        needs: "Necesidades urgentes",
        options: {
            damage: { minime: "MÍNIMO", partiel: "PARCIAL", complet: "COMPLETO" },
            infra: ["Residencial", "Comercial", "Gubernamental", "Servicios públicos", "Transporte", "Comunitario", "Espacios públicos", "Otro"],
            crisis: ["Terremoto", "Inundación", "Huracán", "Tsunami", "Incendio forestal", "Conflicto", "Explosión"],
            elec: { 
                aucun: "Ningún daño observado",
                mineur: "Daño menor (interrupciones reparables rápidamente)",
                modere: "Daño moderado (cortes parciales)",
                important: "Daño importante (infraestructura dañada)",
                detruit: "Completamente destruido",
                inconnu: "Desconocido/no puede evaluarse"
            },
            health: { 
                fonctionnel: "Completamente funcional",
                partiel: "Parcialmente funcional",
                perturbe: "Fuertemente perturbado",
                HS: "No funciona en absoluto",
                inconnu: "Desconocido"
            },
            urgent_needs: {
                food: "Asistencia alimentaria y agua potable",
                financial: "Asistencia financiera o en efectivo",
                health: "Acceso a atención médica y medicamentos esenciales",
                shelter: "Alojamiento, reparación de vivienda o alojamiento temporal",
                livelihood: "Restablecimiento de medios de vida o fuentes de ingresos",
                wash: "Agua, saneamiento e higiene (sanitarios, instalaciones)",
                services: "Restablecimiento de servicios e infraestructuras básicas",
                psycho: "Servicios de protección y apoyo psicosocial",
                authorities: "Apoyo de autoridades locales y organizaciones comunitarias",
                other: "Otro, por favor especifique"
            }
        }
    },
    ar: {
        title: "🚨 ALERTO",
        subtitle: "نظام الاستجابة السريعة",
        take_photo: "التقط صورة",
        description_label: "وصف الضرر",
        description_placeholder: "صِف الضرر...",
        damage_label: "مستوى الضرر",
        infrastructure_label: "نوع البنية التحتية",
        crisis_label: "طبيعة الأزمة",
        location_label: "الموقع الدقيق",
        submit_btn: "إرسال",
        gps_active: "نظام تحديد المواقع نشط",
        gps_searching: "البحث عن نظام تحديد المواقع...",
        online_success: "✅ تم إرسال التقرير عبر الإنترنت!",
        offline_success: "📡 غير متصل: تم حفظ التقرير محليًا.",
        select_placeholder: "اختر...",
        electricity: "حالة الكهرباء",
        health: "الخدمات الصحية",
        needs: "الاحتياجات الأكثر إلحاحا",
        options: {
            damage: { minime: "أدنى", partiel: "جزئي", complet: "كامل" },
            infra: ["سكني", "تجاري", "حكومي", "خدمات عامة", "النقل", "مجتمعي", "أماكن عامة", "آخر"],
            crisis: ["زلزال", "فيضان", "إعصار", "تسونامي", "حريق غابات", "صراع", "انفجار"],
            elec: { 
                aucun: "لا أضرار ملاحظة",
                mineur: "أضرار طفيفة (انقطاعات يمكن إصلاحها بسرعة)",
                modere: "أضرار معتدلة (انقطاعات جزئية)",
                important: "أضرار كبيرة (بنية تحتية مدمرة)",
                detruit: "مدمر تماماً",
                inconnu: "غير معروف/لا يمكن تقييمه"
            },
            health: { 
                fonctionnel: "يعمل بكامل الطاقة",
                partiel: "يعمل بشكل جزئي",
                perturbe: "مضطرب بشدة",
                HS: "لا يعمل على الإطلاق",
                inconnu: "غير معروف"
            },
            urgent_needs: {
                food: "المساعدات الغذائية والمياه النظيفة",
                financial: "المساعدات المالية أو النقدية",
                health: "الوصول إلى الرعاية الصحية والأدوية الأساسية",
                shelter: "المأوى أو إصلاح المنزل أو الإقامة المؤقتة",
                livelihood: "استعادة سبل العيش أو مصادر الدخل",
                wash: "المياه والصرف الصحي والنظافة",
                services: "استعادة الخدمات والبنية التحتية الأساسية",
                psycho: "خدمات الحماية والدعم النفسي",
                authorities: "دعم السلطات المحلية والمنظمات المجتمعية",
                other: "آخر، يرجى التحديد"
            }
        }
    },
    zh: {
        title: "🚨 ALERTO",
        subtitle: "快速反应系统",
        take_photo: "拍照",
        description_label: "损害描述",
        description_placeholder: "描述损害情况...",
        damage_label: "损害程度",
        infrastructure_label: "基础设施类型",
        crisis_label: "危机性质",
        location_label: "准确位置",
        submit_btn: "发送",
        gps_active: "GPS 已激活",
        gps_searching: "正在搜索 GPS...",
        online_success: "✅ 报告已在线发送！",
        offline_success: "📡 离线：报告已在本地保存。",
        select_placeholder: "选择...",
        electricity: "电力状况",
        health: "医疗服务",
        needs: "最紧急需求",
        options: {
            damage: { minime: "最小", partiel: "部分", complet: "完全" },
            infra: ["住宅", "商业", "政府", "公共服务", "交通", "社区", "公共空间", "其他"],
            crisis: ["地震", "洪水", "飓风", "海啸", "森林火灾", "冲突", "爆炸"],
            elec: { 
                aucun: "未观察到损害",
                mineur: "轻微损害(可快速修复)",
                modere: "中等损害(部分停电)",
                important: "重大损害(主要基础设施受损)",
                detruit: "完全毁坏",
                inconnu: "未知/无法评估"
            },
            health: { 
                fonctionnel: "完全正常",
                partiel: "部分正常",
                perturbe: "严重中断",
                HS: "完全停止",
                inconnu: "未知"
            },
            urgent_needs: {
                food: "食物和饮用水援助",
                financial: "财务或现金援助",
                health: "获得医疗保健和基本药物",
                shelter: "避难所、住房维修或临时住所",
                livelihood: "恢复生计或收入来源",
                wash: "水、卫生设施和卫生(厕所等)",
                services: "恢复基本服务和基础设施",
                psycho: "保护服务和心理社会支持",
                authorities: "地方当局和社区组织的支持",
                other: "其他，请说明"
            }
        }
    },
    ru: {
        title: "🚨 ALERTO",
        subtitle: "Система быстрого реагирования",
        take_photo: "Сделать фото",
        description_label: "Описание повреждений",
        description_placeholder: "Опишите повреждения...",
        damage_label: "Уровень повреждений",
        infrastructure_label: "Тип инфраструктуры",
        crisis_label: "Характер кризиса",
        location_label: "Точное местоположение",
        submit_btn: "ОТПРАВИТЬ",
        gps_active: "GPS Активен",
        gps_searching: "Поиск GPS...",
        online_success: "✅ Отчет отправлен онлайн!",
        offline_success: "📡 Оффлайн: Отчет сохранен локально.",
        select_placeholder: "Выбрать...",
        electricity: "Статус электроснабжения",
        health: "Медицинские услуги",
        needs: "Самые насущные потребности",
        options: {
            damage: { minime: "МИНИМАЛЬНЫЙ", partiel: "ЧАСТИЧНЫЙ", complet: "ПОЛНЫЙ" },
            infra: ["Жилой", "Коммерческий", "Государственный", "Госуслуги", "Транспорт", "Общественный", "Публичные места", "Другое"],
            crisis: ["Землетрясение", "Наводнение", "Ураган", "Цунами", "Лесной пожар", "Конфликт", "Взрыв"],
            elec: { 
                aucun: "Нет наблюдаемого ущерба",
                mineur: "Незначительный ущерб (быстро поправимые перебои)",
                modere: "Умеренный ущерб (частичные отключения)",
                important: "Серьезный ущерб (поврежденная инфраструктура)",
                detruit: "Полностью разрушено",
                inconnu: "Неизвестно/невозможно оценить"
            },
            health: { 
                fonctionnel: "Полностью работает",
                partiel: "Частично работает",
                perturbe: "Сильно нарушено",
                HS: "Не работает вообще",
                inconnu: "Неизвестно"
            },
            urgent_needs: {
                food: "Продовольственная и питьевая вода помощь",
                financial: "Финансовая или денежная помощь",
                health: "Доступ к медицинской помощи и основным лекарствам",
                shelter: "Жилье, ремонт дома или временное жилье",
                livelihood: "Восстановление средств к существованию",
                wash: "Вода, санитария и гигиена",
                services: "Восстановление базовых услуг и инфраструктуры",
                psycho: "Услуги защиты и психосоциальная поддержка",
                authorities: "Поддержка местных органов власти и общественных организаций",
                other: "Другое, пожалуйста укажите"
            }
        }
    }
};

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
    const [lang, setLang] = useState(localStorage.getItem('alerto_lang') || 'fr');

    useEffect(() => {
        localStorage.setItem('alerto_lang', lang);
    }, [lang]);

    const t = translations[lang] || translations['fr'];

    // On utilise React.createElement pour eviter le JSX dans un fichier .js
    return React.createElement(LanguageContext.Provider, { value: { t, lang, setLang } }, children);
};

export const useTranslation = () => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error("useTranslation must be used within a LanguageProvider");
    }
    return context;
};
