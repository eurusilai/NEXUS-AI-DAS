import { useState } from 'react';
import DraggableCard from './DraggableCard';

const DashboardLayout = () => {
  const [cards, setCards] = useState([
    { id: 1, x: 0, y: 0, width: 250, height: 200, title: 'Card 1', content: 'Drag and resize me!' },
    { id: 2, x: 270, y: 0, width: 250, height: 200, title: 'Card 2', content: 'Try resizing from any corner or edge' },
    { id: 3, x: 0, y: 220, width: 350, height: 250, title: 'Card 3', content: 'Drag the top bar to move me around' },
  ]);

  return (
    <div className="w-full h-screen p-4 overflow-hidden relative">
      <h1 className="text-2xl font-bold mb-6 text-white">Interactive Dashboard</h1>
      <div className="w-full h-[calc(100%-4rem)] relative">
        {cards.map((card) => (
          <DraggableCard
            key={card.id}
            defaultPosition={{ x: card.x, y: card.y }}
            defaultSize={{ width: card.width, height: card.height }}
          >
            <h3 className="text-lg font-semibold mb-2">{card.title}</h3>
            <p className="text-sm text-gray-300">{card.content}</p>
          </DraggableCard>
        ))}
      </div>
    </div>
  );
};

export default DashboardLayout;
