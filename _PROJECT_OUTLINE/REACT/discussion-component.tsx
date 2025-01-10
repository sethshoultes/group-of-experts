import React, { useState } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  MoreHorizontal, 
  MessageSquare, 
  Flag,
  PauseCircle,
  PlayCircle,
  Loader2,
  MessageCircle,
  AlertTriangle,
  Check
} from 'lucide-react';

const DiscussionCanvas = () => {
  const [discussion, setDiscussion] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isPaused, setIsPaused] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);

  const ThreadedMessage = ({ message, depth = 0, expert }) => {
    const hasReplies = messages.some(m => m.replyTo === message.id);
    const replies = messages.filter(m => m.replyTo === message.id);
    
    return (
      <div className={`ml-${depth * 4}`}>
        <div className="mb-4 relative">
          {depth > 0 && (
            <div className="absolute left-0 top-0 h-full w-px bg-gray-200 -ml-2" />
          )}
          
          <div className="flex items-center gap-2 mb-1">
            <Badge variant={expert?.role === 'MODERATOR' ? 'secondary' : 'outline'}>
              {expert?.role || 'Expert'}
            </Badge>
            <span className="text-sm text-gray-500">{expert?.name}</span>
            {message.flagged && (
              <Badge variant="destructive">Flagged</Badge>
            )}
          </div>

          <Card className={`bg-gray-50 ${message.id === selectedMessage?.id ? 'ring-2 ring-blue-500' : ''}`}>
            <CardContent className="pt-4">
              <p className="text-gray-700">{message.content}</p>
              
              <div className="flex gap-2 mt-4">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => handleReply(message)}
                >
                  <MessageSquare className="h-4 w-4 mr-1" />
                  Reply
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => handleFlag(message)}
                >
                  <Flag className="h-4 w-4 mr-1" />
                  Flag
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {hasReplies && (
          <div className="ml-4">
            {replies.map(reply => (
              <ThreadedMessage 
                key={reply.id} 
                message={reply}
                depth={depth + 1}
                expert={discussion?.experts?.find(e => e.id === reply.expertId)}
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  const ModeratorControls = () => (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => setIsPaused(!isPaused)}
        >
          {isPaused ? (
            <>
              <PlayCircle className="h-4 w-4 mr-1" />
              Resume
            </>
          ) : (
            <>
              <PauseCircle className="h-4 w-4 mr-1" />
              Pause
            </>
          )}
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          onClick={handleSummarize}
        >
          <MessageCircle className="h-4 w-4 mr-1" />
          Summarize
        </Button>
      </div>
      
      <div className="flex gap-2">
        <Button 
          variant="outline" 
          size="sm"
          onClick={handleRedirect}
          disabled={!selectedMessage}
        >
          <MessageSquare className="h-4 w-4 mr-1" />
          Redirect
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          onClick={handleWarn}
          disabled={!selectedMessage}
        >
          <AlertTriangle className="h-4 w-4 mr-1" />
          Warn
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          onClick={handleEndorse}
          disabled={!selectedMessage}
        >
          <Check className="h-4 w-4 mr-1" />
          Endorse
        </Button>
      </div>
    </div>
  );

  const handleReply = (message) => {
    setSelectedMessage(message);
  };

  const handleFlag = async (message) => {
    // Flag implementation
  };

  const handleSummarize = async () => {
    // Summarize implementation
  };

  const handleRedirect = async () => {
    // Redirect implementation
  };

  const handleWarn = async () => {
    // Warning implementation
  };

  const handleEndorse = async () => {
    // Endorse implementation
  };

  const handleExpertResponse = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/discussion/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          discussionId: discussion?.id,
          expertId: discussion?.activeExperts?.[0]?.id,
          replyTo: selectedMessage?.id
        }),
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      
      setMessages(prev => [...prev, data.message]);
      setSelectedMessage(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <Card>
        <CardHeader className="flex flex-row justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold">
              {discussion?.topic || 'New Discussion'}
            </h2>
            <p className="text-gray-500">
              {discussion?.activeExperts?.length || 0} Experts Active
            </p>
          </div>
          <ModeratorControls />
        </CardHeader>
        
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <div className="space-y-4">
            {messages
              .filter(message => !message.replyTo)
              .map(message => (
                <ThreadedMessage
                  key={message.id}
                  message={message}
                  expert={discussion?.experts?.find(e => e.id === message.expertId)}
                />
              ))}
          </div>
          
          <div className="mt-4 flex justify-end space-x-2">
            {selectedMessage && (
              <Button
                variant="outline"
                onClick={() => setSelectedMessage(null)}
              >
                Cancel Reply
              </Button>
            )}
            <Button
              onClick={handleExpertResponse}
              disabled={isLoading || !discussion || isPaused}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : selectedMessage ? (
                'Reply to Message'
              ) : (
                'Get Expert Response'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DiscussionCanvas;