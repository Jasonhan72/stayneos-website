"use client";

import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/context/UserContext";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { useI18n } from "@/lib/i18n";
import Button from "@/components/ui/Button";

interface WelcomeBannerProps {
  className?: string;
}

export function WelcomeBanner({ className }: WelcomeBannerProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { t } = useI18n();

  if (isLoading || !isAuthenticated || !user) {
    return null;
  }

  const firstName = user.name?.split(" ").filter(n => n)[0] || user.email?.split("@")[0] || t("common.there");

  return (
    <section 
      className={cn(
        "relative overflow-hidden bg-gradient-to-br from-primary via-primary-800 to-primary-900",
        className
      )}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          {/* Left Content */}
          <div className="flex items-start md:items-center gap-4 md:gap-6">
            <div className="shrink-0">
              <UserAvatar
                name={user.name}
                image={user.image}
                size="xl"
                className="ring-4 ring-white/20"
              />
            </div>
            
            <div className="text-white">
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="w-4 h-4 text-accent" />
                <span className="text-sm text-white/80">{t("welcome.back", "Welcome back")}</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold mb-2">
                {t("welcome.greeting", { name: firstName })}
              </h1>
              <p className="text-white/80 text-sm md:text-base max-w-md">
                {t("welcome.tagline", "Feel at home, free to roam")}
                <span className="hidden md:inline"> — 体验灵活的租住方式，找到属于您的理想居所</span>
              </p>
            </div>
          </div>

          {/* Right Content - CTA */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Link href="/dashboard">
              <Button 
                variant="outline" 
                size="lg"
                className="border-white/30 text-white hover:bg-white/10 hover:border-white/50"
              >
                {t("welcome.dashboard", "Dashboard")}
              </Button>
            </Link>
            <Link href="/properties">
              <Button 
                variant="accent" 
                size="lg"
                className="group"
              >
                {t("welcome.findHome", "Find your new home")}
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mt-8 pt-8 border-t border-white/10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
            <QuickStat label={t("welcome.stats.activeBookings", "Active bookings")} value="0" />
            <QuickStat label={t("welcome.stats.savedHomes", "Saved homes")} value="0" />
            <QuickStat label={t("welcome.stats.pastStays", "Past stays")} value="0" />
            <QuickStat 
              label={t("welcome.stats.membership", "Membership")} 
              value={t("welcome.stats.standard", "Standard")} 
              highlight 
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function QuickStat({ 
  label, 
  value, 
  highlight = false 
}: { 
  label: string; 
  value: string; 
  highlight?: boolean;
}) {
  return (
    <div className="text-center md:text-left">
      <p className={cn(
        "text-2xl md:text-3xl font-bold",
        highlight ? "text-accent" : "text-white"
      )}>
        {value}
      </p>
      <p className="text-sm text-white/60 mt-1">{label}</p>
    </div>
  );
}

export default WelcomeBanner;
