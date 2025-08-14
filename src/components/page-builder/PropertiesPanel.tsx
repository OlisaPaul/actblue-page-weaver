import { PageComponent } from './PageBuilder';
import { useWebinyFiles } from '../../hooks/useWebinyFiles';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { X, Type, DollarSign, CreditCard, Image, FileText, Upload, ImageIcon, AlertTriangle, CheckCircle } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

interface PropertiesPanelProps {
  component: PageComponent;
  onUpdate: (updates: Partial<PageComponent>) => void;
  onClose: () => void;
}

export const PropertiesPanel = ({ component, onUpdate, onClose }: PropertiesPanelProps) => {
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [uploadError, setUploadError] = useState<string>('');
  const [dragActive, setDragActive] = useState(false);
  const previousBlobUrl = useRef<string>('');
  const { uploadImage } = useWebinyFiles();

  // Cleanup blob URLs when component unmounts or changes
  useEffect(() => {
    return () => {
      if (previousBlobUrl.current && previousBlobUrl.current.startsWith('blob:')) {
        console.log('Cleaning up blob URL:', previousBlobUrl.current);
        URL.revokeObjectURL(previousBlobUrl.current);
      }
    };
  }, []);

  const validateFile = (file: File): { valid: boolean; error?: string } => {
    console.log('Validating file:', {
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: new Date(file.lastModified).toISOString()
    });

    // Check file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
    if (!validTypes.includes(file.type)) {
      return {
        valid: false,
        error: `Invalid file type. Please upload: ${validTypes.map(t => t.split('/')[1]).join(', ')}`
      };
    }

    // Check file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return {
        valid: false,
        error: `File too large. Maximum size is ${maxSize / (1024 * 1024)}MB`
      };
    }

    // Check if file is not corrupted (basic check)
    if (file.size === 0) {
      return {
        valid: false,
        error: 'File appears to be corrupted or empty'
      };
    }

    return { valid: true };
  };

  // const handleFileUpload = async (file: File) => {
  //   setUploadStatus('uploading');
  //   setUploadError('');

  //   try {
  //     // Validate file
  //     const validation = validateFile(file);
  //     if (!validation.valid) {
  //       setUploadStatus('error');
  //       setUploadError(validation.error || 'Invalid file');
  //       return;
  //     }

  //     // Clean up previous blob URL
  //     if (previousBlobUrl.current && previousBlobUrl.current.startsWith('blob:')) {
  //       console.log('Revoking previous blob URL:', previousBlobUrl.current);
  //       URL.revokeObjectURL(previousBlobUrl.current);
  //     }

  //     // Create new blob URL
  //     const imageUrl = URL.createObjectURL(file);
  //     console.log('Generated new blob URL:', imageUrl);
      
  //     // Store reference for cleanup
  //     previousBlobUrl.current = imageUrl;

  //     // Update component with new image (atomic update to prevent race conditions)
  //     const newAlt = file.name.split('.')[0];
  //     console.log('Updating component with new blob URL:', imageUrl);
  //     console.log('Updating component with new alt text:', newAlt);
      
  //     // Update both imageUrl and alt in a single atomic operation
  //     onUpdate({
  //       content: {
  //         ...component.content,
  //         imageUrl: imageUrl,
  //         alt: newAlt
  //       }
  //     });
      
  //     console.log('Component content after atomic update should be:', {
  //       ...component.content,
  //       imageUrl: imageUrl,
  //       alt: newAlt
  //     });

  //     setUploadStatus('success');
      
  //     // Reset success status after 3 seconds
  //     setTimeout(() => {
  //       setUploadStatus(prev => prev === 'success' ? 'idle' : prev);
  //     }, 3000);

  //   } catch (error) {
  //     console.error('File upload error:', error);
  //     setUploadStatus('error');
  //     setUploadError('Failed to process file. Please try again.');
  //   }
  // };
const handleFileUpload = async (file: File) => {
    setUploadStatus('uploading');
    setUploadError('');

    try {
      const validation = validateFile(file);
      if (!validation.valid) {
        setUploadStatus('error');
        setUploadError(validation.error || 'Invalid file');
        return;
      }

      // Upload to Webiny instead of creating blob URL
      const imageUrl = await uploadImage(file);
      const newAlt = file.name.split('.')[0];
      
      console.log('Uploaded to Webiny:', imageUrl);
      
      // Update component with Webiny URL
      onUpdate({
        content: {
          ...component.content,
          imageUrl: imageUrl,
          alt: newAlt
        }
      });

      setUploadStatus('success');
      setTimeout(() => {
        setUploadStatus(prev => prev === 'success' ? 'idle' : prev);
      }, 3000);

    } catch (error) {
      console.error('File upload error:', error);
      setUploadStatus('error');
      setUploadError('Failed to upload file to Webiny');
    }
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    
    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find(file => file.type.startsWith('image/'));
    
    if (!imageFile) {
      setUploadStatus('error');
      setUploadError('Please drop an image file');
      return;
    }
    
    if (files.length > 1) {
      setUploadStatus('error');
      setUploadError('Please drop only one file at a time');
      return;
    }

    handleFileUpload(imageFile);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  };

  const updateContent = (key: string, value: any) => {
    console.log('Updating content:', key, value);
    
    // If updating imageUrl and it's a manual URL change, reset upload status
    if (key === 'imageUrl' && typeof value === 'string' && !value.startsWith('blob:')) {
      setUploadStatus('idle');
      setUploadError('');
      
      // Clean up any existing blob URL
      if (previousBlobUrl.current && previousBlobUrl.current.startsWith('blob:')) {
        console.log('Cleaning up blob URL due to manual URL change');
        URL.revokeObjectURL(previousBlobUrl.current);
        previousBlobUrl.current = '';
      }
    }

    onUpdate({
      content: {
        ...component.content,
        [key]: value
      }
    });
  };

  const getUploadAreaClassName = () => {
    let baseClass = "border-2 border-dashed rounded-lg p-6 text-center transition-colors";
    
    if (dragActive) {
      baseClass += " border-primary bg-primary/5";
    } else if (uploadStatus === 'error') {
      baseClass += " border-destructive/50 bg-destructive/5";
    } else if (uploadStatus === 'success') {
      baseClass += " border-green-500/50 bg-green-50";
    } else {
      baseClass += " border-border hover:border-primary/50";
    }
    
    return baseClass;
  };

  const renderUploadStatus = () => {
    switch (uploadStatus) {
      case 'uploading':
        return (
          <div className="flex items-center gap-2 text-primary">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
            <span className="text-sm">Uploading...</span>
          </div>
        );
      case 'success':
        return (
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle className="w-4 h-4" />
            <span className="text-sm">Upload successful!</span>
          </div>
        );
      case 'error':
        return (
          <div className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-sm">{uploadError}</span>
          </div>
        );
      default:
        return null;
    }
  };
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


  const renderProperties = () => {
    switch (component.type) {
      case 'logo':
        return (
          <div className="space-y-4">
            <div>
              <Label>Upload Logo</Label>
              <div
                className={getUploadAreaClassName()}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
              >
                <div className="flex flex-col items-center gap-3">
                  {component.content.imageUrl ? (
                    <div className="relative">
                      <img
                        key={component.content.imageUrl} // Force re-render when URL changes
                        src={component.content.imageUrl}
                        alt="Preview"
                        className="max-w-20 max-h-20 object-contain rounded"
                        onLoad={() => console.log('Properties panel preview loaded:', component.content.imageUrl)}
                        onError={(e) => console.error('Properties panel preview failed to load:', e.currentTarget.src)}
                      />
                      <Button
                        variant="destructive"
                        size="sm"
                        className="absolute -top-2 -right-2 w-6 h-6 p-0 rounded-full"
                        onClick={() => {
                          // Clean up blob URL when removing image
                          if (component.content.imageUrl?.startsWith('blob:')) {
                            URL.revokeObjectURL(component.content.imageUrl);
                          }
                          updateContent('imageUrl', '');
                          setUploadStatus('idle');
                          setUploadError('');
                        }}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  ) : (
                    <ImageIcon className="w-12 h-12 text-muted-foreground" />
                  )}
                  
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      Drag and drop an image here, or
                    </p>
                    <div className="flex flex-col gap-2 items-center">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => document.getElementById('logo-upload')?.click()}
                        disabled={uploadStatus === 'uploading'}
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        {uploadStatus === 'uploading' ? 'Uploading...' : 'Upload File'}
                      </Button>
                      {renderUploadStatus()}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Supports: JPEG, PNG, GIF, WebP, SVG (max 10MB)
                    </p>
                  </div>
                </div>
                
                <input
                  id="logo-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handleFileUpload(file);
                      // Reset input so same file can be selected again
                      e.target.value = '';
                    }
                  }}
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="imageUrl">Or enter Image URL</Label>
              <Input
                id="imageUrl"
                value={component.content.imageUrl || ''}
                onChange={(e) => updateContent('imageUrl', e.target.value)}
                placeholder="https://example.com/logo.jpg"
                disabled={uploadStatus === 'uploading'}
                onFocus={(e) => {
                  // Clear default placeholder URL when user starts typing
                  if (component.content.imageUrl === '/placeholder.svg') {
                    updateContent('imageUrl', '');
                    e.target.value = '';
                  }
                }}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Enter a direct URL to an image file
              </p>
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