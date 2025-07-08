import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { MarkdownComponents } from './markdown-component';

const markdownContent = `
# Enhanced Markdown Components Demo

This is a demonstration of the enhanced markdown components with better styling and functionality.

## Code Examples

### JavaScript Code Block
\`\`\`javascript
function greet(name) {
  console.log(\`Hello, \${name}!\`);
  return \`Welcome, \${name}!\`;
}

// Example usage
const message = greet('World');
console.log(message);
\`\`\`

### Python Code Block
\`\`\`python
def fibonacci(n):
    """Calculate the nth Fibonacci number."""
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

# Example usage
for i in range(10):
    print(f"F({i}) = {fibonacci(i)}")
\`\`\`

### TypeScript Code Block
\`\`\`typescript
interface User {
  id: number;
  name: string;
  email: string;
  isActive: boolean;
}

class UserService {
  private users: User[] = [];

  addUser(user: User): void {
    this.users.push(user);
  }

  getUserById(id: number): User | undefined {
    return this.users.find(user => user.id === id);
  }
}
\`\`\`

## Inline Code Examples

You can use \`inline code\` within text, or reference variables like \`const apiKey = process.env.API_KEY\`.

## Lists

### Unordered List
- **Bold item** with emphasis
- *Italic item* for variety
- Regular item with \`inline code\`
- [Link item](https://example.com)

### Ordered List
1. First step in the process
2. Second step with **bold text**
3. Third step with \`code\`
4. Fourth step with [a link](https://example.com)

## Blockquotes

> This is a blockquote with enhanced styling. It includes an icon and better visual hierarchy.
> 
> You can have multiple paragraphs in a blockquote.

## Tables

| Feature | Description | Status |
|---------|-------------|--------|
| Syntax Highlighting | Code blocks with language-specific colors | ✅ Complete |
| Copy Button | One-click code copying | ✅ Complete |
| Responsive Design | Works on all screen sizes | ✅ Complete |
| Dark Mode | Supports light and dark themes | ✅ Complete |
| Tables | Enhanced table styling | ✅ Complete |

## Links and Images

Here's a [link to GitHub](https://github.com) with an external link icon.

![Example Image](https://via.placeholder.com/400x200?text=Example+Image)

## Emphasis and Styling

**Bold text** and *italic text* are supported, as well as ***bold italic*** combinations.

---

## Horizontal Rules

Above this line is a horizontal rule that provides visual separation.

## Mixed Content

Here's a paragraph with **bold text**, *italic text*, \`inline code\`, and a [link](https://example.com).

\`\`\`bash
# Shell command example
npm install @types/react-markdown
npm run dev
\`\`\`

> **Note:** This demo showcases all the enhanced markdown components with improved styling, syntax highlighting, and better user experience.
`;

export const MarkdownDemo: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="prose prose-lg max-w-none">
        <ReactMarkdown 
          remarkPlugins={[remarkGfm]} 
          components={MarkdownComponents}
        >
          {markdownContent}
        </ReactMarkdown>
      </div>
    </div>
  );
};

export default MarkdownDemo; 