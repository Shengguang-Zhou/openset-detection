
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./ui/collapsible";

interface CollapsibleLayoutProps {
  leftSidebar: React.ReactNode;
  mainContent: React.ReactNode;
  rightSidebar: React.ReactNode;
  collapsedLabels?: React.ReactNode;
}

export function CollapsibleLayout({
  leftSidebar,
  mainContent,
  rightSidebar,
  collapsedLabels
}: CollapsibleLayoutProps) {
  // Initialize with right sidebar open, left sidebar closed on mobile
  const [isLeftCollapsed, setIsLeftCollapsed] = useState(false);
  const [isRightCollapsed, setIsRightCollapsed] = useState(false);
  
  // Check if we're on mobile and adjust sidebar states accordingly
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsLeftCollapsed(true);
        setIsRightCollapsed(true);
      } else {
        setIsLeftCollapsed(false);
        setIsRightCollapsed(false);
      }
    };

    // Set initial state
    handleResize();

    // Add event listener
    window.addEventListener('resize', handleResize);
    
    // Clean up
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  return (
    <div className="flex h-full w-full">
      {/* Left sidebar with collapse button */}
      <Collapsible 
        open={!isLeftCollapsed} 
        className="h-full"
      >
        <div className="flex h-full">
          <CollapsibleContent className="h-full">
            <div className="bg-white h-full border rounded-lg overflow-hidden w-[250px]">
              {leftSidebar}
            </div>
          </CollapsibleContent>
          
          <CollapsibleTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon"
              className="h-10 w-6 -ml-3 z-10 rounded-l-none rounded-r-xl bg-primary/10 hover:bg-primary/20"
              onClick={() => setIsLeftCollapsed(!isLeftCollapsed)}
            >
              {isLeftCollapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </Button>
          </CollapsibleTrigger>
        </div>
      </Collapsible>
      
      {/* Main content area */}
      <div className="flex-1 transition-all mx-3">
        {mainContent}
      </div>
      
      {/* Right sidebar with collapse button */}
      <Collapsible 
        open={!isRightCollapsed} 
        className="h-full"
      >
        <div className="flex h-full">
          <CollapsibleTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon"
              className="h-10 w-6 -mr-3 z-10 rounded-r-none rounded-l-xl bg-primary/10 hover:bg-primary/20"
              onClick={() => setIsRightCollapsed(!isRightCollapsed)}
            >
              {isRightCollapsed ? (
                <ChevronLeft className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
          </CollapsibleTrigger>
          
          <CollapsibleContent className="h-full">
            {isRightCollapsed && collapsedLabels ? (
              <div className="absolute top-1/4 right-8 z-10 bg-white rounded-lg border shadow-lg p-2">
                {collapsedLabels}
              </div>
            ) : (
              <div className="bg-white h-full border rounded-lg overflow-hidden w-[250px]">
                {rightSidebar}
              </div>
            )}
          </CollapsibleContent>
        </div>
      </Collapsible>
    </div>
  );
}
