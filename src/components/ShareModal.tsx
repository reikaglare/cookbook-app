import { useState, useEffect } from 'react';
import { X, Copy, Download, Globe, Lock, Share2, Facebook, Twitter, MessageCircle, Mail, Check, FileText } from 'lucide-react';
import { supabase } from '../lib/supabase';
import {
    generateShareToken,
    getSocialShareLinks,
    formatRecipeForSharing,
    exportAsImage,
    exportAsPDF
} from '../utils/shareUtils';

interface ShareModalProps {
    isOpen: boolean;
    onClose: () => void;
    recipe: any;
    onUpdate: (updatedRecipe: any) => void;
}

export default function ShareModal({ isOpen, onClose, recipe, onUpdate }: ShareModalProps) {
    const [isPublic, setIsPublic] = useState(recipe.is_public || false);
    const [shareToken, setShareToken] = useState(recipe.share_token || '');
    const [copied, setCopied] = useState(false);
    const [loading, setLoading] = useState(false);
    const [exportingImage, setExportingImage] = useState(false);
    const [exportingPDF, setExportingPDF] = useState(false);

    const shareUrl = `${window.location.origin}/share/${shareToken}`;
    const recipeText = formatRecipeForSharing(recipe);
    const socialLinks = getSocialShareLinks(shareUrl, recipe.title, recipeText);

    useEffect(() => {
        if (isOpen) {
            setIsPublic(recipe.is_public || false);
            setShareToken(recipe.share_token || '');
        }
    }, [isOpen, recipe]);

    const handleTogglePublic = async () => {
        setLoading(true);
        try {
            const newToken = !isPublic && !shareToken ? generateShareToken() : shareToken;
            const { data, error } = await supabase
                .from('recipes')
                .update({
                    is_public: !isPublic,
                    share_token: !isPublic ? newToken : shareToken
                })
                .eq('id', recipe.id)
                .select()
                .single();

            if (error) {
                if (error.code === '42703') { // Column not found
                    throw new Error('Database non aggiornato. Per favore esegui la migrazione SQL indicata nel walkthrough.');
                }
                throw error;
            }

            setIsPublic(!isPublic);
            if (!isPublic) setShareToken(newToken);
            onUpdate(data);
        } catch (error: any) {
            console.error('Error updating privacy:', error);
            alert(error.message || 'Errore durante l\'aggiornamento della privacy.');
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy text: ', err);
        }
    };

    const handleExportImage = async () => {
        setExportingImage(true);
        await exportAsImage('recipe-container', `Ricetta-${recipe.title}`);
        setExportingImage(false);
    };

    const handleExportPDF = async () => {
        setExportingPDF(true);
        await exportAsPDF('recipe-container', `Ricetta-${recipe.title}`);
        setExportingPDF(false);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-[var(--bg-surface)] border border-[var(--border-color)] w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-6 border-b border-[var(--border-color)] flex justify-between items-center bg-[var(--bg-surface)]">
                    <h2 className="text-xl font-bold text-[var(--text-primary)] flex items-center">
                        <Share2 className="w-5 h-5 mr-2 text-primary" />
                        Condividi Ricetta
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                        <X className="w-5 h-5 text-[var(--text-secondary)]" />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Privacy Toggle - FIXED CONTRAST */}
                    <div className="flex items-center justify-between p-4 bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-xl">
                        <div className="flex items-center space-x-3">
                            <div className={`p-2 rounded-lg ${isPublic ? 'bg-green-500/10 text-green-500' : 'bg-gray-500/10 text-gray-500'}`}>
                                {isPublic ? <Globe className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
                            </div>
                            <div>
                                <p className="font-semibold text-sm text-[var(--text-primary)]">Link Pubblico</p>
                                <p className="text-xs text-[var(--text-secondary)]">
                                    {isPublic ? 'Chiunque abbia il link può vedere la ricetta' : 'Solo tu puoi vedere la ricetta'}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={handleTogglePublic}
                            disabled={loading}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isPublic ? 'bg-primary' : 'bg-gray-300'}`}
                        >
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isPublic ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                    </div>

                    {isPublic && (
                        <div className="space-y-4 animate-in slide-in-from-top-2 duration-200">
                            {/* Share Link */}
                            <div className="flex items-center space-x-2">
                                <div className="flex-1 bg-[var(--bg-surface)] border border-[var(--border-color)] p-3 rounded-lg text-xs font-mono text-[var(--text-secondary)] truncate">
                                    {shareUrl}
                                </div>
                                <button
                                    onClick={() => copyToClipboard(shareUrl)}
                                    className="p-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-all shadow-sm active:scale-95"
                                >
                                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                </button>
                            </div>

                            {/* Social Buttons */}
                            <div className="grid grid-cols-4 gap-4">
                                <a href={socialLinks.whatsapp} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center space-y-1">
                                    <div className="p-3 bg-[#25D366] text-white rounded-xl hover:scale-110 transition-transform shadow-md">
                                        <MessageCircle className="w-5 h-5" />
                                    </div>
                                    <span className="text-[10px] text-[var(--text-secondary)]">WhatsApp</span>
                                </a>
                                <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center space-y-1">
                                    <div className="p-3 bg-[#1877F2] text-white rounded-xl hover:scale-110 transition-transform shadow-md">
                                        <Facebook className="w-5 h-5" />
                                    </div>
                                    <span className="text-[10px] text-[var(--text-secondary)]">Facebook</span>
                                </a>
                                <a href={socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center space-y-1">
                                    <div className="p-3 bg-[#000000] border border-white/20 text-white rounded-xl hover:scale-110 transition-transform shadow-md">
                                        <Twitter className="w-5 h-5" />
                                    </div>
                                    <span className="text-[10px] text-[var(--text-secondary)]">X</span>
                                </a>
                                <a href={socialLinks.email} className="flex flex-col items-center space-y-1">
                                    <div className="p-3 bg-gray-600 text-white rounded-xl hover:scale-110 transition-transform shadow-md">
                                        <Mail className="w-5 h-5" />
                                    </div>
                                    <span className="text-[10px] text-[var(--text-secondary)]">Email</span>
                                </a>
                            </div>
                        </div>
                    )}

                    {/* Action grid (always visible) */}
                    <div className="grid grid-cols-2 gap-3 pt-2">
                        <button
                            onClick={() => copyToClipboard(recipeText)}
                            className="flex items-center justify-center space-x-2 p-3 border border-[var(--border-color)] rounded-xl hover:bg-white/5 transition-colors text-sm font-medium text-[var(--text-primary)] shadow-sm"
                        >
                            <Copy className="w-4 h-4" />
                            <span>{copied ? 'Copiato!' : 'Copia Testo'}</span>
                        </button>
                        <button
                            onClick={handleExportImage}
                            disabled={exportingImage}
                            className="flex items-center justify-center space-x-2 p-3 border border-[var(--border-color)] rounded-xl hover:bg-white/5 transition-colors text-sm font-medium text-[var(--text-primary)] shadow-sm disabled:opacity-50"
                        >
                            <Download className={`w-4 h-4 ${exportingImage ? 'animate-spin' : ''}`} />
                            <span>{exportingImage ? 'Esporto...' : 'Immagine'}</span>
                        </button>
                        <button
                            onClick={handleExportPDF}
                            disabled={exportingPDF}
                            className="flex items-center justify-center space-x-2 p-3 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500/20 transition-colors text-sm font-medium border border-red-500/20 col-span-2 shadow-sm disabled:opacity-50"
                        >
                            <FileText className={`w-4 h-4 ${exportingPDF ? 'animate-spin' : ''}`} />
                            <span>{exportingPDF ? 'Generazione PDF...' : 'Scarica PDF Ricetta'}</span>
                        </button>
                    </div>
                </div>

                <div className="p-4 bg-[var(--bg-surface)] border-t border-[var(--border-color)] text-center opacity-50">
                    <p className="text-[10px] text-[var(--text-secondary)]">
                        CookBook 2025 - Condividi la passione per la cucina
                    </p>
                </div>
            </div>
        </div>
    );
}
