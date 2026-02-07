import React from 'react';

export default function Avatar({ name, email, size = 32, className = "" }) {
    const initials = name
        ? name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)
        : '?';

    // Primary source: unavatar.io (tries GitHub, Gravatar, etc. based on email)
    // Fallback source: ui-avatars.com (initials)
    const fallbackUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'User')}&background=f34f29&color=fff&bold=true&rounded=true&size=${size * 2}`;

    const avatarUrl = email
        ? `https://unavatar.io/github/${email}?fallback=${encodeURIComponent(fallbackUrl)}`
        : fallbackUrl;

    return (
        <div
            className={`relative inline-flex items-center justify-center overflow-hidden bg-[#2a1f00] rounded-full border border-white/10 shadow-inner ${className}`}
            style={{ width: size, height: size }}
        >
            <img
                src={avatarUrl}
                alt={name}
                className="w-full h-full object-cover relative z-10"
                onError={(e) => {
                    e.target.src = fallbackUrl;
                }}
            />
            <span className="absolute text-xs font-bold text-white/40 pointer-events-none">
                {initials}
            </span>
        </div>
    );
}
