import { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { ComponentLibrary } from './ComponentLibrary';
import { Canvas } from './Canvas';
import { PropertiesPanel } from './PropertiesPanel';
import { Button } from '@/components/ui/button';
import { Eye, Code, Download } from 'lucide-react';

export interface PageComponent {
  id: string;
  type: 'hero' | 'donationAmounts' | 'description' | 'paymentOptions' | 'logo';
  content: any;
  styles?: any;
}

const PageBuilder = () => {
  const [components, setComponents] = useState<PageComponent[]>([
    {
      id: '1',
      type: 'logo',
      content: { 
        imageUrl: '/api/placeholder/300/150',
        alt: 'Campaign Logo',
        width: 300,
        height: 150
      }
    },
    {
      id: '2',
      type: 'hero',
      content: { 
        title: 'Donate to Your Campaign',
        subtitle: 'Help us build a movement for change in our community.'
      }
    },
    {
      id: '3',
      type: 'description',
      content: { 
        text: 'Your candidate is fighting for the values that matter most to our community. Join our grassroots campaign and help make a difference.'
      }
    },
    {
      id: '4',
      type: 'donationAmounts',
      content: { 
        amounts: [10, 25, 50, 100, 250, 500],
        customAmount: true,
        monthly: true
      }
    },
    {
      id: '5',
      type: 'paymentOptions',
      content: { 
        methods: ['credit', 'paypal', 'venmo']
      }
    }
  ]);

  const [selectedComponent, setSelectedComponent] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState(false);

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const newComponents = Array.from(components);
    const [reorderedItem] = newComponents.splice(result.source.index, 1);
    newComponents.splice(result.destination.index, 0, reorderedItem);

    setComponents(newComponents);
  };

  const updateComponent = (id: string, updates: Partial<PageComponent>) => {
    setComponents(prev => prev.map(comp => 
      comp.id === id ? { ...comp, ...updates } : comp
    ));
  };

  const addComponent = (type: PageComponent['type']) => {
    const newComponent: PageComponent = {
      id: Date.now().toString(),
      type,
      content: getDefaultContent(type)
    };
    setComponents(prev => [...prev, newComponent]);
  };

  const getDefaultContent = (type: string) => {
    switch (type) {
      case 'hero':
        return { title: 'New Title', subtitle: 'New Subtitle' };
      case 'description':
        return { text: 'Add your description here...' };
      case 'donationAmounts':
        return { amounts: [25, 50, 100], customAmount: true, monthly: false };
      case 'paymentOptions':
        return { methods: ['credit'] };
      case 'logo':
        return { imageUrl: '/api/placeholder/200/100', alt: 'Logo', width: 200, height: 100 };
      default:
        return {};
    }
  };

  return (
    <div className="h-screen flex bg-builder-canvas">
      {/* Sidebar - Component Library */}
      <div className="w-80 bg-builder-sidebar border-r border-border">
        <div className="p-6 border-b border-border">
          <h2 className="text-xl font-bold text-builder-sidebar-foreground">
            Page Builder
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Build your campaign page
          </p>
        </div>
        
        <ComponentLibrary onAddComponent={addComponent} />
      </div>

      {/* Main Canvas Area */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <div className="bg-background border-b border-border p-4 flex justify-between items-center">
          <div className="flex gap-2">
            <Button
              variant={previewMode ? "secondary" : "default"}
              size="sm"
              onClick={() => setPreviewMode(!previewMode)}
            >
              <Eye className="w-4 h-4 mr-2" />
              {previewMode ? 'Edit' : 'Preview'}
            </Button>
            <Button variant="outline" size="sm">
              <Code className="w-4 h-4 mr-2" />
              View Code
            </Button>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1 overflow-auto">
          <Canvas
            components={components}
            selectedComponent={selectedComponent}
            onSelectComponent={setSelectedComponent}
            onUpdateComponent={updateComponent}
            previewMode={previewMode}
            onDragEnd={handleDragEnd}
          />
        </div>
      </div>

      {/* Properties Panel */}
      {selectedComponent && !previewMode && (
        <div className="w-80 bg-background border-l border-border">
          <PropertiesPanel
            component={components.find(c => c.id === selectedComponent)!}
            onUpdate={(updates) => updateComponent(selectedComponent, updates)}
            onClose={() => setSelectedComponent(null)}
          />
        </div>
      )}
    </div>
  );
};

export default PageBuilder;