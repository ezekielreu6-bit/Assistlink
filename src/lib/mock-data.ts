export const mockChats = [
  {
    id: '1',
    customerName: 'Sarah Jenkins',
    lastMessage: 'I have a question about my recent order #4421.',
    time: '2m ago',
    status: 'active',
    avatar: 'https://picsum.photos/seed/sarah/40/40',
    messages: [
      { role: 'user', content: 'Hello, I need help with an order.' },
      { role: 'agent', content: 'Hi Sarah! I can certainly help with that. Could you provide your order number?' },
      { role: 'user', content: 'It is #4421.' },
      { role: 'user', content: 'I have a question about my recent order #4421.' }
    ]
  },
  {
    id: '2',
    customerName: 'Marcus Chen',
    lastMessage: 'When will the new summer collection be available?',
    time: '15m ago',
    status: 'active',
    avatar: 'https://picsum.photos/seed/marcus/40/40',
    messages: [
      { role: 'user', content: 'Hi there!' },
      { role: 'agent', content: 'Hello Marcus! How can I help you today?' },
      { role: 'user', content: 'When will the new summer collection be available?' }
    ]
  },
  {
    id: '3',
    customerName: 'Elena Rodriguez',
    lastMessage: 'Thanks for the quick response!',
    time: '1h ago',
    status: 'resolved',
    avatar: 'https://picsum.photos/seed/elena/40/40',
    messages: [
      { role: 'user', content: 'Is the free shipping still active?' },
      { role: 'agent', content: 'Yes! Free shipping is active for all orders over $50 until Friday.' },
      { role: 'user', content: 'Thanks for the quick response!' }
    ]
  }
];

export const mockStats = {
  activeChats: 12,
  resolvedToday: 48,
  avgResponseTime: '1m 24s',
  satisfactionRate: '98%'
};
