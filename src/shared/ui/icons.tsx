import {
  Apple,
  Armchair,
  Barcode,
  Bike,
  BookOpen,
  ArrowUp,
  Camera,
  ChevronLeft,
  ChevronRight,
  CircleCheck,
  Clock,
  X,
  Dumbbell,
  Footprints,
  History,
  Info,
  Mic,
  Moon,
  Pencil,
  PersonStanding,
  Plus,
  RotateCcw,
  Scale,
  Search,
  Sparkles,
  Star,
  Sun,
  Sunrise,
  Images,
  Trash2,
  TrendingDown,
  TrendingUp,
  Type,
  TriangleAlert,
  User,
  Utensils,
  WifiOff,
  type LucideIcon,
  type LucideProps,
} from 'lucide-react';

export type IconComponent = (props: LucideProps) => React.ReactElement;

/**
 * Every icon in the app is a Lucide outline glyph, named by what it means
 * rather than what it draws. Swapping the icon set later touches only this file.
 */
function icon(Base: LucideIcon, name: string): IconComponent {
  const Wrapped = ({ strokeWidth = 1.8, ...rest }: LucideProps) => (
    <Base strokeWidth={strokeWidth} {...rest} />
  );
  Wrapped.displayName = name;
  return Wrapped;
}

export const IconDiary = icon(BookOpen, 'IconDiary');
export const IconStar = icon(Star, 'IconStar');
export const IconUser = icon(User, 'IconUser');
export const IconPlus = icon(Plus, 'IconPlus');
export const IconCamera = icon(Camera, 'IconCamera');
export const IconMic = icon(Mic, 'IconMic');
export const IconText = icon(Type, 'IconText');
export const IconPencil = icon(Pencil, 'IconPencil');
export const IconTrash = icon(Trash2, 'IconTrash');
export const IconChevronLeft = icon(ChevronLeft, 'IconChevronLeft');
export const IconChevronRight = icon(ChevronRight, 'IconChevronRight');
export const IconSearch = icon(Search, 'IconSearch');
export const IconRepeat = icon(RotateCcw, 'IconRepeat');
export const IconWarning = icon(TriangleAlert, 'IconWarning');
export const IconOffline = icon(WifiOff, 'IconOffline');
export const IconBarcode = icon(Barcode, 'IconBarcode');
export const IconCoach = icon(Sparkles, 'IconCoach');
export const IconClock = icon(Clock, 'IconClock');
export const IconInfo = icon(Info, 'IconInfo');
export const IconCheck = icon(CircleCheck, 'IconCheck');
export const IconSend = icon(ArrowUp, 'IconSend');
export const IconHistory = icon(History, 'IconHistory');
export const IconLibrary = icon(Images, 'IconLibrary');
export const IconClose = icon(X, 'IconClose');

export const IconBreakfast = icon(Sunrise, 'IconBreakfast');
export const IconLunch = icon(Sun, 'IconLunch');
export const IconDinner = icon(Moon, 'IconDinner');
export const IconSnack = icon(Apple, 'IconSnack');
export const IconMeal = icon(Utensils, 'IconMeal');

export const IconSedentary = icon(Armchair, 'IconSedentary');
export const IconLight = icon(Footprints, 'IconLight');
export const IconModerate = icon(PersonStanding, 'IconModerate');
export const IconHigh = icon(Bike, 'IconHigh');
export const IconAthlete = icon(Dumbbell, 'IconAthlete');

export const IconLose = icon(TrendingDown, 'IconLose');
export const IconMaintain = icon(Scale, 'IconMaintain');
export const IconGain = icon(TrendingUp, 'IconGain');
