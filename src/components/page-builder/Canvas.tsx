import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { PageComponent } from './PageBuilder';
import { ComponentRenderer } from './ComponentRenderer';

interface CanvasProps {
  components: PageComponent[];
  selectedComponent: string | null;
  onSelectComponent: (id: string | null) => void;
  onUpdateComponent: (id: string, updates: Partial<PageComponent>) => void;
  previewMode: boolean;
  onDragEnd: (result: any) => void;
}

export const Canvas = ({ 
  components, 
  selectedComponent, 
  onSelectComponent, 
  onUpdateComponent,
  previewMode,
  onDragEnd 
}: CanvasProps) => {
  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="bg-white rounded-lg shadow-card min-h-[600px]">
        {previewMode ? (
          <div className="p-8">
            {components.map((component) => (
              <div key={component.id} className="mb-6">
                <ComponentRenderer
                  component={component}
                  isSelected={false}
                  onSelect={() => {}}
                  onUpdate={() => {}}
                  previewMode={true}
                />
              </div>
            ))}
          </div>
        ) : (
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="canvas">
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`p-8 min-h-[600px] transition-colors ${
                    snapshot.isDraggingOver ? 'bg-builder-canvas/50' : ''
                  }`}
                >
                  {components.map((component, index) => (
                    <Draggable
                      key={component.id}
                      draggableId={component.id}
                      index={index}
                    >
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={`mb-6 transition-transform ${
                            snapshot.isDragging ? 'scale-105' : ''
                          }`}
                        >
                          <ComponentRenderer
                            component={component}
                            isSelected={selectedComponent === component.id}
                            onSelect={() => onSelectComponent(
                              selectedComponent === component.id ? null : component.id
                            )}
                            onUpdate={(updates) => onUpdateComponent(component.id, updates)}
                            previewMode={false}
                          />
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                  
                  {components.length === 0 && (
                    <div className="flex items-center justify-center h-96 text-center">
                      <div>
                        <p className="text-lg text-muted-foreground mb-2">
                          Start building your campaign page
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Drag components from the sidebar to get started
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        )}
      </div>
    </div>
  );
};