import { fn } from '@storybook/test';
import TranslatedInput from "@/components/translation/TranslatedInput";


export default {
  title: 'Translation/TranslatedInput',
  component: TranslatedInput,
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
