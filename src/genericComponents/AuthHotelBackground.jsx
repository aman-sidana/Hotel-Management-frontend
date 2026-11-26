import React, { useEffect, useState } from 'react';

export const HOTEL_BACKGROUNDS = [
    {
        url: "/luxury_hotel_banner.jpg",
        title: "The Grand Horizon Luxury Resort & Spa",
        location: "Bali, Indonesia"
    },
    {
        url: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=2070&q=80",
        title: "Palais Grand Royale & Palace Suites",
        location: "Paris, France"
    },
    {
        url: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=2080&q=80",
        title: "Azure Cliffside Marina & Villas",
        location: "Santorini, Greece"
    },
    {
        url: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=2070&q=80",
        title: "Aura Oceanfront Lagoon Sanctuary",
        location: "Maldives"
    },
    {
        url: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=2070&q=80",
        title: "The Skyview Luxury Penthouse Collection",
        location: "Dubai, UAE"
    },
    {
        url: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=2070&q=80",
        title: "Sunset Palms Beachfront Retreat",
        location: "Phuket, Thailand"
    }
];

function AuthHotelBackground({
    currentIndex: externalIndex,
    onIndexChange,
    overlayIntensity = "medium" // "light", "medium", "heavy"
}) {
    const [internalIndex, setInternalIndex] = useState(0);

    const isControlled = externalIndex !== undefined;
    const currentIndex = isControlled ? externalIndex : internalIndex;

    const setIndex = (nextIndex) => {
        const resolved = (nextIndex + HOTEL_BACKGROUNDS.length) % HOTEL_BACKGROUNDS.length;
        if (!isControlled) {
            setInternalIndex(resolved);
        }
        if (onIndexChange) {
            onIndexChange(resolved);
        }
    };

    useEffect(() => {
        const timer = setInterval(() => {
            setIndex(currentIndex + 1);
        }, 5500);

        return () => clearInterval(timer);
    }, [currentIndex]);

    const overlayClasses = {
        light: "bg-slate-950/50 backdrop-blur-[1px]",
        medium: "bg-slate-950/65 backdrop-blur-[2px]",
        heavy: "bg-slate-950/75 backdrop-blur-[4px]"
    }[overlayIntensity] || "bg-slate-950/65 backdrop-blur-[2px]";

    return (
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none select-none">
            {/* Hotel Background Image Slides */}
            {HOTEL_BACKGROUNDS.map((hotel, index) => {
                const isActive = index === currentIndex;
                return (
                    <div
                        key={index}
                        className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                            isActive ? "opacity-100 z-[1]" : "opacity-0 z-0"
                        }`}
                    >
                        <img
                            src={hotel.url}
                            alt={hotel.title}
                            className={`w-full h-full object-cover object-center transition-transform duration-[7000ms] ease-out ${
                                isActive ? "scale-105" : "scale-100"
                            }`}
                        />
                    </div>
                );
            })}

            {/* Dark Tint Overlay with subtle gradient for optimal form readability */}
            <div className={`absolute inset-0 z-[2] ${overlayClasses}`} />
            <div className="absolute inset-0 z-[2] bg-gradient-to-t from-slate-950 via-slate-950/30 to-slate-950/60" />
            <div className="absolute inset-0 z-[2] bg-gradient-to-r from-slate-950/40 via-transparent to-slate-950/40" />

            {/* Ambient Lighting Orbs blended on top of hotel background */}
            <div className="gradient-orb orb-1 z-[3] opacity-20" />
            <div className="gradient-orb orb-2 z-[3] opacity-20" />
            <div className="gradient-orb orb-3 z-[3] opacity-15" />
        </div>
    );
}

export default AuthHotelBackground;
