"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, List, RefreshCw } from "lucide-react";

interface IssueForm {
  title: string;
  description: string;
  priority: number;
  labels: string[];
}

export function MCPTest() {
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<string[]>([]);
  const [formData, setFormData] = useState<IssueForm>({
    title: "",
    description: "",
    priority: 3,
    labels: [],
  });
  const [newLabel, setNewLabel] = useState("");

  // Csak development módban jelenjen meg
  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  const addMessage = (message: string) => {
    setMessages(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const handleCreateIssue = async () => {
    if (!formData.title.trim()) {
      addMessage("❌ Error: Title is required");
      return;
    }

    setIsLoading(true);
    addMessage("🚀 Creating Linear issue...");

    try {
      // Itt hívnánk meg az MCP szervert
      // Ez egy mock implementáció, mert az MCP szerver közvetlenül nem hívható meg komponensből
      addMessage("✅ Issue created successfully (mock)");
      addMessage(`📝 Title: ${formData.title}`);
      addMessage(`📋 Description: ${formData.description}`);
      addMessage(`🎯 Priority: ${formData.priority}`);
      addMessage(`🏷️ Labels: ${formData.labels.join(", ")}`);

      // Form reset
      setFormData({
        title: "",
        description: "",
        priority: 3,
        labels: [],
      });
    } catch (error) {
      addMessage(`❌ Error: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleListTeams = async () => {
    setIsLoading(true);
    addMessage("🔍 Listing teams...");

    try {
      // Mock response
      addMessage("✅ Teams found:");
      addMessage("- ProTipp Team (PT) - ID: team_123");
      addMessage("- Development Team (DEV) - ID: team_456");
    } catch (error) {
      addMessage(`❌ Error: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleListIssues = async () => {
    setIsLoading(true);
    addMessage("📋 Listing issues...");

    try {
      // Mock response
      addMessage("✅ Issues found:");
      addMessage("- PT-1: Fix login bug (Todo)");
      addMessage("- PT-2: Add new analytics feature (In Progress)");
      addMessage("- PT-3: Update documentation (Done)");
    } catch (error) {
      addMessage(`❌ Error: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setIsLoading(false);
    }
  };

  const addLabel = () => {
    if (newLabel.trim() && !formData.labels.includes(newLabel.trim())) {
      setFormData(prev => ({
        ...prev,
        labels: [...prev.labels, newLabel.trim()]
      }));
      setNewLabel("");
    }
  };

  const removeLabel = (labelToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      labels: prev.labels.filter(label => label !== labelToRemove)
    }));
  };

  return (
    <Card className="mb-4 border-purple-500/50 bg-purple-50/10">
      <CardHeader>
        <CardTitle className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
          🔗 Linear MCP Server Test
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Issue Creation Form */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="title">Issue Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Enter issue title..."
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Enter issue description..."
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="priority">Priority</Label>
            <Select
              value={formData.priority.toString()}
              onValueChange={(value) => setFormData(prev => ({ ...prev, priority: parseInt(value) }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">No Priority</SelectItem>
                <SelectItem value="1">Urgent</SelectItem>
                <SelectItem value="2">High</SelectItem>
                <SelectItem value="3">Medium</SelectItem>
                <SelectItem value="4">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Labels</Label>
            <div className="flex gap-2 mb-2">
              <Input
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                placeholder="Add label..."
                onKeyPress={(e) => e.key === "Enter" && addLabel()}
              />
              <Button onClick={addLabel} size="sm" variant="outline">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.labels.map((label) => (
                <Badge key={label} variant="secondary" className="cursor-pointer" onClick={() => removeLabel(label)}>
                  {label} ×
                </Badge>
              ))}
            </div>
          </div>

          <Button onClick={handleCreateIssue} disabled={isLoading} className="w-full">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Issue...
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Create Issue
              </>
            )}
          </Button>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button onClick={handleListTeams} disabled={isLoading} variant="outline" className="flex-1">
            <List className="mr-2 h-4 w-4" />
            List Teams
          </Button>
          <Button onClick={handleListIssues} disabled={isLoading} variant="outline" className="flex-1">
            <RefreshCw className="mr-2 h-4 w-4" />
            List Issues
          </Button>
        </div>

        {/* Messages */}
        <div className="mt-4">
          <Label>MCP Server Messages</Label>
          <div className="mt-2 max-h-40 overflow-y-auto rounded border bg-muted/50 p-2 text-sm">
            {messages.length === 0 ? (
              <p className="text-muted-foreground">No messages yet...</p>
            ) : (
              messages.map((message, index) => (
                <div key={index} className="mb-1">
                  {message}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-4 rounded-lg bg-blue-50/50 p-3 text-sm">
          <h4 className="font-semibold text-blue-700">📋 Instructions:</h4>
          <ul className="mt-2 space-y-1 text-blue-600">
            <li>• Official Linear MCP server is now configured</li>
            <li>• Go to Cursor Settings (Cmd+Shift+J) → MCP</li>
            <li>• Add new global MCP server with the configuration from .cursorrules</li>
            <li>• The Linear MCP server will appear in MCP Tools list</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
