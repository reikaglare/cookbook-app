import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export const generateShareToken = () => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

export const formatRecipeForSharing = (recipe: any) => {
    if (!recipe) return '';

    const ingredients = recipe.ingredients
        ?.map((ing: any) => `- ${ing.quantity || ''} ${ing.unit || ''} ${ing.item}`)
        .join('\n') || 'Nessun ingrediente inserito.';

    const instructions = (Array.isArray(recipe.instructions) ? recipe.instructions : [])
        .map((step: any, i: number) => `${i + 1}. ${typeof step === 'string' ? step : step.text || ''}`)
        .join('\n\n') || 'Nessun procedimento inserito.';

    return `🍳 Ricetta: ${recipe.title}\n\n${recipe.description || ''}\n\n🥗 Ingredienti:\n${ingredients}\n\n👨‍🍳 Procedimento:\n${instructions}\n\nCondivisa tramite CookBook 👩‍🍳`;
};

export const getSocialShareLinks = (url: string, title: string, text: string) => {
    const encodedUrl = encodeURIComponent(url);
    const encodedTitle = encodeURIComponent(title);
    const encodedText = encodeURIComponent(text);

    return {
        whatsapp: `https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`,
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
        twitter: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
        email: `mailto:?subject=${encodedTitle}&body=${encodedText}%0A%0A${encodedUrl}`,
    };
};

export const exportAsImage = async (elementId: string, fileName: string) => {
    const element = document.getElementById(elementId);
    if (!element) {
        alert('Errore: Elemento ricetta non trovato.');
        return;
    }

    console.log('Avvio esportazione immagine (Clean Room) per:', elementId);

    try {
        const canvas = await html2canvas(element, {
            useCORS: true,
            scale: 2,
            backgroundColor: '#ffffff',
            logging: false,
            onclone: (clonedDoc) => {
                // 1. Remove non-content elements ABSOLUTELY
                const clonedContainer = clonedDoc.getElementById(elementId);
                if (clonedContainer) {
                    // Remove all buttons (back, edit, delete, etc.)
                    clonedContainer.querySelectorAll('button, a[role="button"]').forEach(el => el.remove());
                    // Remove ShareModal content if accidentally captured
                    clonedContainer.querySelectorAll('[role="dialog"], .fixed, .absolute.top-0').forEach(el => el.remove());
                }

                // 2. Clear all original styles to avoid oklch crash
                clonedDoc.querySelectorAll('link[rel="stylesheet"], style').forEach(el => el.remove());

                // 3. Inject clean, safe styles
                const style = clonedDoc.createElement('style');
                style.textContent = `
                    #${elementId} {
                        background-color: white !important;
                        color: #1a1a1a !important;
                        padding: 40px !important;
                        font-family: sans-serif !important;
                        width: 900px !important;
                    }
                    #${elementId} * {
                        color: #1a1a1a !important;
                        background: transparent !important;
                        visibility: visible !important;
                    }
                    #${elementId} img {
                        width: 100% !important;
                        border-radius: 20px !important;
                        margin-bottom: 30px !important;
                    }
                    #${elementId} h1 { font-size: 42px !important; color: #F97316 !important; margin: 20px 0 !important; }
                    #${elementId} h2 { font-size: 26px !important; color: #F97316 !important; border-bottom: 2px solid #FEF3C7 !important; padding-bottom: 8px !important; margin-top: 40px !important; }
                    #${elementId} .flex { display: flex !important; gap: 20px !important; margin-bottom: 10px !important; }
                    #${elementId} .grid { display: grid !important; grid-template-columns: 1fr 2fr !important; gap: 40px !important; }
                    
                    /* Badge styles */
                    span { font-weight: 600 !important; }
                    
                    /* Instructions step number */
                    .rounded-full.bg-orange-100 {
                        background-color: #FFEDD5 !important;
                        color: #EA580C !important;
                        width: 32px !important;
                        height: 32px !important;
                        border-radius: 50% !important;
                        display: inline-block !important;
                        text-align: center !important;
                        line-height: 32px !important;
                        margin-right: 15px !important;
                    }
                    
                    li { border-bottom: 1px solid #F3F4F6 !important; padding: 10px 0 !important; list-style: none !important; }
                    p { font-size: 18px !important; line-height: 1.6 !important; }
                `;
                clonedDoc.head.appendChild(style);

                // Inline style cleanup
                clonedDoc.querySelectorAll('*').forEach((el: any) => {
                    if ((el.getAttribute('style') || '').includes('okl')) el.removeAttribute('style');
                });
            }
        });

        console.log('Canvas generato con successo');
        const link = document.createElement('a');
        link.download = `${fileName}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
    } catch (error: any) {
        console.error('Error exporting image:', error);
        alert('Errore durante la generazione dell\'immagine.');
    }
};

export const exportAsPDF = async (elementId: string, fileName: string) => {
    const element = document.getElementById(elementId);
    if (!element) {
        alert('Errore: Elemento ricetta non trovato.');
        return;
    }

    console.log('Avvio esportazione PDF per:', elementId);

    try {
        const canvas = await html2canvas(element, {
            useCORS: true,
            scale: 2,
            backgroundColor: '#ffffff',
            logging: false,
            onclone: (clonedDoc) => {
                const clonedContainer = clonedDoc.getElementById(elementId);
                if (clonedContainer) {
                    clonedContainer.querySelectorAll('button, a[role="button"], [role="dialog"], .fixed, .absolute.top-0').forEach(el => el.remove());
                }

                clonedDoc.querySelectorAll('link[rel="stylesheet"], style').forEach(el => el.remove());
                const style = clonedDoc.createElement('style');
                style.textContent = `
                    #${elementId} {
                        background-color: white !important;
                        color: #1a1a1a !important;
                        padding: 40px !important;
                        font-family: sans-serif !important;
                        width: 900px !important;
                    }
                    #${elementId} * {
                        color: #1a1a1a !important;
                        background: transparent !important;
                        visibility: visible !important;
                    }
                    #${elementId} img {
                        width: 100% !important;
                        border-radius: 20px !important;
                        margin-bottom: 30px !important;
                    }
                    #${elementId} h1 { font-size: 42px !important; color: #F97316 !important; margin: 20px 0 !important; }
                    #${elementId} h2 { font-size: 26px !important; color: #F97316 !important; border-bottom: 2px solid #FEF3C7 !important; padding-bottom: 8px !important; margin-top: 40px !important; }
                    #${elementId} .flex { display: flex !important; gap: 20px !important; margin-bottom: 10px !important; }
                    #${elementId} .grid { display: grid !important; grid-template-columns: 1fr 2fr !important; gap: 40px !important; }
                    span { font-weight: 600 !important; }
                    .rounded-full.bg-orange-100 {
                        background-color: #FFEDD5 !important;
                        color: #EA580C !important;
                        width: 32px !important;
                        height: 32px !important;
                        border-radius: 50% !important;
                        display: inline-block !important;
                        text-align: center !important;
                        line-height: 32px !important;
                        margin-right: 15px !important;
                    }
                    li { border-bottom: 1px solid #F3F4F6 !important; padding: 10px 0 !important; list-style: none !important; }
                    p { font-size: 18px !important; line-height: 1.6 !important; }
                `;
                clonedDoc.head.appendChild(style);

                clonedDoc.querySelectorAll('*').forEach((el: any) => {
                    if ((el.getAttribute('style') || '').includes('okl')) el.removeAttribute('style');
                });
            }
        });

        console.log('Canvas generato per PDF');
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'px',
            format: [canvas.width / 2, canvas.height / 2]
        });

        pdf.addImage(imgData, 'PNG', 0, 0, canvas.width / 2, canvas.height / 2);
        pdf.save(`${fileName}.pdf`);
    } catch (error: any) {
        console.error('Error exporting PDF:', error);
        alert('Errore tecnico durante la generazione del PDF.');
    }
};
