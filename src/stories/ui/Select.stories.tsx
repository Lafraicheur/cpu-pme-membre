import type { Meta, StoryObj } from '@storybook/react';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';

const meta = {
  title: 'UI/Select',
  component: Select,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Select>
      <SelectTrigger className="w-[280px]">
        <SelectValue placeholder="Sélectionnez une option" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="option1">Option 1</SelectItem>
        <SelectItem value="option2">Option 2</SelectItem>
        <SelectItem value="option3">Option 3</SelectItem>
      </SelectContent>
    </Select>
  ),
};

export const WithLabel: Story = {
  render: () => (
    <div className="space-y-2">
      <Label>Secteur d'activité</Label>
      <Select>
        <SelectTrigger className="w-[280px]">
          <SelectValue placeholder="Choisir un secteur" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="agriculture">Agriculture</SelectItem>
          <SelectItem value="industrie">Industrie</SelectItem>
          <SelectItem value="commerce">Commerce</SelectItem>
          <SelectItem value="services">Services</SelectItem>
        </SelectContent>
      </Select>
    </div>
  ),
};

export const WithGroups: Story = {
  render: () => (
    <Select>
      <SelectTrigger className="w-[280px]">
        <SelectValue placeholder="Sélectionnez un secteur" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Secteur Primaire</SelectLabel>
          <SelectItem value="agriculture">Agriculture</SelectItem>
          <SelectItem value="elevage">Élevage</SelectItem>
          <SelectItem value="peche">Pêche</SelectItem>
        </SelectGroup>
        <SelectGroup>
          <SelectLabel>Secteur Secondaire</SelectLabel>
          <SelectItem value="industrie">Industrie</SelectItem>
          <SelectItem value="btp">BTP</SelectItem>
          <SelectItem value="energie">Énergie</SelectItem>
        </SelectGroup>
        <SelectGroup>
          <SelectLabel>Secteur Tertiaire</SelectLabel>
          <SelectItem value="commerce">Commerce</SelectItem>
          <SelectItem value="services">Services</SelectItem>
          <SelectItem value="transport">Transport</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  ),
};

export const KYCLevel: Story = {
  render: () => (
    <div className="w-[350px] space-y-2">
      <Label>Niveau KYC requis</Label>
      <Select defaultValue="standard">
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="minimum">KYC Minimum</SelectItem>
          <SelectItem value="standard">KYC Standard</SelectItem>
          <SelectItem value="renforce">KYC Renforcé</SelectItem>
        </SelectContent>
      </Select>
    </div>
  ),
};

export const FormExample: Story = {
  render: () => (
    <div className="w-[400px] space-y-4">
      <div className="space-y-2">
        <Label>Région</Label>
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Sélectionnez votre région" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="abidjan">Abidjan</SelectItem>
            <SelectItem value="yamoussoukro">Yamoussoukro</SelectItem>
            <SelectItem value="bouake">Bouaké</SelectItem>
            <SelectItem value="san-pedro">San-Pédro</SelectItem>
            <SelectItem value="korhogo">Korhogo</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Taille de l'entreprise</Label>
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Nombre d'employés" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1-10">1-10 employés</SelectItem>
            <SelectItem value="11-50">11-50 employés</SelectItem>
            <SelectItem value="51-200">51-200 employés</SelectItem>
            <SelectItem value="201+">201+ employés</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  ),
};

export const Disabled: Story = {
  render: () => (
    <Select disabled>
      <SelectTrigger className="w-[280px]">
        <SelectValue placeholder="Select désactivé" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="option1">Option 1</SelectItem>
      </SelectContent>
    </Select>
  ),
};
