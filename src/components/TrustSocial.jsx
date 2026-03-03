import React from 'react';

const TrustSocial = () => {
    return (
        <footer style={{ background: 'var(--marine-blue)', color: '#fff', padding: '5rem 0 2rem' }}>
            <div className="container">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '4rem', marginBottom: '4rem' }}>
                    <div className="footer-brand">
                        <h2 style={{ color: 'var(--goldgelb)', fontSize: '2rem', marginBottom: '1rem' }}>LingoLume</h2>
                        <p style={{ opacity: 0.7 }}>Deutsch lernen – Exklusiv, persönlich, hochwertig.</p>
                    </div>

                    <div className="footer-trust">
                        <h4 style={{ color: '#fff', marginBottom: '1.5rem' }}>Unsere Garantien</h4>
                        <ul style={{ listStyle: 'none', opacity: 0.8 }}>
                            <li style={{ marginBottom: '0.5rem' }}>✓ 100% Muttersprachler</li>
                            <li style={{ marginBottom: '0.5rem' }}>✓ Geld-zurück-Garantie</li>
                            <li style={{ marginBottom: '0.5rem' }}>✓ Zertifikat inklusive</li>
                            <li style={{ marginBottom: '0.5rem' }}>✓ Multilingualer Support</li>
                        </ul>
                    </div>

                    <div className="footer-contact">
                        <h4 style={{ color: '#fff', marginBottom: '1.5rem' }}>Kontakt</h4>
                        <p style={{ opacity: 0.8 }}>E-Mail: <a href="mailto:freudesam@gmail.com" style={{ color: 'var(--goldgelb)', textDecoration: 'none' }}>freudesam@gmail.com</a></p>
                        <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem' }}>
                            {/* Social Icons Placeholders */}
                            <div style={{ width: '40px', height: '40px', background: 'rgba(255,255,255,0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>f</div>
                            <div style={{ width: '40px', height: '40px', background: 'rgba(255,255,255,0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>i</div>
                            <div style={{ width: '40px', height: '40px', background: 'rgba(255,255,255,0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>l</div>
                        </div>
                    </div>
                </div>

                <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '2rem', opacity: 0.5, fontSize: '0.9rem', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap' }}>
                    <p>&copy; 2026 LingoLume. Alle Rechte vorbehalten.</p>
                    <div style={{ display: 'flex', gap: '2rem' }}>
                        <span onClick={() => onNavigate('impressum')} style={{ cursor: 'pointer' }}>Impressum</span>
                        <span onClick={() => onNavigate('privacy')} style={{ cursor: 'pointer' }}>Datenschutz</span>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default TrustSocial;
