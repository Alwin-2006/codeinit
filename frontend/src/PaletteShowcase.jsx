import React from 'react';

const PaletteShowcase = () => {
    return (
        <div className="p-8 space-y-12">
            <h2 className="text-3xl font-bold text-center mb-8">Color Palette Exploration</h2>

            {/* Option A: Deep Warmth */}
            <section className="space-y-4">
                <h3 className="text-xl font-semibold">Option A: Deep Warmth (Luxury / Earthy)</h3>
                <p className="text-sm opacity-80">Uses your primary brown with gold/amber accents for a premium feel.</p>
                <div className="p-6 rounded-xl grid grid-cols-1 md:grid-cols-2 gap-6" style={{ background: 'var(--bg-option-a)', color: 'var(--text-option-a)' }}>
                    <div className="space-y-2">
                        <h4 className="text-2xl font-bold">Headline Example</h4>
                        <p>This is body text on the Deep Warmth background. It feels grounded and rich.</p>
                    </div>
                    <div className="flex flex-col gap-3 justify-center items-start">
                        <button className="px-6 py-2 rounded-lg font-semibold transition-colors" style={{ backgroundColor: 'var(--accent-option-a)', color: '#3d2d00' }}>
                            Primary Action
                        </button>
                        <button className="px-6 py-2 rounded-lg font-semibold border transition-colors" style={{ borderColor: 'var(--accent-option-a)', color: 'var(--accent-option-a)' }}>
                            Secondary Action
                        </button>
                    </div>
                </div>
            </section>

            {/* Option B: Modern Dark */}
            <section className="space-y-4">
                <h3 className="text-xl font-semibold">Option B: Modern Dark (Sleek / Technical)</h3>
                <p className="text-sm opacity-80">High contrast dark mode, using your brown as a subtle surface color.</p>
                <div className="p-6 rounded-xl grid grid-cols-1 md:grid-cols-2 gap-6" style={{ background: 'var(--bg-option-b)', color: 'var(--text-option-b)' }}>
                    <div className="space-y-2">
                        <h4 className="text-2xl font-bold" style={{ color: 'var(--accent-option-b)' }}>Headline Example</h4>
                        <p>This background is nearly black, making the content pop. Your brown color is used on cards.</p>
                        <div className="p-3 rounded-lg mt-2" style={{ backgroundColor: '#3d2d00', color: '#ffffff' }}>
                            Surface / Card Element
                        </div>
                    </div>
                    <div className="flex flex-col gap-3 justify-center items-start">
                        <button className="px-6 py-2 rounded-lg font-semibold transition-colors" style={{ backgroundColor: 'var(--accent-option-b)', color: '#ffffff' }}>
                            Primary Action
                        </button>
                        <button className="px-6 py-2 rounded-lg font-semibold border transition-colors" style={{ borderColor: 'var(--accent-option-b)', color: 'var(--accent-option-b)' }}>
                            Secondary Action
                        </button>
                    </div>
                </div>
            </section>

            {/* Option C: High Contrast */}
            <section className="space-y-4">
                <h3 className="text-xl font-semibold">Option C: High Contrast (Vibrant / Bold)</h3>
                <p className="text-sm opacity-80">Deep brown background with a complementary teal/cyan for maximum visibility.</p>
                <div className="p-6 rounded-xl grid grid-cols-1 md:grid-cols-2 gap-6" style={{ background: 'var(--bg-option-c)', color: 'var(--text-option-c)' }}>
                    <div className="space-y-2">
                        <h4 className="text-2xl font-bold">Headline Example</h4>
                        <p>Teal is the direct complement to red-orange/browns, creating high energy.</p>
                    </div>
                    <div className="flex flex-col gap-3 justify-center items-start">
                        <button className="px-6 py-2 rounded-lg font-bold transition-colors shadow-lg" style={{ backgroundColor: 'var(--accent-option-c)', color: '#002222' }}>
                            CTA Button
                        </button>
                        <button className="px-6 py-2 rounded-lg font-bold transition-colors" style={{ backgroundColor: '#f34f29', color: '#ffffff' }}>
                            Brand Color Button
                        </button>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default PaletteShowcase;
