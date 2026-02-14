import type { Meta, StoryObj } from '@storybook/react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const meta = {
  title: 'UI/Avatar',
  component: Avatar,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Avatar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Avatar>
      <AvatarFallback>PI</AvatarFallback>
    </Avatar>
  ),
};

export const WithImage: Story = {
  render: () => (
    <Avatar>
      <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
      <AvatarFallback>CN</AvatarFallback>
    </Avatar>
  ),
};

export const UserProfile: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Avatar>
        <AvatarFallback>PI</AvatarFallback>
      </Avatar>
      <div>
        <p className="text-sm font-medium">PME Ivoirienne</p>
        <p className="text-xs text-muted-foreground">@pme_ivoirienne</p>
      </div>
    </div>
  ),
};

export const MembersList: Story = {
  render: () => (
    <div className="space-y-3 w-[300px]">
      {[
        { name: 'Amadou Koné', role: 'Directeur Général', initials: 'AK' },
        { name: 'Fatou Traoré', role: 'Chef Comptable', initials: 'FT' },
        { name: 'Yao N\'Guessan', role: 'Responsable Marketing', initials: 'YN' },
      ].map((member, i) => (
        <div key={i} className="flex items-center gap-3">
          <Avatar>
            <AvatarFallback>{member.initials}</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium">{member.name}</p>
            <p className="text-xs text-muted-foreground">{member.role}</p>
          </div>
        </div>
      ))}
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="flex items-end gap-4">
      <Avatar className="h-8 w-8">
        <AvatarFallback className="text-xs">SM</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarFallback>MD</AvatarFallback>
      </Avatar>
      <Avatar className="h-14 w-14">
        <AvatarFallback className="text-lg">LG</AvatarFallback>
      </Avatar>
      <Avatar className="h-20 w-20">
        <AvatarFallback className="text-2xl">XL</AvatarFallback>
      </Avatar>
    </div>
  ),
};

export const VendorInfo: Story = {
  render: () => (
    <div className="flex items-center gap-4 p-4 rounded-lg border w-[400px]">
      <Avatar className="h-16 w-16">
        <AvatarFallback className="text-lg">PI</AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <h4 className="font-semibold">PME Ivoirienne SARL</h4>
        <p className="text-sm text-muted-foreground">Producteur de café et cacao</p>
        <div className="flex gap-3 mt-2 text-xs">
          <span className="font-medium">156 produits</span>
          <span className="text-muted-foreground">•</span>
          <span className="font-medium">4.8/5</span>
        </div>
      </div>
    </div>
  ),
};

export const CommentSection: Story = {
  render: () => (
    <div className="space-y-4 w-[500px]">
      {[
        {
          name: 'Kouassi Jean',
          initials: 'KJ',
          comment: 'Excellent produit! Livraison rapide et qualité au rendez-vous.',
          time: 'Il y a 2 heures',
        },
        {
          name: 'Aya Sanogo',
          initials: 'AS',
          comment: 'Très satisfaite de mon achat. Je recommande ce vendeur.',
          time: 'Il y a 1 jour',
        },
      ].map((review, i) => (
        <div key={i} className="flex gap-3">
          <Avatar>
            <AvatarFallback>{review.initials}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium">{review.name}</p>
              <p className="text-xs text-muted-foreground">{review.time}</p>
            </div>
            <p className="text-sm text-muted-foreground mt-1">{review.comment}</p>
          </div>
        </div>
      ))}
    </div>
  ),
};

export const AvatarGroup: Story = {
  render: () => (
    <div className="flex -space-x-2">
      <Avatar className="border-2 border-background">
        <AvatarFallback>PI</AvatarFallback>
      </Avatar>
      <Avatar className="border-2 border-background">
        <AvatarFallback>FT</AvatarFallback>
      </Avatar>
      <Avatar className="border-2 border-background">
        <AvatarFallback>AK</AvatarFallback>
      </Avatar>
      <Avatar className="border-2 border-background">
        <AvatarFallback className="text-xs">+5</AvatarFallback>
      </Avatar>
    </div>
  ),
};
