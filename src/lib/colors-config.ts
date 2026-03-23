export type ColorTheme = {
  bg: string;
  text: string;
  border: string;
  borderThick: string;
  ring: string;
  badge: string;
  icon: string;
  shadow: string;
  gradient: string;
};

export const getColorConfig = (provider: string): ColorTheme => {
  const configs: Record<string, ColorTheme> = {
    mpesa: { 
      bg: "from-rose-50/30 to-rose-100/10", 
      text: "text-rose-600", 
      border: "group-hover:border-rose-200", 
      borderThick: "border-rose-500/30",
      ring: "ring-rose-500/5",
      badge: "bg-rose-50 text-rose-600 border-rose-100",
      icon: "bg-rose-500/10 text-rose-500",
      shadow: "shadow-rose-100/50",
      gradient: "from-rose-600 to-rose-500"
    },
    emola: { 
      bg: "from-orange-50/30 to-orange-100/10", 
      text: "text-orange-600", 
      border: "group-hover:border-orange-200", 
      borderThick: "border-orange-500/30",
      ring: "ring-orange-500/5",
      badge: "bg-orange-50 text-orange-600 border-orange-100",
      icon: "bg-orange-500/10 text-orange-500",
      shadow: "shadow-orange-100/50",
      gradient: "from-orange-600 to-orange-500"
    },
    mkesh: { 
      bg: "from-emerald-50/30 to-emerald-100/10", 
      text: "text-emerald-600", 
      border: "group-hover:border-emerald-200", 
      borderThick: "border-emerald-500/30",
      ring: "ring-emerald-500/5",
      badge: "bg-emerald-50 text-emerald-600 border-emerald-100",
      icon: "bg-emerald-500/10 text-emerald-500",
      shadow: "shadow-emerald-100/50",
      gradient: "from-emerald-600 to-emerald-500"
    },
    bci: { 
      bg: "from-sky-50/30 to-sky-100/10", 
      text: "text-sky-600", 
      border: "group-hover:border-sky-200", 
      borderThick: "border-sky-500/30",
      ring: "ring-sky-500/5",
      badge: "bg-sky-50 text-sky-600 border-sky-100",
      icon: "bg-sky-500/10 text-sky-500",
      shadow: "shadow-sky-100/50",
      gradient: "from-sky-600 to-sky-500"
    },
    bim: { 
      bg: "from-red-50/30 to-red-100/10", 
      text: "text-red-600", 
      border: "group-hover:border-red-200", 
      borderThick: "border-red-500/30",
      ring: "ring-red-500/5",
      badge: "bg-red-50 text-red-600 border-red-100",
      icon: "bg-red-500/10 text-red-500",
      shadow: "shadow-red-100/50",
      gradient: "from-red-600 to-red-500"
    },
    moza: { 
      bg: "from-purple-50/30 to-purple-100/10", 
      text: "text-purple-600", 
      border: "group-hover:border-purple-200", 
      borderThick: "border-purple-500/30",
      ring: "ring-purple-500/5",
      badge: "bg-purple-50 text-purple-600 border-purple-100",
      icon: "bg-purple-500/10 text-purple-500",
      shadow: "shadow-purple-100/50",
      gradient: "from-purple-600 to-purple-500"
    },
    standard: { 
      bg: "from-blue-50/30 to-blue-100/10", 
      text: "text-blue-700", 
      border: "group-hover:border-blue-200", 
      borderThick: "border-blue-500/30",
      ring: "ring-blue-500/5",
      badge: "bg-blue-50 text-blue-700 border-blue-100",
      icon: "bg-blue-500/10 text-blue-600",
      shadow: "shadow-blue-100/50",
      gradient: "from-blue-700 to-blue-600"
    },
    cash: { 
      bg: "from-emerald-50/30 to-emerald-100/10", 
      text: "text-emerald-700", 
      border: "group-hover:border-emerald-200", 
      borderThick: "border-emerald-500/30",
      ring: "ring-emerald-500/5",
      badge: "bg-emerald-50 text-emerald-700 border-emerald-100",
      icon: "bg-emerald-500/10 text-emerald-600",
      shadow: "shadow-emerald-100/50",
      gradient: "from-emerald-600 to-emerald-500"
    }
  };

  return configs[provider] || { 
    bg: "from-slate-50/30 to-slate-100/10", 
    text: "text-slate-600", 
    border: "group-hover:border-slate-200", 
    borderThick: "border-slate-400/20",
    ring: "ring-slate-400/5",
    badge: "bg-slate-50 text-slate-600 border-slate-100",
    icon: "bg-slate-500/10 text-slate-500",
    shadow: "shadow-slate-100/50",
    gradient: "from-slate-700 to-slate-600"
  };
};
