// Each icon is imported from its own file: the package barrel pulls in all ~1,900 icons (about 4 MB of JS).
import type { LucideIcon } from 'lucide-react-native';
import Activity from 'lucide-react-native/icons/activity';
import ArrowLeft from 'lucide-react-native/icons/arrow-left';
import ArrowRight from 'lucide-react-native/icons/arrow-right';
import AudioWaveform from 'lucide-react-native/icons/audio-waveform';
import Calendar from 'lucide-react-native/icons/calendar';
import Check from 'lucide-react-native/icons/check';
import ChevronRight from 'lucide-react-native/icons/chevron-right';
import CircleX from 'lucide-react-native/icons/circle-x';
import Clock from 'lucide-react-native/icons/clock';
import Database from 'lucide-react-native/icons/database';
import DollarSign from 'lucide-react-native/icons/dollar-sign';
import Ellipsis from 'lucide-react-native/icons/ellipsis';
import FileText from 'lucide-react-native/icons/file-text';
import Frown from 'lucide-react-native/icons/face-slightly-frowning';
import Heart from 'lucide-react-native/icons/heart';
import Lightbulb from 'lucide-react-native/icons/lightbulb';
import LogOut from 'lucide-react-native/icons/log-out';
import Meh from 'lucide-react-native/icons/face-neutral';
import MessageCircle from 'lucide-react-native/icons/message-circle';
import Mic from 'lucide-react-native/icons/mic';
import Pause from 'lucide-react-native/icons/pause';
import Palette from 'lucide-react-native/icons/palette';
import Pencil from 'lucide-react-native/icons/pencil';
import Plane from 'lucide-react-native/icons/plane';
import Play from 'lucide-react-native/icons/play';
import Search from 'lucide-react-native/icons/search';
import Settings from 'lucide-react-native/icons/settings';
import Share2 from 'lucide-react-native/icons/share-2';
import ShoppingCart from 'lucide-react-native/icons/shopping-cart';
import Smile from 'lucide-react-native/icons/face-slightly-smiling';
import Tag from 'lucide-react-native/icons/tag';
import Trash2 from 'lucide-react-native/icons/trash';
import TrendingUp from 'lucide-react-native/icons/trending-up';
import User from 'lucide-react-native/icons/user';
import Users from 'lucide-react-native/icons/users';
import X from 'lucide-react-native/icons/x';

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
