import React, { createContext, useContext, useState, useEffect } from 'react';

export const translations = {
    fr: {
        title: "ALERTO",
        subtitle: "Système de réponse rapide",
        take_photo: "Prendre une photo",
        description_label: "Description du sinistre",
        description_placeholder: "Décrivez les dégâts...",
        damage_label: "Niveau de dégâts",
        infrastructure_label: "Type d'infrastructure",
        infrastructure_name_label: "Nom de l'infrastructure",
        crisis_label: "Nature de la crise",
        debris_label: "Y a-t-il des débris à enlever sur le site ?",
        location_label: "Localisation exacte",
        submit_btn: "ENVOYER LE RAPPORT",
        gps_active: "GPS Actif",
        gps_searching: "Recherche GPS...",
        online_success: "Rapport envoyé en ligne !",
        offline_success: "Mode Hors-ligne : Rapport sauvegardé localement.",
        select_placeholder: "Sélectionner...",
        electricity: "État de l'électricité",
        health: "Services de Santé",
        needs: "Besoins les plus urgents",
        dashboard: {
            title: "Plateforme ALERTO PNUD",
            subtitle: "Surveillance tactique et évaluation des dommages",
            stat_total: "RAPPORTS TOTAUX",
            stat_critical: "DÉGÂTS COMPLETS",
            stat_reliability: "FIABILITÉ IA",
            stat_flagged: "SIGNALÉS",
            chart_sectors: "Secteurs Impactés",
            feed_tactical: "Flux Tactique",
            feed_security: "Revue de Sécurité",
            tab_all: "Tous",
            tab_flagged: "Signalés",
            btn_csv: "CSV",
            btn_geojson: "GeoJSON",
            btn_logout: "Déconnexion",
            btn_approve: "Marquer comme sûr",
            loading: "Analyse des flux tactiques..."
        },
        options: {
            damage: { minime: "MINIME", partiel: "PARTIEL", complet: "COMPLET" },
            infra: [
                "Infrastructures résidentielles (maisons, appartements)",
                "Infrastructures commerciales (marchés, centres commerciaux, magasins, hôtels, banques, etc.)",
                "Bâtiments gouvernementaux (administrations, commissariats, casernes, etc.)",
                "Infrastructures de services publics (pompes à eau, centrales électriques, etc.)",
                "Infrastructures de transport et de communication (routes, ponts, gares, antennes, etc.)",
                "Infrastructures communautaires (écoles, hôpitaux, salles communautaires, etc.)",
                "Espaces publics / Loisirs (stades, terrains de jeux, édifices religieux, etc.)",
                "Autre"
            ],
            crisis: [
                "--- Risques Naturels ---", "Tremblement de terre", "Inondation", "Tsunami", "Ouragan / Cyclone", "Feu de forêt",
                "--- Risques Technologiques ---", "Explosion", "Incident chimique",
                "--- Crises d'origine humaine ---", "Conflit", "Troubles civils"
            ],
            debris: { yes: "Oui, débris présents", no: "Non, pas de débris" },
            elec: {
                aucun: "Aucun dommage observé", mineur: "Dommages mineurs", modere: "Dommages modérés",
                important: "Dommages importants", detruit: "Complètement détruit", inconnu: "Inconnu"
            },
            health: {
                fonctionnel: "Entièrement fonctionnel", partiel: "Partiellement fonctionnel",
                perturbe: "Fortement perturbé", HS: "Ne fonctionne pas", inconnu: "Inconnu"
            },
            urgent_needs: {
                food: "Aide alimentaire et eau potable", financial: "Aide financière ou en espèces",
                health: "Accès aux soins de santé", shelter: "Abri ou réparation",
                livelihood: "Moyens de subsistance", wash: "Eau, assainissement et hygiène",
                services: "Services de base", psycho: "Soutien psychosocial",
                authorities: "Soutien des autorités", other: "Autre"
            }
        }
    },
    en: {
        title: "ALERTO",
        subtitle: "Rapid Response System",
        take_photo: "Take a photo",
        description_label: "Damage Description",
        description_placeholder: "Describe the damage...",
        damage_label: "Damage Level",
        infrastructure_label: "Infrastructure Type",
        infrastructure_name_label: "Infrastructure Name",
        crisis_label: "Nature of Crisis",
        debris_label: "Is there debris to be removed?",
        location_label: "Exact Location",
        submit_btn: "SUBMIT REPORT",
        gps_active: "GPS Active",
        gps_searching: "Searching GPS...",
        online_success: "Report sent online!",
        offline_success: "Offline: Report saved locally.",
        select_placeholder: "Select...",
        electricity: "Electricity Status",
        health: "Health Services",
        needs: "Most urgent needs",
        dashboard: {
            title: "ALERTO UNDP Platform",
            subtitle: "Tactical monitoring and damage assessment",
            stat_total: "TOTAL REPORTS",
            stat_critical: "COMPLETE DAMAGE",
            stat_reliability: "AI RELIABILITY",
            stat_flagged: "FLAGGED",
            chart_sectors: "Impacted Sectors",
            feed_tactical: "Tactical Feed",
            feed_security: "Security Review",
            tab_all: "All",
            tab_flagged: "Flagged",
            btn_csv: "CSV",
            btn_geojson: "GeoJSON",
            btn_logout: "Logout",
            btn_approve: "Mark as Safe",
            loading: "Analyzing tactical feeds..."
        },
        options: {
            damage: { minime: "MINIMAL", partiel: "PARTIAL", complet: "COMPLETE" },
            infra: [
                "Residential infrastructures", "Commercial infrastructures", "Government buildings",
                "Public utility infrastructures", "Transport and communication", "Community infrastructures",
                "Public spaces / Leisure", "Other"
            ],
            crisis: [
                "-- Natural Hazards", "Earthquake", "Flood", "Tsunami", "Hurricane / Cyclone", "Wildfire",
                "-- Technological Hazards", "Explosion", "Chemical Incident",
                "-- Human Crises", "Conflict", "Civil Unrest"
            ],
            debris: { yes: "Yes, debris present", no: "No debris" },
            elec: {
                aucun: "No damage", mineur: "Minor damage", modere: "Moderate damage",
                important: "Major damage", detruit: "Completely destroyed", inconnu: "Unknown"
            },
            health: {
                fonctionnel: "Fully functional", partiel: "Partially functional",
                perturbe: "Strongly disrupted", HS: "Not functioning", inconnu: "Unknown"
            },
            urgent_needs: {
                food: "Food and water", financial: "Financial assistance", health: "Healthcare access",
                shelter: "Shelter/Repair", livelihood: "Livelihoods", wash: "Water/Sanitation",
                services: "Basic services", psycho: "Psychosocial support",
                authorities: "Authority support", other: "Other"
            }
        }
    },
    es: {
        title: "ALERTO",
        subtitle: "Sistema de respuesta rápida",
        take_photo: "Tomar foto",
        description_label: "Descripción del daño",
        description_placeholder: "Describa el daño...",
        damage_label: "Nivel de daño",
        infrastructure_label: "Tipo de infraestructura",
        infrastructure_name_label: "Nombre de la infraestructura",
        crisis_label: "Naturaleza de la crisis",
        debris_label: "¿Hay escombros para remover?",
        location_label: "Ubicación exacta",
        submit_btn: "ENVIAR INFORME",
        gps_active: "GPS Activo",
        gps_searching: "Buscando GPS...",
        online_success: "¡Informe enviado!",
        offline_success: "Informe guardado localmente.",
        select_placeholder: "Seleccionar...",
        electricity: "Estado eléctrico",
        health: "Servicios de salud",
        needs: "Necesidades urgentes",
        dashboard: {
            title: "Plataforma ALERTO PNUD",
            subtitle: "Monitoreo táctico y evaluación de daños",
            stat_total: "INFORMES TOTALES",
            stat_critical: "DAÑO COMPLETO",
            stat_reliability: "FIABILIDAD IA",
            stat_flagged: "MARCADOS",
            chart_sectors: "Sectores Impactados",
            feed_tactical: "Flujo Táctico",
            feed_security: "Revisión de Seguridad",
            tab_all: "Todos",
            tab_flagged: "Marcados",
            btn_csv: "CSV",
            btn_geojson: "GeoJSON",
            btn_logout: "Cerrar Sesión",
            btn_approve: "Marcar como Seguro",
            loading: "Analizando flujos tácticos..."
        },
        options: {
            damage: { minime: "MÍNIMO", partiel: "PARCIAL", complet: "COMPLETO" },
            infra: ["Residencial", "Comercial", "Gubernamental", "Servicios públicos", "Transporte", "Comunitario", "Espacios públicos", "Otro"],
            crisis: [
                "--- Riesgos Naturales ---", "Terremoto", "Inundación", "Tsunami", "Huracán / Ciclón", "Incendio",
                "--- Riesgos Tecnológicos ---", "Explosión", "Incidente químico",
                "--- Crisis Humanas ---", "Conflicto", "Disturbios"
            ],
            elec: {
                aucun: "Sin daños", mineur: "Daños menores", modere: "Daños moderados",
                important: "Daños importantes", detruit: "Destruido", inconnu: "Desconocido"
            },
            health: {
                fonctionnel: "Funcional", partiel: "Parcialmente funcional",
                perturbe: "Perturbado", HS: "No funciona", inconnu: "Desconocido"
            },
            urgent_needs: {
                food: "Alimentos y agua", financial: "Ayuda financiera", health: "Salud",
                shelter: "Refugio", livelihood: "Medios de vida", wash: "Agua y saneamiento",
                services: "Servicios básicos", psycho: "Apoyo psicosocial",
                authorities: "Autoridades", other: "Otro"
            }
        }
    },
    ar: {
        title: "ALERTO",
        subtitle: "نظام الاستجابة السريعة",
        take_photo: "التقط صورة",
        description_label: "وصف الأضرار",
        description_placeholder: "صِف الأضرار...",
        damage_label: "مستوى الضرر",
        infrastructure_label: "نوع البنية التحتية",
        infrastructure_name_label: "اسم المنشأة",
        crisis_label: "طبيعة الأزمة",
        debris_label: "هل توجد حطام؟",
        location_label: "الموقع الدقيق",
        submit_btn: "إرسال التقرير",
        gps_active: "GPS نشط",
        gps_searching: "البحث عن GPS...",
        online_success: "تم الإرسال بنجاح!",
        offline_success: "تم الحفظ محلياً.",
        select_placeholder: "اختر...",
        electricity: "حالة الكهرباء",
        health: "الخدمات الصحية",
        needs: "الاحتياجات العاجلة",
        dashboard: {
            title: "منصة ALERTO لبرنامج الأمم المتحدة الإنمائي",
            subtitle: "الرصد التكتيكي وتقييم الأضرار",
            stat_total: "إجمالي التقارير",
            stat_critical: "أضرار كاملة",
            stat_reliability: "موثوقية الذكاء الاصطناعي",
            stat_flagged: "تم الإبلاغ عنها",
            chart_sectors: "القطاعات المتأثرة",
            feed_tactical: "التغذية التكتيكية",
            feed_security: "المراجعة الأمنية",
            tab_all: "الكل",
            tab_flagged: "المبلغ عنها",
            btn_csv: "CSV",
            btn_geojson: "GeoJSON",
            btn_logout: "تسجيل الخروج",
            btn_approve: "وضع علامة كآمن",
            loading: "تحليل التغذية التكتيكية..."
        },
        options: {
            damage: { minime: "أدنى", partiel: "جزئي", complet: "كامل" },
            infra: ["سكني", "تجاري", "حكومي", "خدمات عامة", "النقل", "مجتمعي", "أماكن عامة", "آخر"],
            crisis: ["زلزال", "فيضان", "تسونامي", "إعصار", "حريق غابات", "انفجار", "حادث كيميائي", "صراع", "اضطرابات"],
            elec: { aucun: "لا توجد أضرار", mineur: "أضرار طفيفة", modere: "أضرار متوسطة", important: "أضرار جسيمة", detruit: "مدمر تماما", inconnu: "غير معروف" },
            health: { fonctionnel: "يعمل", partiel: "يعمل جزئيا", perturbe: "معطل بشدة", HS: "خارج الخدمة", inconnu: "غير معروف" },
            urgent_needs: { food: "طعام وماء", financial: "مساعدات مالية", health: "رعاية صحية", shelter: "مأوى", livelihood: "سبل عيش", wash: "صرف صحي", services: "خدمات أساسية", psycho: "دعم نفسي", authorities: "دعم السلطات", other: "آخر" }
        }
    },
    zh: {
        title: "ALERTO",
        subtitle: "快速反应系统",
        take_photo: "拍照",
        description_label: "损害描述",
        description_placeholder: "请描述损害情况...",
        damage_label: "损害程度",
        infrastructure_label: "基础设施类型",
        infrastructure_name_label: "基础设施名称",
        crisis_label: "危机性质",
        debris_label: "现场是否有碎片？",
        location_label: "准确位置",
        submit_btn: "提交报告",
        gps_active: "GPS 已激活",
        gps_searching: "正在搜索 GPS...",
        online_success: "报告已在线提交！",
        offline_success: "离线：报告已在本地保存。",
        select_placeholder: "请选择...",
        electricity: "电力状况",
        health: "医疗服务",
        needs: "最紧急需求",
        dashboard: {
            title: "ALERTO 联合国开发计划署平台",
            subtitle: "战术监测与损害评估",
            stat_total: "报告总数",
            stat_critical: "完全损坏",
            stat_reliability: "AI 可信度",
            stat_flagged: "已标记",
            chart_sectors: "受影响领域",
            feed_tactical: "战术流",
            feed_security: "安全审查",
            tab_all: "全部",
            tab_flagged: "已标记",
            btn_csv: "CSV",
            btn_geojson: "GeoJSON",
            btn_logout: "登出",
            btn_approve: "标记为安全",
            loading: "正在分析战术流..."
        },
        options: {
            damage: { minime: "最小", partiel: "部分", complet: "完全" },
            infra: ["住宅", "商业", "政府", "公共服务", "交通", "社区", "公共空间", "其他"],
            crisis: ["地震", "洪水", "海啸", "飓风", "火灾", "爆炸", "化学品", "冲突", "骚乱"],
            elec: { aucun: "无损", mineur: "轻微", modere: "中等", important: "严重", detruit: "完全毁坏", inconnu: "未知" },
            health: { fonctionnel: "正常", partiel: "部分", perturbe: "严重中断", HS: "停止服务", inconnu: "未知" },
            urgent_needs: { food: "食水援助", financial: "资金援助", health: "医疗服务", shelter: "避难所", livelihood: "生计恢复", wash: "卫生设施", services: "基本服务", psycho: "心理支持", authorities: "官方支持", other: "其他" }
        }
    },
    ru: {
        title: "ALERTO",
        subtitle: "Система быстрого реагирования",
        take_photo: "Сделать фото",
        description_label: "Описание повреждений",
        description_placeholder: "Опишите повреждения...",
        damage_label: "Уровень повреждений",
        infrastructure_label: "Тип инфраструктуры",
        infrastructure_name_label: "Название инфраструктуры",
        crisis_label: "Характер кризиса",
        debris_label: "Есть ли обломки на объекте?",
        location_label: "Точное местоположение",
        submit_btn: "ОТПРАВИТЬ ОТЧЕТ",
        gps_active: "GPS Активен",
        gps_searching: "Поиск GPS...",
        online_success: "Отчет отправлен онлайн!",
        offline_success: "Оффлайн: Отчет сохранен локально.",
        select_placeholder: "Выбрать...",
        electricity: "Статус электроснабжения",
        health: "Медицинские услуги",
        needs: "Самые насущные потребности",
        dashboard: {
            title: "Платформа ALERTO ПРООН",
            subtitle: "Тактический мониторинг и оценка ущерба",
            stat_total: "ВСЕГО ОТЧЕТОВ",
            stat_critical: "ПОЛНЫЕ ПОВРЕЖДЕНИЯ",
            stat_reliability: "НАДЕЖНОСТЬ ИИ",
            stat_flagged: "ОТМЕЧЕНО",
            chart_sectors: "Затронутые сектора",
            feed_tactical: "Тактический поток",
            feed_security: "Проверка безопасности",
            tab_all: "Все",
            tab_flagged: "Отмечено",
            btn_csv: "CSV",
            btn_geojson: "GeoJSON",
            btn_logout: "Выход",
            btn_approve: "Отметить как безопасное",
            loading: "Анализ тактических потоков..."
        },
        options: {
            damage: { minime: "МИНИМАЛЬНЫЙ", partiel: "ЧАСТИЧНЫЙ", complet: "ПОЛНЫЙ" },
            infra: ["Жилой", "Коммерческий", "Государственный", "Госуслуги", "Транспорт", "Общественный", "Публичные места", "Другое"],
            crisis: ["Землетрясение", "Наводнение", "Цунами", "Ураган", "Пожар", "Взрыв", "Химическая авария", "Конфликт", "Беспорядки"],
            elec: { aucun: "Нет повреждений", mineur: "Незначительные", modere: "Умеренные", important: "Серьезные", detruit: "Разрушено", inconnu: "Неизвестно" },
            health: { fonctionnel: "Работает", partiel: "Частично", perturbe: "Нарушено", HS: "Не работает", inconnu: "Неизвестно" },
            urgent_needs: { food: "Еда и вода", financial: "Денежная помощь", health: "Медицина", shelter: "Жилье", livelihood: "Средства к жизни", wash: "Санитария", services: "Базовые услуги", psycho: "Психологическая поддержка", authorities: "Поддержка властей", other: "Другое" }
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
    return React.createElement(LanguageContext.Provider, { value: { t, lang, setLang, translations } }, children);
};

export const useTranslation = () => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error("useTranslation must be used within a LanguageProvider");
    }
    return context;
};
