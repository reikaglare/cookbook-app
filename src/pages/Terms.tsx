
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function Terms() {
    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto bg-[var(--bg-surface)] rounded-2xl shadow-sm p-8 sm:p-12">
                <Link to="/" className="inline-flex items-center text-[var(--text-secondary)] hover:text-primary mb-8 transition-colors">
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Torna alla Home
                </Link>

                <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-6">Termini e Condizioni</h1>

                <div className="prose prose-orange max-w-none text-[var(--text-secondary)] space-y-6">
                    <p>Ultimo aggiornamento: {new Date().toLocaleDateString('it-IT')}</p>

                    <section>
                        <h2 className="text-xl font-bold text-gray-800 mb-3">1. Accettazione dei Termini</h2>
                        <p>
                            Accedendo e utilizzando CookBook ("l'Applicazione"), accetti di essere vincolato dai seguenti Termini e Condizioni.
                            Se non accetti questi termini, ti preghiamo di non utilizzare l'Applicazione.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-800 mb-3">2. Uso dell'Applicazione</h2>
                        <p>
                            CookBook è una piattaforma personale per la gestione di ricette. Ti impegni a utilizzare l'Applicazione
                            solo per scopi legali e in modo da non violare i diritti di, limitare o inibire l'uso e il godimento
                            dell'Applicazione da parte di terzi.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-800 mb-3">3. Account Utente</h2>
                        <p>
                            Per utilizzare alcune funzionalità dell'Applicazione, potrebbe essere necessario registrare un account.
                            Sei responsabile del mantenimento della riservatezza delle tue credenziali di accesso e di tutte le
                            attività che si verificano sotto il tuo account.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-800 mb-3">4. Contenuti dell'Utente</h2>
                        <p>
                            Conservi tutti i diritti di proprietà sui contenuti (ricette, immagini, testi) che carichi sull'Applicazione.
                            Tuttavia, caricando contenuti, concedi a CookBook una licenza limitata per ospitare e visualizzare tali contenuti
                            per il tuo uso personale.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-800 mb-3">5. Proprietà Intellettuale</h2>
                        <p>
                            Tutti i diritti di proprietà intellettuale relativi all'Applicazione (esclusi i contenuti degli utenti)
                            sono di proprietà esclusiva di CookBook.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}
