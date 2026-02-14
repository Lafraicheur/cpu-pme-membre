import type { Meta, StoryObj } from '@storybook/react';
import { Calendar } from '@/components/ui/calendar';
import { useState } from 'react';

const meta = {
  title: 'UI/Calendar',
  component: Calendar,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Calendar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => {
    const [date, setDate] = useState<Date | undefined>(new Date());
    return <Calendar mode="single" selected={date} onSelect={setDate} className="rounded-md border" />;
  },
};

export const FormationDate: Story = {
  render: () => {
    const [date, setDate] = useState<Date | undefined>(new Date());
    return (
      <div className="space-y-4">
        <div>
          <h4 className="font-semibold">Sélectionnez la date de début</h4>
          <p className="text-sm text-muted-foreground">
            Formation: Gestion financière pour PME
          </p>
        </div>
        <Calendar mode="single" selected={date} onSelect={setDate} className="rounded-md border" />
        {date && (
          <p className="text-sm">
            Date sélectionnée: {date.toLocaleDateString('fr-FR')}
          </p>
        )}
      </div>
    );
  },
};

export const DeliveryDate: Story = {
  render: () => {
    const [date, setDate] = useState<Date | undefined>();
    return (
      <div className="space-y-4">
        <div>
          <h4 className="font-semibold">Choisissez une date de livraison</h4>
          <p className="text-sm text-muted-foreground">
            Commande #CMD-2024-1234
          </p>
        </div>
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          className="rounded-md border"
          disabled={(date) => date < new Date()}
        />
      </div>
    );
  },
};

export const MultipleSelection: Story = {
  render: () => {
    const [dates, setDates] = useState<Date[] | undefined>([]);
    return (
      <div className="space-y-4">
        <div>
          <h4 className="font-semibold">Jours de formation disponibles</h4>
          <p className="text-sm text-muted-foreground">
            Sélectionnez plusieurs dates
          </p>
        </div>
        <Calendar mode="multiple" selected={dates} onSelect={setDates} className="rounded-md border" />
      </div>
    );
  },
};

export const RangeSelection: Story = {
  render: () => {
    const [dateRange, setDateRange] = useState<any>();
    return (
      <div className="space-y-4">
        <div>
          <h4 className="font-semibold">Période de rapport</h4>
          <p className="text-sm text-muted-foreground">
            Sélectionnez une période pour générer le rapport
          </p>
        </div>
        <Calendar mode="range" selected={dateRange} onSelect={setDateRange} className="rounded-md border" />
      </div>
    );
  },
};
