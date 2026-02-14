import type { Meta, StoryObj } from '@storybook/react';
import { Input } from '@/components/ui/input';

const meta = {
  title: 'UI/Input',
  component: Input,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: 'select',
      options: ['text', 'email', 'password', 'number', 'tel', 'url', 'search'],
      description: 'Le type d\'input HTML',
    },
    disabled: {
      control: 'boolean',
      description: 'Si l\'input est désactivé',
    },
    placeholder: {
      control: 'text',
      description: 'Le texte du placeholder',
    },
  },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    placeholder: 'Entrez du texte...',
  },
};

export const Email: Story = {
  args: {
    type: 'email',
    placeholder: 'nom@exemple.com',
  },
};

export const Password: Story = {
  args: {
    type: 'password',
    placeholder: 'Mot de passe',
  },
};

export const Disabled: Story = {
  args: {
    placeholder: 'Input désactivé',
    disabled: false,
  },
};

export const WithValue: Story = {
  args: {
    defaultValue: 'Valeur préremplie',
  },
};

export const Number: Story = {
  args: {
    type: 'number',
    placeholder: '0',
  },
};

export const Search: Story = {
  args: {
    type: 'search',
    placeholder: 'Rechercher...',
  },
};

export const FormExample: Story = {
  render: () => (
    <div className="w-[350px] space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Nom de l'entreprise</label>
        <Input placeholder="Ex: CPU-PME" />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Email</label>
        <Input type="email" placeholder="contact@entreprise.com" />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Téléphone</label>
        <Input type="tel" placeholder="+225 XX XX XX XX XX" />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Nombre d'employés</label>
        <Input type="number" placeholder="10" />
      </div>
    </div>
  ),
};

export const WithIcon: Story = {
  render: () => (
    <div className="w-[300px] relative">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
      <Input className="pl-10" placeholder="Rechercher..." />
    </div>
  ),
};
