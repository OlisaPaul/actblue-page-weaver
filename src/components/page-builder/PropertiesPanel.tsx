import { PageComponent } from './PageBuilder';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { X, Type, DollarSign, CreditCard, Image, FileText } from 'lucide-react';

interface PropertiesPanelProps {
  component: PageComponent;
  onUpdate: (updates: Partial<PageComponent>) => void;
  onClose: () => void;
}

export const PropertiesPanel = ({ component, onUpdate, onClose }: PropertiesPanelProps) => {
  const getIcon = () => {
    switch (component.type) {
      case 'logo': return Image;
      case 'hero': return Type;
      case 'description': return FileText;
      case 'donationAmounts': return DollarSign;
      case 'paymentOptions': return CreditCard;
      default: return Type;
    }
  };

  const Icon = getIcon();

  const updateContent = (key: string, value: any) => {
    onUpdate({
      content: {
        ...component.content,
        [key]: value
      }
    });
  };

  const renderProperties = () => {
    switch (component.type) {
      case 'logo':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="imageUrl">Image URL</Label>
              <Input
                id="imageUrl"
                value={component.content.imageUrl || ''}
                onChange={(e) => updateContent('imageUrl', e.target.value)}
                placeholder="https://example.com/logo.jpg"
              />
            </div>
            <div>
              <Label htmlFor="alt">Alt Text</Label>
              <Input
                id="alt"
                value={component.content.alt || ''}
                onChange={(e) => updateContent('alt', e.target.value)}
                placeholder="Campaign logo"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="width">Width</Label>
                <Input
                  id="width"
                  type="number"
                  value={component.content.width || ''}
                  onChange={(e) => updateContent('width', parseInt(e.target.value))}
                />
              </div>
              <div>
                <Label htmlFor="height">Height</Label>
                <Input
                  id="height"
                  type="number"
                  value={component.content.height || ''}
                  onChange={(e) => updateContent('height', parseInt(e.target.value))}
                />
              </div>
            </div>
          </div>
        );

      case 'hero':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={component.content.title || ''}
                onChange={(e) => updateContent('title', e.target.value)}
                placeholder="Donate to Your Campaign"
              />
            </div>
            <div>
              <Label htmlFor="subtitle">Subtitle</Label>
              <Textarea
                id="subtitle"
                value={component.content.subtitle || ''}
                onChange={(e) => updateContent('subtitle', e.target.value)}
                placeholder="Help us build a movement for change"
                rows={3}
              />
            </div>
          </div>
        );

      case 'description':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="text">Description Text</Label>
              <Textarea
                id="text"
                value={component.content.text || ''}
                onChange={(e) => updateContent('text', e.target.value)}
                placeholder="Add your campaign description here..."
                rows={6}
              />
            </div>
          </div>
        );

      case 'donationAmounts':
        return (
          <div className="space-y-4">
            <div>
              <Label>Donation Amounts</Label>
              <div className="grid grid-cols-3 gap-2 mt-2">
                {component.content.amounts?.map((amount: number, index: number) => (
                  <Input
                    key={index}
                    type="number"
                    value={amount}
                    onChange={(e) => {
                      const newAmounts = [...component.content.amounts];
                      newAmounts[index] = parseInt(e.target.value);
                      updateContent('amounts', newAmounts);
                    }}
                    className="text-sm"
                  />
                ))}
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-2 w-full"
                onClick={() => {
                  const newAmounts = [...(component.content.amounts || []), 100];
                  updateContent('amounts', newAmounts);
                }}
              >
                Add Amount
              </Button>
            </div>
            
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="customAmount"
                checked={component.content.customAmount || false}
                onChange={(e) => updateContent('customAmount', e.target.checked)}
              />
              <Label htmlFor="customAmount">Allow custom amount</Label>
            </div>
            
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="monthly"
                checked={component.content.monthly || false}
                onChange={(e) => updateContent('monthly', e.target.checked)}
              />
              <Label htmlFor="monthly">Enable monthly donations</Label>
            </div>
          </div>
        );

      case 'paymentOptions':
        return (
          <div className="space-y-4">
            <div>
              <Label>Payment Methods</Label>
              <div className="space-y-2 mt-2">
                {['credit', 'paypal', 'venmo', 'applepay', 'googlepay'].map((method) => (
                  <div key={method} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id={method}
                      checked={component.content.methods?.includes(method) || false}
                      onChange={(e) => {
                        const methods = component.content.methods || [];
                        if (e.target.checked) {
                          updateContent('methods', [...methods, method]);
                        } else {
                          updateContent('methods', methods.filter((m: string) => m !== method));
                        }
                      }}
                    />
                    <Label htmlFor={method} className="capitalize">
                      {method === 'credit' ? 'Credit Card' : 
                       method === 'applepay' ? 'Apple Pay' :
                       method === 'googlepay' ? 'Google Pay' : method}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      default:
        return <div>No properties available</div>;
    }
  };

  return (
    <div className="bg-background border-l border-border h-full">
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold capitalize">
              {component.type} Properties
            </h3>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>
      
      <div className="p-6">
        {renderProperties()}
        
        <div className="mt-8 pt-6 border-t border-border">
          <Button 
            variant="destructive" 
            size="sm"
            className="w-full"
            onClick={() => {
              // TODO: Implement delete functionality
              console.log('Delete component:', component.id);
            }}
          >
            Delete Component
          </Button>
        </div>
      </div>
    </div>
  );
};