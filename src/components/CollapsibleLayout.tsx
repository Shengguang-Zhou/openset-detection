
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
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
  const [isLeftCollapsed, setIsLeftCollapsed] = useState(false);
  const [isRightCollapsed, setIsRightCollapsed] = useState(true);
  
  return (
    <div className="flex h-full w-full">
      {/* Left sidebar with collapse button */}
      <Collapsible 
        open={!isLeftCollapsed} 
        className="h-full"
      >
        <div className="flex h-full">
          <CollapsibleContent className="bg-white h-full border rounded-lg overflow-hidden w-[250px]">
            {leftSidebar}
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
          
          <CollapsibleContent className="h-full flex-col flex">
            {isRightCollapsed && collapsedLabels ? (
              <div className="absolute top-1/4 right-8 z-10 bg-white rounded-lg border shadow-lg p-2">
                {collapsedLabels}
              </div>
            ) : (
              <div className="h-full w-[350px]">
                {rightSidebar}
              </div>
            )}
          </CollapsibleContent>
        </div>
      </Collapsible>
    </div>
  );
}
