import type { Descendant, BaseEditor } from 'slate';
import type { ReactEditor } from 'slate-react';
import type { HistoryEditor } from 'slate-history';
import type { CommandEditor, TextAlign } from './types';

declare module 'slate' {
  export type BlockQuoteElement = {
    type: 'block-quote';
    align?: TextAlign;
    children: Descendant[];
  };

  export type BulletedListElement = {
    type: 'bulleted-list';
    align?: TextAlign;
    children: Descendant[];
  };

  export type NumberedListElement = {
    type: 'numbered-list';
    align?: TextAlign;
    children: Descendant[];
  };

  export type ListItemElement = {
    type: 'list-item';
    align?: TextAlign;
    children: Descendant[];
  };

  export type CheckListItemElement = {
    type: 'check-list-item';
    align?: TextAlign;
    checked: boolean;
    children: Descendant[];
  };

  export type HeadingOneElement = {
    type: 'heading-one';
    align?: TextAlign;
    children: Descendant[];
  };

  export type HeadingTwoElement = {
    type: 'heading-two';
    align?: TextAlign;
    children: Descendant[];
  };

  export type HeadingThreeElement = {
    type: 'heading-three';
    align?: TextAlign;
    children: Descendant[];
  };

  export type HeadingFourElement = {
    type: 'heading-four';
    align?: TextAlign;
    children: Descendant[];
  };

  export type HeadingFiveElement = {
    type: 'heading-five';
    align?: TextAlign;
    children: Descendant[];
  };

  export type HeadingSixElement = {
    type: 'heading-six';
    align?: TextAlign;
    children: Descendant[];
  };

  export type ImageElement = {
    type: 'image';
    source: 'local' | 'remote';
    url: string;
    width?: number;
    height?: number;
    inline?: boolean;
    float?: 'left' | 'right';
    align?: TextAlign;
    children: EmptyText[];
  };

  export type LinkElement = {
    type: 'link';
    url: string;
    children: Descendant[];
  };

  export type ParagraphElement = {
    type: 'paragraph';
    align?: TextAlign;
    lock?: boolean;
    children: Descendant[];
  };

  export type TableElement = {
    type: 'table';
    children: TableRowElement[];
  };

  export type TableRowElement = {
    type: 'table-row';
    children: TableCellElement[];
  };

  export type TableCellElement = {
    type: 'table-cell';
    children: CustomText[];
  };

  export type VideoElement = {
    type: 'video';
    url: string;
    inline?: boolean;
    children: EmptyText[];
  };

  export type AudioElement = {
    type: 'audio';
    url: string;
    inline?: boolean;
    children: EmptyText[];
  };

  export type FormulaElement = {
    type: 'formula';
    latex: string;
    inline?: boolean;
    children: EmptyText[];
  };

  export type AdvancedHighlight = {
    color: string;
    search?: {
      activeColor: string;
      key: string;
      offset: number;
    };
  };

  export type MarkText = {
    bold?: boolean;
    italic?: boolean;
    code?: boolean;
    underline?: boolean;
    linethrough?: boolean;
    superscript?: boolean;
    subscript?: boolean;
    highlight?: boolean | AdvancedHighlight;
    fontsize?: number | string;
    color?: string;
    text: string;
  };

  export type EmptyText = {
    text: string;
  };

  export type CustomEditor = BaseEditor & ReactEditor & HistoryEditor & CommandEditor;

  export type CustomText = MarkText | EmptyText;

  export type CustomElement =
    | BlockQuoteElement
    | BulletedListElement
    | NumberedListElement
    | ListItemElement
    | CheckListItemElement
    | HeadingOneElement
    | HeadingTwoElement
    | HeadingThreeElement
    | HeadingFourElement
    | HeadingFiveElement
    | HeadingSixElement
    | ImageElement
    | LinkElement
    | ParagraphElement
    | TableElement
    | TableRowElement
    | TableCellElement
    | VideoElement
    | AudioElement
    | FormulaElement;

  // Slate custom types
  interface CustomTypes {
    Editor: CustomEditor;
    Text: CustomText;
    Element: CustomElement;
  }
}
