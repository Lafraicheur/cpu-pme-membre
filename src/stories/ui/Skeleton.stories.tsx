import type { Meta, StoryObj } from '@storybook/react';
import { Skeleton } from '@/components/ui/skeleton';

const meta = {
  title: 'UI/Skeleton',
  component: Skeleton,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Skeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <Skeleton className="w-[250px] h-[20px]" />,
};

export const Circle: Story = {
  render: () => <Skeleton className="h-12 w-12 rounded-full" />,
};

export const ProductCard: Story = {
  render: () => (
    <div className="w-[350px] space-y-4 p-4 border rounded-lg">
      <Skeleton className="h-[200px] w-full rounded-lg" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-[250px]" />
        <Skeleton className="h-4 w-[200px]" />
      </div>
      <div className="flex justify-between">
        <Skeleton className="h-8 w-[100px]" />
        <Skeleton className="h-8 w-[80px]" />
      </div>
    </div>
  ),
};

export const FormationCard: Story = {
  render: () => (
    <div className="w-[400px] space-y-4 p-4 border rounded-lg">
      <div className="flex items-center space-x-4">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-[250px]" />
          <Skeleton className="h-4 w-[200px]" />
        </div>
      </div>
      <Skeleton className="h-[150px] w-full rounded-lg" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-[80%]" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-10 flex-1" />
        <Skeleton className="h-10 w-[100px]" />
      </div>
    </div>
  ),
};

export const TableRows: Story = {
  render: () => (
    <div className="w-[700px] space-y-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
          </div>
          <Skeleton className="h-8 w-[80px]" />
        </div>
      ))}
    </div>
  ),
};

export const ProfileSkeleton: Story = {
  render: () => (
    <div className="w-[500px] space-y-6 p-6 border rounded-lg">
      <div className="flex items-center space-x-4">
        <Skeleton className="h-20 w-20 rounded-full" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-5 w-[200px]" />
          <Skeleton className="h-4 w-[150px]" />
          <Skeleton className="h-3 w-[100px]" />
        </div>
      </div>
      <div className="space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-[90%]" />
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-3 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-3 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-3 w-full" />
        </div>
      </div>
    </div>
  ),
};

export const OrderHistory: Story = {
  render: () => (
    <div className="w-[600px] space-y-4">
      <div className="flex justify-between items-center">
        <Skeleton className="h-6 w-[150px]" />
        <Skeleton className="h-8 w-[100px]" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="border rounded-lg p-4 space-y-3">
            <div className="flex justify-between">
              <Skeleton className="h-5 w-[150px]" />
              <Skeleton className="h-5 w-[80px]" />
            </div>
            <Skeleton className="h-4 w-full" />
            <div className="flex justify-between">
              <Skeleton className="h-4 w-[100px]" />
              <Skeleton className="h-4 w-[120px]" />
            </div>
          </div>
        ))}
      </div>
    </div>
  ),
};

export const Dashboard: Story = {
  render: () => (
    <div className="w-[800px] space-y-6">
      <div className="grid grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="border rounded-lg p-4 space-y-3">
            <Skeleton className="h-4 w-[100px]" />
            <Skeleton className="h-8 w-[120px]" />
            <Skeleton className="h-3 w-[80px]" />
          </div>
        ))}
      </div>
      <div className="border rounded-lg p-6 space-y-4">
        <Skeleton className="h-6 w-[200px]" />
        <Skeleton className="h-[300px] w-full" />
      </div>
    </div>
  ),
};

export const FormList: Story = {
  render: () => (
    <div className="w-[500px] space-y-4">
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-24 w-full" />
      <Skeleton className="h-10 w-full" />
      <div className="flex gap-2">
        <Skeleton className="h-10 flex-1" />
        <Skeleton className="h-10 w-[120px]" />
      </div>
    </div>
  ),
};

export const NotificationList: Story = {
  render: () => (
    <div className="w-[400px] space-y-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex items-start space-x-3 p-3 border rounded-lg">
          <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-3 w-[80%]" />
            <Skeleton className="h-3 w-[60px]" />
          </div>
        </div>
      ))}
    </div>
  ),
};
