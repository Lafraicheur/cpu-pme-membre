import type { Meta, StoryObj } from '@storybook/react';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { useState } from 'react';

const meta = {
  title: 'UI/Slider',
  component: Slider,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Slider>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <Slider defaultValue={[50]} max={100} step={1} className="w-[300px]" />,
};

export const WithLabel: Story = {
  render: () => (
    <div className="w-[350px] space-y-4">
      <Label>Volume</Label>
      <Slider defaultValue={[33]} max={100} step={1} />
    </div>
  ),
};

export const WithValue: Story = {
  render: () => {
    const [value, setValue] = useState([50]);
    return (
      <div className="w-[350px] space-y-4">
        <div className="flex justify-between">
          <Label>Budget (FCFA)</Label>
          <span className="text-sm text-muted-foreground">
            {value[0].toLocaleString()} FCFA
          </span>
        </div>
        <Slider value={value} onValueChange={setValue} max={1000000} step={10000} />
      </div>
    );
  },
};

export const Range: Story = {
  render: () => {
    const [value, setValue] = useState([20, 80]);
    return (
      <div className="w-[400px] space-y-4">
        <div className="flex justify-between">
          <Label>Fourchette de prix</Label>
          <span className="text-sm text-muted-foreground">
            {value[0]} - {value[1]} FCFA
          </span>
        </div>
        <Slider value={value} onValueChange={setValue} max={100} step={1} />
      </div>
    );
  },
};

export const Disabled: Story = {
  render: () => <Slider defaultValue={[50]} max={100} step={1} disabled className="w-[300px]" />,
};

export const Steps: Story = {
  render: () => {
    const [value, setValue] = useState([3]);
    const labels = ['Très faible', 'Faible', 'Moyen', 'Élevé', 'Très élevé'];
    return (
      <div className="w-[350px] space-y-4">
        <div className="flex justify-between">
          <Label>Niveau de risque</Label>
          <span className="text-sm text-muted-foreground">{labels[value[0]]}</span>
        </div>
        <Slider value={value} onValueChange={setValue} max={4} step={1} />
      </div>
    );
  },
};

export const FormFilters: Story = {
  render: () => {
    const [budget, setBudget] = useState([500000]);
    const [employees, setEmployees] = useState([50]);
    return (
      <div className="w-[400px] space-y-6 p-4 border rounded-lg">
        <h3 className="font-semibold">Filtres de recherche</h3>
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label>Budget maximum</Label>
              <span className="text-sm text-muted-foreground">
                {budget[0].toLocaleString()} FCFA
              </span>
            </div>
            <Slider value={budget} onValueChange={setBudget} max={5000000} step={100000} />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label>Nombre d'employés</Label>
              <span className="text-sm text-muted-foreground">{employees[0]}</span>
            </div>
            <Slider value={employees} onValueChange={setEmployees} max={500} step={10} />
          </div>
        </div>
      </div>
    );
  },
};
