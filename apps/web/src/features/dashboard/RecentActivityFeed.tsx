interface ActivityItem {
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

const placeholderActivity: ActivityItem[] = [
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

export function RecentActivityFeed() {
  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-bold text-lg">Recent Activity</h3>
        <button className="text-text-secondary text-sm hover:text-white transition-colors">View All</button>
      </div>
      <div className="bg-surface-dark rounded-xl border border-border-dark p-1">
        <div className="divide-y divide-border-dark">
          {placeholderActivity.map((item) => (
            <div key={item.id} className="flex items-start gap-4 p-4 hover:bg-accent-green/30 transition-colors rounded-lg">
              <div className={`${item.iconBg} ${item.iconColor} p-2 rounded-lg mt-0.5`}>
                <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
              </div>
              <div className="flex-1">
                <p className="text-sm text-white">
                  {item.text} <span className="font-bold text-white">{item.boldText}</span>
                  {item.type === 'purchase' && ' at Whole Foods'}
                  {item.type === 'add' && " to 'Weekend' list"}
                  {item.type === 'alert' && ' dropped at Costco'}
                </p>
                <div className="flex items-center gap-2 mt-1 text-xs">
                  <span className="text-text-secondary">{item.time}</span>
                  {item.price && (
                    <>
                      <span className="w-1 h-1 rounded-full bg-text-secondary" />
                      <span className="font-mono text-white">{item.price}</span>
                    </>
                  )}
                  {item.priceChange && (
                    <span className={`${item.priceChangeColor} px-1 rounded font-medium`}>
                      {item.priceChange}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
