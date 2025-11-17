# Enhanced Markdown Components

This directory contains enhanced markdown components for rendering rich markdown content in the chat interface with improved styling, syntax highlighting, and better user experience.

## Components

### `markdown-component.tsx`
Enhanced markdown components that provide:
- **Syntax highlighting** for code blocks with language detection
- **Copy buttons** for code blocks with visual feedback
- **Enhanced styling** for all markdown elements
- **Responsive design** that works on all screen sizes
- **Dark mode support** with proper theming
- **Accessibility improvements** with proper ARIA labels

### `syntax-highlighter.tsx`
A dedicated syntax highlighter component that:
- Uses Shiki for high-quality syntax highlighting
- Supports multiple programming languages
- Provides fallback for unsupported languages
- Includes line numbers option
- Has built-in copy functionality

### `markdown-demo.tsx`
A comprehensive demo component showcasing all markdown features including:
- Code blocks in various languages
- Tables with enhanced styling
- Blockquotes with icons
- Lists with improved spacing
- Links with external link indicators
- Images with captions

## Features

### Code Blocks
- **Language detection** from markdown code fence
- **Syntax highlighting** with Shiki
- **Copy functionality** with visual feedback
- **Language header** showing the programming language
- **Responsive design** with horizontal scrolling

### Tables
- **Enhanced styling** with proper borders and spacing
- **Responsive design** with horizontal scrolling
- **Header styling** with background colors
- **Proper alignment** support

### Blockquotes
- **Icon integration** with FileText icon
- **Enhanced styling** with left border and background
- **Better typography** with proper spacing

### Links
- **External link indicators** with ExternalLink icon
- **Proper target attributes** for security
- **Hover effects** with color transitions

### Lists
- **Improved spacing** and typography
- **Marker styling** with muted colors
- **Nested list support**

### Headings
- **Proper hierarchy** with scroll margins
- **Enhanced typography** with better font weights
- **Border styling** for main headings

## Usage

### Basic Usage
```tsx
import { MarkdownComponents } from './markdown-component';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

<ReactMarkdown 
  remarkPlugins={[remarkGfm]} 
  components={MarkdownComponents}
>
  {markdownContent}
</ReactMarkdown>
```

### With Syntax Highlighter
```tsx
import { SyntaxHighlighter } from '@/components/ui/syntax-highlighter';

<SyntaxHighlighter 
  language="javascript"
  showLineNumbers={true}
  showCopyButton={true}
>
  {codeContent}
</SyntaxHighlighter>
```

### Demo Page
Visit `/markdown-demo` to see all components in action.

## Styling

The components use Tailwind CSS classes and follow the design system:
- **Colors**: Uses CSS variables for theming
- **Spacing**: Consistent spacing with Tailwind utilities
- **Typography**: Proper font weights and sizes
- **Borders**: Subtle borders with proper radius
- **Shadows**: Minimal shadows for depth

## Accessibility

- **Proper ARIA labels** for interactive elements
- **Keyboard navigation** support
- **Screen reader** friendly
- **Color contrast** compliance
- **Focus indicators** for interactive elements

## Browser Support

- Modern browsers with ES6+ support
- Fallback for older browsers with basic styling
- Progressive enhancement for syntax highlighting

## Dependencies

- `react-markdown`: Core markdown parsing
- `remark-gfm`: GitHub Flavored Markdown support
- `shiki`: Syntax highlighting (optional)
- `lucide-react`: Icons
- `tailwindcss`: Styling

## Customization

You can customize the components by:
1. Modifying the component definitions in `markdown-component.tsx`
2. Adjusting Tailwind classes for styling
3. Adding new language support to the syntax highlighter
4. Extending the component interface for additional props

## Examples

### Code Block
\`\`\`javascript
function hello() {
  console.log('Hello, World!');
}
\`\`\`

### Table
| Column 1 | Column 2 | Column 3 |
|----------|----------|----------|
| Data 1   | Data 2   | Data 3   |

### Blockquote
> This is a blockquote with enhanced styling.

### Links
[External Link](https://example.com)

### Lists
- Item 1
- Item 2
- Item 3

1. First item
2. Second item
3. Third item 