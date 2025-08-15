import { useState } from "react";
import { useWebinyPages } from "../../hooks/useWebinyPages";
import { useAuth } from "../../contexts/AuthContext";
import { Input } from "@/components/ui/input";
import { Save, FolderOpen } from "lucide-react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { ComponentLibrary } from "./ComponentLibrary";
import { Canvas } from "./Canvas";
import { PropertiesPanel } from "./PropertiesPanel";
import { Button } from "@/components/ui/button";
import { Eye, Code, Download } from "lucide-react";

export interface PageComponent {
  id: string;
  type: "hero" | "donationAmounts" | "description" | "paymentOptions" | "logo";
  content: any;
  styles?: any;
}

const PageBuilder = () => {
  const { user, isAuthenticated, login, logout } = useAuth();
  const { savePage, getUserPages, loading } = useWebinyPages();
  const [pageTitle, setPageTitle] = useState("Untitled Campaign Page");
  const [currentPageId, setCurrentPageId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Modal and login form state
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  const [components, setComponents] = useState<PageComponent[]>([
    {
      id: "1",
      type: "logo",
      content: {
        imageUrl: "/placeholder.svg",
        alt: "Campaign Logo",
        width: 300,
        height: 150,
      },
    },
    {
      id: "2",
      type: "hero",
      content: {
        title: "Donate to Your Campaign",
        subtitle: "Help us build a movement for change in our community.",
      },
    },
    {
      id: "3",
      type: "description",
      content: {
        text: "Your candidate is fighting for the values that matter most to our community. Join our grassroots campaign and help make a difference.",
      },
    },
    {
      id: "4",
      type: "donationAmounts",
      content: {
        amounts: [10, 25, 50, 100, 250, 500],
        customAmount: true,
        monthly: true,
      },
    },
    {
      id: "5",
      type: "paymentOptions",
      content: { methods: ["credit", "paypal", "venmo"] },
    },
  ]);

  const [selectedComponent, setSelectedComponent] = useState<string | null>(
    null
  );
  const [previewMode, setPreviewMode] = useState(false);

  // Drag & drop handlers
  const handleDragEnd = (result: any) => {
    if (!result.destination) return;
    const newComponents = Array.from(components);
    const [reorderedItem] = newComponents.splice(result.source.index, 1);
    newComponents.splice(result.destination.index, 0, reorderedItem);
    setComponents(newComponents);
  };

  const updateComponent = (id: string, updates: Partial<PageComponent>) => {
    setComponents((prev) =>
      prev.map((comp) => (comp.id === id ? { ...comp, ...updates } : comp))
    );
  };

  const addComponent = (type: PageComponent["type"]) => {
    const newComponent: PageComponent = {
      id: Date.now().toString(),
      type,
      content: getDefaultContent(type),
    };
    setComponents((prev) => [...prev, newComponent]);
  };

  const getDefaultContent = (type: string) => {
    switch (type) {
      case "hero":
        return { title: "New Title", subtitle: "New Subtitle" };
      case "description":
        return { text: "Add your description here..." };
      case "donationAmounts":
        return { amounts: [25, 50, 100], customAmount: true, monthly: false };
      case "paymentOptions":
        return { methods: ["credit"] };
      case "logo":
        return {
          imageUrl: "/placeholder.svg",
          alt: "Logo",
          width: 200,
          height: 100,
        };
      default:
        return {};
    }
  };

  const handleSavePage = async () => {
    if (!isAuthenticated) {
      alert("Please log in to save pages");
      return;
    }
    setIsSaving(true);
    try {
      const savedPage = await savePage(
        pageTitle,
        components,
        currentPageId || undefined
      );
      setCurrentPageId(savedPage.id);
      console.log("Page saved successfully!");
    } catch (error) {
      console.error("Failed to save page:", error);
      alert("Failed to save page");
    } finally {
      setIsSaving(false);
    }
  };

  // Login handler
  const handleLogin = async () => {
    setLoginLoading(true);
    setLoginError(null);
    try {
      await login(email, password);
      setLoginModalOpen(false);
      setEmail("");
      setPassword("");
    } catch (err: any) {
      setLoginError(err.message || "Login failed");
    } finally {
      setLoginLoading(false);
    }
  };

  return (
    <div className="h-screen flex bg-builder-canvas">
      {/* Sidebar */}
      <div className="w-80 bg-builder-sidebar border-r border-border">
        <div className="p-6 border-b border-border">
          <h2 className="text-xl font-bold text-builder-sidebar-foreground">
            Page Builder
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Build your campaign page
          </p>
        </div>

        {isAuthenticated && (
          <div className="p-4 border-t border-border mt-4">
            <div className="space-y-3">
              <Input
                value={pageTitle}
                onChange={(e) => setPageTitle(e.target.value)}
                placeholder="Page title"
                className="text-sm"
              />
              <Button
                onClick={handleSavePage}
                disabled={isSaving}
                className="w-full"
                size="sm"
              >
                <Save className="w-4 h-4 mr-2" />{" "}
                {isSaving ? "Saving..." : "Save Page"}
              </Button>
            </div>
          </div>
        )}

        <ComponentLibrary onAddComponent={addComponent} />
      </div>

      {/* Main Canvas */}
      <div className="flex-1 flex flex-col">
        <div className="bg-background border-b border-border p-4 flex justify-between items-center">
          <div className="flex gap-2">
            <Button
              variant={previewMode ? "secondary" : "default"}
              size="sm"
              onClick={() => setPreviewMode(!previewMode)}
            >
              <Eye className="w-4 h-4 mr-2" />{" "}
              {previewMode ? "Edit" : "Preview"}
            </Button>

            {/* Login / Logout Button */}
            {isAuthenticated ? (
              <Button variant="outline" size="sm" onClick={logout}>
                Logout
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setLoginModalOpen(true)}
              >
                Login
              </Button>
            )}
          </div>
        </div>

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

      {selectedComponent && !previewMode && (
        <div className="w-80 bg-background border-l border-border">
          <PropertiesPanel
            component={components.find((c) => c.id === selectedComponent)!}
            onUpdate={(updates) => updateComponent(selectedComponent, updates)}
            onClose={() => setSelectedComponent(null)}
          />
        </div>
      )}

      {/* Login Modal */}
      {loginModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow w-96">
            <h3 className="text-lg font-bold mb-4">Login</h3>
            {loginError && (
              <p className="text-red-500 text-sm mb-2">{loginError}</p>
            )}
            <Input
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mb-2"
            />
            <Input
              placeholder="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mb-4"
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setLoginModalOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleLogin} disabled={loginLoading}>
                {loginLoading ? "Logging in..." : "Login"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PageBuilder;
