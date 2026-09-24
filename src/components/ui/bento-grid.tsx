"use client";

import { cn } from "@/lib/utils";
import React from "react";

export interface BentoItem {
    title: string;
    description: string;
    icon: React.ReactNode;
    status?: string;
    tags?: string[];
    meta?: string;
    cta?: string;
    colSpan?: number;
    hasPersistentHover?: boolean;
}

interface BentoGridProps {
    items: BentoItem[];
    themeColor: string;
}

export function BentoGrid({ items, themeColor }: BentoGridProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-7xl mx-auto">
            {items.map((item, index) => (
                <div
                    key={index}
                    className={cn(
                        "group relative p-6 md:p-8 rounded-2xl overflow-hidden transition-all duration-500",
                        "border border-white/[0.05] bg-[#050505]",
                        "hover:-translate-y-1 will-change-transform",
                        item.colSpan || "col-span-1",
                        item.colSpan === 2 ? "md:col-span-2" : ""
                    )}
                    style={{
                        boxShadow: `0 0 0 1px rgba(255,255,255,0.02)`,
                    }}
                >
                    {/* Hover Glow Base */}
                    <div
                        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                    >
                        <div 
                            className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[length:4px_4px]" 
                        />
                        <div 
                            className="absolute inset-0 opacity-10"
                            style={{ background: `radial-gradient(800px circle at top left, ${themeColor}, transparent 50%)` }}
                        />
                    </div>

                    <div className="relative flex flex-col space-y-6 h-full z-10">
                        {/* Header: Icon & Tag */}
                        <div className="flex items-start justify-between">
                            <div 
                                className="w-12 h-12 rounded-xl flex items-center justify-center border border-white/5 bg-white/[0.02] shadow-[inset_0_0_12px_rgba(255,255,255,0.02)] transition-all duration-500 group-hover:bg-white/[0.04]"
                                style={{
                                    boxShadow: `inset 0 0 20px ${themeColor}10`
                                }}
                            >
                                {item.icon}
                            </div>
                            {item.status && (
                                <span
                                    className="text-[10px] font-mono tracking-widest px-2.5 py-1 rounded-md border border-white/5 bg-white/[0.02] text-neutral-400 uppercase"
                                    style={{ color: themeColor }}
                                >
                                    {item.status}
                                </span>
                            )}
                        </div>

                        {/* Content Area */}
                        <div className="space-y-3 flex-1">
                            <h3 className="text-xl md:text-2xl font-medium text-white tracking-tight">
                                {item.title}
                            </h3>
                            <p className="text-[15px] text-neutral-400 leading-relaxed font-light">
                                {item.description}
                            </p>
                        </div>

                        {/* Footer: Tags & CTA */}
                        {(item.tags?.length || item.cta) && (
                            <div className="flex items-center justify-between pt-4 mt-auto border-t border-white/[0.04]">
                                {item.tags && item.tags.length > 0 && (
                                    <div className="flex flex-wrap items-center gap-2">
                                        {item.tags.map((tag, i) => (
                                            <span
                                                key={i}
                                                className="px-2.5 py-1 text-[11px] rounded-md font-mono tracking-wider bg-white/[0.03] text-neutral-500"
                                            >
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                )}
                                {item.cta && (
                                    <span 
                                        className="text-[11px] font-mono tracking-widest uppercase opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                        style={{ color: themeColor }}
                                    >
                                        {item.cta}
                                    </span>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Active Accent Border Hover */}
                    <div
                        className="absolute inset-0 -z-10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none border border-transparent"
                        style={{
                            borderColor: themeColor,
                            boxShadow: `inset 0 0 20px ${themeColor}10, 0 0 20px ${themeColor}15`
                        }}
                    />
                </div>
            ))}
        </div>
    );
}
