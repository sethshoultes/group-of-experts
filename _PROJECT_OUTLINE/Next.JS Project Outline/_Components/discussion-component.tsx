import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';

const DiscussionCanvas = () => {
  const [discussion, setDiscussion] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Expert message component inline to avoid external dependencies
  const ExpertMessage = ({ message, expert }) => (
    <div className="mb-4 last:mb-0">
      <div className="flex items-center gap-2 mb-1">
        <Badge variant="outline">{expert?.role || 'Expert'}</Badge>
        <span className="text-sm text-gray-500">
          {expert?.name || 'Unknown Expert'}
        </span>
      </div>
      <Card className="bg-gray-50">
        <CardContent className="pt-4">
          <p className="text-gray-700">{message.content}</p>
        </CardContent>
      </Card>
    </div>
  );

  // Moderator controls inline
  const ModeratorControls = () => (
    <div className="flex gap-2">
      <Button 
        variant="outline" 
        size="sm"
        onClick={() => handleModeratorAction('summarize')}
        disabled={isLoading}
      >
        Summarize
      </Button>
      <Button 
        variant="outline" 
        size="sm"
        onClick={() => handleModeratorAction('next')}
        disabled={isLoading}
      >
        Next Expert
      </Button>
    </div>
  );

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
        }),
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to get response');
      
      setMessages(prev => [...prev, data.message]);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleModeratorAction = async (action) => {
    // Implementation for moderator actions
    console.log(`Moderator action: ${action}`);
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <Card>
        <CardHeader className="flex flex-row justify-between items-center">
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
            {messages.map((message) => (
              <ExpertMessage
                key={message.id}
                message={message}
                expert={discussion?.experts?.find(e => e.id === message.expertId)}
              />
            ))}
          </div>
          
          <div className="mt-4 flex justify-end space-x-2">
            <Button
              onClick={handleExpertResponse}
              disabled={isLoading || !discussion}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Getting Response...
                </>
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