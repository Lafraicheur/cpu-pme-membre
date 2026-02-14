import type { Meta, StoryObj } from '@storybook/react';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

const meta = {
  title: 'UI/Textarea',
  component: Textarea,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Textarea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    placeholder: 'Entrez votre texte...',
  },
};

export const WithValue: Story = {
  args: {
    defaultValue: 'Ceci est un texte prérempli dans le textarea.',
  },
};

export const Disabled: Story = {
  args: {
    placeholder: 'Textarea désactivé',
    disabled: true,
  },
};

export const WithLabel: Story = {
  render: () => (
    <div className="w-[400px] space-y-2">
      <Label htmlFor="message">Message</Label>
      <Textarea id="message" placeholder="Entrez votre message ici..." />
    </div>
  ),
};

export const ContactForm: Story = {
  render: () => (
    <div className="w-[500px] space-y-4">
      <div className="space-y-2">
        <Label htmlFor="description">Description du projet</Label>
        <Textarea
          id="description"
          placeholder="Décrivez votre projet en détail..."
          className="min-h-[120px]"
        />
      </div>
      <p className="text-sm text-muted-foreground">
        Minimum 100 caractères
      </p>
    </div>
  ),
};

export const FeedbackForm: Story = {
  render: () => (
    <div className="w-[500px] space-y-4">
      <div className="space-y-2">
        <Label htmlFor="feedback">
          Commentaire <span className="text-destructive">*</span>
        </Label>
        <Textarea
          id="feedback"
          placeholder="Partagez votre expérience avec la plateforme..."
          className="min-h-[150px]"
        />
      </div>
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>0 / 500 caractères</span>
      </div>
    </div>
  ),
};

export const AppelOffresForm: Story = {
  render: () => (
    <div className="w-[600px] space-y-6">
      <div className="space-y-2">
        <Label htmlFor="requirements">Cahier des charges</Label>
        <Textarea
          id="requirements"
          placeholder="Décrivez les exigences techniques et fonctionnelles..."
          className="min-h-[200px]"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="conditions">Conditions particulières</Label>
        <Textarea
          id="conditions"
          placeholder="Précisez les conditions spécifiques de l'appel d'offres..."
          className="min-h-[100px]"
        />
      </div>
    </div>
  ),
};
