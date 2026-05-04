<script setup lang="ts">
import {
  Gauge,
  Gamepad2,
  Settings,
  Wrench,
  LogOut,
  Menu,
  Search,
  X,
  XCircle,
  Check,
  CheckCircle2,
  Pencil,
  Trash2,
  Link,
  Unlink,
  Plus,
  ArrowLeft,
  ChevronUp,
  ChevronDown,
  ChevronRight,
  Save,
  RotateCcw,
  ExternalLink,
  AlertCircle,
  AlertTriangle,
  Info,
  HelpCircle,
  Power,
  Lock,
  Key,
  Copy,
  Monitor,
  Smartphone,
  Laptop,
  Tv,
  Disc,
  Github,
  MessageCircle,
  FileText,
  Image as ImageLucide,
  Lightbulb,
  Compass,
  CircleSlash,
  Play,
  Pause,
  Square,
  Maximize2,
  Minimize2,
  Volume2,
  SlidersHorizontal,
  Users,
  UserCog,
  UserX,
  Loader2,
  Cog,
  LayoutGrid,
  Grid3X3,
  Radio,
  Wifi,
  Plug,
  Bug,
  FileArchive,
  Download,
  GitBranch,
  Hash,
  FlaskConical,
  List,
  Zap,
  Timer,
  MousePointerClick,
  ShieldCheck,
  Cpu,
  Stethoscope,
  Sun,
  Moon,
  SunMoon,
  type LucideIcon,
} from 'lucide-vue-next';

const iconMap: Record<string, LucideIcon> = {
  // Navigation
  'fa-gauge': Gauge,
  'fa-gamepad': Gamepad2,
  'fa-sliders-h': SlidersHorizontal,
  'fa-wrench': Wrench,
  'fa-sign-out-alt': LogOut,
  'fa-bars': Menu,
  'fa-users': Users,
  'fa-users-cog': UserCog,
  'fa-user-slash': UserX,
  'fa-user-cog': UserCog,

  // Actions
  'fa-search': Search,
  'fa-magnifying-glass': Search,
  'fa-times': X,
  'fa-xmark': X,
  'fa-check': Check,
  'fa-edit': Pencil,
  'fa-pencil': Pencil,
  'fa-trash': Trash2,
  'fa-link': Link,
  'fa-link-slash': Unlink,
  'fa-circle-notch': Loader2,
  'fa-spinner': Loader2,
  'fa-cog': Cog,
  'fa-cogs': Cog,
  'fa-gear': Cog,
  'fa-gears': Cog,
  'fa-settings': Settings,
  'fa-play': Play,
  'fa-play-circle': Play,
  'fa-pause': Pause,
  'fa-stop': Square,
  'fa-power-off': Power,
  'fa-sliders': SlidersHorizontal,
  'fa-th': LayoutGrid,
  'fa-table-cells-large': Grid3X3,
  'fa-satellite-dish': Radio,
  'fa-wifi': Wifi,
  'fa-plug': Plug,
  'fa-bug': Bug,
  'fa-download': Download,
  'fa-file-zipper': FileArchive,
  'fa-file-lines': FileText,
  'fa-file-alt': FileText,
  'fa-file-text': FileText,
  'fa-rotate-right': RotateCcw,
  'fa-rotate': RotateCcw,
  'fa-sync': RotateCcw,
  'fa-code-branch': GitBranch,
  'fa-hashtag': Hash,
  'fa-flask': FlaskConical,
  'fa-bars-staggered': List,
  'fa-list': List,
  'fa-bolt': Zap,
  'fa-plus': Plus,
  'fa-arrow-left': ArrowLeft,
  'fa-chevron-up': ChevronUp,
  'fa-chevron-down': ChevronDown,
  'fa-chevron-right': ChevronRight,
  'fa-save': Save,
  'fa-external-link-alt': ExternalLink,
  'fa-copy': Copy,
  'fa-key': Key,
  'fa-lock': Lock,
  'fa-image': ImageLucide,
  'fa-lightbulb': Lightbulb,
  'fa-stethoscope': Stethoscope,
  'fa-stopwatch': Timer,
  'fa-stopwatch-20': Timer,
  'fa-hand-point-right': MousePointerClick,
  'fa-nvidia': Cpu,
  'fa-desktop': Monitor,
  'fa-display': Monitor,
  'fa-monitor': Monitor,
  'fa-sun': Sun,
  'fa-moon': Moon,
  'fa-circle-half-stroke': SunMoon,

  // Status/Alerts
  'fa-circle-exclamation': AlertCircle,
  'fa-exclamation-circle': AlertCircle,
  'fa-exclamation': AlertCircle,
  'fa-triangle-exclamation': AlertTriangle,
  'fa-exclamation-triangle': AlertTriangle,
  'fa-circle-info': Info,
  'fa-info-circle': Info,
  'fa-info': Info,
  'fa-circle-check': CheckCircle2,
  'fa-check-circle': CheckCircle2,
  'fa-times-circle': XCircle,
  'fa-question-circle': HelpCircle,
  'fa-shield-heart': ShieldCheck,
  'fa-shield-halved': ShieldCheck,

  // Devices/Media
  'fa-mobile': Smartphone,
  'fa-mobile-alt': Smartphone,
  'fa-laptop': Laptop,
  'fa-tv': Tv,
  'fa-disc': Disc,
  'fa-compact-disc': Disc,
  'fa-expand': Maximize2,
  'fa-compress': Minimize2,
  'fa-volume-up': Volume2,
  'fa-volume': Volume2,

  // Brands
  'fa-github': Github,
  'fa-discord': MessageCircle,

  // Misc
  'fa-compass': Compass,
  'fa-ban': CircleSlash,
  'fa-window-restore': Monitor,
  'fa-window-maximize': Maximize2,
};

interface Props {
  name: string;
  size?: number;
  strokeWidth?: number;
  class?: string;
}

const props = withDefaults(defineProps<Props>(), {
  size: 16,
  strokeWidth: 1.5,
  class: '',
});

const icon = computed(() => iconMap[props.name] || null);

// Warn if icon not found (development only)
if (import.meta.env.DEV && !iconMap[props.name]) {
  console.warn(`[LucideIcon] No mapping found for: ${props.name}`);
}
</script>

<script lang="ts">
import { computed } from 'vue';
</script>

<template>
  <component
    :is="icon"
    v-if="icon"
    :size="size"
    :stroke-width="strokeWidth"
    :class="class"
  />
  <span v-else class="inline-block w-4 h-4" :class="class">{{ name }}</span>
</template>
