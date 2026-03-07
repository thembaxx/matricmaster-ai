import os
import re

mapping = {
    'Activity': 'ActivityIcon',
    'AlertCircle': 'WarningCircle',
    'AlertTriangle': 'Warning',
    'Archive': 'Archive',
    'ArrowLeft': 'ArrowLeft',
    'ArrowRight': 'ArrowRight',
    'Award': 'Medal',
    'BarChart3': 'ChartBar',
    'Bell': 'Bell',
    'Book': 'Book',
    'BookOpen': 'BookOpen',
    'Bookmark': 'Bookmark',
    'BookmarkCheck': 'BookmarkSimple',
    'Brain': 'Brain',
    'Calculator': 'Calculator',
    'Calendar': 'Calendar',
    'CalendarDays': 'CalendarBlank',
    'Check': 'Check',
    'CheckCheck': 'Checks',
    'CheckCircle': 'CheckCircle',
    'CheckCircle2': 'CheckCircle',
    'ChevronDown': 'CaretDown',
    'ChevronLeft': 'CaretLeft',
    'ChevronRight': 'CaretRight',
    'ChevronUp': 'CaretUp',
    'Circle': 'Circle',
    'ClipboardList': 'ClipboardText',
    'Clock': 'Clock',
    'Code': 'Code',
    'Copy': 'Copy',
    'Crown': 'Crown',
    'Database': 'Database',
    'Delete': 'Backspace',
    'Download': 'DownloadSimple',
    'DownloadSimple': 'DownloadSimple',
    'Dumbbell': 'Barbell',
    'Edit': 'Pencil',
    'Edit2': 'PencilSimple',
    'Eye': 'Eye',
    'EyeOff': 'EyeSlash',
    'FileText': 'FileText',
    'FileUp': 'FileArrowUp',
    'Filter': 'Faders',
    'Flame': 'Fire',
    'Flask': 'Flask',
    'FlaskConical': 'Flask',
    'FlipHorizontal': 'FlipHorizontal',
    'Gamepad2': 'GameController',
    'Gift': 'Gift',
    'Globe': 'Globe',
    'GraduationCap': 'GraduationCap',
    'GripVertical': 'DotsSixVertical',
    'HelpCircle': 'Question',
    'Highlighter': 'Highlighter',
    'History': 'ClockCounterClockwise',
    'Home': 'House',
    'ImagePlus': 'ImageSquare',
    'Keyboard': 'Keyboard',
    'Key': 'Key',
    'KeyRound': 'Key',
    'Landmark': 'Bank',
    'Languages': 'Translate',
    'Layers': 'Stack',
    'Layout': 'Layout',
    'LayoutGrid': 'Layout',
    'Leaf': 'Leaf',
    'Lightbulb': 'Lightbulb',
    'Loader2': 'CircleNotch',
    'Loader2Icon': 'CircleNotch',
    'Lock': 'Lock',
    'LogOut': 'SignOut',
    'Map': 'MapTrifold',
    'Maximize2': 'CornersOut',
    'Medal': 'Medal',
    'Menu': 'List',
    'MessageCircle': 'ChatCircle',
    'MessageSquare': 'ChatCenteredText',
    'MessageSquarePlus': 'ChatCenteredText',
    'Microscope': 'Microscope',
    'Minimize2': 'CornersIn',
    'Moon': 'Moon',
    'MoreHorizontal': 'DotsThree',
    'MoreVertical': 'DotsThreeVertical',
    'PanelLeft': 'Sidebar',
    'Play': 'Play',
    'Plus': 'Plus',
    'RefreshCw': 'ArrowsClockwise',
    'Reply': 'ArrowBendUpLeft',
    'RotateCcw': 'ArrowCounterClockwise',
    'RotateCw': 'ArrowClockwise',
    'Save': 'FloppyDisk',
    'Search': 'MagnifyingGlass',
    'Send': 'PaperPlaneRight',
    'Settings': 'Gear',
    'Settings2': 'GearSix',
    'Shield': 'Shield',
    'ShieldAlert': 'ShieldWarning',
    'Shuffle': 'Shuffle',
    'Sigma': 'Sigma',
    'SkipForward': 'SkipForward',
    'Smartphone': 'DeviceMobile',
    'Sparkle': 'Sparkle',
    'Sparkles': 'Sparkle',
    'Split': 'SplitVertical',
    'Star': 'Star',
    'StickyNote': 'Note',
    'Sun': 'Sun',
    'Tag': 'Tag',
    'Target': 'Target',
    'Terminal': 'TerminalWindow',
    'ThumbsDown': 'ThumbsDown',
    'ThumbsUp': 'ThumbsUp',
    'Trash': 'Trash',
    'Trash2': 'Trash',
    'TrendingDown': 'TrendDown',
    'TrendUp': 'TrendUp',
    'Trophy': 'Trophy',
    'Type': 'TextT',
    'Undo2': 'ArrowCounterClockwise',
    'Users': 'Users',
    'Wifi': 'WifiHigh',
    'X': 'X',
    'XCircle': 'XCircle',
    'Zap': 'Lightning',
    'ZoomIn': 'MagnifyingGlassPlus',
    'ZoomOut': 'MagnifyingGlassMinus',
}

bold_icons = {'Sparkle', 'Lightning', 'Trophy', 'Medal', 'Fire', 'Target'}

def migrate_file(file_path):
    if 'BottomNavigation.tsx' in file_path:
        return
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    if "from 'lucide-react'" not in content and "from \"lucide-react\"" not in content and "from '@phosphor-icons/react'" not in content and "from \"@phosphor-icons/react\"" not in content:
        return

    # Replace import
    content = content.replace("from 'lucide-react'", "from '@phosphor-icons/react'")
    content = content.replace('from "lucide-react"', 'from "@phosphor-icons/react"')
    
    # Replace LucideIcon type
    content = content.replace('LucideIcon', 'Icon')
    
    # Replace icons in imports and usage
    for lucide, phosphor in mapping.items():
        # Replace in import block
        content = re.sub(fr'import \{{(.*?)\b{lucide}\b(.*?)\}} from \'@phosphor-icons/react\';', 
                         fr"import {{\1{phosphor}\2}} from '@phosphor-icons/react';", content, flags=re.DOTALL)
        content = re.sub(fr'import \{{(.*?)\b{lucide}\b(.*?)\}} from \"@phosphor-icons/react\";', 
                         fr'import {{\1{phosphor}\2}} from "@phosphor-icons/react";', content, flags=re.DOTALL)
        
        # Replace in JSX: <Icon or </Icon
        content = re.sub(fr'<{lucide}\b', f'<{phosphor}', content)
        content = re.sub(fr'</{lucide}>', f'</{phosphor}>', content)

        # Replace in LucideIcon mapping/objects if it's used as a variable but specifically for icons
        # This is riskier, but let's look for common patterns like icon: Icon
        content = re.sub(fr'icon:\s*{lucide}\b', f'icon: {phosphor}', content)
        content = re.sub(fr'Icon:\s*{lucide}\b', f'Icon: {phosphor}', content)
        
    # Add weight="bold" to bold icons in usage
    for icon in bold_icons:
        # Match <Icon ... /> or <Icon> but not already having weight
        # This is a bit tricky with regex, but let's try to find tags
        content = re.sub(fr'<{icon}\b([^>]*?)(?<!weight=[\"\'])(/?>)', fr'<{icon} weight="bold" \1\2', content)

    # Dedup weight="bold" if it was added multiple times
    for icon in bold_icons:
        # Replace multiple weight="bold" with a single one
        content = re.sub(fr'<{icon}(.*?)weight="bold"(\s+weight="bold")+', fr'<{icon}\1weight="bold"', content)

    # Dedup imports in DesktopSidebar
    if 'DesktopSidebar.tsx' in file_path:
        # Remove duplicate imports in the import { ... } block
        match = re.search(r'import \{(.*?)\} from \'@phosphor-icons/react\';', content, re.DOTALL)
        if match:
            imports = [i.strip() for i in match.group(1).split(',')]
            unique_imports = []
            seen = set()
            for i in imports:
                if not i: continue
                # Handle as aliases
                name = i.split(' as ')[0].strip()
                if name not in seen:
                    unique_imports.append(i)
                    seen.add(name)
            
            new_import_block = f"import {{ {', '.join(unique_imports)} }} from '@phosphor-icons/react';"
            content = content.replace(match.group(0), new_import_block)

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

# Get files
files = []
for root, dirs, filenames in os.walk('src'):
    for filename in filenames:
        if filename.endswith('.tsx') or filename.endswith('.ts'):
            files.append(os.path.join(root, filename))

for file in files:
    migrate_file(file)

print(f"Migrated {len(files)} files.")
