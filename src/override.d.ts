import { Descendant, BaseEditor } from 'slate';
import { ReactEditor } from 'slate-react';
import { HistoryEditor } from 'slate-history';
import { CommandEditor } from './utils/withCommand';
import { TextAlign } from './utils/constant';

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
    url: string;
    width?: number;
    height?: number;
    inline?: boolean;
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
    draggable?: boolean;
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

  export type MarkText = {
    bold?: boolean;
    italic?: boolean;
    code?: boolean;
    underline?: boolean;
    linethrough?: boolean;
    superscript?: boolean;
    subscript?: boolean;
    highlight?: boolean | { color: string };
    fontsize?: number | string;
    color?: string;
    text: string;
  };

  export type EmptyText = {
    text: string;
  };

  type CustomEditor = BaseEditor & ReactEditor & HistoryEditor & CommandEditor;

  type CustomText = MarkText | EmptyText;

  type CustomElement =
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

  export type ElementKeys = KeysOfUnion<CustomTypes['Element']>;

  export type MarkKeys = keyof Omit<MarkText, 'text'>;
}
