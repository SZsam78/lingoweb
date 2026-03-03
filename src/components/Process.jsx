import React from 'react';

const Process = () => {
    const steps = [
        { title: 'Formular ausfüllen', desc: 'Wähle dein gewünschtes Level und deine Sprache.' },
        { title: 'Infopaket erhalten', desc: 'Details zu Ablauf, Technik und Bezahlung per E-Mail.' },
        { title: 'Starten', desc: 'Nach Klärung der Details am Wunschtermin loslegen.' }
    ];

    return (
        <section className="process" style={{ background: '#fff' }}>
            <div className="container">
                <div className="text-center" style={{ marginBottom: '4rem' }}>
                    <h2>Dein Weg zum Erfolg</h2>
                    <p>Klar, strukturiert und einfach.</p>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '2rem', position: 'relative' }}>
                    {/* Connecting Line (Desktop) */}
                    <div style={{ position: 'absolute', top: '40px', left: '10%', right: '10%', height: '2px', background: '#edf2f7', zIndex: 0 }} className="desktop-only"></div>

                    {steps.map((s, i) => (
                        <div key={i} style={{ flex: '1 1 250px', textAlign: 'center', position: 'relative', zIndex: 1, padding: '0 1rem' }}>
                            <div style={{
                                width: '80px',
                                height: '80px',
                                background: 'var(--marine-blue)',
                                color: 'var(--goldgelb)',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 1.5rem',
                                fontSize: '1.5rem',
                                fontWeight: '700',
                                boxShadow: '0 0 0 10px #FFFCF9'
                            }}>
                                {i + 1}
                            </div>
                            <h3>{s.title}</h3>
                            <p style={{ marginTop: '0.5rem', color: '#4A5568' }}>{s.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Process;
