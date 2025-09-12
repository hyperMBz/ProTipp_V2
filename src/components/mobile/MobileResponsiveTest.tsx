"use client";

import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Mobile Responsive Test Component
export function MobileResponsiveTest() {
  const [formData, setFormData] = React.useState({
    email: '',
    name: '',
    message: '',
    category: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="p-4 space-y-6 max-w-md mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Mobile Responsive Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Touch Target Test - Buttons */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Touch Target Test (44px minimum)</Label>
            <div className="grid grid-cols-2 gap-2">
              <Button className="h-11 px-4 text-sm">Small Button</Button>
              <Button className="h-11 px-4 text-sm">Test Button</Button>
            </div>
          </div>

          {/* Form Elements Test */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Form Elements</Label>

            {/* Text Input */}
            <div className="space-y-1">
              <Label htmlFor="name" className="text-xs">Name</Label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="h-11"
                placeholder="Enter your name"
              />
            </div>

            {/* Email Input */}
            <div className="space-y-1">
              <Label htmlFor="email" className="text-xs">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="h-11"
                placeholder="Enter your email"
              />
            </div>

            {/* Select */}
            <div className="space-y-1">
              <Label className="text-xs">Category</Label>
              <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="support">Support</SelectItem>
                  <SelectItem value="billing">Billing</SelectItem>
                  <SelectItem value="feature">Feature Request</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Textarea */}
            <div className="space-y-1">
              <Label htmlFor="message" className="text-xs">Message</Label>
              <Textarea
                id="message"
                value={formData.message}
                onChange={(e) => handleInputChange('message', e.target.value)}
                className="min-h-[88px] resize-none"
                placeholder="Enter your message"
                rows={3}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-2">
            <Button className="w-full h-11 text-base font-medium">
              Submit Form
            </Button>
            <Button variant="outline" className="w-full h-11 text-base">
              Reset Form
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Typography Test */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Typography Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-xs leading-relaxed">Small text (12px) - should be readable on mobile</p>
          <p className="text-sm leading-relaxed">Body text (14px) - main content size</p>
          <p className="text-base leading-relaxed">Large body text (16px) - comfortable reading</p>
          <p className="text-lg leading-relaxed">Large text (18px) - headings</p>
          <p className="text-xl leading-relaxed">Extra large text (20px) - section headers</p>
        </CardContent>
      </Card>

      {/* Image Test */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Image Scaling Test</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="aspect-video bg-gradient-to-br from-primary/20 to-purple-500/20 rounded-lg flex items-center justify-center">
            <p className="text-muted-foreground">Responsive Image Placeholder</p>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            This should scale properly on all screen sizes
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
