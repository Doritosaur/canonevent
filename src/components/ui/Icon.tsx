import {
  Activity,
  ArrowLeft,
  ArrowRight,
  AudioWaveform,
  Calendar,
  Check,
  ChevronRight,
  CircleX,
  Clock,
  Database,
  DollarSign,
  Ellipsis,
  FileText,
  Frown,
  Heart,
  Lightbulb,
  LogOut,
  type LucideIcon,
  Meh,
  MessageCircle,
  Mic,
  Pause,
  Palette,
  Pencil,
  Plane,
  Play,
  Search,
  Settings,
  Share2,
  ShoppingCart,
  Smile,
  Tag,
  Trash2,
  TrendingUp,
  User,
  Users,
  X,
} from 'lucide-react-native';

/** The single icon set for the app. Add a name here to make it available everywhere. */
const ICONS = {
  back: ArrowLeft,
  'arrow-right': ArrowRight,
  close: X,
  'close-circle': CircleX,
  settings: Settings,
  more: Ellipsis,
  search: Search,
  chevron: ChevronRight,
  check: Check,
  play: Play,
  pause: Pause,
  calendar: Calendar,
  edit: Pencil,
  mic: Mic,
  share: Share2,
  trash: Trash2,
  sad: Frown,
  neutral: Meh,
  happy: Smile,
  dollar: DollarSign,
  chat: MessageCircle,
  heart: Heart,
  plane: Plane,
  fitness: Activity,
  logout: LogOut,
  palette: Palette,
  pulse: AudioWaveform,
  document: FileText,
  bulb: Lightbulb,
  tag: Tag,
  database: Database,
  cart: ShoppingCart,
  clock: Clock,
  trend: TrendingUp,
  people: Users,
  person: User,
} as const satisfies Record<string, LucideIcon>;

export type IconName = keyof typeof ICONS;

export type IconProps = {
  name: IconName;
  size?: number;
  color: string;
  /** Solid shapes, e.g. a play triangle. */
  filled?: boolean;
  strokeWidth?: number;
};

/** Decorative by default; the control that wraps it provides the accessible label. */
export function Icon({ name, size = 22, color, filled = false, strokeWidth = 2 }: IconProps) {
  const Glyph = ICONS[name];
  return <Glyph size={size} color={color} fill={filled ? color : 'none'} strokeWidth={strokeWidth} />;
}

export const ICON_NAMES = Object.keys(ICONS) as IconName[];
