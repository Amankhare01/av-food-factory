    "use client";

    import { useState, useEffect, useCallback } from "react";

    const slides = [
    {
        id: 1,
        image:
        "https://images.unsplash.com/photo-1555244162-803834f70033?w=1600&q=80",
        caption: "Artisan Spreads",
        subtitle: "Handcrafted with seasonal ingredients for your finest gatherings",
        tag: "Signature Collection",
    },
    {
        id: 2,
        image:
        "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1600&q=80",
        caption: "Fine Dining, Elevated",
        subtitle: "Restaurant-quality plating brought to your event venue",
        tag: "Premium Experience",
    },
    {
        id: 3,
        image:
        "https://images.unsplash.com/photo-1567521464027-f127ff144326?w=1600&q=80",
        caption: "Canape & Cocktail",
        subtitle: "Elegant bite-sized creations to impress every palate",
        tag: "Cocktail Hour",
    },
    {
        id: 4,
        image:
        "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1600&q=80",
        caption: "Grand Buffet",
        subtitle: "Lavish spreads curated for celebrations at any scale",
        tag: "Buffet Mastery",
    },
    {
        id: 5,
        image:
        "https://images.unsplash.com/photo-1530062845289-9109b2c9c868?w=1600&q=80",
        caption: "The Sweet Finale",
        subtitle: "Dessert tables that turn moments into memories",
        tag: "Pastry & Sweets",
    },
    ];

    export default function HeroSection() {
    const [current, setCurrent] = useState(0);
    const [prev, setPrev] = useState<number | null>(null);
    const [animating, setAnimating] = useState(false);
    const [textVisible, setTextVisible] = useState(true);
    const [progress, setProgress] = useState(0);

    const goTo = useCallback(
        (index: number) => {
        if (animating || index === current) return;
        setTextVisible(false);
        setAnimating(true);
        setPrev(current);
        setTimeout(() => {
            setCurrent(index);
            setProgress(0);
            setTimeout(() => {
            setAnimating(false);
            setPrev(null);
            setTextVisible(true);
            }, 700);
        }, 300);
        },
        [animating, current]
    );

    const next = useCallback(() => {
        goTo((current + 1) % slides.length);
    }, [current, goTo]);

    // Auto-advance
    useEffect(() => {
        const interval = setInterval(() => {
        setProgress((p) => {
            if (p >= 100) {
            next();
            return 0;
            }
            return p + 1;
        });
        }, 55);
        return () => clearInterval(interval);
    }, [next]);

    return (
        <>
        {/* Google Fonts */}

        <section className="relative w-full overflow-hidden bg-[#0d0c0b]" style={{ height: "100svh", minHeight: "600px" }}>

            {/* ── Slide Images ── */}
            {slides.map((slide, i) => (
            <div
                key={slide.id}
                className={`absolute inset-0 ${
                i === current
                    ? "z-10 img-enter"
                    : i === prev
                    ? "z-20 img-exit"
                    : "z-0 opacity-0"
                }`}
            >
                <img
                src={slide.image}
                alt={slide.caption}
                className={`w-full h-full object-cover img-ken ${i !== current ? "opacity-0" : ""}`}
                style={{ filter: "brightness(0.55)" }}
                />
            </div>
            ))}

            {/* ── Gradient overlay ── */}
            <div className="absolute inset-0 z-30 pointer-events-none"
            style={{ background: "linear-gradient(to right, rgba(13,12,11,0.80) 38%, rgba(13,12,11,0.15) 100%)" }} />
            <div className="absolute bottom-0 left-0 right-0 h-40 z-30 pointer-events-none"
            style={{ background: "linear-gradient(to top, rgba(13,12,11,0.9), transparent)" }} />

            {/* ── Decorative vertical rule ── */}
            <div className="absolute left-14 top-0 bottom-0 z-30 hidden lg:block">
            <div className="w-px h-full" style={{ background: "linear-gradient(to bottom, transparent, rgba(212,175,55,0.25) 30%, rgba(212,175,55,0.25) 70%, transparent)" }} />
            </div>

            {/* ── Main Content ── */}
            <div className="relative z-40 h-full flex flex-col justify-center px-8 sm:px-16 lg:px-28 max-w-4xl">

            <div className={textVisible ? "text-enter" : "opacity-0"}>

                {/* Tag */}
                <div className="tag flex items-center gap-3 mb-6">
                <span className="body-font text-xs tracking-[0.25em] uppercase"
                    style={{ color: "#d4af37" }}>
                    {slides[current].tag}
                </span>
                <span className="h-px w-8 block" style={{ background: "#d4af37" }} />
                </div>

                {/* Decorative line */}
                <div className="line mb-5 h-px" style={{ width: "3rem", background: "rgba(212,175,55,0.5)" }} />

                {/* Main title */}
                <h1 className="title hero-font font-light text-white leading-none mb-6"
                style={{ fontSize: "clamp(3rem, 7vw, 6.5rem)", letterSpacing: "-0.01em" }}>
                {slides[current].caption.split(" ").map((word, wi) => (
                    <span key={wi} className={wi % 2 === 1 ? "italic" : ""}>
                    {word}{" "}
                    </span>
                ))}
                </h1>

                {/* Subtitle */}
                <p className="sub body-font font-light text-white/60 mb-10 max-w-md"
                style={{ fontSize: "clamp(0.9rem, 1.5vw, 1.05rem)", lineHeight: 1.75, letterSpacing: "0.03em" }}>
                {slides[current].subtitle}
                </p>

                {/* CTAs */}
                <div className="cta flex flex-wrap items-center gap-5">
                <button
                    className="body-font font-medium text-sm tracking-widest uppercase px-8 py-4 transition-all duration-300 hover:scale-105 hover:shadow-2xl"
                    style={{
                    background: "linear-gradient(135deg, #d4af37, #b8922a)",
                    color: "#0d0c0b",
                    letterSpacing: "0.18em",
                    boxShadow: "0 8px 32px rgba(212,175,55,0.3)",
                    }}>
                    Reserve Your Event
                </button>
                <button
                    className="body-font font-light text-sm tracking-widest uppercase text-white/70 hover:text-white transition-colors duration-300 flex items-center gap-3"
                    style={{ letterSpacing: "0.15em" }}>
                    View Menu
                    <svg width="20" height="10" viewBox="0 0 20 10" fill="none">
                    <path d="M0 5h18M14 1l4 4-4 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </button>
                </div>

            </div>
            </div>

            {/* ── Slide Thumbnails (right side) ── */}
            <div className="absolute right-8 top-1/2 -translate-y-1/2 z-40 hidden lg:flex flex-col gap-3">
            {slides.map((slide, i) => (
                <button
                key={slide.id}
                onClick={() => goTo(i)}
                className="group relative overflow-hidden transition-all duration-500"
                style={{
                    width: i === current ? "72px" : "56px",
                    height: i === current ? "56px" : "42px",
                    outline: i === current ? "2px solid #d4af37" : "2px solid rgba(255,255,255,0.15)",
                    outlineOffset: "2px",
                    transition: "all 0.4s ease",
                }}>
                <img src={slide.image} alt={slide.caption}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    style={{ filter: i === current ? "brightness(1)" : "brightness(0.5)" }} />
                </button>
            ))}
            </div>

            {/* ── Bottom bar ── */}
            <div className="absolute bottom-0 left-0 right-0 z-40 px-8 sm:px-16 lg:px-28 pb-8">
            <div className="flex items-end justify-between">

                {/* Slide counter */}
                <div className="flex items-baseline gap-2 body-font">
                <span className="text-white font-medium" style={{ fontSize: "2rem", lineHeight: 1, color: "#d4af37" }}>
                    {String(current + 1).padStart(2, "0")}
                </span>
                <span className="text-white/30 text-sm">/ {String(slides.length).padStart(2, "0")}</span>
                </div>

                {/* Caption strip */}
                <div className="hidden sm:flex items-center gap-4">
                <span className="body-font text-xs tracking-[0.2em] uppercase text-white/40">
                    {slides[current].caption}
                </span>
                </div>

                {/* Progress dots */}
                <div className="flex items-center gap-2">
                {slides.map((_, i) => (
                    <button key={i} onClick={() => goTo(i)} className="relative h-0.5 rounded-full overflow-hidden transition-all duration-300"
                    style={{ width: i === current ? "2.5rem" : "1.25rem", background: "rgba(255,255,255,0.2)" }}>
                    {i === current && (
                        <div className="absolute inset-0 rounded-full origin-left"
                        style={{ background: "#d4af37", transform: `scaleX(${progress / 100})`, transition: "transform 0.05s linear" }} />
                    )}
                    </button>
                ))}
                </div>

            </div>
            </div>


        </section>
        </>
    );
    }