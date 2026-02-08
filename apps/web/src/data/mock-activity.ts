export interface ActivityItem {
  id: string;
  type: 'purchase' | 'add' | 'alert';
  icon: string;
  iconBg: string;
  iconColor: string;
  text: string;
  boldText: string;
  time: string;
  price?: string;
  priceChange?: string;
  priceChangeColor?: string;
}

export const mockActivity: ActivityItem[] = [
  {
    id: 'a1',
    type: 'purchase',
    icon: 'shopping_bag',
    iconBg: 'bg-blue-500/20',
    iconColor: 'text-blue-400',
    text: 'Bought',
    boldText: 'Almond Milk',
    time: '2 hours ago',
    price: '$3.99',
    priceChange: '+$0.20 vs avg',
    priceChangeColor: 'text-primary bg-primary/10',
  },
  {
    id: 'a2',
    type: 'add',
    icon: 'add_task',
    iconBg: 'bg-primary/20',
    iconColor: 'text-primary',
    text: 'Added',
    boldText: 'Sourdough Starter',
    time: '5 hours ago',
  },
  {
    id: 'a3',
    type: 'alert',
    icon: 'price_check',
    iconBg: 'bg-yellow-500/20',
    iconColor: 'text-yellow-400',
    text: 'Price Alert:',
    boldText: 'Ribeye Steak',
    time: 'Yesterday',
    price: '$12.99/lb',
    priceChange: '-15% drop',
    priceChangeColor: 'text-danger bg-danger/10',
  },
];
