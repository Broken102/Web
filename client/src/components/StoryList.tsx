import { StoryWithUser } from "@shared/schema";
import Story from "./Story";
import { ScrollArea } from "@/components/ui/scroll-area";

interface StoryListProps {
  stories: StoryWithUser[];
  onAddStory?: () => void;
}

export default function StoryList({ stories, onAddStory }: StoryListProps) {
  return (
    <div className="p-4">
      <ScrollArea className="w-full" orientation="horizontal">
        <div className="flex space-x-4">
          <Story isAddStory onClick={onAddStory} />
          
          {stories.map((story) => (
            <Story 
              key={story.id}
              story={story}
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
