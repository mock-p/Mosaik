import { fn } from '@storybook/test';
import TranslatedTextArea from "@/components/translation/TranslatedTextArea";


export default {
  title: 'Translation/TranslatedTextArea',
  component: TranslatedTextArea,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  args: {
    onChange: fn(),
  },
};

export const Default = {
  args: {
    label: 'Label',
    translatedValueObject: {
      en: 'default value',
      fr: 'valeur par défaut',
    },
    langList: ['en', 'fr', 'es'],
    defaultLang: 'en',
    placeholder: 'Placeholder text',
  },
};
