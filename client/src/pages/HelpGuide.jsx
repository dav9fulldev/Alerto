import React, { useState } from 'react';
import { HelpCircle, Camera, MapPin, BarChart3, Shield, Info, ChevronDown, ChevronUp, Download, Globe, WifiOff, AlertTriangle } from 'lucide-react';

const HelpGuide = ({ lang = 'fr', onClose }) => {
    const [openIndex, setOpenIndex] = useState(null);

    const toggle = (index) => setOpenIndex(openIndex === index ? null : index);

    const content = {
        fr: {
            title: "Centre d'Aide ALERTO",
            subtitle: "Apprenez à maîtriser la plateforme de réponse aux crises.",
            sections: [
                {
                    title: "🙋‍♂️ Guide du Citoyen",
                    icon: <Camera size={20} />,
                    items: [
                        {
                            q: "Comment envoyer un signalement ?",
                            a: "Cliquez sur 'Soumettre une Alerte'. Prenez une photo ou vidéo du sinistre, activez votre GPS, et remplissez une courte description. Cliquez sur Valider pour envoyer."
                        },
                        {
                            q: "Est-ce que ça fonctionne sans internet ?",
                            a: "Oui ! ALERTO stocke vos rapports localement si vous n'avez pas de réseau. Ils seront envoyés automatiquement dès que vous retrouverez une connexion (Synchronisation Offline)."
                        },
                        {
                            q: "Pourquoi donner accès à mon GPS ?",
                            a: "La localisation précise permet au PNUD d'envoyer les secours exactement là où c'est nécessaire. Aucune donnée n'est partagée en dehors des services d'urgence."
                        }
                    ]
                },
                {
                    title: "🏢 Guide Autorités (PNUD)",
                    icon: <BarChart3 size={20} />,
                    items: [
                        {
                            q: "Comment lire le Dashboard ?",
                            a: "Le Dashboard est mis à jour toutes les 30 secondes. Il montre la répartition des crises, les zones les plus touchées et les preuves visuelles récentes."
                        },
                        {
                            q: "Comment utiliser la carte SIG ?",
                            a: "Utilisez la carte pour voir géographiquement l'étendue des dégâts. Cliquez sur un marqueur pour voir la photo du terrain et les besoins urgents détectés par l'IA."
                        },
                        {
                            q: "Exporter les données",
                            a: "Vous pouvez exporter tous les rapports en CSV (pour Excel) ou en GeoJSON (pour les logiciels SIG professionnels comme QGIS/ArcGIS)."
                        }
                    ]
                },
                {
                    title: "🤖 Intelligence Artificielle & Sécurité",
                    icon: <Shield size={20} />,
                    items: [
                        {
                            q: "C'est quoi la détection NSFW ?",
                            a: "Notre IA filtre automatiquement les contenus inappropriés ou choquants. Si une image est jugée sensible, elle est bloquée ou marquée pour revue humaine."
                        },
                        {
                            q: "Classification automatique",
                            a: "L'IA analyse le texte et l'image pour suggérer un niveau de gravité (Normal, Critique, Urgent), aidant à prioriser les interventions."
                        },
                        {
                            q: "Traduction Multi-langues",
                            a: "Tous les rapports envoyés dans une langue locale sont automatiquement traduits en Français et Anglais pour une compréhension globale par les partenaires internationaux."
                        }
                    ]
                }
            ],
            contact: "Besoin d'assistance technique ? Contactez l'équipe IT du PNUD."
        },
        en: {
            title: "ALERTO Help Center",
            subtitle: "Learn how to master the crisis response platform.",
            sections: [
                {
                    title: "🙋‍♂️ Citizen Guide",
                    icon: <Camera size={20} />,
                    items: [
                        { q: "How to send a report?", a: "Click 'Submit Alert'. Take a photo or video of the disaster, enable GPS, and fill in a short description. Click Validate to send." },
                        { q: "Does it work without internet?", a: "Yes! ALERTO stores your reports locally if you have no signal. They will be sent automatically as soon as you find a connection (Offline Sync)." },
                        { q: "Why give access to my GPS?", a: "Precise location allows UNDP to send help exactly where it's needed. No data is shared outside of emergency services." }
                    ]
                },
                {
                    title: "🏢 Authorities Guide (UNDP)",
                    icon: <BarChart3 size={20} />,
                    items: [
                        { q: "How to read the Dashboard?", a: "The Dashboard updates every 30 seconds. It shows crisis distribution, most affected areas, and recent visual evidence." },
                        { q: "How to use the GIS Map?", a: "Use the map to geographically see the extent of the damage. Click on a marker to see the field photo and the urgent needs detected by the AI." },
                        { q: "Exporting Data", a: "You can export all reports to CSV (for Excel) or GeoJSON (for professional GIS software like QGIS/ArcGIS)." }
                    ]
                }
            ],
            contact: "Need technical assistance? Contact the UNDP IT team."
        },
        es: {
            title: "Centro de Ayuda ALERTO",
            subtitle: "Aprenda a dominar la plataforma de respuesta a crisis.",
            sections: [
                {
                    title: "🙋‍♂️ Guía del Ciudadano",
                    icon: <Camera size={20} />,
                    items: [
                        { q: "¿Cómo enviar un reporte?", a: "Haga clic en 'Enviar Alerta'. Tome una foto o video, active su GPS y complete una breve descripción. Haga clic en Validar." },
                        { q: "¿Funciona sin internet?", a: "¡Sí! ALERTO guarda sus reportes localmente. Se enviarán automáticamente cuando recupere la conexión (Sincronización Offline)." },
                        { q: "¿Por qué dar acceso a mi GPS?", a: "La ubicación precisa permite al PNUD enviar ayuda exactamente donde se necesita. No se comparten datos fuera de emergencia." }
                    ]
                },
                {
                    title: "🏢 Guía de Autoridades (PNUD)",
                    icon: <BarChart3 size={20} />,
                    items: [
                        { q: "¿Cómo leer el Dashboard?", a: "El tablero se actualiza cada 30 segundos. Muestra la distribución de crisis y evidencia visual reciente." },
                        { q: "¿Cómo usar el mapa SIG?", a: "Use el mapa para ver la extensión de los daños. Haga clic en un marcador para ver fotos y necesidades detectadas por la IA." }
                    ]
                }
            ],
            contact: "¿Necesita asistencia técnica? Contacte al equipo de TI del PNUD."
        },
        ar: {
            title: "مركز مساعدة ALERTO",
            subtitle: "تعلم كيفية إتقان منصة الاستجابة للأزمات.",
            sections: [
                {
                    title: "🙋‍♂️ دليل المواطن",
                    icon: <Camera size={20} />,
                    items: [
                        { q: "كيفية إرسال بلاغ؟", a: "انقر فوق 'إرسال تنبيه'. التقط صورة أو مقطع فيديو، وقم بتفعيل نظام تحديد المواقع (GPS)، واكتب وصفاً قصيراً. انقر فوق تأكيد للإرسال." },
                        { q: "هل يعمل بدون إنترنت؟", a: "نعم! يقوم ALERTO بتخزين تقاريرك محلياً وسيتم إرسالها تلقائياً بمجرد توفر الاتصال (مزامنة أوفلاين)." },
                        { q: "لماذا يجب السماح بالوصول إلى نظام تحديد المواقع؟", a: "الموقع الدقيق يسمح لبرنامج الأمم المتحدة الإنمائي بإرسال المساعدة إلى حيث تشتد الحاجة إليها." }
                    ]
                },
                {
                    title: "🏢 دليل السلطات (PNUD)",
                    icon: <BarChart3 size={20} />,
                    items: [
                        { q: "كيفية قراءة لوحة التحكم؟", a: "يتم تحديث لوحة التحكم كل 30 ثانية. تعرض توزيع الأزمات والمناطق الأكثر تضرراً." }
                    ]
                }
            ],
            contact: "هل تحتاج إلى مساعدة تقنية؟ اتصل بفريق تكنولوجيا المعلومات في برنامج الأمم المتحدة الإنمائي."
        },
        zh: {
            title: "ALERTO 帮助中心",
            subtitle: "学习如何掌握危机应对平台。",
            sections: [
                {
                    title: "🙋‍♂️ 公民指南",
                    icon: <Camera size={20} />,
                    items: [
                        { q: "如何发送报告？", a: "点击“提交警报”。拍摄照片或视频，启用 GPS，并填写简短说明。点击验证发送。" },
                        { q: "没有网络也能工作吗？", a: "是的！如果您没有信号，ALERTO 会在本地存储您的报告。一旦恢复连接，它们将自动发送（离线同步）。" },
                        { q: "为什么要授权访问我的 GPS？", a: "精确的位置允许开发计划署将帮助发送到确切需要的地方。" }
                    ]
                },
                {
                    title: "🏢 当局指南 (PNUD)",
                    icon: <BarChart3 size={20} />,
                    items: [
                        { q: "如何查看仪表板？", a: "仪表板每 30 秒更新一次。它显示危机分布、受影响最严重的地区和最近的视觉证据。" }
                    ]
                }
            ],
            contact: "需要技术支持？请联系开发计划署 IT 团队。"
        },
        ru: {
            title: "Центр помощи ALERTO",
            subtitle: "Узнайте, как пользоваться платформой реагирования на кризисы.",
            sections: [
                {
                    title: "🙋‍♂️ Руководство для граждан",
                    icon: <Camera size={20} />,
                    items: [
                        { q: "Как отправить отчет?", a: "Нажмите 'Отправить оповещение'. Сделайте фото или видео, включите GPS и заполните краткое описание. Нажмите 'Подтвердить'." },
                        { q: "Работает ли это без интернета?", a: "Да! ALERTO сохраняет ваши отчеты локально. Они будут отправлены автоматически, как только появится связь (оффлайн синхронизация)." },
                        { q: "Зачем давать доступ к моему GPS?", a: "Точное местоположение позволяет ПРООН направлять помощь именно туда, где она необходима." }
                    ]
                },
                {
                    title: "🏢 Руководство для властей (ПРООН)",
                    icon: <BarChart3 size={20} />,
                    items: [
                        { q: "Как читать дашборд?", a: "Дашборд обновляется каждые 30 секунд. Он показывает распределение кризисов и последние визуальные доказательства." }
                    ]
                }
            ],
            contact: "Нужна техническая помощь? Свяжитесь с ИТ-командой ПРООН."
        }
    };

    const isRtl = lang === 'ar';
    const activeContent = content[lang] || content.fr;

    return (
        <div className="help-overlay" dir={isRtl ? 'rtl' : 'ltr'}>
            <div className={`help-modal ${isRtl ? 'rtl' : ''}`}>
                <header className="help-header">
                    <div className="help-header-content">
                        <HelpCircle className="help-icon-main" style={{ marginLeft: isRtl ? '16px' : '0', marginRight: isRtl ? '0' : '16px' }} />
                        <div>
                            <h1>{activeContent.title}</h1>
                            <p>{activeContent.subtitle}</p>
                        </div>
                    </div>
                    <button className="help-close" onClick={onClose}>✕</button>
                </header>

                <div className="help-body">
                    {activeContent.sections.map((section, sIdx) => (
                        <div key={sIdx} className="help-section">
                            <h2 className="section-title">
                                {section.icon}
                                {section.title}
                            </h2>
                            <div className="faq-list">
                                {section.items.map((item, iIdx) => {
                                    const index = `${sIdx}-${iIdx}`;
                                    const isOpen = openIndex === index;
                                    return (
                                        <div key={iIdx} className={`faq-item ${isOpen ? 'open' : ''}`}>
                                            <div className="faq-question" onClick={() => toggle(index)}>
                                                <span>{item.q}</span>
                                                {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                            </div>
                                            {isOpen && <div className="faq-answer">{item.a}</div>}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>

                <footer className="help-footer">
                    <p><Globe size={14} style={{ marginRight: '6px' }} /> {activeContent.contact}</p>
                </footer>
            </div>
            <style>{`
                .help-overlay {
                    position: fixed;
                    top: 0; left: 0; right: 0; bottom: 0;
                    background: rgba(15, 23, 42, 0.9);
                    backdrop-filter: blur(10px);
                    z-index: 1000;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 20px;
                    animation: fadeIn 0.3s ease;
                }
                .help-modal {
                    background: #1e293b;
                    border: 1px solid rgba(255,255,255,0.1);
                    border-radius: 20px;
                    width: 100%;
                    max-width: 700px;
                    max-height: 90vh;
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
                }
                .help-header {
                    padding: 24px;
                    background: linear-gradient(135deg, #f43f5e 0%, #fb7185 100%);
                    color: white;
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                }
                .help-header-content {
                    display: flex;
                    gap: 16px;
                    align-items: center;
                }
                .help-icon-main {
                    width: 40px;
                    height: 40px;
                    padding: 8px;
                    background: rgba(255,255,255,0.2);
                    border-radius: 12px;
                }
                .help-header h1 {
                    fontSize: 1.5rem;
                    fontWeight: 700;
                    margin: 0;
                }
                .help-header p {
                    margin: 4px 0 0;
                    opacity: 0.9;
                    fontSize: 0.9rem;
                }
                .help-close {
                    background: rgba(0,0,0,0.1);
                    border: none;
                    color: white;
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .help-body {
                    padding: 24px;
                    overflow-y: auto;
                    flex: 1;
                }
                .help-section {
                    margin-bottom: 32px;
                }
                .section-title {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    color: #f43f5e;
                    fontSize: 1.1rem;
                    fontWeight: 600;
                    margin-bottom: 16px;
                }
                .faq-list {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }
                .faq-item {
                    background: rgba(51, 65, 85, 0.5);
                    border: 1px solid rgba(255,255,255,0.05);
                    border-radius: 12px;
                    overflow: hidden;
                    transition: all 0.3s ease;
                }
                .faq-item:hover {
                    background: rgba(51, 65, 85, 0.8);
                }
                .faq-question {
                    padding: 16px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    cursor: pointer;
                    fontWeight: 500;
                    color: #f1f5f9;
                }
                .faq-answer {
                    padding: 16px;
                    background: rgba(15, 23, 42, 0.3);
                    color: #94a3b8;
                    fontSize: 0.9rem;
                    lineHeight: 1.5;
                    border-top: 1px solid rgba(255,255,255,0.05);
                    animation: slideDown 0.3s ease;
                }
                .help-footer {
                    padding: 16px 24px;
                    background: rgba(15, 23, 42, 0.5);
                    border-top: 1px solid rgba(255,255,255,0.05);
                    color: #64748b;
                    fontSize: 0.8rem;
                }
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>
        </div>
    );
};

export default HelpGuide;
