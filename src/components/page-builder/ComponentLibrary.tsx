import { Button } from '@/components/ui/button';
import { 
  Image, 
  Type, 
  DollarSign, 
  CreditCard, 
  FileText,
  Plus
} from 'lucide-react';

interface ComponentLibraryProps {
  onAddComponent: (type: string) => void;
}

export const ComponentLibrary = ({ onAddComponent }: ComponentLibraryProps) => {
  const components = [
    {
      type: 'logo',
      name: 'Logo/Image',
      icon: Image,
      description: 'Campaign logo or header image'
    },
    {
      type: 'hero',
      name: 'Hero Title',
      icon: Type,
      description: 'Main heading and subtitle'
    },
    {
      type: 'description',
      name: 'Description',
      icon: FileText,
      description: 'Campaign description text'
    },
    {
      type: 'donationAmounts',
      name: 'Donation Amounts',
      icon: DollarSign,
      description: 'Preset donation buttons'
    },
    {
      type: 'paymentOptions',
      name: 'Payment Options',
      icon: CreditCard,
      description: 'Payment method buttons'
    }
  ];

  return (
    <div className="p-4">
      <h3 className="text-sm font-semibold text-builder-sidebar-foreground mb-4 uppercase tracking-wider">
        Components
      </h3>
      
      <div className="space-y-2">
        {components.map((component) => (
          <Button
            key={component.type}
            variant="ghost"
            className="w-full justify-start p-3 h-auto text-left hover:bg-builder-hover/10"
            onClick={() => onAddComponent(component.type)}
          >
            <div className="flex items-start gap-3">
              <component.icon className="w-5 h-5 mt-0.5 text-builder-sidebar-foreground/70" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-builder-sidebar-foreground">
                  {component.name}
                </p>
                <p className="text-xs text-builder-sidebar-foreground/60 mt-1">
                  {component.description}
                </p>
              </div>
              <Plus className="w-4 h-4 text-builder-sidebar-foreground/50" />
            </div>
          </Button>
        ))}
      </div>

      <div className="mt-8">
        <h3 className="text-sm font-semibold text-builder-sidebar-foreground mb-4 uppercase tracking-wider">
          Templates
        </h3>
        <Button 
          variant="outline" 
          className="w-full border-builder-hover text-builder-hover hover:bg-builder-hover hover:text-white"
        >
          Load ActBlue Template
        </Button>
      </div>
    </div>
  );
};