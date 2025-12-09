"use client";

import { redirect } from "next/navigation";
import { Footer } from "@paylo/ui/Footer";
import { AppbarClient } from "./AppbarClient";
import { FeatureCard } from "@paylo/ui/FeatureCard";
import { ArrowIcon, Shield, Wallet, Zap } from "@paylo/ui/Icons";

export default function LandingPage() {
  const features = [
    {
      icon: <Wallet />,
      title: "Easy Transfers",
      description: "Send money with just a few taps",
    },
    {
      icon: <Shield />,
      title: "Bank-Level Security",
      description: "Your money is protected by advanced encryption",
    },
    {
      icon: <Zap />,
      title: "Instant Processing",
      description: "Lightning-fast transaction processing",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 text-black">
      <AppbarClient />
      <main className="flex-1 flex items-center justify-center px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-12">
            <h2 className="text-5xl md:text-8xl font-bold mb-6 leading-tight text-[#001c64]">
              Pay easy, fast,
              <br />
              <span className="cursor-pointer text-blue-600">and secure</span>
            </h2>

            <p className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto leading-relaxed text-gray-900 text-opacity-20">
              Experience the future of digital payments — fast, secure, and
              effortless transactions designed for the way you live.
            </p>

            <button
              className="inline-flex items-center gap-3 px-8 py-4 rounded-full text-lg font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg cursor-pointer bg-[#001c64] text-white hover:bg-blue-600"
              onClick={() => redirect("/api/auth/signin")}
            >
              Get Started Today <ArrowIcon />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            {features.map((item, index) => (
              <FeatureCard
                key={index}
                icon={item.icon}
                title={item.title}
                description={item.description}
              />
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
