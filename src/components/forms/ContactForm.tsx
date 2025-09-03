"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Send, 
  Loader2, 
  CheckCircle, 
  AlertCircle,
  Mail,
  User,
  MessageSquare
} from "lucide-react";

interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

type FormStatus = 'idle' | 'loading' | 'success' | 'error';

export function ContactForm() {
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  
  const [status, setStatus] = useState<FormStatus>('idle');
  const [errors, setErrors] = useState<Partial<ContactFormData>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<ContactFormData> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'A név megadása kötelező';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'A név legalább 2 karakter hosszú legyen';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Az e-mail cím megadása kötelező';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Érvényes e-mail címet adjon meg';
    }
    
    if (!formData.subject.trim()) {
      newErrors.subject = 'A tárgy megadása kötelező';
    }
    
    if (!formData.message.trim()) {
      newErrors.message = 'Az üzenet megadása kötelező';
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Az üzenet legalább 10 karakter hosszú legyen';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setStatus('loading');
    
    try {
      // Simulate API call - replace with actual email service
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock success/error for demo
      const isSuccess = Math.random() > 0.2; // 80% success rate
      
      if (isSuccess) {
        setStatus('success');
        setFormData({
          name: '',
          email: '',
          subject: '',
          message: ''
        });
        setErrors({});
      } else {
        throw new Error('Hiba történt az üzenet küldése során');
      }
    } catch (error) {
      console.error('Contact form error:', error);
      setStatus('error');
    }
  };

  const handleInputChange = (field: keyof ContactFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const subjectOptions = [
    'Általános kérdés',
    'Technikai probléma',
    'Számlázási kérdés',
    'Funkció kérés',
    'Panasz',
    'Partnerség',
    'Egyéb'
  ];

  if (status === 'success') {
    return (
      <Card className="gradient-bg border-green-400/20">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-green-400/20 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="h-8 w-8 text-green-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-green-400 mb-2">
                Üzenet sikeresen elküldve!
              </h3>
              <p className="text-muted-foreground">
                Köszönjük megkeresését! Hamarosan válaszolunk e-mail címére.
              </p>
            </div>
            <Button 
              variant="outline" 
              onClick={() => setStatus('idle')}
            >
              Új üzenet küldése
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {status === 'error' && (
        <Card className="gradient-bg border-red-400/20">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2 text-red-400">
              <AlertCircle className="h-5 w-5" />
              <p className="text-sm">
                Hiba történt az üzenet küldése során. Kérjük, próbálja újra később.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Name Field */}
        <div className="space-y-2">
          <Label htmlFor="name" className="flex items-center space-x-2">
            <User className="h-4 w-4" />
            <span>Név *</span>
          </Label>
          <Input
            id="name"
            type="text"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder="Az Ön neve"
            className={errors.name ? 'border-red-400' : ''}
          />
          {errors.name && (
            <p className="text-sm text-red-400">{errors.name}</p>
          )}
        </div>

        {/* Email Field */}
        <div className="space-y-2">
          <Label htmlFor="email" className="flex items-center space-x-2">
            <Mail className="h-4 w-4" />
            <span>E-mail cím *</span>
          </Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            placeholder="email@example.com"
            className={errors.email ? 'border-red-400' : ''}
          />
          {errors.email && (
            <p className="text-sm text-red-400">{errors.email}</p>
          )}
        </div>
      </div>

      {/* Subject Field */}
      <div className="space-y-2">
        <Label htmlFor="subject" className="flex items-center space-x-2">
          <MessageSquare className="h-4 w-4" />
          <span>Tárgy *</span>
        </Label>
        <Select 
          value={formData.subject} 
          onValueChange={(value) => handleInputChange('subject', value)}
        >
          <SelectTrigger className={errors.subject ? 'border-red-400' : ''}>
            <SelectValue placeholder="Válasszon témát" />
          </SelectTrigger>
          <SelectContent>
            {subjectOptions.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.subject && (
          <p className="text-sm text-red-400">{errors.subject}</p>
        )}
      </div>

      {/* Message Field */}
      <div className="space-y-2">
        <Label htmlFor="message">Üzenet *</Label>
        <Textarea
          id="message"
          value={formData.message}
          onChange={(e) => handleInputChange('message', e.target.value)}
          placeholder="Írja le kérdését vagy üzenetét..."
          rows={6}
          className={errors.message ? 'border-red-400' : ''}
        />
        {errors.message && (
          <p className="text-sm text-red-400">{errors.message}</p>
        )}
        <p className="text-xs text-muted-foreground">
          Minimum 10 karakter szükséges
        </p>
      </div>

      {/* Submit Button */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <p className="text-xs text-muted-foreground">
          * Kötelező mezők. Az Ön adatait bizalmasan kezeljük.
        </p>
        <Button 
          type="submit" 
          disabled={status === 'loading'}
          className="min-w-[120px]"
        >
          {status === 'loading' ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Küldés...
            </>
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" />
              Üzenet küldése
            </>
          )}
        </Button>
      </div>

      {/* Privacy Notice */}
      <Card className="gradient-bg border-primary/10">
        <CardContent className="pt-4">
          <p className="text-xs text-muted-foreground">
            Az üzenet elküldésével elfogadja, hogy személyes adatait a megkeresés 
            megválaszolása céljából kezeljük. Részletek az{' '}
            <a href="/privacy" className="text-primary hover:underline">
              Adatvédelmi Tájékoztatóban
            </a>.
          </p>
        </CardContent>
      </Card>
    </form>
  );
}
