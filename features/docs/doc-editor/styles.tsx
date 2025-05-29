import './styles.css';

export const getEditorClassName = (readonly: boolean): string => {
  return `editor-container ${readonly ? 'readonly' : ''}`.trim();
};
