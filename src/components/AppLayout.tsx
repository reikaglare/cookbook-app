import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import {
    ChefHat,
    Home,
    BookOpen,
    Heart,
    User,
    LogOut,
    Menu,
    X,
    Search,
    Bell,
    Plus,
    Moon,
    Sun,
    ShoppingBag
} from 'lucide-react';
import clsx from 'clsx';

export default function AppLayout() {
    const { user, signOut } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const location = useLocation();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const navigation = [
        { name: 'Dashboard', href: '/dashboard', icon: Home },
        { name: 'Le mie Ricette', href: '/my-recipes', icon: BookOpen },
        { name: 'Preferiti', href: '/favorites', icon: Heart },
        { name: 'Lista Spesa', href: '/shopping-list', icon: ShoppingBag },
        { name: 'Profilo', href: '/profile', icon: User },
    ];

    const handleSignOut = async () => {
        await signOut();
    };

    return (
        <div className="min-h-screen bg-[var(--bg-main)] flex flex-col md:flex-row">

            {/* Mobile Header */}
            <div className="md:hidden bg-[var(--bg-surface)] border-b border-[var(--border-color)] p-4 flex items-center justify-between sticky top-0 z-20">
                <div className="flex items-center space-x-2 text-primary">
                    <ChefHat className="w-8 h-8" />
                    <span className="text-xl font-bold">CookBook</span>
                </div>
                <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 text-gray-600">
                    {mobileMenuOpen ? <X /> : <Menu />}
                </button>
            </div>

            {/* Desktop Sidebar */}
            <aside className="hidden md:flex w-64 bg-[var(--bg-surface)] border-r border-[var(--border-color)] flex-col sticky top-0 h-screen">
                <div className="p-6 flex items-center space-x-2 text-primary border-b border-[var(--border-color)]">
                    <ChefHat className="w-8 h-8" />
                    <span className="text-2xl font-bold">CookBook</span>
                </div>

                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    <div className="mb-6 px-4">
                        <Link to="/add-recipe" className="w-full flex items-center justify-center bg-primary text-white py-2 rounded-lg hover:bg-primary/90 transition-colors shadow-md">
                            <Plus className="w-5 h-5 mr-2" />
                            Nuova Ricetta
                        </Link>
                    </div>

                    {navigation.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.href;
                        return (
                            <Link
                                key={item.name}
                                to={item.href}
                                className={clsx(
                                    'flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors font-medium',
                                    isActive
                                        ? 'bg-orange-50 text-primary'
                                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                )}
                            >
                                <Icon className={clsx('w-5 h-5', isActive && 'fill-current')} />
                                <span>{item.name}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-[var(--border-color)]">
                    <div className="flex items-center space-x-3 px-4 py-3 mb-2">
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                            {user?.email?.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-[var(--text-primary)] truncate">{user?.email}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleSignOut}
                        className="flex w-full items-center space-x-3 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm font-medium"
                    >
                        <LogOut className="w-5 h-5" />
                        <span>Esci</span>
                    </button>
                </div>
            </aside>

            {/* Mobile Navigation Menu (Overlay) */}
            {mobileMenuOpen && (
                <div className="md:hidden fixed inset-0 z-10 bg-white pt-20 px-4 pb-4">
                    <nav className="space-y-2">
                        <Link
                            to="/add-recipe"
                            onClick={() => setMobileMenuOpen(false)}
                            className="flex items-center space-x-3 px-4 py-3 bg-primary text-white rounded-lg mb-4"
                        >
                            <Plus className="w-5 h-5" />
                            <span>Nuova Ricetta</span>
                        </Link>
                        {navigation.map((item) => (
                            <Link
                                key={item.name}
                                to={item.href}
                                onClick={() => setMobileMenuOpen(false)}
                                className={clsx(
                                    'flex items-center space-x-3 px-4 py-3 rounded-lg text-lg font-medium',
                                    location.pathname === item.href
                                        ? 'bg-orange-50 text-primary'
                                        : 'text-gray-600'
                                )}
                            >
                                <item.icon className="w-6 h-6" />
                                <span>{item.name}</span>
                            </Link>
                        ))}
                        <button
                            onClick={handleSignOut}
                            className="flex w-full items-center space-x-3 px-4 py-3 text-red-600 mt-4 border-t pt-4"
                        >
                            <LogOut className="w-6 h-6" />
                            <span>Esci</span>
                        </button>
                    </nav>
                </div>
            )}

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto h-screen relative">
                {/* Desktop Header */}
                <header className="hidden md:flex items-center justify-between bg-[var(--bg-surface)] border-b border-[var(--border-color)] px-8 py-4 sticky top-0 z-10">
                    <div className="w-96 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Cerca ricette..."
                            className="w-full pl-10 pr-4 py-2 rounded-full border border-[var(--border-color)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                        />
                    </div>
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={toggleTheme}
                            className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors rounded-lg hover:bg-[var(--bg-hover)]"
                            aria-label="Toggle theme"
                        >
                            {theme === 'dark' ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
                        </button>
                        <button className="relative p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
                            <Bell className="w-6 h-6" />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-[var(--bg-surface)]"></span>
                        </button>
                    </div>
                </header>

                <div className="p-4 md:p-8">
                    <Outlet />
                </div>
            </main>

            {/* Mobile Bottom Bar */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 bg-[var(--bg-surface)] border-t border-[var(--border-color)] flex justify-around p-2 z-20 pb-safe">
                {navigation.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.href;
                    return (
                        <Link
                            key={item.name}
                            to={item.href}
                            className={clsx(
                                'flex flex-col items-center justify-center p-2 rounded-lg transition-colors w-16',
                                isActive ? 'text-primary' : 'text-gray-500'
                            )}
                        >
                            <Icon className={clsx('w-6 h-6', isActive && 'fill-current')} />
                            <span className="text-[10px] mt-1 font-medium">{item.name}</span>
                        </Link>
                    );
                })}
                <Link
                    to="/add-recipe"
                    className="flex flex-col items-center justify-center p-2 text-primary"
                >
                    <div className="bg-primary text-white p-3 rounded-full -mt-8 shadow-lg border-4 border-white">
                        <Plus className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] mt-1 font-medium">Aggiungi</span>
                </Link>
            </div>
        </div>
    );
}
