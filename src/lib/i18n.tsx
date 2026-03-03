import { useState, createContext, useContext, ReactNode } from 'react';

export type Language = 'de' | 'en' | 'fr' | 'es' | 'ar' | 'uk' | 'ja' | 'hi';

const translations = {
    de: {
        lernplan: 'Lernplan',
        artikeltrainer: 'Artikeltrainer',
        story_modus: 'Story-Modus',
        admin_bereich: 'Admin-Bereich',
        einstellungen: 'Einstellungen',
        abmelden: 'Abmelden',
        anmelden: 'Anmelden',
        benutzerverwaltung: 'Benutzerverwaltung',
        inhalte: 'Inhalte',
        willkommen: 'Willkommen',
        benutzer_anlegen: 'Benutzer anlegen',
        passwort_zuruecksetzen: 'Passwort zurücksetzen',
        benutzer_loeschen: 'Benutzer löschen',
        lektionen: 'Lektionen',
        weiter: 'Weiter',
        zurueck: 'Zurück',
        pruefen: 'Prüfen',
        loesung: 'Lösung',
        zuruecksetzen: 'Zurücksetzen',
        abschliessen: 'Abschließen',
        laden: 'Laden...',
        fehler_laden: 'Lektion nicht gefunden.',
        verwaltung_beschreibung: 'Verwalte Lektionen, Benutzer & Story-Inhalte.',
        rechte_matrix: 'Berechtigungen (Rechte-Matrix)',
    },
    en: {
        lernplan: 'Learning Plan',
        artikeltrainer: 'Article Trainer',
        story_modus: 'Story Mode',
        admin_bereich: 'Admin Area',
        einstellungen: 'Settings',
        abmelden: 'Logout',
        anmelden: 'Login',
        benutzerverwaltung: 'User Management',
        inhalte: 'Content',
        willkommen: 'Welcome',
        benutzer_anlegen: 'Create User',
        passwort_zuruecksetzen: 'Reset Password',
        benutzer_loeschen: 'Delete User',
        lektionen: 'Lessons',
        weiter: 'Next',
        zurueck: 'Back',
        pruefen: 'Check',
        loesung: 'Solution',
        zuruecksetzen: 'Reset',
        abschliessen: 'Complete',
        laden: 'Loading...',
        fehler_laden: 'Lesson not found.',
        verwaltung_beschreibung: 'Manage lessons, users & story content.',
        rechte_matrix: 'Permissions (Rights Matrix)',
    },
    fr: {
        lernplan: 'Plan d\'apprentissage',
        artikeltrainer: 'Entraîneur d\'articles',
        story_modus: 'Mode Histoire',
        admin_bereich: 'Zone Admin',
        einstellungen: 'Paramètres',
        abmelden: 'Déconnexion',
        anmelden: 'Connexion',
        benutzerverwaltung: 'Gestion des utilisateurs',
        inhalte: 'Contenu',
        willkommen: 'Bienvenue',
        benutzer_anlegen: 'Créer un utilisateur',
        passwort_zuruecksetzen: 'Réinitialiser le mot de passe',
        benutzer_loeschen: 'Supprimer l\'utilisateur',
        lektionen: 'Leçons',
        weiter: 'Suivant',
        zurueck: 'Retour',
        pruefen: 'Vérifier',
        loesung: 'Solution',
        zuruecksetzen: 'Réinitialiser',
        abschliessen: 'Terminer',
        laden: 'Chargement...',
        fehler_laden: 'Leçon non trouvée.',
        verwaltung_beschreibung: 'Gérez les leçons, les utilisateurs et le contenu de l\'histoire.',
        rechte_matrix: 'Autorisations (Matrice des droits)',
    },
    es: {
        lernplan: 'Plan de aprendizaje',
        artikeltrainer: 'Entrenador de artículos',
        story_modus: 'Modo Historia',
        admin_bereich: 'Área de administración',
        einstellungen: 'Ajustes',
        abmelden: 'Cerrar sesión',
        anmelden: 'Iniciar sesión',
        benutzerverwaltung: 'Gestión de usuarios',
        inhalte: 'Contenido',
        willkommen: 'Bienvenido',
        benutzer_anlegen: 'Crear usuario',
        passwort_zuruecksetzen: 'Restablecer contraseña',
        benutzer_loeschen: 'Eliminar usuario',
        lektionen: 'Lecciones',
        weiter: 'Siguiente',
        zurueck: 'Atrás',
        pruefen: 'Comprobar',
        loesung: 'Solución',
        zuruecksetzen: 'Restablecer',
        abschliessen: 'Completar',
        laden: 'Cargando...',
        fehler_laden: 'Lección no encontrada.',
        verwaltung_beschreibung: 'Administre lecciones, usuarios y contenido de historias.',
        rechte_matrix: 'Permisos (Matriz de derechos)',
    },
    ar: {
        lernplan: 'خطة التعلم',
        artikeltrainer: 'مدرب المقالات',
        story_modus: 'وضع القصة',
        admin_bereich: 'منطقة المسؤول',
        einstellungen: 'الإعدادات',
        abmelden: 'تسجيل الخروج',
        anmelden: 'تسجيل الدخول',
        benutzerverwaltung: 'إدارة المستخدمين',
        inhalte: 'المحتوى',
        willkommen: 'أهلاً بك',
        benutzer_anlegen: 'إنشاء مستخدم',
        passwort_zuruecksetzen: 'إعادة تعيين كلمة المرور',
        benutzer_loeschen: 'حذف المستخدم',
        lektionen: 'الدروس',
        weiter: 'التالي',
        zurueck: 'السابق',
        pruefen: 'تحقق',
        loesung: 'الحل',
        zuruecksetzen: 'إعادة ضبط',
        abschliessen: 'إكمال',
        laden: 'جاري التحميل...',
        fehler_laden: 'لم يتم العثور على الدرس.',
        verwaltung_beschreibung: 'إدارة الدروس والمستخدمين ومحتوى القصة.',
        rechte_matrix: 'الأذونات (مصفوفة الحقوق)',
    },
    uk: {
        lernplan: 'План навчання',
        artikeltrainer: 'Тренажер артиклів',
        story_modus: 'Режим історії',
        admin_bereich: 'Панель адміністратора',
        einstellungen: 'Налаштування',
        abmelden: 'Вийти',
        anmelden: 'Увійти',
        benutzerverwaltung: 'Керування користувачами',
        inhalte: 'Контент',
        willkommen: 'Ласкаво просимо',
        benutzer_anlegen: 'Створити користувача',
        passwort_zuruecksetzen: 'Скинути пароль',
        benutzer_loeschen: 'Видалити користувача',
        lektionen: 'Уроки',
        weiter: 'Далі',
        zurueck: 'Назад',
        pruefen: 'Перевірити',
        loesung: 'Рішення',
        zuruecksetzen: 'Скинути',
        abschliessen: 'Завершити',
        laden: 'Завантаження...',
        fehler_laden: 'Урок не знайдено.',
        verwaltung_beschreibung: 'Керуйте уроками, користувачами та контентом історії.',
        rechte_matrix: 'Дозволи (Матриця прав)',
    },
    ja: {
        lernplan: '学習プラン',
        artikeltrainer: '冠詞トレーナー',
        story_modus: 'ストーリーモード',
        admin_bereich: '管理エリア',
        einstellungen: '設定',
        abmelden: 'ログアウト',
        anmelden: 'ログイン',
        benutzerverwaltung: 'ユーザー管理',
        inhalte: 'コンテンツ',
        willkommen: 'ようこそ',
        benutzer_anlegen: 'ユーザー作成',
        passwort_zuruecksetzen: 'パスワード再設定',
        benutzer_loeschen: 'ユーザー削除',
        lektionen: 'レッスン',
        weiter: '次へ',
        zurueck: '戻る',
        pruefen: 'チェック',
        loesung: '解決策',
        zuruecksetzen: 'リセット',
        abschliessen: '完了',
        laden: '読み込み中...',
        fehler_laden: 'レッスンが見つかりません。',
        verwaltung_beschreibung: 'レッスン、ユーザー、ストーリーコンテンツを管理します。',
        rechte_matrix: '権限（権限マトリックス）',
    },
    hi: {
        lernplan: 'सीखने की योजना',
        artikeltrainer: 'लेख प्रशिक्षक',
        story_modus: 'कहानी मोड',
        admin_bereich: 'एडमिन क्षेत्र',
        einstellungen: 'सेटिंग्स',
        abmelden: 'लॉगआउट',
        anmelden: 'लॉगिन',
        benutzerverwaltung: 'उपयोगकर्ता प्रबंधन',
        inhalte: 'सामग्री',
        willkommen: 'स्वागत है',
        benutzer_anlegen: 'उपयोगकर्ता बनाएँ',
        passwort_zuruecksetzen: 'पासवर्ड रीसेट करें',
        benutzer_loeschen: 'उपयोगकर्ता हटाएं',
        lektionen: 'पाठ',
        weiter: 'आगे',
        zurueck: 'पीछे',
        pruefen: 'जांचें',
        loesung: 'समाधान',
        zuruecksetzen: 'रीसेट करें',
        abschliessen: 'पूरा करें',
        laden: 'लोड हो रहा है...',
        fehler_laden: 'पाठ नहीं मिला।',
        verwaltung_beschreibung: 'पाठ, उपयोगकर्ता और कहानी सामग्री प्रबंधित करें।',
        rechte_matrix: 'अनुमतियां (अधिकार मैट्रिक्स)',
    }
};

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: keyof typeof translations['de']) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
    const [language, setLanguage] = useState<Language>(() => {
        const stored = localStorage.getItem('lingolume_lang');
        return (stored as Language) || 'de';
    });

    const handleSetLanguage = (lang: Language) => {
        setLanguage(lang);
        localStorage.setItem('lingolume_lang', lang);
    };

    const t = (key: keyof typeof translations['de']) => {
        return translations[language][key] || translations['de'][key] || key;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useTranslation() {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useTranslation must be used within a LanguageProvider');
    }
    return context;
}
