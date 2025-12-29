import { Link } from 'react-router-dom';
import { ChefHat, BookOpen, Share2, Shield, ArrowRight } from 'lucide-react';

export default function Landing() {
    return (
        <div className="min-h-screen bg-background">
            {/* Navigation */}
            <nav className="container mx-auto px-4 sm:px-6 py-6 flex justify-between items-center">
                <div className="flex items-center space-x-2 shrink-0">
                    <ChefHat className="w-8 h-8 text-primary" />
                    <span className="text-xl sm:text-2xl font-bold font-sans text-[var(--text-primary)]">CookBook</span>
                </div>
                <div className="flex items-center space-x-2 sm:space-x-4">
                    <Link to="/login" className="text-sm sm:text-base text-[var(--text-secondary)] hover:text-primary transition-colors font-medium">
                        Accedi
                    </Link>
                    <Link to="/signup" className="bg-primary hover:bg-primary/90 text-white px-4 sm:px-6 py-2 rounded-full text-sm sm:text-base font-medium transition-colors whitespace-nowrap">
                        <span className="hidden xs:inline">Registrati</span>
                        <span className="xs:hidden">Unisciti</span>
                        <span className="hidden sm:inline"> Gratis</span>
                    </Link>
                </div>
            </nav>


            {/* Hero Section */}
            <div className="container mx-auto px-6 py-16 md:py-24 grid md:grid-cols-2 gap-12 items-center">
                <div className="space-y-6">
                    <h1 className="text-4xl md:text-6xl font-bold leading-tight text-[var(--text-primary)]">
                        Il tuo ricettario personale, <span className="text-primary">reinventato</span>.
                    </h1>
                    <p className="text-xl text-[var(--text-secondary)]">
                        Salva, organizza e custodisci le tue ricette preferite in un luogo sicuro e accessibile ovunque.
                        Dai vita alla tua passione per la cucina.
                    </p>
                    <div className="pt-4 flex flex-col sm:flex-row gap-4">
                        <Link to="/signup" className="inline-flex items-center justify-center bg-primary hover:bg-primary/90 text-white px-8 py-3 rounded-full text-lg font-medium transition-all shadow-lg hover:shadow-xl">
                            Inizia Ora <ArrowRight className="ml-2 w-5 h-5" />
                        </Link>
                        <Link to="/login" className="inline-flex items-center justify-center bg-[var(--bg-surface)] border-2 border-[var(--border-color)] hover:border-primary text-[var(--text-primary)] hover:text-primary px-8 py-3 rounded-full text-lg font-medium transition-all">
                            Accedi
                        </Link>
                    </div>
                </div>
                <div className="relative">
                    <div className="absolute -inset-4 bg-gradient-to-r from-primary to-secondary rounded-full opacity-20 blur-3xl animate-pulse"></div>
                    <img
                        src="https://images.unsplash.com/photo-1556911220-e15b29be8c8f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80"
                        alt="Cucina moderna"
                        className="relative rounded-2xl shadow-2xl transform hover:scale-[1.02] transition-transform duration-300"
                    />
                </div>
            </div>

            {/* Features Section */}
            <div className="bg-[var(--bg-surface)] py-20">
                <div className="container mx-auto px-6">
                    <h2 className="text-3xl font-bold text-center mb-16 text-[var(--text-primary)]">Perché scegliere CookBook?</h2>
                    <div className="grid md:grid-cols-3 gap-10">
                        <FeatureCard
                            icon={<Shield className="w-8 h-8 text-primary" />}
                            title="Ricette Private"
                            description="Le tue ricette sono solo tue. Un ambiente sicuro dove custodire i segreti di famiglia."
                        />
                        <FeatureCard
                            icon={<BookOpen className="w-8 h-8 text-primary" />}
                            title="Organizzazione Facile"
                            description="Categorie personalizzate, tag e ricerca istantanea per trovare sempre il piatto giusto."
                        />
                        <FeatureCard
                            icon={<Share2 className="w-8 h-8 text-primary" />}
                            title="Accesso Ovunque"
                            description="Accedi al tuo ricettario da computer, tablet o smartphone. La tua cucina è sempre con te."
                        />
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="bg-gray-50 py-12 border-t text-center text-[var(--text-secondary)]">
                <p>© 2025 CookBook. Fatto con ❤️ per gli amanti della cucina.</p>
            </footer>
        </div>
    );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
    return (
        <div className="p-8 rounded-2xl bg-background border border-orange-100 hover:border-primary/30 hover:shadow-lg transition-all">
            <div className="mb-4 bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center">
                {icon}
            </div>
            <h3 className="text-xl font-bold mb-3 text-[var(--text-primary)]">{title}</h3>
            <p className="text-[var(--text-secondary)] leading-relaxed">{description}</p>
        </div>
    );
}
