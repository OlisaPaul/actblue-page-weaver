import { PageComponent } from './PageBuilder';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';

interface ComponentRendererProps {
  component: PageComponent;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (updates: Partial<PageComponent>) => void;
  previewMode: boolean;
}

export const ComponentRenderer = ({ 
  component, 
  isSelected, 
  onSelect, 
  onUpdate,
  previewMode 
}: ComponentRendererProps) => {
  const [customAmount, setCustomAmount] = useState('');
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [isMonthly, setIsMonthly] = useState(false);

  const handleAmountSelect = (amount: number) => {
    setSelectedAmount(selectedAmount === amount ? null : amount);
    setCustomAmount('');
  };

  const handleCustomAmountChange = (value: string) => {
    setCustomAmount(value);
    setSelectedAmount(null);
  };

  const renderComponent = () => {
    switch (component.type) {
      case 'logo':
        console.log('Rendering logo component:', component.content);
        return (
          <div className="text-center">
            <div className="inline-block p-4 border-2 border-primary rounded-lg bg-gradient-subtle">
              {component.content.imageUrl ? (
                <img
                  src={component.content.imageUrl}
                  alt={component.content.alt || 'Campaign logo'}
                  className="max-w-64 max-h-32 object-contain rounded"
                  style={{
                    width: component.content.width ? `${component.content.width}px` : 'auto',
                    height: component.content.height ? `${component.content.height}px` : 'auto'
                  }}
                  onLoad={() => console.log('Logo image loaded successfully')}
                  onError={(e) => console.error('Logo image failed to load:', e)}
                />
              ) : (
                <div className="w-64 h-32 bg-primary/10 rounded flex items-center justify-center">
                  <span className="text-primary font-bold text-lg">CAMPAIGN LOGO</span>
                </div>
              )}
            </div>
          </div>
        );

      case 'hero':
        return (
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-4">
              {component.content.title}
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {component.content.subtitle}
            </p>
          </div>
        );

      case 'description':
        return (
          <div className="mb-8">
            <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto text-center">
              {component.content.text}
            </p>
          </div>
        );

      case 'donationAmounts':
        return (
          <div className="mb-8">
            <div className="max-w-md mx-auto">
              <h3 className="text-lg font-semibold mb-4">Choose an amount:</h3>
              
              <div className="grid grid-cols-3 gap-3 mb-4">
                {component.content.amounts.map((amount: number) => (
                  <Button
                    key={amount}
                    variant={selectedAmount === amount ? "default" : "outline"}
                    className="h-12 text-lg font-semibold"
                    onClick={() => handleAmountSelect(amount)}
                  >
                    ${amount}
                  </Button>
                ))}
              </div>

              {component.content.customAmount && (
                <div className="mb-4">
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      $
                    </span>
                    <Input
                      type="number"
                      placeholder="Custom amount"
                      value={customAmount}
                      onChange={(e) => handleCustomAmountChange(e.target.value)}
                      className="pl-8 h-12 text-lg"
                    />
                  </div>
                </div>
              )}

              {component.content.monthly && (
                <div className="flex gap-2 mb-6">
                  <Button
                    variant={isMonthly ? "default" : "outline"}
                    onClick={() => setIsMonthly(true)}
                    className="flex-1"
                  >
                    Monthly
                  </Button>
                  <Button
                    variant={!isMonthly ? "default" : "outline"}
                    onClick={() => setIsMonthly(false)}
                    className="flex-1"
                  >
                    One-time
                  </Button>
                </div>
              )}
            </div>
          </div>
        );

      case 'paymentOptions':
        return (
          <div className="max-w-md mx-auto">
            <h3 className="text-lg font-semibold mb-4">Payment Options</h3>
            <div className="space-y-3">
              <Button className="w-full h-12 bg-primary text-primary-foreground font-semibold">
                💳 Pay with Card
              </Button>
              
              {component.content.methods.includes('paypal') && (
                <Button variant="outline" className="w-full h-12 bg-yellow-500 text-white border-yellow-500 hover:bg-yellow-600">
                  PayPal
                </Button>
              )}
              
              {component.content.methods.includes('venmo') && (
                <Button variant="outline" className="w-full h-12 bg-blue-500 text-white border-blue-500 hover:bg-blue-600">
                  Venmo
                </Button>
              )}
            </div>
          </div>
        );

      default:
        return <div>Unknown component type</div>;
    }
  };

  const containerClasses = `
    transition-all duration-200 rounded-lg
    ${!previewMode ? 'cursor-pointer hover:shadow-md' : ''}
    ${isSelected ? 'ring-2 ring-builder-hover bg-builder-hover/5' : ''}
    ${!previewMode ? 'p-4' : ''}
  `;

  return (
    <div 
      className={containerClasses}
      onClick={!previewMode ? onSelect : undefined}
    >
      {renderComponent()}
    </div>
  );
};