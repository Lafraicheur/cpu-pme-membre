import type { Meta, StoryObj } from '@storybook/react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

const meta = {
  title: 'UI/ToggleGroup',
  component: ToggleGroup,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ToggleGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

const BoldIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" />
    <path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" />
  </svg>
);

const ItalicIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="19" y1="4" x2="10" y2="4" />
    <line x1="14" y1="20" x2="5" y2="20" />
    <line x1="15" y1="4" x2="9" y2="20" />
  </svg>
);

const UnderlineIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M6 4v7a6 6 0 0 0 12 0V4" />
    <line x1="4" y1="20" x2="20" y2="20" />
  </svg>
);

export const Single: Story = {
  render: () => (
    <ToggleGroup type="single" defaultValue="bold">
      <ToggleGroupItem value="bold" aria-label="Toggle bold">
        <BoldIcon />
      </ToggleGroupItem>
      <ToggleGroupItem value="italic" aria-label="Toggle italic">
        <ItalicIcon />
      </ToggleGroupItem>
      <ToggleGroupItem value="underline" aria-label="Toggle underline">
        <UnderlineIcon />
      </ToggleGroupItem>
    </ToggleGroup>
  ),
};

export const Multiple: Story = {
  render: () => (
    <ToggleGroup type="multiple" defaultValue={['bold', 'italic']}>
      <ToggleGroupItem value="bold" aria-label="Toggle bold">
        <BoldIcon />
      </ToggleGroupItem>
      <ToggleGroupItem value="italic" aria-label="Toggle italic">
        <ItalicIcon />
      </ToggleGroupItem>
      <ToggleGroupItem value="underline" aria-label="Toggle underline">
        <UnderlineIcon />
      </ToggleGroupItem>
    </ToggleGroup>
  ),
};

export const Outline: Story = {
  render: () => (
    <ToggleGroup type="single" variant="outline">
      <ToggleGroupItem value="bold">
        <BoldIcon />
      </ToggleGroupItem>
      <ToggleGroupItem value="italic">
        <ItalicIcon />
      </ToggleGroupItem>
      <ToggleGroupItem value="underline">
        <UnderlineIcon />
      </ToggleGroupItem>
    </ToggleGroup>
  ),
};

export const WithText: Story = {
  render: () => (
    <ToggleGroup type="single" variant="outline" defaultValue="left">
      <ToggleGroupItem value="left">Gauche</ToggleGroupItem>
      <ToggleGroupItem value="center">Centre</ToggleGroupItem>
      <ToggleGroupItem value="right">Droite</ToggleGroupItem>
    </ToggleGroup>
  ),
};

export const TextAlignment: Story = {
  render: () => (
    <ToggleGroup type="single" variant="outline" defaultValue="left">
      <ToggleGroupItem value="left" aria-label="Align left">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="21" y1="6" x2="3" y2="6" />
          <line x1="15" y1="12" x2="3" y2="12" />
          <line x1="17" y1="18" x2="3" y2="18" />
        </svg>
      </ToggleGroupItem>
      <ToggleGroupItem value="center" aria-label="Align center">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="18" y1="6" x2="6" y2="6" />
          <line x1="21" y1="12" x2="3" y2="12" />
          <line x1="16" y1="18" x2="8" y2="18" />
        </svg>
      </ToggleGroupItem>
      <ToggleGroupItem value="right" aria-label="Align right">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="21" y1="6" x2="3" y2="6" />
          <line x1="21" y1="12" x2="9" y2="12" />
          <line x1="21" y1="18" x2="7" y2="18" />
        </svg>
      </ToggleGroupItem>
      <ToggleGroupItem value="justify" aria-label="Justify">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="21" y1="6" x2="3" y2="6" />
          <line x1="21" y1="12" x2="3" y2="12" />
          <line x1="21" y1="18" x2="3" y2="18" />
        </svg>
      </ToggleGroupItem>
    </ToggleGroup>
  ),
};

export const ViewMode: Story = {
  render: () => (
    <ToggleGroup type="single" variant="outline" defaultValue="grid">
      <ToggleGroupItem value="grid" aria-label="Grid view">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="7" height="7" />
          <rect x="14" y="3" width="7" height="7" />
          <rect x="14" y="14" width="7" height="7" />
          <rect x="3" y="14" width="7" height="7" />
        </svg>
      </ToggleGroupItem>
      <ToggleGroupItem value="list" aria-label="List view">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="8" y1="6" x2="21" y2="6" />
          <line x1="8" y1="12" x2="21" y2="12" />
          <line x1="8" y1="18" x2="21" y2="18" />
          <line x1="3" y1="6" x2="3.01" y2="6" />
          <line x1="3" y1="12" x2="3.01" y2="12" />
          <line x1="3" y1="18" x2="3.01" y2="18" />
        </svg>
      </ToggleGroupItem>
    </ToggleGroup>
  ),
};

export const Disabled: Story = {
  render: () => (
    <ToggleGroup type="single" disabled>
      <ToggleGroupItem value="bold">
        <BoldIcon />
      </ToggleGroupItem>
      <ToggleGroupItem value="italic">
        <ItalicIcon />
      </ToggleGroupItem>
      <ToggleGroupItem value="underline">
        <UnderlineIcon />
      </ToggleGroupItem>
    </ToggleGroup>
  ),
};

export const TimeRange: Story = {
  render: () => (
    <ToggleGroup type="single" variant="outline" defaultValue="7d">
      <ToggleGroupItem value="24h">24h</ToggleGroupItem>
      <ToggleGroupItem value="7d">7 jours</ToggleGroupItem>
      <ToggleGroupItem value="30d">30 jours</ToggleGroupItem>
      <ToggleGroupItem value="1y">1 an</ToggleGroupItem>
    </ToggleGroup>
  ),
};
