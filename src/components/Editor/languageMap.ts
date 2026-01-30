// Language mapping for Monaco Editor
// Maps document formats to Monaco language modes

export type DocumentFormat = 'markdown' | 'xml' | 'text';

export interface LanguageConfig {
  id: string;
  label: string;
  monacoLanguage: string;
  extension: string;
  icon: string;
}

export const languageMap: Record<DocumentFormat, LanguageConfig> = {
  markdown: {
    id: 'markdown',
    label: 'Markdown',
    monacoLanguage: 'markdown',
    extension: '.md',
    icon: 'M',
  },
  xml: {
    id: 'xml',
    label: 'XML',
    monacoLanguage: 'xml',
    extension: '.xml',
    icon: '</>',
  },
  text: {
    id: 'text',
    label: 'Plain Text',
    monacoLanguage: 'plaintext',
    extension: '.txt',
    icon: 'T',
  },
};

export const getLanguageConfig = (format: DocumentFormat): LanguageConfig => {
  return languageMap[format] || languageMap.text;
};

export const formatOptions: DocumentFormat[] = ['markdown', 'xml', 'text'];
